// ============ ProfilePage.tsx ============
"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Save, X, Trash2, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import DefaultLayout from "../defaultLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";

// Import custom components
import TargetProgramSection from "../../../components/ProfileData/TargetProgramSection";
import PersonalInfoSection from "../../../components/ProfileData/PersonalInfoSection";
import AcademicSection from "../../../components/ProfileData/AcademicSection";
import TestScoresSection from "../../../components/ProfileData/TestScoresSection";
import WorkExperienceSection from "../../../components/ProfileData/WorkExperienceSection";
import ExtracurricularSection from "../../../components/ProfileData/ExtracurricularSection";
import ProfileHeader from "../../../components/ProfileData/ProfileHeader";

// Color scheme from home page
const accentColor = '#A51C30';
const primaryBg = '#FFFFFF';
const borderColor = '#FECDD3';

interface TestScore {
  exam: string;
  score: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  contact_preferences: string[];
  target_countries: string[];
  target_degree: string;
  target_field: string;
  budget: string;
  term: string;
  tenth_board: string;
  tenth_year: string;
  tenth_score: string;
  twelfth_board: string;
  twelfth_year: string;
  twelfth_score: string;
  twelfth_stream: string;
  ug_degree: string;
  ug_university: string;
  ug_year: string;
  ug_score: string;
  ug_field: string;
  pg_degree: string;
  pg_university: string;
  pg_year: string;
  pg_score: string;
  pg_field: string;
  testScores: TestScore[];
  has_experience: string;
  experience_years: string;
  experience_field: string;
  extracurricular: string;
  verified: boolean;
}

// Global cache
let cachedFormData: FormData | null = null;
let cachedHasProfile = false;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export const invalidateProfileCache = () => {
  cachedFormData = null;
  cachedHasProfile = false;
  cacheTimestamp = 0;
};

// Shared Components
interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (field: string, value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  field: string;
}

const InputField = React.memo(
  ({ label, type = "text", value, onChange, placeholder, required = false, disabled, field }: InputFieldProps) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span style={{ color: accentColor }}>*</span>}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none text-gray-800 placeholder:text-gray-400"
          style={{ 
            borderColor: borderColor,
            ...(disabled && { backgroundColor: '#F3F4F6' })
          }}
          onFocus={(e) => !disabled && (e.target.style.borderColor = accentColor)}
          onBlur={(e) => !disabled && (e.target.style.borderColor = borderColor)}
        />
      </div>
    );
  }
);
InputField.displayName = "InputField";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (field: string, value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  field: string;
}

const SelectField = React.memo(
  ({ label, value, onChange, options, required = false, disabled, field }: SelectFieldProps) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span style={{ color: accentColor }}>*</span>}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          disabled={disabled}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none text-gray-800"
          style={{ 
            borderColor: borderColor,
            ...(disabled && { backgroundColor: '#F3F4F6' })
          }}
          onFocus={(e) => !disabled && (e.target.style.borderColor = accentColor)}
          onBlur={(e) => !disabled && (e.target.style.borderColor = borderColor)}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
SelectField.displayName = "SelectField";

interface SectionProps {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  visible?: boolean;
  isExpanded: boolean;
  isComplete: boolean;
  onToggle: (id: string) => void;
}

const Section = React.memo(
  ({ id, title, icon: Icon, children, visible = true, isExpanded, isComplete, onToggle }: SectionProps) => {
    if (!visible) return null;
    return (
      <div 
        className="mb-3 sm:mb-4 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden transition-all"
        style={{ backgroundColor: primaryBg, border: `2px solid ${borderColor}` }}
      >
        <button
          type="button"
          onClick={() => onToggle(id)}
          className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between transition-colors"
          style={{ backgroundColor: '#FEF2F3' }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <span style={{ color: accentColor }}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </span>
            <span className="font-semibold text-gray-800 text-sm sm:text-base text-left">{title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isComplete && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />}
            <span style={{ color: accentColor }}>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </span>
          </div>
        </button>
        {isExpanded && (
          <div className="px-4 sm:px-6 py-4 sm:py-5" style={{ backgroundColor: primaryBg }}>
            {children}
          </div>
        )}
      </div>
    );
  }
);
Section.displayName = "Section";

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(!cachedFormData);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [hasProfile, setHasProfile] = useState(cachedHasProfile);
  const [expandedSection, setExpandedSection] = useState("target");
  const [formData, setFormData] = useState<FormData>(
    cachedFormData || {
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      contact_preferences: [],
      target_countries: [],
      target_degree: "",
      target_field: "",
      budget: "",
      term: "",
      tenth_board: "",
      tenth_year: "",
      tenth_score: "",
      twelfth_board: "",
      twelfth_year: "",
      twelfth_score: "",
      twelfth_stream: "",
      ug_degree: "",
      ug_university: "",
      ug_year: "",
      ug_score: "",
      ug_field: "",
      pg_degree: "",
      pg_university: "",
      pg_year: "",
      pg_score: "",
      pg_field: "",
      testScores: [],
      has_experience: "",
      experience_years: "",
      experience_field: "",
      extracurricular: "",
      verified: false,
    }
  );

  const getDefaultFormData = useCallback(
    (): FormData => ({
      name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "",
      email: user?.email || "",
      phone: "",
      city: "",
      state: "",
      contact_preferences: [],
      target_countries: [],
      target_degree: "",
      target_field: "",
      budget: "",
      term: "",
      tenth_board: "",
      tenth_year: "",
      tenth_score: "",
      twelfth_board: "",
      twelfth_year: "",
      twelfth_score: "",
      twelfth_stream: "",
      ug_degree: "",
      ug_university: "",
      ug_year: "",
      ug_score: "",
      ug_field: "",
      pg_degree: "",
      pg_university: "",
      pg_year: "",
      pg_score: "",
      pg_field: "",
      testScores: [],
      has_experience: "",
      experience_years: "",
      experience_field: "",
      extracurricular: "",
      verified: false,
    }),
    [user]
  );

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("admit_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Fetch error:", fetchError);
        const defaultData = getDefaultFormData();
        setFormData(defaultData);
        cachedFormData = defaultData;
        setHasProfile(false);
        cachedHasProfile = false;
        setIsEditing(true);
      } else if (data) {
        const profileData: FormData = {
          name: data.name || "",
          email: data.email || user?.email || "",
          phone: data.phone || "",
          city: data.city || "",
          state: data.state || "",
          contact_preferences: data.contact_preferences || [],
          target_countries: data.target_countries || [],
          target_degree: data.degree || "",
          target_field: data.program || "",
          budget: data.budget || "",
          term: data.term || data.intake_year || "",
          tenth_board: data.tenth_board || "",
          tenth_year: data.tenth_year || "",
          tenth_score: data.tenth_score || "",
          twelfth_board: data.twelfth_board || "",
          twelfth_year: data.twelfth_year || "",
          twelfth_score: data.twelfth_score || "",
          twelfth_stream: data.twelfth_stream || "",
          ug_degree: data.ug_degree || "",
          ug_university: data.ug_university || "",
          ug_year: data.ug_year || "",
          ug_score: data.ug_score || "",
          ug_field: data.ug_field || "",
          pg_degree: data.pg_degree || "",
          pg_university: data.pg_university || "",
          pg_year: data.pg_year || "",
          pg_score: data.pg_score || "",
          pg_field: data.pg_field || "",
          testScores: data.test_scores || [],
          has_experience: data.has_experience || "",
          experience_years: data.experience_years || "",
          experience_field: data.experience_field || "",
          extracurricular: data.extracurricular || "",
          verified: data.verified || false,
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
      console.error("Error fetching profile:", err);
      const defaultData = getDefaultFormData();
      setFormData(defaultData);
      cachedFormData = defaultData;
      setHasProfile(false);
      cachedHasProfile = false;
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  }, [user, getDefaultFormData]);

  useEffect(() => {
    if (user) {
      const now = Date.now();
      const isCacheValid = cachedFormData && now - cacheTimestamp < CACHE_DURATION;
      if (!isCacheValid) {
        fetchUserProfile();
      } else {
        setLoading(false);
      }
    }
  }, [user, fetchUserProfile]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  }, []);

  const handleMultiSelect = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      target_countries: prev.target_countries.includes(value)
        ? prev.target_countries.filter((c) => c !== value)
        : [...prev.target_countries, value],
    }));
    setError("");
  }, []);

  const handleMultiSelectContactPreference = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact_preferences: prev.contact_preferences.includes(value)
        ? prev.contact_preferences.filter((pref) => pref !== value)
        : [...prev.contact_preferences, value],
    }));
    setError("");
  }, []);

  const handleTestScoreChange = useCallback((index: number, field: "exam" | "score", value: string) => {
    setFormData((prev) => {
      const newTestScores = [...prev.testScores];
      newTestScores[index] = { ...newTestScores[index], [field]: value };
      return { ...prev, testScores: newTestScores };
    });
    setError("");
  }, []);

  const addTestScore = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      testScores: [...prev.testScores, { exam: "", score: "" }],
    }));
  }, []);

  const removeTestScore = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      testScores: prev.testScores.filter((_, i) => i !== index),
    }));
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSection((prev) => (prev === section ? "" : section));
  }, []);

  const shouldShowUG = useMemo(
    () => ["Masters", "MBA", "PhD"].includes(formData.target_degree),
    [formData.target_degree]
  );

  const shouldShowPG = useMemo(() => formData.target_degree === "PhD", [formData.target_degree]);

  const shouldShowWorkExp = useMemo(
    () => ["Masters", "MBA", "PhD"].includes(formData.target_degree),
    [formData.target_degree]
  );

  const isSectionComplete = useCallback(
    (section: string): boolean => {
      switch (section) {
        case "target":
          return !!(formData.target_countries.length > 0 && formData.target_degree && formData.target_field);
        case "personal":
          return !!(formData.name && formData.email && formData.phone && formData.city);
        case "tenth":
          return !!(formData.tenth_board && formData.tenth_year && formData.tenth_score);
        case "twelfth":
          return !!(
            formData.twelfth_board &&
            formData.twelfth_year &&
            formData.twelfth_score &&
            formData.twelfth_stream
          );
        case "ug":
          return !shouldShowUG || !!(formData.ug_degree && formData.ug_university && formData.ug_year && formData.ug_score);
        case "pg":
          return !shouldShowPG || !!(formData.pg_degree && formData.pg_university && formData.pg_year);
        case "tests":
          return formData.testScores.length > 0;
        case "experience":
          return !shouldShowWorkExp || !!formData.has_experience;
        default:
          return false;
      }
    },
    [formData, shouldShowUG, shouldShowPG, shouldShowWorkExp]
  );

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Please enter your phone number");
      return false;
    }
    if (formData.target_countries.length === 0) {
      setError("Please select at least one preferred country");
      return false;
    }
    if (!formData.target_degree) {
      setError("Please select your target degree");
      return false;
    }
    if (!formData.target_field) {
      setError("Please enter your field of interest");
      return false;
    }
    for (let i = 0; i < formData.testScores.length; i++) {
      const test = formData.testScores[i];
      if (!test.exam || !test.score) {
        setError(`Please complete test #${i + 1} or remove it`);
        return false;
      }
    }
    return true;
  }, [formData]);

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      setError("");
      if (!user) throw new Error("User not authenticated");

      const validTestScores = formData.testScores.filter((test) => test.exam && test.score);

      const profileData = {
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city || null,
        state: formData.state || null,
        contact_preferences: formData.contact_preferences || [],
        target_countries: formData.target_countries,
        degree: formData.target_degree,
        program: formData.target_field,
        budget: formData.budget || null,
        term: formData.term || null,
        intake_year: formData.term || null,
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
        avatar_type: "S",
        verified: formData.verified,
        updated_at: new Date().toISOString(),
      };

      if (hasProfile) {
        const { error: updateError } = await supabase.from("admit_profiles").update(profileData).eq("user_id", user.id);
        if (updateError) throw updateError;
        setSuccessMessage("Profile updated successfully!");
      } else {
        const { error: insertError } = await supabase
          .from("admit_profiles")
          .insert([{ ...profileData, created_at: new Date().toISOString() }]);
        if (insertError) throw insertError;
        setHasProfile(true);
        cachedHasProfile = true;
        setSuccessMessage("Profile created successfully!");
      }

      cachedFormData = formData;
      cacheTimestamp = Date.now();
      invalidateProfileCache();
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      setDeleting(true);
      setError("");
      const { error: deleteError } = await supabase.from("admit_profiles").delete().eq("user_id", user.id);
      if (deleteError) throw deleteError;
      const defaultData = getDefaultFormData();
      setFormData(defaultData);
      cachedFormData = defaultData;
      setHasProfile(false);
      cachedHasProfile = false;
      invalidateProfileCache();
      setIsEditing(true);
      setShowDeleteConfirm(false);
      setSuccessMessage("Profile deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting profile:", err);
      setError("Failed to delete profile. Please try again.");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setError("");
    if (hasProfile && cachedFormData) {
      setFormData(cachedFormData);
    }
  }, [hasProfile]);

  const userInitial = useMemo(() => {
    return formData.name ? formData.name.charAt(0).toUpperCase() : "U";
  }, [formData.name]);

  const eduScore = useMemo(() => {
    let score = 0;
    if (formData.target_countries.length > 0) score += 3;
    if (formData.target_degree) score += 4;
    if (formData.target_field) score += 4;
    if (formData.term) score += 2;
    if (formData.budget) score += 2;
    if (formData.name) score += 2;
    if (formData.email) score += 2;
    if (formData.phone) score += 2;
    if (formData.city) score += 2;
    if (formData.state) score += 2;
    if (formData.tenth_board) score += 3;
    if (formData.tenth_year) score += 3;
    if (formData.tenth_score) score += 4;
    if (formData.twelfth_board) score += 3;
    if (formData.twelfth_year) score += 2;
    if (formData.twelfth_score) score += 3;
    if (formData.twelfth_stream) score += 2;
    if (shouldShowUG) {
      if (formData.ug_degree) score += 3;
      if (formData.ug_university) score += 3;
      if (formData.ug_year) score += 3;
      if (formData.ug_score) score += 3;
      if (formData.ug_field) score += 3;
    }
    if (shouldShowPG) {
      if (formData.pg_degree) score += 3;
      if (formData.pg_university) score += 3;
      if (formData.pg_year) score += 3;
      if (formData.pg_score) score += 3;
      if (formData.pg_field) score += 3;
    }
    if (formData.testScores.length > 0) {
      const validTests = formData.testScores.filter((t) => t.exam && t.score);
      score += Math.min(validTests.length * 3, 10);
    }
    if (shouldShowWorkExp) {
      if (formData.has_experience === "Yes") {
        score += 2;
        if (formData.experience_years) score += 2;
        if (formData.experience_field) score += 1;
      }
    }
    if (formData.extracurricular && formData.extracurricular.trim().length > 20) {
      score += 5;
    }
    const maxPossibleScore = 90;
    const normalizedScore = Math.max(45, Math.min(90, Math.round((score / maxPossibleScore) * 90)));
    return normalizedScore;
  }, [formData, shouldShowUG, shouldShowPG, shouldShowWorkExp]);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 75) return { color: "#10b981", label: "Excellent" };
    if (score >= 60) return { color: "#f59e0b", label: "Good" };
    return { color: "#ef4444", label: "Needs Improvement" };
  }, []);

  const scoreInfo = useMemo(() => getScoreColor(eduScore), [eduScore, getScoreColor]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
          <div className="text-lg sm:text-xl flex items-center gap-2" style={{ color: accentColor }}>
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2" style={{ borderColor: accentColor }}></div>
            Loading profile...
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto mt-[72px] sm:mt-0 bg-gradient-to-br from-red-50 via-white to-red-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <ProfileHeader
            userInitial={userInitial}
            hasProfile={hasProfile}
            isEditing={isEditing}
            eduScore={eduScore}
            scoreInfo={scoreInfo}
            successMessage={successMessage}
            error={error}
            onEdit={() => setIsEditing(true)}
            onDelete={() => setShowDeleteConfirm(true)}
          />

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div 
                className="rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl"
                style={{ backgroundColor: primaryBg, border: `2px solid ${borderColor}` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#FEF2F3' }}
                  >
                    <Trash2 style={{ color: accentColor }} size={20} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Delete Profile</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Are you sure you want to delete your profile? This action cannot be undone and will remove all your
                  academic information.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-gray-700 rounded-lg transition-all text-sm sm:text-base border-2"
                    style={{ borderColor: borderColor }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg transition-all text-sm sm:text-base ${
                      deleting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    style={{ backgroundColor: accentColor }}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Form Sections */}
<div className="space-y-3 sm:space-y-4">
  {/* Target Program */}
  <TargetProgramSection
    formData={formData}
    isEditing={isEditing}
    isExpanded={expandedSection === "target"}
    isComplete={isSectionComplete("target")}
    onToggle={toggleSection}
    onInputChange={handleInputChange}
    onMultiSelect={handleMultiSelect}
    Section={Section}
    SelectField={SelectField}
    InputField={InputField}
  />
          {/* Personal Information */}
        <PersonalInfoSection
          formData={formData}
          isEditing={isEditing}
          isExpanded={expandedSection === "personal"}
          isComplete={isSectionComplete("personal")}
          onToggle={toggleSection}
          onInputChange={handleInputChange}
          onMultiSelectContactPreference={handleMultiSelectContactPreference}
          Section={Section}
          InputField={InputField}
        />

        {/* 10th Grade */}
        <AcademicSection
          id="tenth"
          title="10th Grade Details"
          type="tenth"
          formData={formData}
          isEditing={isEditing}
          isExpanded={expandedSection === "tenth"}
          isComplete={isSectionComplete("tenth")}
          onToggle={toggleSection}
          onInputChange={handleInputChange}
          Section={Section}
          InputField={InputField}
          SelectField={SelectField}
        />

        {/* 12th Grade */}
        <AcademicSection
          id="twelfth"
          title="12th Grade Details"
          type="twelfth"
          formData={formData}
          isEditing={isEditing}
          isExpanded={expandedSection === "twelfth"}
          isComplete={isSectionComplete("twelfth")}
          onToggle={toggleSection}
          onInputChange={handleInputChange}
          Section={Section}
          InputField={InputField}
          SelectField={SelectField}
        />

        {/* Undergraduate */}
        <AcademicSection
          id="ug"
          title="Undergraduate Details"
          type="ug"
          formData={formData}
          isEditing={isEditing}
          isExpanded={expandedSection === "ug"}
          isComplete={isSectionComplete("ug")}
          visible={shouldShowUG}
          onToggle={toggleSection}
          onInputChange={handleInputChange}
          Section={Section}
          InputField={InputField}
          SelectField={SelectField}
        />

        {/* Postgraduate */}
        <AcademicSection
          id="pg"
          title="Postgraduate/Masters Details"
          type="pg"
          formData={formData}
          isEditing={isEditing}
          isExpanded={expandedSection === "pg"}
          isComplete={isSectionComplete("pg")}
          visible={shouldShowPG}
          onToggle={toggleSection}
          onInputChange={handleInputChange}
          Section={Section}
          InputField={InputField}
          SelectField={SelectField}
        />

        {/* Test Scores */}
        <TestScoresSection
          testScores={formData.testScores}
          isEditing={isEditing}
          isExpanded={expandedSection === "tests"}
          isComplete={isSectionComplete("tests")}
          onToggle={toggleSection}
          onAdd={addTestScore}
          onRemove={removeTestScore}
          onChange={handleTestScoreChange}
          Section={Section}
        />

        {/* Work Experience */}
        <WorkExperienceSection
          formData={formData}
          isEditing={isEditing}
          isExpanded={expandedSection === "experience"}
          isComplete={isSectionComplete("experience")}
          visible={shouldShowWorkExp}
          onToggle={toggleSection}
          onInputChange={handleInputChange}
          Section={Section}
          SelectField={SelectField}
          InputField={InputField}
        />

        {/* Extracurricular Activities */}
        <ExtracurricularSection
          formData={formData}
          isEditing={isEditing}
          isExpanded={expandedSection === "extra"}
          onToggle={toggleSection}
          onInputChange={handleInputChange}
          Section={Section}
        />

        {/* Action Buttons - Centered at Bottom */}
        {isEditing && (
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 pb-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 text-gray-700 rounded-lg transition-all text-sm sm:text-base border-2"
              style={{ borderColor: borderColor }}
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 text-white rounded-lg transition-all text-sm sm:text-base ${
                saving ? "opacity-70 cursor-not-allowed" : ""
              }`}
              style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #8B1528 100%)` }}
            >
              <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
              {saving ? "Saving..." : "Save Profile"}
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