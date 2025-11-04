"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, BookOpen, Award, Trophy, Edit2, Save, X, CheckCircle, Trash2, Plus, Minus } from 'lucide-react';
import DefaultLayout from '../defaultLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface TestScore {
  exam: string;
  score: string;
}

interface FormData {
  name: string;
  degree: string;
  lastCourseCGPA: string;
  testScores: TestScore[];
  term: string;
  university: string;
  program: string;
  extracurricular: string;
  verified: boolean;
}

// Global cache for profile data
let cachedFormData: FormData | null = null;
let cachedHasProfile = false;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Export function to invalidate cache (call after save/delete)
export const invalidateProfileCache = () => {
  cachedFormData = null;
  cachedHasProfile = false;
  cacheTimestamp = 0;
};

const COMMON_EXAMS = [
  'GRE',
  'GMAT',
  'TOEFL',
  'IELTS',
  'Duolingo English Test',
  'PTE Academic',
  'TestDaF',
  'Goethe Certificate',
  'DELF/DALF',
  'SAT',
  'ACT',
  'Other'
];

const ProfilePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(!cachedFormData);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [hasProfile, setHasProfile] = useState(cachedHasProfile);

  const [formData, setFormData] = useState<FormData>(
    cachedFormData || {
      name: '',
      degree: '',
      lastCourseCGPA: '',
      testScores: [],
      term: '',
      university: '',
      program: '',
      extracurricular: '',
      verified: false
    }
  );

  useEffect(() => {
    if (user) {
      const now = Date.now();
      const isCacheValid = cachedFormData && (now - cacheTimestamp < CACHE_DURATION);
      
      if (!isCacheValid) {
        fetchUserProfile();
      } else {
        setLoading(false);
      }
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('admit_profiles')
        .select('name, degree, last_course_cgpa, test_scores, term, university, program, extracurricular, verified')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Fetch error:', fetchError);
        const defaultName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
        const defaultData = {
          name: defaultName,
          degree: '',
          lastCourseCGPA: '',
          testScores: [],
          term: '',
          university: '',
          program: '',
          extracurricular: '',
          verified: false
        };
        setFormData(defaultData);
        cachedFormData = defaultData;
        setHasProfile(false);
        cachedHasProfile = false;
        setIsEditing(true);
      } else if (data) {
        const profileData = {
          name: data.name || '',
          degree: data.degree || '',
          lastCourseCGPA: data.last_course_cgpa || '',
          testScores: data.test_scores || [],
          term: data.term || '',
          university: data.university || '',
          program: data.program || '',
          extracurricular: data.extracurricular || '',
          verified: data.verified || false
        };
        setFormData(profileData);
        cachedFormData = profileData;
        setHasProfile(true);
        cachedHasProfile = true;
        cacheTimestamp = Date.now();
      } else {
        const defaultName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
        const defaultData = {
          name: defaultName,
          degree: '',
          lastCourseCGPA: '',
          testScores: [],
          term: '',
          university: '',
          program: '',
          extracurricular: '',
          verified: false
        };
        setFormData(defaultData);
        cachedFormData = defaultData;
        setHasProfile(false);
        cachedHasProfile = false;
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      const defaultName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
      const defaultData = {
        name: defaultName,
        degree: '',
        lastCourseCGPA: '',
        testScores: [],
        term: '',
        university: '',
        program: '',
        extracurricular: '',
        verified: false
      };
      setFormData(defaultData);
      cachedFormData = defaultData;
      setHasProfile(false);
      cachedHasProfile = false;
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  }, []);

  const handleTestScoreChange = (index: number, field: 'exam' | 'score', value: string) => {
    setFormData(prev => {
      const newTestScores = [...prev.testScores];
      newTestScores[index] = { ...newTestScores[index], [field]: value };
      return { ...prev, testScores: newTestScores };
    });
    setError('');
  };

  const addTestScore = () => {
    setFormData(prev => ({
      ...prev,
      testScores: [...prev.testScores, { exam: '', score: '' }]
    }));
  };

  const removeTestScore = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testScores: prev.testScores.filter((_, i) => i !== index)
    }));
  };

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.degree) {
      setError('Please select your degree type');
      return false;
    }
    if (!formData.lastCourseCGPA) {
      setError('Please enter your last course CGPA/Percentage');
      return false;
    }
    
    // Validate test scores
    for (let i = 0; i < formData.testScores.length; i++) {
      const test = formData.testScores[i];
      if (!test.exam || !test.score) {
        setError(`Please complete test score #${i + 1} or remove it`);
        return false;
      }
    }
    
    return true;
  }, [formData]);

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');

      if (!user) throw new Error('User not authenticated');

      // Filter out empty test scores
      const validTestScores = formData.testScores.filter(
        test => test.exam && test.score
      );

      const profileData = {
        user_id: user.id,
        name: formData.name,
        degree: formData.degree,
        last_course_cgpa: formData.lastCourseCGPA,
        test_scores: validTestScores,
        term: formData.term,
        university: formData.university,
        program: formData.program,
        extracurricular: formData.extracurricular,
        applications_count: 1,
        avatar_type: 'S',
        verified: formData.verified,
        updated_at: new Date().toISOString()
      };

      if (hasProfile) {
        const { error: updateError } = await supabase
          .from('admit_profiles')
          .update(profileData)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        setSuccessMessage('Profile updated successfully!');
      } else {
        const { error: insertError } = await supabase
          .from('admit_profiles')
          .insert([{ ...profileData, created_at: new Date().toISOString() }]);

        if (insertError) throw insertError;
        setHasProfile(true);
        cachedHasProfile = true;
        setSuccessMessage('Profile created successfully!');
      }

      // Update cache
      cachedFormData = formData;
      cacheTimestamp = Date.now();
      invalidateProfileCache();

      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    try {
      setDeleting(true);
      setError('');

      const { error: deleteError } = await supabase
        .from('admit_profiles')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      const defaultData = {
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
        degree: '',
        lastCourseCGPA: '',
        testScores: [],
        term: '',
        university: '',
        program: '',
        extracurricular: '',
        verified: false
      };

      setFormData(defaultData);
      cachedFormData = defaultData;
      setHasProfile(false);
      cachedHasProfile = false;
      invalidateProfileCache();
      setIsEditing(true);
      setShowDeleteConfirm(false);
      setSuccessMessage('Profile deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError('Failed to delete profile. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setError('');
    if (hasProfile && cachedFormData) {
      setFormData(cachedFormData);
    }
  }, [hasProfile]);

  const userInitial = useMemo(() => {
    return formData.name ? formData.name.charAt(0).toUpperCase() : 'U';
  }, [formData.name]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-red-600 flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            Loading profile...
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {userInitial}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {hasProfile ? 'My Profile' : 'Create Your Profile'}
                  </h1>
                  <p className="text-gray-600">
                    {hasProfile ? 'Manage your academic information' : 'Tell us about yourself'}
                  </p>
                </div>
              </div>
              {hasProfile && !isEditing && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 bg-white border-2 border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {successMessage && (
              <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
                <CheckCircle size={20} />
                <p>{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="text-red-600" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Delete Profile</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete your profile? This action cannot be undone and will remove all your academic information.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all ${
                      deleting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Sections */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <User className="text-red-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree Type *
                  </label>
                  <select
                    value={formData.degree}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Degree</option>
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="PhD">Doctor of Philosophy (PhD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Course CGPA/Percentage *
                    <span className="text-xs text-gray-500 ml-2">
                      (12th for UG, UG for PG, PG for PhD)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastCourseCGPA}
                    onChange={(e) => handleInputChange('lastCourseCGPA', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                    placeholder="e.g., 8.5 or 85%"
                  />
                </div>
              </div>
            </div>

            {/* Test Scores - NEW DYNAMIC SECTION */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-red-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">Test Scores</h2>
                </div>
                {isEditing && (
                  <button
                    onClick={addTestScore}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                  >
                    <Plus size={18} />
                    Add Test
                  </button>
                )}
              </div>

              {formData.testScores.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {isEditing ? (
                    <p>No test scores added yet. Click "Add Test" to add your scores.</p>
                  ) : (
                    <p>No test scores available.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.testScores.map((test, index) => (
                    <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Type
                        </label>
                        {isEditing ? (
                          <select
                            value={test.exam}
                            onChange={(e) => handleTestScoreChange(index, 'exam', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="">Select Exam</option>
                            {COMMON_EXAMS.map(exam => (
                              <option key={exam} value={exam}>{exam}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="px-4 py-3 bg-gray-100 rounded-lg">{test.exam}</p>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Score
                        </label>
                        <input
                          type="text"
                          value={test.score}
                          onChange={(e) => handleTestScoreChange(index, 'score', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                          placeholder="e.g., 325, 7.5, TDN 5"
                        />
                      </div>

                      {isEditing && (
                        <button
                          onClick={() => removeTestScore(index)}
                          className="mt-8 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove test"
                        >
                          <Minus size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Academic Goals */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <Award className="text-red-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Academic Goals</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Term
                    </label>
                    <select
                      value={formData.term}
                      onChange={(e) => handleInputChange('term', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Term</option>
                      <option value="Fall 2025">Fall 2025</option>
                      <option value="Spring 2026">Spring 2026</option>
                      <option value="Fall 2026">Fall 2026</option>
                      <option value="Spring 2027">Spring 2027</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target University
                    </label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                      placeholder="e.g., Stanford University"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program/Major
                  </label>
                  <input
                    type="text"
                    value={formData.program}
                    onChange={(e) => handleInputChange('program', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            </div>

            {/* Extracurricular Activities */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="text-red-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Extracurricular Activities</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your achievements, activities, and experiences
                </label>
                <textarea
                  value={formData.extracurricular}
                  onChange={(e) => handleInputChange('extracurricular', e.target.value)}
                  disabled={!isEditing}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 resize-none"
                  placeholder="Include sports, volunteer work, leadership roles, competitions, research projects, internships, etc."
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all ${
                    saving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProfilePage;