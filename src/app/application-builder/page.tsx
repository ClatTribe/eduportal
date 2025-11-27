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
  (c: unknown): c is CourseRow => {
    if (c && typeof c === "object") {
      const obj = c as Record<string, unknown>;
      return (
        typeof obj.id === "number" &&
        typeof obj.University === "string"
      );
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
    console.log('Creating new document record for user:', user?.id);
    
    const { error: insertError } = await supabase
      .from("student_documents")
      .insert([{ 
        user_id: user!.id,
        username: user?.email || user?.user_metadata?.email || 'Unknown User' // Add username
      }]);
      
    if (insertError) {
      console.error('Error creating document record:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
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