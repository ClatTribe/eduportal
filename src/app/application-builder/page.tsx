"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Lock, ArrowRight, User, FileText, Upload, CheckSquare, Award, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import DefaultLayout from '../defaultLayout';

interface ApplicationProgress {
  login: boolean;
  profileCompletion: boolean;
  documentUpload: boolean;
  documentVerification: boolean;
  documentVerified: boolean;
  finalSteps: boolean;
}

const ApplicationBuilderPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ApplicationProgress>({
    login: false,
    profileCompletion: false,
    documentUpload: false,
    documentVerification: false,
    documentVerified: false,
    finalSteps: false
  });

  useEffect(() => {
    if (user) {
      checkUserProgress();
    }
  }, [user]);

  const checkUserProgress = async () => {
    try {
      setLoading(true);

      // Check if user is logged in
      const isLoggedIn = !!user;

      // Check if profile is completed
      const { data: profileData } = await supabase
        .from('admit_profiles')
        .select('name, degree, last_course_cgpa, verified')
        .eq('user_id', user?.id)
        .single();

      const isProfileComplete = !!(
        profileData &&
        profileData.name &&
        profileData.degree &&
        profileData.last_course_cgpa
      );

      // Check if documents are uploaded
      const { data: documentsData } = await supabase
        .from('student_documents')
        .select('resume_url, sop_url')
        .eq('user_id', user?.id)
        .single();

      const areDocumentsUploaded = !!(
        documentsData &&
        documentsData.resume_url &&
        documentsData.sop_url
      );

      // Check if profile is verified (from admit_profiles table)
      const isProfileVerified = !!(profileData && profileData.verified);

      // Document verification is in progress if documents uploaded but not verified
      const isDocumentVerification = areDocumentsUploaded && !isProfileVerified;

      // Update progress state
      setProgress({
        login: isLoggedIn,
        profileCompletion: isProfileComplete,
        documentUpload: areDocumentsUploaded,
        documentVerification: isDocumentVerification,
        documentVerified: isProfileVerified,
        finalSteps: false // TODO: Check when final steps are completed
      });
    } catch (error) {
      console.error('Error checking progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    {
      id: 'login',
      title: 'Login',
      description: 'Sign in to your account',
      icon: User,
      completed: progress.login,
      locked: false,
      action: () => router.push('/register'),
      actionText: 'Go to Login'
    },
    {
      id: 'profileCompletion',
      title: 'Profile Completion',
      description: 'Complete your academic profile',
      icon: FileText,
      completed: progress.profileCompletion,
      locked: !progress.login,
      action: () => router.push('/profile'),
      actionText: 'Complete Profile'
    },
    {
      id: 'documentUpload',
      title: 'Document Upload',
      description: 'Upload Resume/CV and SOP',
      icon: Upload,
      completed: progress.documentUpload,
      locked: !progress.profileCompletion,
      action: () => router.push('/document'),
      actionText: 'Upload Documents'
    },
    {
      id: 'documentVerification',
      title: 'Document Verification',
      description: 'Documents under review',
      icon: CheckSquare,
      completed: progress.documentVerification,
      locked: !progress.documentUpload,
      action: null,
      actionText: 'Under Review'
    },
    {
      id: 'documentVerified',
      title: 'Document Verified',
      description: 'All documents approved',
      icon: Award,
      completed: progress.documentVerified,
      locked: !progress.documentVerification && !progress.documentVerified,
      action: null,
      actionText: 'Verified'
    },
    {
      id: 'finalSteps',
      title: 'Final Steps',
      description: 'Complete your application',
      icon: CheckCircle,
      completed: progress.finalSteps,
      locked: !progress.documentVerified,
      action: () => router.push('/final-steps'),
      actionText: 'Complete Application'
    }
  ];

  const getProgressPercentage = () => {
    const completedStages = Object.values(progress).filter(Boolean).length;
    return (completedStages / Object.keys(progress).length) * 100;
  };

  const getCurrentStage = () => {
    return stages.findIndex(stage => !stage.completed);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
        <div className="text-xl text-red-600 flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          Loading application progress...
        </div>
      </div>
    );
  }

  return (
    <DefaultLayout>
    <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-gradient-to-br from-pink-50 to-red-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Application Builder
          </h1>
          <p className="text-gray-600 mb-6">
            Track your progress and complete each step to submit your application
          </p>

          {/* Overall Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Overall Progress
              </span>
              <span className="text-sm font-bold text-red-600">
                {Math.round(getProgressPercentage())}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 to-pink-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Current Stage Info */}
          {getCurrentStage() < stages.length && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Current Step: {stages[getCurrentStage()].title}
                </p>
                <p className="text-sm text-blue-700">
                  {stages[getCurrentStage()].description}
                </p>
              </div>
            </div>
          )}

          {getCurrentStage() === stages.length && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-sm font-semibold text-green-900">
                  All Steps Completed! 🎉
                </p>
                <p className="text-sm text-green-700">
                  You have successfully completed all application steps.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop View: Horizontal Progress */}
        <div className="hidden md:block bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-12 left-0 right-0 h-1 bg-gray-200 -z-10" />
            <div
              className="absolute top-12 left-0 h-1 bg-gradient-to-r from-red-600 to-pink-600 -z-10 transition-all duration-500"
              style={{ width: `${(Object.values(progress).filter(Boolean).length / stages.length) * 100}%` }}
            />

            {/* Stages */}
            <div className="flex justify-between">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <div key={stage.id} className="flex flex-col items-center" style={{ width: `${100 / stages.length}%` }}>
                    {/* Icon Circle */}
                    <div
                      className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                        stage.completed
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg scale-110'
                          : stage.locked
                          ? 'bg-gray-300'
                          : 'bg-gradient-to-br from-red-600 to-pink-600 shadow-lg'
                      }`}
                    >
                      {stage.locked ? (
                        <Lock className="text-white" size={32} />
                      ) : stage.completed ? (
                        <CheckCircle className="text-white" size={32} />
                      ) : (
                        <Icon className="text-white" size={32} />
                      )}
                    </div>

                    {/* Stage Info */}
                    <div className="text-center">
                      <h3 className={`font-bold text-sm mb-1 ${
                        stage.completed ? 'text-green-600' : stage.locked ? 'text-gray-400' : 'text-red-600'
                      }`}>
                        {stage.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3 px-2">
                        {stage.description}
                      </p>
                      
                      {/* Action Button */}
                      {stage.action && !stage.locked && !stage.completed && (
                        <button
                          onClick={stage.action}
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs rounded-lg hover:from-red-700 hover:to-pink-700 transition-all flex items-center gap-2 mx-auto"
                        >
                          {stage.actionText}
                          <ArrowRight size={14} />
                        </button>
                      )}
                      
                      {stage.completed && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                          <CheckCircle size={12} />
                          Completed
                        </span>
                      )}
                      
                      {stage.locked && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                          <Lock size={12} />
                          Locked
                        </span>
                      )}

                      {!stage.action && !stage.completed && !stage.locked && stage.id === 'documentVerification' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">
                          <AlertCircle size={12} />
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile View: Vertical Progress */}
        <div className="md:hidden space-y-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.id}
                className={`bg-white rounded-xl shadow-lg p-6 transition-all ${
                  stage.completed ? 'border-2 border-green-500' : stage.locked ? 'opacity-60' : 'border-2 border-red-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                      stage.completed
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                        : stage.locked
                        ? 'bg-gray-300'
                        : 'bg-gradient-to-br from-red-600 to-pink-600'
                    }`}
                  >
                    {stage.locked ? (
                      <Lock className="text-white" size={24} />
                    ) : stage.completed ? (
                      <CheckCircle className="text-white" size={24} />
                    ) : (
                      <Icon className="text-white" size={24} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-lg mb-1 ${
                      stage.completed ? 'text-green-600' : stage.locked ? 'text-gray-400' : 'text-red-600'
                    }`}>
                      {stage.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {stage.description}
                    </p>

                    {/* Status & Action */}
                    {stage.completed && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                        <CheckCircle size={12} />
                        Completed
                      </span>
                    )}
                    
                    {stage.locked && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        <Lock size={12} />
                        Locked
                      </span>
                    )}

                    {!stage.action && !stage.completed && !stage.locked && stage.id === 'documentVerification' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">
                        <AlertCircle size={12} />
                        Under Review
                      </span>
                    )}
                    
                    {stage.action && !stage.locked && !stage.completed && (
                      <button
                        onClick={stage.action}
                        className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm rounded-lg hover:from-red-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                      >
                        {stage.actionText}
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Connector Line for Mobile */}
                {index < stages.length - 1 && (
                  <div className="ml-8 mt-4 mb-4 h-8 w-0.5 bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Documentation</h3>
              <p className="text-sm text-red-700 mb-3">
                Learn more about each application step
              </p>
              <button className="text-sm text-red-600 font-semibold hover:underline">
                View Guides →
              </button>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Support</h3>
              <p className="text-sm text-blue-700 mb-3">
                Contact our team for assistance
              </p>
              <button className="text-sm text-blue-600 font-semibold hover:underline">
                Get Support →
              </button>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">FAQ</h3>
              <p className="text-sm text-green-700 mb-3">
                Find answers to common questions
              </p>
              <button className="text-sm text-green-600 font-semibold hover:underline">
                Browse FAQ →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DefaultLayout>
  );
};

export default ApplicationBuilderPage;