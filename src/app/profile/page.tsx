"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, BookOpen, Award, Trophy, Edit2, Save, X, CheckCircle, Trash2, Plus, Minus, Globe, GraduationCap, Target, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import DefaultLayout from '../defaultLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface TestScore {
  exam: string;
  score: string;
}

interface FormData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  
  // Target Program
  target_countries: string[];
  target_degree: string;
  target_field: string;
  budget: string;
  intake_year: string;
  
  // 10th Grade
  tenth_board: string;
  tenth_year: string;
  tenth_score: string;
  
  // 12th Grade
  twelfth_board: string;
  twelfth_year: string;
  twelfth_score: string;
  twelfth_stream: string;
  
  // Undergraduate
  ug_degree: string;
  ug_university: string;
  ug_year: string;
  ug_score: string;
  ug_field: string;
  
  // Postgraduate
  pg_degree: string;
  pg_university: string;
  pg_year: string;
  pg_score: string;
  pg_field: string;
  
  // Test Scores (keeping original dynamic pattern)
  testScores: TestScore[];
  
  // Work Experience
  has_experience: string;
  experience_years: string;
  experience_field: string;
  
  // Other
  extracurricular: string;
  verified: boolean;
}

// Global cache for profile data
let cachedFormData: FormData | null = null;
let cachedHasProfile = false;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000;

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

const COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Europe (Other)'];

const DEGREE_OPTIONS = [
  { value: 'Bachelors', label: 'Bachelors (Undergraduate)' },
  { value: 'Masters', label: 'Masters' },
  { value: 'MBA', label: 'MBA' },
  { value: 'PhD', label: 'PhD / Doctorate' },
  { value: 'Diploma', label: 'Diploma/Certificate' }
];

// Move these components outside to prevent recreation - FIXED INPUT FOCUS ISSUE
const InputField = React.memo(({ label, type = "text", value, onChange, placeholder, required = false, disabled, field }: any) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
      />
    </div>
  );
});

InputField.displayName = 'InputField';

const SelectField = React.memo(({ label, value, onChange, options, required = false, disabled, field }: any) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
      >
        <option value="">Select...</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
});

SelectField.displayName = 'SelectField';

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
  const [expandedSection, setExpandedSection] = useState('target');

  const [formData, setFormData] = useState<FormData>(
    cachedFormData || {
      name: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      target_countries: [],
      target_degree: '',
      target_field: '',
      budget: '',
      intake_year: '',
      tenth_board: '',
      tenth_year: '',
      tenth_score: '',
      twelfth_board: '',
      twelfth_year: '',
      twelfth_score: '',
      twelfth_stream: '',
      ug_degree: '',
      ug_university: '',
      ug_year: '',
      ug_score: '',
      ug_field: '',
      pg_degree: '',
      pg_university: '',
      pg_year: '',
      pg_score: '',
      pg_field: '',
      testScores: [],
      has_experience: '',
      experience_years: '',
      experience_field: '',
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
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Fetch error:', fetchError);
        const defaultData = getDefaultFormData();
        setFormData(defaultData);
        cachedFormData = defaultData;
        setHasProfile(false);
        cachedHasProfile = false;
        setIsEditing(true);
      } else if (data) {
        const profileData: FormData = {
          name: data.name || '',
          email: data.email || user?.email || '',
          phone: data.phone || '',
          city: data.city || '',
          state: data.state || '',
          target_countries: data.target_countries || [],
          target_degree: data.degree || '',
          target_field: data.program || '',
          budget: data.budget || '',
          intake_year: data.intake_year || '',
          tenth_board: data.tenth_board || '',
          tenth_year: data.tenth_year || '',
          tenth_score: data.tenth_score || '',
          twelfth_board: data.twelfth_board || '',
          twelfth_year: data.twelfth_year || '',
          twelfth_score: data.twelfth_score || '',
          twelfth_stream: data.twelfth_stream || '',
          ug_degree: data.ug_degree || '',
          ug_university: data.ug_university || '',
          ug_year: data.ug_year || '',
          ug_score: data.ug_score || '',
          ug_field: data.ug_field || '',
          pg_degree: data.pg_degree || '',
          pg_university: data.pg_university || '',
          pg_year: data.pg_year || '',
          pg_score: data.pg_score || '',
          pg_field: data.pg_field || '',
          testScores: data.test_scores || [],
          has_experience: data.has_experience || '',
          experience_years: data.experience_years || '',
          experience_field: data.experience_field || '',
          extracurricular: data.extracurricular || '',
          verified: data.verified || false
        };
        setFormData(profileData);
        cachedFormData = profileData;
        setHasProfile(true);
        cachedHasProfile = true;
        cacheTimestamp = Date.now();
      } else {
        const defaultData = getDefaultFormData();
        setFormData(defaultData);
        cachedFormData = defaultData;
        setHasProfile(false);
        cachedHasProfile = false;
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      const defaultData = getDefaultFormData();
      setFormData(defaultData);
      cachedFormData = defaultData;
      setHasProfile(false);
      cachedHasProfile = false;
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultFormData = (): FormData => ({
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
    email: user?.email || '',
    phone: '',
    city: '',
    state: '',
    target_countries: [],
    target_degree: '',
    target_field: '',
    budget: '',
    intake_year: '',
    tenth_board: '',
    tenth_year: '',
    tenth_score: '',
    twelfth_board: '',
    twelfth_year: '',
    twelfth_score: '',
    twelfth_stream: '',
    ug_degree: '',
    ug_university: '',
    ug_year: '',
    ug_score: '',
    ug_field: '',
    pg_degree: '',
    pg_university: '',
    pg_year: '',
    pg_score: '',
    pg_field: '',
    testScores: [],
    has_experience: '',
    experience_years: '',
    experience_field: '',
    extracurricular: '',
    verified: false
  });

  // Fixed: Properly memoized input change handler with field parameter
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  }, []);

  const handleMultiSelect = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      target_countries: prev.target_countries.includes(value)
        ? prev.target_countries.filter(c => c !== value)
        : [...prev.target_countries, value]
    }));
    setError('');
  }, []);

  const handleTestScoreChange = useCallback((index: number, field: 'exam' | 'score', value: string) => {
    setFormData(prev => {
      const newTestScores = [...prev.testScores];
      newTestScores[index] = { ...newTestScores[index], [field]: value };
      return { ...prev, testScores: newTestScores };
    });
    setError('');
  }, []);

  const addTestScore = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      testScores: [...prev.testScores, { exam: '', score: '' }]
    }));
  }, []);

  const removeTestScore = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      testScores: prev.testScores.filter((_, i) => i !== index)
    }));
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSection(prev => prev === section ? '' : section);
  }, []);

  const shouldShowUG = useMemo(() => ['Masters', 'MBA', 'PhD'].includes(formData.target_degree), [formData.target_degree]);
  const shouldShowPG = useMemo(() => formData.target_degree === 'PhD', [formData.target_degree]);
  const shouldShowWorkExp = useMemo(() => ['Masters', 'MBA', 'PhD'].includes(formData.target_degree), [formData.target_degree]);

  const isSectionComplete = useCallback((section: string) => {
    switch(section) {
      case 'target':
        return formData.target_countries.length > 0 && formData.target_degree && formData.target_field;
      case 'personal':
        return !!(formData.name && formData.email && formData.phone && formData.city);
      case 'tenth':
        return !!(formData.tenth_board && formData.tenth_year && formData.tenth_score);
      case 'twelfth':
        return !!(formData.twelfth_board && formData.twelfth_year && formData.twelfth_score && formData.twelfth_stream);
      case 'ug':
        return !shouldShowUG || !!(formData.ug_degree && formData.ug_university && formData.ug_year && formData.ug_score);
      case 'pg':
        return !shouldShowPG || !!(formData.pg_degree && formData.pg_university && formData.pg_year);
      case 'tests':
        return formData.testScores.length > 0;
      case 'experience':
        return !shouldShowWorkExp || !!formData.has_experience;
      default:
        return false;
    }
  }, [formData, shouldShowUG, shouldShowPG, shouldShowWorkExp]);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (formData.target_countries.length === 0) {
      setError('Please select at least one preferred country');
      return false;
    }
    if (!formData.target_degree) {
      setError('Please select your target degree');
      return false;
    }
    if (!formData.target_field) {
      setError('Please enter your field of interest');
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
        email: formData.email,
        phone: formData.phone,
        city: formData.city || null,
        state: formData.state || null,
        target_countries: formData.target_countries,
        degree: formData.target_degree,
        program: formData.target_field,
        budget: formData.budget || null,
        intake_year: formData.intake_year || null,
        tenth_board: formData.tenth_board || null,
        tenth_year: formData.tenth_year || null,
        tenth_score: formData.tenth_score || null,
        twelfth_board: formData.twelfth_board || null,
        twelfth_year: formData.twelfth_year || null,
        twelfth_score: formData.twelfth_score || null,
        twelfth_stream: formData.twelfth_stream || null,
        ug_degree: formData.ug_degree || null,
        ug_university: formData.ug_university || null,
        ug_year: formData.ug_year || null,
        ug_score: formData.ug_score || null,
        ug_field: formData.ug_field || null,
        pg_degree: formData.pg_degree || null,
        pg_university: formData.pg_university || null,
        pg_year: formData.pg_year || null,
        pg_score: formData.pg_score || null,
        pg_field: formData.pg_field || null,
        test_scores: validTestScores,
        has_experience: formData.has_experience || null,
        experience_years: formData.experience_years || null,
        experience_field: formData.experience_field || null,
        extracurricular: formData.extracurricular || null,
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

      const defaultData = getDefaultFormData();
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

  const Section = useCallback(({ id, title, icon: Icon, children, visible = true }: any) => {
    if (!visible) return null;
    
    const isExpanded = expandedSection === id;
    const isComplete = isSectionComplete(id);

    return (
      <div className="mb-4 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-red-50 to-white hover:from-red-100 hover:to-red-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-gray-800">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {isComplete && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-red-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-red-600" />
            )}
          </div>
        </button>
        
        {isExpanded && (
          <div className="px-6 py-5 bg-white">
            {children}
          </div>
        )}
      </div>
    );
  }, [expandedSection, isSectionComplete, toggleSection]);

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
      <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-red-50 via-white to-red-50">
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
          <div className="space-y-4">
            {/* Target Program */}
            <Section id="target" title="What are you looking to study?" icon={Target}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Countries <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {COUNTRIES.map(country => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => isEditing && handleMultiSelect(country)}
                      disabled={!isEditing}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        formData.target_countries.includes(country)
                          ? 'border-red-600 bg-red-50 text-red-700 font-medium'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-red-400'
                      } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="What degree are you applying for?"
                  value={formData.target_degree}
                  onChange={handleInputChange}
                  field="target_degree"
                  options={DEGREE_OPTIONS}
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Field of Interest"
                  value={formData.target_field}
                  onChange={handleInputChange}
                  field="target_field"
                  placeholder="Computer Science, MBA, Medicine, etc."
                  required
                  disabled={!isEditing}
                />
                <SelectField
                  label="When do you plan to start?"
                  value={formData.intake_year}
                  onChange={handleInputChange}
                  field="intake_year"
                  options={[
                    { value: '2025', label: 'Fall 2025' },
                    { value: 'Spring 2026', label: 'Spring 2026' },
                    { value: 'Fall 2026', label: 'Fall 2026' },
                    { value: '2027', label: '2027 or later' }
                  ]}
                  disabled={!isEditing}
                />
                <SelectField
                  label="Budget Range (Annual)"
                  value={formData.budget}
                  onChange={handleInputChange}
                  field="budget"
                  options={[
                    { value: 'Under 10L', label: 'Under ₹10 Lakhs' },
                    { value: '10-20L', label: '₹10-20 Lakhs' },
                    { value: '20-30L', label: '₹20-30 Lakhs' },
                    { value: 'Above 30L', label: 'Above ₹30 Lakhs' }
                  ]}
                  disabled={!isEditing}
                />
              </div>
            </Section>

            {/* Personal Information */}
            <Section id="personal" title="Personal Information" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  field="name"
                  placeholder="Enter your full name"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  field="email"
                  placeholder="your.email@example.com"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  field="phone"
                  placeholder="+91 XXXXX XXXXX"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  field="city"
                  placeholder="Your city"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="State"
                  value={formData.state}
                  onChange={handleInputChange}
                  field="state"
                  placeholder="Your state"
                  disabled={!isEditing}
                />
              </div>
            </Section>

            {/* 10th Grade */}
            <Section id="tenth" title="10th Grade Details" icon={GraduationCap}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField
                  label="Board"
                  value={formData.tenth_board}
                  onChange={handleInputChange}
                  field="tenth_board"
                  options={[
                    { value: 'CBSE', label: 'CBSE' },
                    { value: 'ICSE', label: 'ICSE' },
                    { value: 'State Board', label: 'State Board' },
                    { value: 'Other', label: 'Other' }
                  ]}
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Year of Passing"
                  type="number"
                  value={formData.tenth_year}
                  onChange={handleInputChange}
                  field="tenth_year"
                  placeholder="2019"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Percentage/CGPA"
                  value={formData.tenth_score}
                  onChange={handleInputChange}
                  field="tenth_score"
                  placeholder="85% or 9.5 CGPA"
                  required
                  disabled={!isEditing}
                />
              </div>
            </Section>

            {/* 12th Grade */}
            <Section id="twelfth" title="12th Grade Details" icon={GraduationCap}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Board"
                  value={formData.twelfth_board}
                  onChange={handleInputChange}
                  field="twelfth_board"
                  options={[
                    { value: 'CBSE', label: 'CBSE' },
                    { value: 'ICSE', label: 'ICSE' },
                    { value: 'State Board', label: 'State Board' },
                    { value: 'Other', label: 'Other' }
                  ]}
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Year of Passing"
                  type="number"
                  value={formData.twelfth_year}
                  onChange={handleInputChange}
                  field="twelfth_year"
                  placeholder="2021"
                  required
                  disabled={!isEditing}
                />
                <SelectField
                  label="Stream"
                  value={formData.twelfth_stream}
                  onChange={handleInputChange}
                  field="twelfth_stream"
                  options={[
                    { value: 'Science', label: 'Science' },
                    { value: 'Commerce', label: 'Commerce' },
                    { value: 'Arts', label: 'Arts' },
                    { value: 'Other', label: 'Other' }
                  ]}
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Percentage/CGPA"
                  value={formData.twelfth_score}
                  onChange={handleInputChange}
                  field="twelfth_score"
                  placeholder="88% or 9.2 CGPA"
                  required
                  disabled={!isEditing}
                />
              </div>
            </Section>

            {/* Undergraduate */}
            <Section id="ug" title="Undergraduate Details" icon={GraduationCap} visible={shouldShowUG}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Degree"
                  value={formData.ug_degree}
                  onChange={handleInputChange}
                  field="ug_degree"
                  placeholder="B.Tech, B.Sc, B.Com, etc."
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="University/College"
                  value={formData.ug_university}
                  onChange={handleInputChange}
                  field="ug_university"
                  placeholder="Name of institution"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Field of Study"
                  value={formData.ug_field}
                  onChange={handleInputChange}
                  field="ug_field"
                  placeholder="Computer Science, Mechanical, etc."
                  disabled={!isEditing}
                />
                <InputField
                  label="Year of Graduation"
                  type="number"
                  value={formData.ug_year}
                  onChange={handleInputChange}
                  field="ug_year"
                  placeholder="2024"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="CGPA/Percentage"
                  value={formData.ug_score}
                  onChange={handleInputChange}
                  field="ug_score"
                  placeholder="8.5 CGPA or 85%"
                  required
                  disabled={!isEditing}
                />
              </div>
            </Section>

            {/* Postgraduate */}
            <Section id="pg" title="Postgraduate/Masters Details" icon={GraduationCap} visible={shouldShowPG}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Degree"
                  value={formData.pg_degree}
                  onChange={handleInputChange}
                  field="pg_degree"
                  placeholder="M.Tech, M.Sc, MBA, etc."
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="University"
                  value={formData.pg_university}
                  onChange={handleInputChange}
                  field="pg_university"
                  placeholder="Name of institution"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="Field of Study"
                  value={formData.pg_field}
                  onChange={handleInputChange}
                  field="pg_field"
                  placeholder="Specialization"
                  disabled={!isEditing}
                />
                <InputField
                  label="Year of Graduation"
                  type="number"
                  value={formData.pg_year}
                  onChange={handleInputChange}
                  field="pg_year"
                  placeholder="2024"
                  required
                  disabled={!isEditing}
                />
                <InputField
                  label="CGPA/Percentage"
                  value={formData.pg_score}
                  onChange={handleInputChange}
                  field="pg_score"
                  placeholder="8.5 CGPA or 85%"
                  disabled={!isEditing}
                />
              </div>
            </Section>

            {/* Test Scores */}
            <Section id="tests" title="Test Scores" icon={BookOpen}>
              <div className="flex items-center justify-between mb-4">
                {isEditing && (
                  <button
                    onClick={addTestScore}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all ml-auto"
                  >
                    <Plus size={18} />
                    Add Test
                  </button>
                )}
              </div>

              {formData.testScores.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {isEditing ? (
                    <p>No test scores added yet. Click &quot;Add Test&quot; to add your scores.</p>
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
                          placeholder="e.g., 325, 7.5, 110"
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
            </Section>

            {/* Work Experience */}
            <Section id="experience" title="Work Experience" icon={Award} visible={shouldShowWorkExp}>
              <SelectField
                label="Do you have work experience?"
                value={formData.has_experience}
                onChange={handleInputChange}
                field="has_experience"
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' }
                ]}
                required
                disabled={!isEditing}
              />
              {formData.has_experience === 'Yes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <InputField
                    label="Years of Experience"
                    type="number"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    field="experience_years"
                    placeholder="2"
                    disabled={!isEditing}
                  />
                  <InputField
                    label="Field/Industry"
                    value={formData.experience_field}
                    onChange={handleInputChange}
                    field="experience_field"
                    placeholder="IT, Finance, Healthcare, etc."
                    disabled={!isEditing}
                  />
                </div>
              )}
            </Section>

            {/* Extracurricular Activities */}
            <Section id="extra" title="Extracurricular Activities" icon={Trophy}>
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
            </Section>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center justify-end gap-4 mt-6">
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