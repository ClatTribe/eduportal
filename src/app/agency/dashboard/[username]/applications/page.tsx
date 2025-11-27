"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../../../../lib/supabase";
import { 
  Eye, 
  Download, 
  FileText, 
  User, 
  Calendar,
  Building2,
  GraduationCap,
  ChevronUp,
  Search,
  Filter,
  X,
  ArrowLeft,
  Lock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// ---------- Types ----------
interface ApplicationRow {
  id: number;
  user_id: string;
  university: string | null;
  program: string | null;
  documents: Record<string, string>;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
}

interface ApplicationWithUser extends ApplicationRow {
  userProfile?: UserProfile;
}

// ---------- Component ----------
const AgencyStudentApplicationsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  
  const studentUserId = params.username as string;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [applications, setApplications] = useState<ApplicationWithUser[]>([]);
  const [studentProfile, setStudentProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedDoc, setSelectedDoc] = useState<{ url: string; name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterUniversity, setFilterUniversity] = useState<string>("");

  // ============ AUTHENTICATION CHECK ============
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = sessionStorage.getItem("agency_authenticated") === "true";
      setIsAuthenticated(isAuth);
      setCheckingAuth(false);

      if (!isAuth) {
        router.push("/agency/dashboard");
      }
    };
    checkAuth();
  }, [router]);

  // ============ FETCH DATA ============
  useEffect(() => {
    if (isAuthenticated && !checkingAuth && studentUserId) {
      fetchStudentApplications();
    }
  }, [isAuthenticated, checkingAuth, studentUserId]);

  const fetchStudentApplications = async () => {
  try {
    setLoading(true);
    setError(null);

    console.log("========================================");
    console.log("🎯 FETCHING FOR STUDENT:", studentUserId);
    console.log("========================================");

    // Fetch student profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", studentUserId)
      .single();

    if (profileError) {
      console.error("❌ Profile error:", profileError);
      setError("Student not found");
      return;
    }

    console.log("✅ Profile loaded:", profileData);
    setStudentProfile(profileData);

    // Fetch applications - DIRECT QUERY
    console.log("🔍 Querying application_builder for user_id:", studentUserId);

    const { data: appsData, error: appsError } = await supabase
      .from("application_builder")
      .select("*")
      .eq("user_id", studentUserId);

    if (appsError) {
      console.error("❌ Apps error:", appsError);
      setError("Failed to load applications");
      return;
    }

    console.log("✅ RAW DATA FROM DATABASE:", appsData);
    console.log("✅ NUMBER OF APPLICATIONS:", appsData?.length);

    if (!appsData || appsData.length === 0) {
      console.warn("⚠️ NO APPLICATIONS FOUND FOR USER:", studentUserId);
      setApplications([]);
      return;
    }

    // Map applications with profile
    const mappedApps = appsData.map((app) => ({
      ...app,
      userProfile: profileData,
    }));

    console.log("✅ MAPPED APPLICATIONS:", mappedApps);
    console.log("========================================");

    // Set state
    setApplications(mappedApps);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("❌ CATCH ERROR:", e);
      setError(e.message);
    } else {
      console.error("❌ CATCH ERROR:", e);
      setError("Unknown error");
    }
  } finally {
    setLoading(false);
  }
};


  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleViewDocument = (url: string, name: string) => {
    setSelectedDoc({ url, name });
  };

  const handleDownloadDocument = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDocumentCount = (docs: Record<string, string>): number => {
    if (!docs) return 0;
    return Object.values(docs).filter((url) => url && url.trim() !== "").length;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const categoryLabels: Record<string, string> = {
    tenth: "10th Marksheet",
    twelfth: "12th Marksheet",
    graduation: "Graduation",
    pg: "Post Graduation",
    lor: "Letter of Recommendation",
    sop: "Statement of Purpose",
    passport: "Passport",
    resume: "Resume",
    other: "Other Documents",
  };

  // Filtering
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchTerm === "" ||
      app.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.program?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUniversity =
      filterUniversity === "" || app.university === filterUniversity;

    return matchesSearch && matchesUniversity;
  });

  const universities = Array.from(
    new Set(applications.map((app) => app.university).filter(Boolean))
  );

  // Debug: Log state changes
  useEffect(() => {
    console.log("📊 STATE UPDATE - Applications:", applications.length);
    console.log("📊 Applications data:", applications);
  }, [applications]);

  // ============ RENDER ============

  if (checkingAuth) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in as agency to view applications</p>
          <button
            onClick={() => router.push("/agency/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold"
          >
            Go to Agency Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
        <div className="text-xl text-red-600 flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          Loading student applications...
        </div>
      </div>
    );
  }

  console.log("🎨 RENDERING - Applications count:", applications.length);
  console.log("🎨 Filtered count:", filteredApplications.length);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-pink-50 to-red-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <button
            onClick={() => router.push("/agency/dashboard")}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-4 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-2 flex items-center gap-3">
                <User size={36} />
                {studentProfile?.full_name || studentProfile?.email || "Student"} Applications
              </h1>
              <p className="text-gray-600">
                View and manage applications for this student
              </p>
            </div>
            <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl px-6 py-4 shadow-md">
              <div className="text-sm text-white font-medium">
                Total Applications
              </div>
              <div className="text-3xl font-bold text-white">
                {applications.length}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by university or program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
              />
            </div>

            {universities.length > 0 && (
              <div className="relative md:w-56">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  value={filterUniversity}
                  onChange={(e) => setFilterUniversity(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 appearance-none bg-white"
                >
                  <option value="">All Universities</option>
                  {universities.map((uni) => (
                    <option key={uni} value={uni!}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {(searchTerm || filterUniversity) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterUniversity("");
                }}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-2 font-semibold"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>

          {/* Applications Display */}
          {applications.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <FileText className="mx-auto mb-4 text-gray-300" size={64} />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Applications Yet</h3>
              <p className="text-gray-500">This student has not submitted any applications yet</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Showing {filteredApplications.length} of {applications.length} applications
              </p>
              <div className="space-y-4">
                {filteredApplications.map((app) => {
                  const isExpanded = expandedRows.has(app.id);
                  const docCount = getDocumentCount(app.documents);

                  return (
                    <div
                      key={app.id}
                      className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                    >
                      {/* Application Header */}
                      <div className="bg-white p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Building2 className="text-red-600" size={24} />
                              <h3 className="text-xl font-bold text-gray-800">
                                {app.university || "N/A"}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                              <GraduationCap size={18} className="text-gray-400" />
                              <span>{app.program || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>Submitted: {formatDate(app.created_at)}</span>
                              </div>
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                                <FileText size={14} />
                                {docCount} document{docCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleRow(app.id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all font-semibold shadow-sm flex items-center gap-2"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp size={18} />
                                Hide Documents
                              </>
                            ) : (
                              <>
                                <Eye size={18} />
                                View Documents
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Documents Section */}
                      {isExpanded && (
                        <div className="bg-pink-50 p-6 border-t-2 border-gray-200">
                          <h4 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                            <FileText size={20} />
                            Attached Documents
                          </h4>
                          
                          {docCount === 0 ? (
                            <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                              <AlertCircle className="mx-auto mb-2 text-gray-400" size={32} />
                              <p className="text-gray-500">No documents attached to this application</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {Object.entries(app.documents).map(([category, url]) => {
                                if (!url || url.trim() === "") return null;
                                
                                const urlParts = (url as string).split("/");
                                const filename = urlParts[urlParts.length - 1] || `${category}_document`;

                                return (
                                  <div
                                    key={category}
                                    className="bg-white border-2 border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex items-start gap-3 mb-3">
                                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="text-red-600" size={20} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-800 text-sm mb-1">
                                          {categoryLabels[category] || category}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                          {filename}
                                        </div>
                                      </div>
                                      <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleViewDocument(url as string, filename)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                      >
                                        <Eye size={14} />
                                        View
                                      </button>
                                      <button
                                        onClick={() => handleDownloadDocument(url as string, filename)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                      >
                                        <Download size={14} />
                                        Download
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-red-600">
                {selectedDoc.name}
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <iframe
                src={selectedDoc.url}
                className="w-full h-full min-h-[600px] border-0 rounded-lg"
                title={selectedDoc.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyStudentApplicationsPage;