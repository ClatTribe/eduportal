// "use client";
// import React, { useState, useEffect } from 'react';
// import { CheckCircle, Circle, Lock, ArrowRight, User, FileText, Upload, Award, AlertCircle } from 'lucide-react';
// import { useAuth } from '../../../contexts/AuthContext';
// import { useRouter } from 'next/navigation';
// import { supabase } from '../../../lib/supabase';
// import DefaultLayout from '../defaultLayout';

// interface ApplicationProgress {
//   login: boolean;
//   profileCompletion: boolean;
//   docsUploaded: number; // 0, 1, 2, or 3
//   docsVerified: number; // 0, 1, 2, or 3
//   finalSteps: boolean;
// }

// const ApplicationBuilderPage = () => {
//   const { user } = useAuth();
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [progress, setProgress] = useState<ApplicationProgress>({
//     login: false,
//     profileCompletion: false,
//     docsUploaded: 0,
//     docsVerified: 0,
//     finalSteps: false
//   });
//   const [pendingUploads, setPendingUploads] = useState<string[]>([]);
//   const [pendingVerifications, setPendingVerifications] = useState<string[]>([]);

//   useEffect(() => {
//     if (user) {
//       checkUserProgress();
//     }
//   }, [user]);

//   const checkUserProgress = async () => {
//     try {
//       setLoading(true);

//       // Check if user is logged in
//       const isLoggedIn = !!user;

//       // Check if profile is completed (name and degree must exist)
//       const { data: profileData } = await supabase
//         .from('admit_profiles')
//         .select('name, degree')
//         .eq('user_id', user?.id)
//         .single();

//       const isProfileComplete = !!(
//         profileData &&
//         profileData.name &&
//         profileData.degree
//       );

//       // Check documents upload and verification status
//       const { data: documentsData } = await supabase
//         .from('student_documents')
//         .select('resume_url, sop_url, lor_url, resume_status, sop_status, lor_status')
//         .eq('user_id', user?.id)
//         .single();

//       // Count uploaded documents
//       let uploadedCount = 0;
//       const pendingUploadsList: string[] = [];

//       if (documentsData) {
//         if (documentsData.lor_url) uploadedCount++;
//         else pendingUploadsList.push('LOR');

//         if (documentsData.sop_url) uploadedCount++;
//         else pendingUploadsList.push('SOP');

//         if (documentsData.resume_url) uploadedCount++;
//         else pendingUploadsList.push('Resume');
//       } else {
//         pendingUploadsList.push('LOR', 'SOP', 'Resume');
//       }

//       setPendingUploads(pendingUploadsList);

//       // Count verified documents
//       let verifiedCount = 0;
//       const pendingVerificationsList: string[] = [];

//       if (documentsData) {
//         if (documentsData.lor_status) verifiedCount++;
//         else if (documentsData.lor_url) pendingVerificationsList.push('LOR');

//         if (documentsData.sop_status) verifiedCount++;
//         else if (documentsData.sop_url) pendingVerificationsList.push('SOP');

//         if (documentsData.resume_status) verifiedCount++;
//         else if (documentsData.resume_url) pendingVerificationsList.push('Resume');
//       }

//       setPendingVerifications(pendingVerificationsList);

//       // Final steps are complete when all 3 documents are verified
//       const isFinalStepsComplete = verifiedCount === 3;

//       // Update progress state
//       setProgress({
//         login: isLoggedIn,
//         profileCompletion: isProfileComplete,
//         docsUploaded: uploadedCount,
//         docsVerified: verifiedCount,
//         finalSteps: isFinalStepsComplete
//       });
//     } catch (error) {
//       console.error('Error checking progress:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getUploadPercentage = () => {
//     if (progress.docsUploaded === 0) return 0;
//     return Math.round((progress.docsUploaded / 3) * 100);
//   };

//   const getUploadColor = () => {
//     if (progress.docsUploaded === 3) return 'from-green-500 to-emerald-600';
//     if (progress.docsUploaded === 2) return 'from-yellow-500 to-orange-500';
//     if (progress.docsUploaded === 1) return 'from-orange-500 to-red-500';
//     return 'from-gray-400 to-gray-500';
//   };

//   const getVerificationPercentage = () => {
//     if (progress.docsVerified === 0) return 0;
//     return Math.round((progress.docsVerified / 3) * 100);
//   };

//   const getVerificationColor = () => {
//     if (progress.docsVerified === 3) return 'from-green-500 to-emerald-600';
//     if (progress.docsVerified === 2) return 'from-yellow-500 to-orange-500';
//     if (progress.docsVerified === 1) return 'from-orange-500 to-red-500';
//     return 'from-gray-400 to-gray-500';
//   };

//   const stages = [
//     {
//       id: 'login',
//       title: 'Login',
//       description: 'Sign in to your account',
//       icon: User,
//       completed: progress.login,
//       locked: false,
//       action: () => router.push('/register'),
//       actionText: 'Go to Login'
//     },
//     {
//       id: 'profileCompletion',
//       title: 'Profile Completion',
//       description: 'Complete your academic profile',
//       icon: FileText,
//       completed: progress.profileCompletion,
//       locked: !progress.login,
//       action: () => router.push('/profile'),
//       actionText: 'Complete Profile'
//     },
//     {
//       id: 'documentUpload',
//       title: 'Document Upload',
//       description: `${progress.docsUploaded}/3 documents uploaded`,
//       icon: Upload,
//       completed: progress.docsUploaded === 3,
//       locked: !progress.profileCompletion,
//       action: () => router.push('/document'),
//       actionText: progress.docsUploaded === 3 ? 'All Uploaded' : 'Upload Documents',
//       isUpload: true
//     },
//     {
//       id: 'documentVerification',
//       title: 'Document Verification',
//       description: `${progress.docsVerified}/3 documents verified`,
//       icon: Award,
//       completed: progress.docsVerified === 3,
//       locked: progress.docsUploaded !== 3,
//       action: null,
//       actionText: progress.docsVerified === 3 ? 'All Verified' : 'Under Review',
//       isVerification: true
//     },
//     {
//       id: 'finalSteps',
//       title: 'Final Steps',
//       description: 'Complete your application',
//       icon: CheckCircle,
//       completed: progress.finalSteps,
//       locked: progress.docsVerified !== 3,
//       action: () => router.push('/final-steps'),
//       actionText: 'Complete Application'
//     }
//   ];

//   const getProgressPercentage = () => {
//     let completedCount = 0;
//     if (progress.login) completedCount++;
//     if (progress.profileCompletion) completedCount++;
//     if (progress.docsUploaded === 3) completedCount++;
//     if (progress.docsVerified === 3) completedCount++;
//     if (progress.finalSteps) completedCount++;
//     return (completedCount / 5) * 100;
//   };

//   const getCurrentStage = () => {
//     const index = stages.findIndex(stage => !stage.completed);
//     return index === -1 ? stages.length - 1 : index; // Return last stage if all completed
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
//         <div className="text-xl text-red-600 flex items-center gap-2">
//           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
//           Loading application progress...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <DefaultLayout>
//       <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-gradient-to-br from-pink-50 to-red-50 min-h-screen">
//         <div className="max-w-6xl mx-auto">
//           {/* Header */}
//           <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
//             <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
//               Application Builder
//             </h1>
//             <p className="text-gray-600 mb-6">
//               Track your progress and complete each step to submit your application
//             </p>

//             {/* Overall Progress Bar */}
//             <div className="mb-4">
//               <div className="flex justify-between items-center mb-2">
//                 <span className="text-sm font-semibold text-gray-700">
//                   Overall Progress
//                 </span>
//                 <span className="text-sm font-bold text-red-600">
//                   {Math.round(getProgressPercentage())}%
//                 </span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//                 <div
//                   className="bg-gradient-to-r from-red-600 to-pink-600 h-3 rounded-full transition-all duration-500 ease-out"
//                   style={{ width: `${getProgressPercentage()}%` }}
//                 />
//               </div>
//             </div>

//             {/* Current Stage Info */}
//             {getCurrentStage() < stages.length && !stages[getCurrentStage()].completed && (
//               <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                 <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
//                 <div>
//                   <p className="text-sm font-semibold text-blue-900">
//                     Current Step: {stages[getCurrentStage()].title}
//                   </p>
//                   <p className="text-sm text-blue-700">
//                     {stages[getCurrentStage()].description}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {stages.every(stage => stage.completed) && (
//               <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
//                 <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
//                 <div>
//                   <p className="text-sm font-semibold text-green-900">
//                     All Steps Completed! 🎉
//                   </p>
//                   <p className="text-sm text-green-700">
//                     You have successfully completed all application steps.
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Desktop View: Horizontal Progress */}
//           <div className="hidden md:block bg-white rounded-2xl shadow-xl p-8 mb-6">
//             <div className="relative">
//               {/* Progress Line */}
//               <div className="absolute top-12 left-0 right-0 h-1 bg-gray-200 -z-10" />
//               <div
//                 className="absolute top-12 left-0 h-1 bg-gradient-to-r from-red-600 to-pink-600 -z-10 transition-all duration-500"
//                 style={{ width: `${getProgressPercentage()}%` }}
//               />

//               {/* Stages */}
//               <div className="flex justify-between">
//                 {stages.map((stage, index) => {
//                   const Icon = stage.icon;
//                   const isUploadStage = stage.isUpload;
//                   const isVerificationStage = stage.isVerification;
                  
//                   return (
//                     <div key={stage.id} className="flex flex-col items-center" style={{ width: `${100 / stages.length}%` }}>
//                       {/* Icon Circle with Progress */}
//                       <div className="relative">
//                         <div
//                           className={`w-24 h-24 rounded-full flex flex-col items-center justify-center mb-4 transition-all duration-300 ${
//                             stage.completed
//                               ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg scale-110'
//                               : stage.locked
//                               ? 'bg-gray-300'
//                               : isUploadStage && progress.docsUploaded > 0
//                               ? `bg-gradient-to-br ${getUploadColor()} shadow-lg`
//                               : isVerificationStage && progress.docsVerified > 0
//                               ? `bg-gradient-to-br ${getVerificationColor()} shadow-lg`
//                               : 'bg-gradient-to-br from-red-600 to-pink-600 shadow-lg'
//                           }`}
//                         >
//                           {stage.locked ? (
//                             <Lock className="text-white" size={32} />
//                           ) : stage.completed ? (
//                             <CheckCircle className="text-white" size={32} />
//                           ) : (
//                             <>
//                               <Icon className="text-white" size={(isUploadStage || isVerificationStage) ? 24 : 32} />
//                               {isUploadStage && progress.docsUploaded > 0 && (
//                                 <span className="text-white text-xs font-bold mt-1">
//                                   {getUploadPercentage()}%
//                                 </span>
//                               )}
//                               {isVerificationStage && progress.docsVerified > 0 && (
//                                 <span className="text-white text-xs font-bold mt-1">
//                                   {getVerificationPercentage()}%
//                                 </span>
//                               )}
//                             </>
//                           )}
//                         </div>
//                       </div>

//                       {/* Stage Info */}
//                       <div className="text-center">
//                         <h3 className={`font-bold text-sm mb-1 ${
//                           stage.completed ? 'text-green-600' : stage.locked ? 'text-gray-400' : 'text-red-600'
//                         }`}>
//                           {stage.title}
//                         </h3>
//                         <p className="text-xs text-gray-600 mb-2 px-2">
//                           {stage.description}
//                         </p>
                        
//                         {/* Pending Documents Display for Upload */}
//                         {isUploadStage && pendingUploads.length > 0 && !stage.completed && (
//                           <p className="text-xs text-orange-600 font-semibold mb-3 px-2">
//                             Pending: {pendingUploads.join(', ')}
//                           </p>
//                         )}
                        
//                         {/* Pending Documents Display for Verification */}
//                         {isVerificationStage && pendingVerifications.length > 0 && !stage.completed && (
//                           <p className="text-xs text-orange-600 font-semibold mb-3 px-2">
//                             Pending: {pendingVerifications.join(', ')}
//                           </p>
//                         )}
                        
//                         {/* Action Button */}
//                         {stage.action && !stage.locked && !stage.completed && (
//                           <button
//                             onClick={stage.action}
//                             className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs rounded-lg hover:from-red-700 hover:to-pink-700 transition-all flex items-center gap-2 mx-auto"
//                           >
//                             {stage.actionText}
//                             <ArrowRight size={14} />
//                           </button>
//                         )}
                        
//                         {stage.completed && (
//                           <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
//                             <CheckCircle size={12} />
//                             Completed
//                           </span>
//                         )}
                        
//                         {stage.locked && (
//                           <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
//                             <Lock size={12} />
//                             Locked
//                           </span>
//                         )}

//                         {!stage.action && !stage.completed && !stage.locked && (isUploadStage || isVerificationStage) && (
//                           <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">
//                             <AlertCircle size={12} />
//                             {stage.actionText}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Mobile View: Vertical Progress */}
//           <div className="md:hidden space-y-4">
//             {stages.map((stage, index) => {
//               const Icon = stage.icon;
//               const isUploadStage = stage.isUpload;
//               const isVerificationStage = stage.isVerification;
              
//               return (
//                 <div
//                   key={stage.id}
//                   className={`bg-white rounded-xl shadow-lg p-6 transition-all ${
//                     stage.completed ? 'border-2 border-green-500' : stage.locked ? 'opacity-60' : 'border-2 border-red-500'
//                   }`}
//                 >
//                   <div className="flex items-start gap-4">
//                     {/* Icon */}
//                     <div className="relative">
//                       <div
//                         className={`w-16 h-16 rounded-full flex flex-col items-center justify-center flex-shrink-0 ${
//                           stage.completed
//                             ? 'bg-gradient-to-br from-green-500 to-emerald-600'
//                             : stage.locked
//                             ? 'bg-gray-300'
//                             : isUploadStage && progress.docsUploaded > 0
//                             ? `bg-gradient-to-br ${getUploadColor()}`
//                             : isVerificationStage && progress.docsVerified > 0
//                             ? `bg-gradient-to-br ${getVerificationColor()}`
//                             : 'bg-gradient-to-br from-red-600 to-pink-600'
//                         }`}
//                       >
//                         {stage.locked ? (
//                           <Lock className="text-white" size={24} />
//                         ) : stage.completed ? (
//                           <CheckCircle className="text-white" size={24} />
//                         ) : (
//                           <>
//                             <Icon className="text-white" size={(isUploadStage || isVerificationStage) ? 20 : 24} />
//                             {isUploadStage && progress.docsUploaded > 0 && (
//                               <span className="text-white text-xs font-bold mt-1">
//                                 {getUploadPercentage()}%
//                               </span>
//                             )}
//                             {isVerificationStage && progress.docsVerified > 0 && (
//                               <span className="text-white text-xs font-bold mt-1">
//                                 {getVerificationPercentage()}%
//                               </span>
//                             )}
//                           </>
//                         )}
//                       </div>
//                     </div>

//                     {/* Content */}
//                     <div className="flex-1 min-w-0">
//                       <h3 className={`font-bold text-lg mb-1 ${
//                         stage.completed ? 'text-green-600' : stage.locked ? 'text-gray-400' : 'text-red-600'
//                       }`}>
//                         {stage.title}
//                       </h3>
//                       <p className="text-sm text-gray-600 mb-3">
//                         {stage.description}
//                       </p>

//                       {/* Pending Documents Display for Upload */}
//                       {isUploadStage && pendingUploads.length > 0 && !stage.completed && (
//                         <p className="text-sm text-orange-600 font-semibold mb-3">
//                           Pending: {pendingUploads.join(', ')}
//                         </p>
//                       )}

//                       {/* Pending Documents Display for Verification */}
//                       {isVerificationStage && pendingVerifications.length > 0 && !stage.completed && (
//                         <p className="text-sm text-orange-600 font-semibold mb-3">
//                           Pending: {pendingVerifications.join(', ')}
//                         </p>
//                       )}

//                       {/* Status & Action */}
//                       {stage.completed && (
//                         <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
//                           <CheckCircle size={12} />
//                           Completed
//                         </span>
//                       )}
                      
//                       {stage.locked && (
//                         <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
//                           <Lock size={12} />
//                           Locked
//                         </span>
//                       )}

//                       {!stage.action && !stage.completed && !stage.locked && (isUploadStage || isVerificationStage) && (
//                         <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">
//                           <AlertCircle size={12} />
//                           {stage.actionText}
//                         </span>
//                       )}
                      
//                       {stage.action && !stage.locked && !stage.completed && (
//                         <button
//                           onClick={stage.action}
//                           className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm rounded-lg hover:from-red-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
//                         >
//                           {stage.actionText}
//                           <ArrowRight size={16} />
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   {/* Connector Line for Mobile */}
//                   {index < stages.length - 1 && (
//                     <div className="ml-8 mt-4 mb-4 h-8 w-0.5 bg-gray-200" />
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           {/* Help Section */}
//           <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mt-6">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h2>
//             <div className="grid md:grid-cols-3 gap-4">
//               <div className="p-4 bg-red-50 rounded-lg border border-red-200">
//                 <h3 className="font-semibold text-red-900 mb-2">Documentation</h3>
//                 <p className="text-sm text-red-700 mb-3">
//                   Learn more about each application step
//                 </p>
//                 <button className="text-sm text-red-600 font-semibold hover:underline">
//                   View Guides →
//                 </button>
//               </div>
//               <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//                 <h3 className="font-semibold text-blue-900 mb-2">Support</h3>
//                 <p className="text-sm text-blue-700 mb-3">
//                   Contact our team for assistance
//                 </p>
//                 <button className="text-sm text-blue-600 font-semibold hover:underline">
//                   Get Support →
//                 </button>
//               </div>
//               <div className="p-4 bg-green-50 rounded-lg border border-green-200">
//                 <h3 className="font-semibold text-green-900 mb-2">FAQ</h3>
//                 <p className="text-sm text-green-700 mb-3">
//                   Find answers to common questions
//                 </p>
//                 <button className="text-sm text-green-600 font-semibold hover:underline">
//                   Browse FAQ →
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </DefaultLayout>
//   );
// };

// export default ApplicationBuilderPage;

"use client";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import DefaultLayout from "../defaultLayout";
import ApplicationCard from "../../../components/ApplicationCard";
import { AlertCircle, CheckCircle, Trash2, Plus, Edit2 } from "lucide-react";

// ---------- Types ----------
type DocumentCategory =
  | "tenth"
  | "twelfth"
  | "graduation"
  | "pg"
  | "lor"
  | "sop"
  | "passport"
  | "resume"
  | "other";

interface UploadedFile {
  name: string;
  size?: number;
  uploadDate?: string;
  url: string;
}

interface StudentDocuments {
  tenth: UploadedFile[];
  twelfth: UploadedFile[];
  graduation: UploadedFile[];
  pg: UploadedFile[];
  lor: UploadedFile[];
  sop: UploadedFile[];
  passport: UploadedFile[];
  resume: UploadedFile[];
  other: UploadedFile[];
}

interface CourseRow {
  id: number;
  University: string | null;
  ["Program Name"]: string | null;
}

interface ApplicationBuilderRow {
  id?: number;
  user_id: string;
  university: string | null;
  program: string | null;
  documents: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

// ---------- Component ----------
const ApplicationBuilderPage: React.FC = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [documents, setDocuments] = useState<StudentDocuments | null>(null);
  const [applications, setApplications] = useState<ApplicationBuilderRow[]>([]);
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedDocs, setSelectedDocs] = useState<Record<DocumentCategory, string>>({
    tenth: "",
    twelfth: "",
    graduation: "",
    pg: "",
    lor: "",
    sop: "",
    passport: "",
    resume: "",
    other: "",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        await Promise.all([fetchCourses(), fetchDocuments(), fetchExistingApplications()]);
      } catch (e) {
        console.error(e);
        setLoadError("Failed to initialize application builder. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user?.id]);

  // ---------- Data fetching ----------
  const fetchCourses = async () => {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) throw error;
    const valid: CourseRow[] = (data || []).filter(
      (c: any) => c && typeof c.id === "number" && c.University
    );
    setCourses(valid);
  };

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from("student_documents")
      .select("*")
      .eq("user_id", user!.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!data && error?.code === "PGRST116") {
      const { error: insertError } = await supabase
        .from("student_documents")
        .insert([{ user_id: user!.id }]);
      if (insertError) throw insertError;

      setDocuments({
        tenth: [],
        twelfth: [],
        graduation: [],
        pg: [],
        lor: [],
        sop: [],
        passport: [],
        resume: [],
        other: [],
      });
      return;
    }

    setDocuments({
      tenth: (data.tenth_marksheets as UploadedFile[]) || [],
      twelfth: (data.twelfth_marksheets as UploadedFile[]) || [],
      graduation: (data.graduation_docs as UploadedFile[]) || [],
      pg: (data.pg_docs as UploadedFile[]) || [],
      lor: (data.lor_docs as UploadedFile[]) || [],
      sop: (data.sop_docs as UploadedFile[]) || [],
      passport: (data.passport_docs as UploadedFile[]) || [],
      resume: (data.resume_docs as UploadedFile[]) || [],
      other: (data.other_docs as UploadedFile[]) || [],
    });
  };

  const fetchExistingApplications = async () => {
    const { data, error } = await supabase
      .from("application_builder")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (data) {
      setApplications(data);
    }
  };

  // ---------- Derived lists ----------
  const universities: string[] = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.University) set.add(c.University);
    });
    return Array.from(set).sort();
  }, [courses]);

  const programsForSelectedUniversity: string[] = useMemo(() => {
    return courses
      .filter((c) => c.University === selectedUniversity)
      .map((c) => (c["Program Name"] || "").trim())
      .filter(Boolean)
      .reduce<string[]>((acc, p) => {
        if (!acc.includes(p)) acc.push(p);
        return acc;
      }, [])
      .sort();
  }, [courses, selectedUniversity]);

  // ---------- Handlers ----------
  const handleDocSelect = (category: DocumentCategory, url: string) => {
    setSelectedDocs((prev) => ({ ...prev, [category]: url }));
  };

  const handleNewApplication = () => {
    setEditingIndex(null);
    setSelectedUniversity("");
    setSelectedProgram("");
    setSelectedDocs({
      tenth: "",
      twelfth: "",
      graduation: "",
      pg: "",
      lor: "",
      sop: "",
      passport: "",
      resume: "",
      other: "",
    });
    setShowForm(true);
    setSaveMessage(null);
  };

  const handleEditApplication = (app: ApplicationBuilderRow, index: number) => {
    setEditingIndex(index);
    setSelectedUniversity(app.university || "");
    setSelectedProgram(app.program || "");
    const docMap = app.documents || {};
    setSelectedDocs({
      tenth: (docMap.tenth || "") as string,
      twelfth: (docMap.twelfth || "") as string,
      graduation: (docMap.graduation || "") as string,
      pg: (docMap.pg || "") as string,
      lor: (docMap.lor || "") as string,
      sop: (docMap.sop || "") as string,
      passport: (docMap.passport || "") as string,
      resume: (docMap.resume || "") as string,
      other: (docMap.other || "") as string,
    });
    setShowForm(true);
    setSaveMessage(null);
  };

  const handleDeleteApplication = async (app: ApplicationBuilderRow) => {
    if (!app.id) return;
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const { error } = await supabase
        .from("application_builder")
        .delete()
        .eq("id", app.id);

      if (error) throw error;

      setApplications((prev) => prev.filter((a) => a.id !== app.id));
      setSaveMessage("Application deleted successfully.");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setSaveMessage("Failed to delete application. Please try again.");
    }
  };

  const handleSaveApplication = async () => {
    setSaveMessage(null);
    if (!user) return;
    if (!selectedUniversity || !selectedProgram) {
      setSaveMessage("Please select both university and program.");
      return;
    }

    if (editingIndex === null && applications.length >= 5) {
      setSaveMessage("You can only create up to 5 applications.");
      return;
    }

    setSaving(true);
    try {
      const payload: ApplicationBuilderRow = {
        user_id: user.id,
        university: selectedUniversity,
        program: selectedProgram,
        documents: selectedDocs,
      };

      if (editingIndex !== null && applications[editingIndex]?.id) {
        payload.id = applications[editingIndex].id;
        const { error } = await supabase
          .from("application_builder")
          .update(payload)
          .eq("id", payload.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("application_builder")
          .insert([payload])
          .select();

        if (error) throw error;
      }

      await fetchExistingApplications();
      setSaveMessage("Application saved successfully.");
      setShowForm(false);
      
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setSaveMessage("Failed to save application. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingIndex(null);
    setSaveMessage(null);
  };

  // ---------- UI ----------
  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
          <div className="text-xl text-red-600 flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            Loading application builder...
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-gradient-to-br from-pink-50 to-red-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  Your Applications
                </h1>
                <p className="text-gray-600">
                  Build and manage up to 5 university applications
                </p>
              </div>
              {!showForm && applications.length < 5 && (
                <button
                  onClick={handleNewApplication}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg font-semibold shadow-lg transition-all"
                >
                  <Plus size={20} />
                  New Application
                </button>
              )}
            </div>

            {loadError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700">{loadError}</p>
                </div>
              </div>
            )}

            {saveMessage && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${
                  saveMessage.toLowerCase().includes("success")
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-yellow-50 border border-yellow-200 text-yellow-700"
                }`}
              >
                {saveMessage}
              </div>
            )}

            {/* Applications List */}
            {/* {!showForm && applications.length > 0 && (
              <div className="space-y-4">
                {applications.map((app, index) => (
                  <div
                    key={app.id || index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">
                          {app.university}
                        </h3>
                        <p className="text-gray-600 mt-1">{app.program}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(app.documents || {}).map(([key, value]) => {
                            if (value) {
                              return (
                                <span
                                  key={key}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold"
                                >
                                  <CheckCircle size={10} />
                                  {key}
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditApplication(app, index)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(app)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )} */}
            {!showForm && applications.length > 0 && (
  <div className="space-y-4">
    {applications.map((app, index) => (
      <ApplicationCard
        key={app.id || index}
        application={app}
        index={index}
        variant="rectangular"
        onEdit={handleEditApplication}
        onDelete={handleDeleteApplication}
      />
    ))}
  </div>
)}

            {!showForm && applications.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No applications created yet</p>
                <button
                  onClick={handleNewApplication}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg font-semibold shadow-lg transition-all"
                >
                  <Plus size={20} />
                  Create Your First Application
                </button>
              </div>
            )}
          </div>

          {/* Application Form */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingIndex !== null ? "Edit Application" : "New Application"}
              </h2>

              {/* University */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  University
                </label>
                <select
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={selectedUniversity}
                  onChange={(e) => {
                    setSelectedUniversity(e.target.value);
                    setSelectedProgram("");
                  }}
                >
                  <option value="">Select University</option>
                  {universities.map((uni: string) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>

              {/* Program */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Program
                </label>
                <select
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  disabled={!selectedUniversity}
                >
                  <option value="">
                    {selectedUniversity ? "Select Program" : "Choose a university first"}
                  </option>
                  {programsForSelectedUniversity.map((program: string) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>

              {/* Documents */}
              <h3 className="text-xl font-bold text-gray-800 mb-4">Attach documents</h3>

              {!documents ? (
                <div className="text-sm text-gray-600 mb-6">
                  No uploaded documents found. Please upload documents in the Document Upload
                  section first.
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {(Object.entries(documents) as [DocumentCategory, UploadedFile[]][]).map(
                    ([category, files]) => (
                      <div key={category}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                          {category} document
                        </label>
                        <select
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                          value={selectedDocs[category] || ""}
                          onChange={(e) => handleDocSelect(category, e.target.value)}
                        >
                          <option value="">
                            {files.length > 0
                              ? `Select ${category} document`
                              : `No ${category} documents uploaded`}
                          </option>
                          {files.map((file: UploadedFile, idx: number) => (
                            <option key={`${category}-${idx}`} value={file.url}>
                              {file.name}
                            </option>
                          ))}
                        </select>
                        {selectedDocs[category] && (
                          <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                            <CheckCircle size={12} />
                            Selected
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveApplication}
                  disabled={saving}
                  className={`flex-1 py-3 rounded-lg font-bold text-white transition-all ${
                    saving
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg"
                  }`}
                >
                  {saving ? "Saving..." : editingIndex !== null ? "Update Application" : "Save Application"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-6 py-3 rounded-lg font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ApplicationBuilderPage;