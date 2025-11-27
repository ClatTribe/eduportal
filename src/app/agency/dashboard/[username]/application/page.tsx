"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../../../lib/supabase";
import { useAuth } from "../../../../../../contexts/AuthContext";
import { 
  Eye, 
  Download, 
  FileText, 
  User, 
  Calendar,
  Building2,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  X,
  ArrowLeft
} from "lucide-react";

// ---------- Types ----------
interface UploadedFile {
  name: string;
  size?: number;
  uploadDate?: string;
  url: string;
}

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
const AgencyApplicationsPage: React.FC = () => {
  const params = useParams();
  const { user } = useAuth();
  const studentId = params?.username as string;

  const [applications, setApplications] = useState<ApplicationWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedDoc, setSelectedDoc] = useState<{ url: string; name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterUniversity, setFilterUniversity] = useState<string>("");

  useEffect(() => {
    if (user && studentId) {
      fetchApplications();
    }
  }, [user, studentId]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch applications for the specific student
      const { data: appsData, error: appsError } = await supabase
        .from("application_builder")
        .select("*")
        .eq("user_id", studentId)
        .order("created_at", { ascending: false });

      if (appsError) throw appsError;

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", studentId)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.warn("Profile fetch error:", profileError);
      }

      const appsWithUser = (appsData || []).map((app) => ({
        ...app,
        userProfile: profileData || { id: studentId, email: "N/A" },
      }));

      setApplications(appsWithUser);
    } catch (e: any) {
      console.error("Error fetching applications:", e);
      setError(e.message || "Failed to load applications");
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
    return Object.values(docs).filter(Boolean).length;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

    const matchesFilter =
      filterUniversity === "" || app.university === filterUniversity;

    return matchesSearch && matchesFilter;
  });

  const universities = Array.from(
    new Set(applications.map((app) => app.university).filter(Boolean))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FEF2F3] to-[#FEF2F3]">
        <div className="text-xl text-[#A51C30] flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A51C30]"></div>
          Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-gradient-to-br from-[#FEF2F3] to-[#FEF2F3] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border border-[#FECDD3]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#A51C30] mb-2">
                Student Applications
              </h1>
              {applications.length > 0 && applications[0].userProfile && (
                <div className="flex items-center gap-4 text-gray-600 mt-3">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-[#A51C30]" />
                    <span className="font-semibold">
                      {applications[0].userProfile.full_name || "Student"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">•</span>
                    <span>{applications[0].userProfile.email}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gradient-to-r from-[#FCA5A5] to-[#FCA5A5] rounded-xl px-6 py-4 shadow-md border border-[#FECDD3]">
              <div className="text-sm text-white font-medium">
                Total Applications
              </div>
              <div className="text-3xl font-bold text-white">
                {applications.length}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Search and Filter */}
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
                className="w-full pl-10 pr-4 py-2 border border-[#FECDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A51C30] focus:border-[#A51C30]"
              />
            </div>
            <div className="relative md:w-64">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={filterUniversity}
                onChange={(e) => setFilterUniversity(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#FECDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A51C30] focus:border-[#A51C30] appearance-none bg-white"
              >
                <option value="">All Universities</option>
                {universities.map((uni) => (
                  <option key={uni} value={uni!}>
                    {uni}
                  </option>
                ))}
              </select>
            </div>
            {(searchTerm || filterUniversity) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterUniversity("");
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>

          {/* Applications Table */}
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto mb-4 text-[#FCA5A5]" size={48} />
              <p className="text-gray-500 text-lg">
                {applications.length === 0
                  ? "No applications submitted yet"
                  : "No applications match your search"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#FECDD3]">
                    <th className="text-left py-4 px-4 font-semibold text-[#A51C30]">
                      <div className="flex items-center gap-2">
                        <Building2 size={18} />
                        University
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-[#A51C30]">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={18} />
                        Program
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-[#A51C30]">
                      <div className="flex items-center gap-2">
                        <FileText size={18} />
                        Documents
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-[#A51C30]">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        Submitted
                      </div>
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-[#A51C30]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <React.Fragment key={app.id}>
                      <tr className="border-b border-[#FECDD3] hover:bg-[#FEF2F3] transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-800">
                            {app.university || "N/A"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-700">
                            {app.program || "N/A"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FCA5A5] text-white rounded-full text-sm font-semibold">
                            <FileText size={14} />
                            {getDocumentCount(app.documents)} attached
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">
                          {formatDate(app.created_at)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => toggleRow(app.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#A51C30] hover:bg-[#8B1526] text-white rounded-lg transition-colors font-medium shadow-sm"
                          >
                            {expandedRows.has(app.id) ? (
                              <>
                                <ChevronUp size={16} />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye size={16} />
                                View
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row - Documents */}
                      {expandedRows.has(app.id) && (
                        <tr>
                          <td colSpan={5} className="bg-[#FEF2F3] p-6">
                            <div className="space-y-4">
                              <h4 className="text-lg font-bold text-[#A51C30] mb-4">
                                Attached Documents
                              </h4>
                              
                              {getDocumentCount(app.documents) === 0 ? (
                                <p className="text-gray-500 italic">
                                  No documents attached to this application
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {Object.entries(app.documents).map(
                                    ([category, url]) => {
                                      if (!url) return null;
                                      
                                      // Extract filename from URL
                                      const urlParts = (url as string).split("/");
                                      const filename =
                                        urlParts[urlParts.length - 1] ||
                                        `${category}_document`;

                                      return (
                                        <div
                                          key={category}
                                          className="bg-white border border-[#FECDD3] rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                          <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                              <FileText
                                                className="text-[#A51C30]"
                                                size={20}
                                              />
                                              <div>
                                                <div className="font-semibold text-gray-800 text-sm">
                                                  {categoryLabels[category] ||
                                                    category}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate max-w-[180px]">
                                                  {filename}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() =>
                                                handleViewDocument(
                                                  url as string,
                                                  filename
                                                )
                                              }
                                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#FCA5A5] hover:bg-[#F87171] text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                              <Eye size={14} />
                                              View
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleDownloadDocument(
                                                  url as string,
                                                  filename
                                                )
                                              }
                                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                            >
                                              <Download size={14} />
                                              Download
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
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
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border-2 border-[#FECDD3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[#FECDD3]">
              <h3 className="text-xl font-bold text-[#A51C30]">
                {selectedDoc.name}
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 hover:bg-[#FEF2F3] rounded-lg transition-colors"
              >
                <X size={24} className="text-[#A51C30]" />
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

export default AgencyApplicationsPage;