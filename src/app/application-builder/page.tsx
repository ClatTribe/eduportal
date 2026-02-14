"use client";
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import DefaultLayout from "../defaultLayout";
import ApplicationCard from "../../../components/ApplicationCard";
import { AlertCircle, CheckCircle, Trash2, Plus, Edit2, ChevronDown } from "lucide-react";

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
  const [universityInput, setUniversityInput] = useState<string>("");
  const [universitySearchQuery, setUniversitySearchQuery] = useState<string>("");
  const [showUniversityDropdown, setShowUniversityDropdown] = useState<boolean>(false);
  const [programInput, setProgramInput] = useState<string>("");
  const [programSearchQuery, setProgramSearchQuery] = useState<string>("");
  const [showProgramDropdown, setShowProgramDropdown] = useState<boolean>(false);
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

  const universityDropdownRef = useRef<HTMLDivElement>(null);
  const programDropdownRef = useRef<HTMLDivElement>(null);
  const universityDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const programDebounceRef = useRef<NodeJS.Timeout | null>(null);

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

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (universityDropdownRef.current && !universityDropdownRef.current.contains(event.target as Node)) {
        setShowUniversityDropdown(false);
      }
      if (programDropdownRef.current && !programDropdownRef.current.contains(event.target as Node)) {
        setShowProgramDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce timers
  useEffect(() => {
    return () => {
      if (universityDebounceRef.current) {
        clearTimeout(universityDebounceRef.current);
      }
      if (programDebounceRef.current) {
        clearTimeout(programDebounceRef.current);
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

    console.log("Raw courses data:", data);
    console.log("Total courses fetched:", data?.length || 0);

    const valid: CourseRow[] = (data || []).filter(
      (c: unknown): c is CourseRow => {
        if (c && typeof c === "object") {
          const obj = c as Record<string, unknown>;
          return typeof obj.id === "number";
        }
        return false;
      }
    );

    console.log("Valid courses after filtering:", valid.length);
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
      console.log('Creating new document record for user:', user?.id);
      
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

  // ---------- Derived lists ----------
  const universities: string[] = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.University && typeof c.University === 'string' && c.University.trim()) {
        set.add(c.University.trim());
      }
    });
    const sorted = Array.from(set).sort();
    console.log("Available universities:", sorted);
    return sorted;
  }, [courses]);

  const getFilteredUniversities = (): string[] => {
    if (!universitySearchQuery.trim()) return universities;
    const query = universitySearchQuery.toLowerCase();
    return universities.filter(uni => uni.toLowerCase().includes(query));
  };

  const programsForSelectedUniversity: string[] = useMemo(() => {
    if (!universityInput) return [];
    
    const programs = courses
      .filter((c) => c.University === universityInput)
      .map((c) => (c["Program Name"] || "").trim())
      .filter(Boolean)
      .reduce<string[]>((acc, p) => {
        if (!acc.includes(p)) acc.push(p);
        return acc;
      }, [])
      .sort();
    
    console.log(`Programs for ${universityInput}:`, programs);
    return programs;
  }, [courses, universityInput]);

  const getFilteredPrograms = (): string[] => {
    if (!programSearchQuery.trim()) return programsForSelectedUniversity;
    const query = programSearchQuery.toLowerCase();
    return programsForSelectedUniversity.filter(prog => prog.toLowerCase().includes(query));
  };

  // ---------- Debounced search handlers ----------
  const handleUniversityInputChange = useCallback((value: string) => {
    setUniversityInput(value);
    
    // Clear existing timeout
    if (universityDebounceRef.current) {
      clearTimeout(universityDebounceRef.current);
    }
    
    // Set new timeout for search query
    universityDebounceRef.current = setTimeout(() => {
      setUniversitySearchQuery(value);
    }, 300); // 300ms debounce delay
  }, []);

  const handleProgramInputChange = useCallback((value: string) => {
    setProgramInput(value);
    
    // Clear existing timeout
    if (programDebounceRef.current) {
      clearTimeout(programDebounceRef.current);
    }
    
    // Set new timeout for search query
    programDebounceRef.current = setTimeout(() => {
      setProgramSearchQuery(value);
    }, 300); // 300ms debounce delay
  }, []);

  // ---------- Handlers ----------
  const handleDocSelect = (category: DocumentCategory, url: string) => {
    setSelectedDocs((prev) => ({ ...prev, [category]: url }));
  };

  const handleNewApplication = () => {
    setEditingIndex(null);
    setUniversityInput("");
    setUniversitySearchQuery("");
    setProgramInput("");
    setProgramSearchQuery("");
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
    setUniversityInput(app.university || "");
    setUniversitySearchQuery("");
    setProgramInput(app.program || "");
    setProgramSearchQuery("");
    
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
    
    const finalUniversity = universityInput.trim();
    const finalProgram = programInput.trim();
    
    if (!finalUniversity || !finalProgram) {
      setSaveMessage("Please provide both university and program.");
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

  const handleUniversitySelect = (university: string) => {
    setUniversityInput(university);
    setUniversitySearchQuery("");
    setShowUniversityDropdown(false);
    // Reset program when university changes
    setProgramInput("");
    setProgramSearchQuery("");
  };

  const handleProgramSelect = (program: string) => {
    setProgramInput(program);
    setProgramSearchQuery("");
    setShowProgramDropdown(false);
  };

  const filteredUniversities = getFilteredUniversities();
  const filteredPrograms = getFilteredPrograms();

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

              {/* University Input with Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  University
                </label>
                <div className="relative" ref={universityDropdownRef}>
                  <input
                    type="text"
                    placeholder="Type or select university..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={universityInput}
                    onChange={(e) => {
                      handleUniversityInputChange(e.target.value);
                      setShowUniversityDropdown(true);
                      // Reset program when university changes
                      setProgramInput("");
                      setProgramSearchQuery("");
                    }}
                    onFocus={() => {
                      setShowUniversityDropdown(true);
                      setUniversitySearchQuery("");
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowUniversityDropdown(!showUniversityDropdown);
                      if (!showUniversityDropdown) {
                        setUniversitySearchQuery("");
                      }
                    }}
                    className="absolute right-2 top-3 cursor-pointer"
                    type="button"
                  >
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  {showUniversityDropdown && filteredUniversities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredUniversities.map((university) => (
                        <div
                          key={university}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleUniversitySelect(university);
                          }}
                        >
                          {university}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showUniversityDropdown && filteredUniversities.length === 0 && universitySearchQuery && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                      <p className="text-sm text-gray-500">No universities found matching "{universitySearchQuery}"</p>
                    </div>
                  )}
                </div>
                {universities.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No universities found in database. You can type any university name.
                  </p>
                )}
              </div>

              {/* Program Input with Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Program
                </label>
                <div className="relative" ref={programDropdownRef}>
                  <input
                    type="text"
                    placeholder="Type or select program..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={programInput}
                    onChange={(e) => {
                      handleProgramInputChange(e.target.value);
                      setShowProgramDropdown(true);
                    }}
                    onFocus={() => {
                      setShowProgramDropdown(true);
                      setProgramSearchQuery("");
                    }}
                    disabled={!universityInput}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (universityInput) {
                        setShowProgramDropdown(!showProgramDropdown);
                        if (!showProgramDropdown) {
                          setProgramSearchQuery("");
                        }
                      }
                    }}
                    className="absolute right-2 top-3 cursor-pointer"
                    type="button"
                    disabled={!universityInput}
                  >
                    <ChevronDown className={`h-4 w-4 ${universityInput ? 'text-gray-500' : 'text-gray-300'}`} />
                  </button>
                  
                  {showProgramDropdown && filteredPrograms.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredPrograms.map((program) => (
                        <div
                          key={program}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleProgramSelect(program);
                          }}
                        >
                          {program}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showProgramDropdown && filteredPrograms.length === 0 && programSearchQuery && universityInput && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                      <p className="text-sm text-gray-500">No programs found matching "{programSearchQuery}"</p>
                    </div>
                  )}
                </div>
                {!universityInput && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please select a university first
                  </p>
                )}
                {universityInput && programsForSelectedUniversity.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No programs found for this university. You can type any program name.
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