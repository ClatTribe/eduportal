"use client";
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import DefaultLayout from "../defaultLayout";
import ApplicationCard from "../../../components/ApplicationCard";
import { AlertCircle, CheckCircle, Trash2, Plus, Edit2, ChevronDown, Search } from "lucide-react";

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
  // Course search bar state (replaces separate university + program dropdowns)
  const [courseSearchInput, setCourseSearchInput] = useState<string>("");
  const [courseSearchQuery, setCourseSearchQuery] = useState<string>("");
  const [showCourseDropdown, setShowCourseDropdown] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseRow | null>(null);
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
  // Auto-open form if course_id is in URL (from Apply Now button)
  const [showForm, setShowForm] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).has("course_id");
    }
    return false;
  });

  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const courseDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
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

  // Click outside handler for course dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setShowCourseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (courseDebounceRef.current) {
        clearTimeout(courseDebounceRef.current);
      }
    };
  }, []);

  // ---------- Data fetching ----------
  const fetchCourses = async () => {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }

    const valid: CourseRow[] = (data || []).filter(
      (c: unknown): c is CourseRow => {
        if (c && typeof c === "object") {
          const obj = c as Record<string, unknown>;
          return typeof obj.id === "number";
        }
        return false;
      }
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
        .insert([{
          user_id: user!.id,
          username: user?.email || user?.user_metadata?.email || 'Unknown User'
        }]);

      if (insertError) {
        console.error('Error creating document record:', insertError);
        throw insertError;
      }

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

  // ---------- Course search (like Course Finder) ----------
  const filteredCourses = useMemo(() => {
    if (!courseSearchQuery.trim()) return [];
    const query = courseSearchQuery.toLowerCase();
    return courses.filter((c) => {
      const uni = (c.University || "").toLowerCase();
      const prog = (c["Program Name"] || "").toLowerCase();
      return uni.includes(query) || prog.includes(query);
    }).slice(0, 50); // Limit to 50 results for performance
  }, [courses, courseSearchQuery]);

  // Pre-fill course from URL query parameter (e.g. from Apply Now button)
  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("course_id");
    if (!courseId) return;

    const id = parseInt(courseId, 10);
    if (isNaN(id)) return;

    // First try to find in already-loaded courses
    const localMatch = courses.find((c) => c.id === id);
    if (localMatch) {
      setSelectedCourse(localMatch);
      setCourseSearchInput(`${localMatch.University || ""} \u2014 ${localMatch["Program Name"] || ""}`);
      setCourseSearchQuery("");
      setShowCourseDropdown(false);
      setShowForm(true);
      return;
    }

    // If not found locally (Supabase default limit is 1000), fetch directly by ID
    if (courses.length > 0) {
      supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
          if (!error && data && typeof data.id === "number") {
            const course: CourseRow = data as CourseRow;
            setSelectedCourse(course);
            setCourseSearchInput(`${course.University || ""} \u2014 ${course["Program Name"] || ""}`);
            setCourseSearchQuery("");
            setShowCourseDropdown(false);
            setShowForm(true);
          }
        });
    }
  }, [courses, user]);

  // ---------- Debounced search handler ----------
  const handleCourseInputChange = useCallback((value: string) => {
    setCourseSearchInput(value);
    setSelectedCourse(null); // Clear selection when typing

    if (courseDebounceRef.current) {
      clearTimeout(courseDebounceRef.current);
    }

    courseDebounceRef.current = setTimeout(() => {
      setCourseSearchQuery(value);
    }, 300);
  }, []);

  // ---------- Handlers ----------
  const handleDocSelect = (category: DocumentCategory, url: string) => {
    setSelectedDocs((prev) => ({ ...prev, [category]: url }));
  };

  const handleNewApplication = () => {
    setEditingIndex(null);
    setCourseSearchInput("");
    setCourseSearchQuery("");
    setSelectedCourse(null);
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
    const displayText = [app.university, app.program].filter(Boolean).join(" — ");
    setCourseSearchInput(displayText);
    setCourseSearchQuery("");
    // Try to find the matching course
    const match = courses.find(
      (c) => c.University === app.university && c["Program Name"] === app.program
    );
    setSelectedCourse(match || null);

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

    if (!selectedCourse) {
      setSaveMessage("Please select a course from the search results.");
      return;
    }

    const finalUniversity = (selectedCourse.University || "").trim();
    const finalProgram = (selectedCourse["Program Name"] || "").trim();

    if (!finalUniversity || !finalProgram) {
      setSaveMessage("Selected course is missing university or program information.");
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
        university: finalUniversity,
        program: finalProgram,
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
        const { error } = await supabase
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

  const handleCourseSelect = (course: CourseRow) => {
    setSelectedCourse(course);
    setCourseSearchInput(`${course.University || ""} — ${course["Program Name"] || ""}`);
    setCourseSearchQuery("");
    setShowCourseDropdown(false);
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

  if (!user) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in Required</h2>
            <p className="text-gray-600">Please sign in to access the Application Builder.</p>
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

              {/* Course Search Bar */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Course
                </label>
                <div className="relative" ref={courseDropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by university name or program..."
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      value={courseSearchInput}
                      onChange={(e) => {
                        handleCourseInputChange(e.target.value);
                        setShowCourseDropdown(true);
                      }}
                      onFocus={() => {
                        if (courseSearchInput && !selectedCourse) {
                          setShowCourseDropdown(true);
                        }
                      }}
                    />
                  </div>

                  {showCourseDropdown && filteredCourses.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                      {filteredCourses.map((course) => (
                        <div
                          key={course.id}
                          className="px-4 py-3 hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleCourseSelect(course);
                          }}
                        >
                          <p className="text-sm font-semibold text-gray-800">
                            {course.University || "Unknown University"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {course["Program Name"] || "Unknown Program"}
                          </p>
                        </div>
                      ))}
                      {filteredCourses.length === 50 && (
                        <div className="px-4 py-2 text-xs text-gray-400 text-center bg-gray-50">
                          Showing top 50 results. Type more to narrow down.
                        </div>
                      )}
                    </div>
                  )}

                  {showCourseDropdown && filteredCourses.length === 0 && courseSearchQuery.trim().length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                      <p className="text-sm text-gray-500">No courses found matching &ldquo;{courseSearchQuery}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* Selected course display */}
                {selectedCourse && (
                  <div className="mt-3 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-green-800 truncate">
                        {selectedCourse.University}
                      </p>
                      <p className="text-xs text-green-600 truncate">
                        {selectedCourse["Program Name"]}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCourse(null);
                        setCourseSearchInput("");
                        setCourseSearchQuery("");
                      }}
                      className="text-green-600 hover:text-green-800 text-xs font-medium"
                      type="button"
                    >
                      Change
                    </button>
                  </div>
                )}

                {!selectedCourse && courseSearchInput.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Start typing a university name or program to search from {courses.length.toLocaleString()} available courses
                  </p>
                )}
              </div>

              {/* Documents */}
              <h3 className="text-xl font-bold text-gray-800 mb-4">Documents Status</h3>

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
                          className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                            selectedDocs[category]
                              ? 'bg-gray-50'
                              : files.length > 0
                                ? 'bg-gray-100'
                                : 'bg-red-100'
                          }`}
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
