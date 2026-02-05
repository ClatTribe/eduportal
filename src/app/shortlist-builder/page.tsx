"use client";
import React, { useState, useEffect } from "react";
import {
  Heart,
  Trash2,
  BookOpen,
  Award,
  MapPin,
  Calendar,
  GraduationCap,
  Globe,
  DollarSign,
  ExternalLink,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import DefaultLayout from "../defaultLayout";

interface Course {
  id: number;
  University: string | null;
  "Program Name": string | null;
  Concentration: string | null;
  "Website URL": string | null;
  Campus: string | null;
  Country: string | null;
  "Study Level": string | null;
  Duration: string | null;
  "Open Intakes": string | null;
  "Yearly Tuition Fees": string | null;
  "Scholarship Available": string | null;
  "IELTS Score": string | null;
  "TOEFL Score": string | null;
  "Entry Requirements": string | null;
}

interface Scholarship {
  id: number;
  country_region: string;
  scholarship_name: string;
  provider: string;
  degree_level: string;
  deadline: string;
  detailed_eligibility: string;
  link: string;
}

interface ShortlistItem {
  id: number;
  user_id: string;
  item_type: "course" | "scholarship";
  course_id: number | null;
  scholarship_id: number | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  course?: Course;
  scholarship?: Scholarship;
}

const accentColor = "#A51C30";
const primaryBg = "#FFFFFF";
const borderColor = "#FECDD3";

const ShortlistBuilder: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"courses" | "scholarships">(
    "courses",
  );
  const [shortlistItems, setShortlistItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchShortlistItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchShortlistItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: shortlistData, error: shortlistError } = await supabase
        .from("shortlist_builder")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (shortlistError) throw shortlistError;

      const itemsWithDetails = await Promise.all(
        (shortlistData || []).map(async (item) => {
          if (item.item_type === "course" && item.course_id) {
            const { data: courseData } = await supabase
              .from("courses")
              .select("*")
              .eq("id", item.course_id)
              .single();

            return { ...item, course: courseData };
          } else if (item.item_type === "scholarship" && item.scholarship_id) {
            const { data: scholarshipData } = await supabase
              .from("scholarship")
              .select("*")
              .eq("id", item.scholarship_id)
              .single();

            return { ...item, scholarship: scholarshipData };
          }
          return item;
        }),
      );

      setShortlistItems(itemsWithDetails);
    } catch (err) {
      console.error("Error fetching shortlist:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch shortlist",
      );
    } finally {
      setLoading(false);
    }
  };

  const removeFromShortlist = async (itemId: number) => {
    if (
      !confirm("Are you sure you want to remove this item from your shortlist?")
    )
      return;

    try {
      const { error } = await supabase
        .from("shortlist_builder")
        .delete()
        .eq("id", itemId)
        .eq("user_id", user?.id);

      if (error) throw error;

      setShortlistItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item. Please try again.");
    }
  };

  const updateStatus = async (itemId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("shortlist_builder")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", itemId)
        .eq("user_id", user?.id);

      if (error) throw error;

      setShortlistItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const updateNotes = async (itemId: number) => {
    try {
      const { error } = await supabase
        .from("shortlist_builder")
        .update({ notes: noteText, updated_at: new Date().toISOString() })
        .eq("id", itemId)
        .eq("user_id", user?.id);

      if (error) throw error;

      setShortlistItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, notes: noteText, updated_at: new Date().toISOString() }
            : item,
        ),
      );

      setEditingNotes(null);
      setNoteText("");
    } catch (err) {
      console.error("Error updating notes:", err);
      alert("Failed to update notes. Please try again.");
    }
  };

  const formatDeadline = (dateString: string) => {
    if (!dateString || dateString === "") return "Check website";

    if (
      dateString.toLowerCase().includes("varies") ||
      dateString.toLowerCase().includes("rolling") ||
      dateString.toLowerCase().includes("typically")
    ) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; color: string; icon: React.ReactNode; label: string }
    > = {
      interested: {
        bg: "rgba(59, 130, 246, 0.1)",
        color: "#2563eb",
        icon: <Heart size={14} />,
        label: "Interested",
      },
      applied: {
        bg: "rgba(168, 85, 247, 0.1)",
        color: "#9333ea",
        icon: <CheckCircle size={14} />,
        label: "Applied",
      },
      accepted: {
        bg: "rgba(34, 197, 94, 0.1)",
        color: "#16a34a",
        icon: <CheckCircle size={14} />,
        label: "Accepted",
      },
      rejected: {
        bg: "rgba(239, 68, 68, 0.1)",
        color: "#dc2626",
        icon: <X size={14} />,
        label: "Rejected",
      },
      pending: {
        bg: "rgba(250, 204, 21, 0.1)",
        color: "#ca8a04",
        icon: <Clock size={14} />,
        label: "Pending",
      },
    };

    const config = statusConfig[status] || statusConfig.interested;

    return (
      <span
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: config.bg,
          color: config.color,
          border: `1px solid ${config.color}30`,
        }}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const filteredItems = shortlistItems.filter((item) => {
    if (activeTab === "courses" && item.item_type !== "course") return false;
    if (activeTab === "scholarships" && item.item_type !== "scholarship")
      return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    return true;
  });

  const courseCount = shortlistItems.filter(
    (item) => item.item_type === "course",
  ).length;
  const scholarshipCount = shortlistItems.filter(
    (item) => item.item_type === "scholarship",
  ).length;

  if (!user) {
    return (
      <DefaultLayout>
        <div
          className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-[72px] sm:mt-0"
          style={{ backgroundColor: primaryBg }}
        >
          <div className="max-w-4xl mx-auto">
            <div
              className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center"
              style={{ border: `1px solid ${borderColor}` }}
            >
              <AlertCircle
                className="mx-auto mb-4"
                style={{ color: accentColor }}
                size={48}
              />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Login Required
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Please login to view your shortlist
              </p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div
        className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-[72px] sm:mt-0"
        style={{ backgroundColor: primaryBg }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3"
              style={{ color: accentColor }}
            >
              <Heart size={28} className="sm:w-9 sm:h-9" />
              My Shortlist
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your saved courses and scholarships in one place
            </p>
          </div>

          {/* Main Content Card */}
          <div
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6"
            style={{ border: `1px solid ${borderColor}` }}
          >
            {/* Tabs and Filter */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setActiveTab("courses")}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
                  style={
                    activeTab === "courses"
                      ? {
                          backgroundColor: accentColor,
                          color: "white",
                          boxShadow: "0 4px 6px -1px rgba(165, 28, 48, 0.1)",
                        }
                      : {
                          backgroundColor: "white",
                          color: "#6b7280",
                          border: `1px solid ${borderColor}`,
                        }
                  }
                >
                  <GraduationCap size={18} className="sm:w-5 sm:h-5" />
                  Courses
                  <span
                    className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold"
                    style={
                      activeTab === "courses"
                        ? { backgroundColor: "white", color: accentColor }
                        : { backgroundColor: "#f3f4f6", color: "#6b7280" }
                    }
                  >
                    {courseCount}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("scholarships")}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
                  style={
                    activeTab === "scholarships"
                      ? {
                          backgroundColor: accentColor,
                          color: "white",
                          boxShadow: "0 4px 6px -1px rgba(165, 28, 48, 0.1)",
                        }
                      : {
                          backgroundColor: "white",
                          color: "#6b7280",
                          border: `1px solid ${borderColor}`,
                        }
                  }
                >
                  <Award size={18} className="sm:w-5 sm:h-5" />
                  Scholarships
                  <span
                    className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold"
                    style={
                      activeTab === "scholarships"
                        ? { backgroundColor: "white", color: accentColor }
                        : { backgroundColor: "#f3f4f6", color: "#6b7280" }
                    }
                  >
                    {scholarshipCount}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Status:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm text-gray-900"
                  style={{
                    border: `1px solid ${borderColor}`,
                    backgroundColor: "white",
                  }}
                >
                  <option value="all">All</option>
                  <option value="interested">Interested</option>
                  <option value="applied">Applied</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3"
                style={{
                  backgroundColor: "rgba(165, 28, 48, 0.05)",
                  border: `1px solid ${borderColor}`,
                }}
              >
                <AlertCircle
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: accentColor }}
                  size={20}
                />
                <div>
                  <h3
                    className="font-semibold text-sm sm:text-base"
                    style={{ color: accentColor }}
                  >
                    Error
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2"
                    style={{ borderColor: accentColor }}
                  ></div>
                  <p className="text-sm sm:text-base text-gray-600">
                    Loading your shortlist...
                  </p>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <Heart
                  size={40}
                  className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4"
                />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No {activeTab} in your shortlist yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                  Start exploring and save items you are interested in
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                  <a
                    href="/course-finder"
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    <GraduationCap size={18} className="sm:w-5 sm:h-5" />
                    Browse Courses
                  </a>
                  <a
                    href="/scholarship-finder"
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Award size={18} className="sm:w-5 sm:h-5" />
                    Browse Scholarships
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow bg-white"
                    style={{ border: `1px solid ${borderColor}` }}
                  >
                    {item.item_type === "course" && item.course ? (
                      <>
                        {/* Course Header */}
                        <div className="flex items-start justify-between mb-4 gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 sm:gap-3 mb-3">
                              <GraduationCap
                                className="flex-shrink-0 mt-1"
                                style={{ color: accentColor }}
                                size={20}
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 break-words">
                                  {item.course["Program Name"] ||
                                    "Unknown Program"}
                                </h3>
                                <p className="text-gray-600 text-xs sm:text-sm font-medium break-words">
                                  {item.course.University}
                                </p>
                                {item.course.Concentration && (
                                  <p className="text-xs text-gray-500 mt-1 break-words">
                                    <span className="font-medium">
                                      Concentration:
                                    </span>{" "}
                                    {item.course.Concentration}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {getStatusBadge(item.status)}
                              {item.course["Study Level"] && (
                                <span
                                  className="text-xs px-3 py-1 rounded-full font-medium"
                                  style={{
                                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                                    color: "#16a34a",
                                    border: "1px solid rgba(34, 197, 94, 0.3)",
                                  }}
                                >
                                  {item.course["Study Level"]}
                                </span>
                              )}
                              {item.course["Scholarship Available"] ===
                                "Yes" && (
                                <span
                                  className="text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1"
                                  style={{
                                    backgroundColor: "rgba(168, 85, 247, 0.1)",
                                    color: "#9333ea",
                                    border: "1px solid rgba(168, 85, 247, 0.3)",
                                  }}
                                >
                                  <Sparkles size={12} />
                                  <span className="hidden sm:inline">
                                    Scholarship Available
                                  </span>
                                  <span className="sm:hidden">Scholarship</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromShortlist(item.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                            title="Remove from shortlist"
                          >
                            <Trash2 size={18} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        {/* Course Details Grid */}
                        <div
                          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 pb-4"
                          style={{ borderBottom: `1px solid ${borderColor}` }}
                        >
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <MapPin size={12} />
                              <span>Campus</span>
                            </div>
                            <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                              {item.course.Campus || "N/A"}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Globe size={12} />
                              <span>Country</span>
                            </div>
                            <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                              {item.course.Country || "N/A"}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Calendar size={12} />
                              <span>Duration</span>
                            </div>
                            <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                              {item.course.Duration || "N/A"}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <DollarSign size={12} />
                              <span>Tuition</span>
                            </div>
                            <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                              {item.course["Yearly Tuition Fees"] || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Status Dropdown */}
                        <div className="mb-4">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Application Status
                          </label>
                          <select
                            value={item.status}
                            onChange={(e) =>
                              updateStatus(item.id, e.target.value)
                            }
                            className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm text-gray-900"
                            style={{
                              border: `1px solid ${borderColor}`,
                              backgroundColor: "white",
                            }}
                          >
                            <option value="interested">Interested</option>
                            <option value="applied">Applied</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>

                        {/* Notes Section */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                              <FileText size={14} />
                              Notes
                            </label>
                            {editingNotes !== item.id && (
                              <button
                                onClick={() => {
                                  setEditingNotes(item.id);
                                  setNoteText(item.notes || "");
                                }}
                                className="text-xs sm:text-sm font-medium hover:opacity-70"
                                style={{ color: accentColor }}
                              >
                                {item.notes ? "Edit" : "Add Note"}
                              </button>
                            )}
                          </div>
                          {editingNotes === item.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add your notes here..."
                                className="w-full px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm text-gray-900"
                                style={{
                                  border: `1px solid ${borderColor}`,
                                  backgroundColor: "white",
                                }}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateNotes(item.id)}
                                  className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white transition hover:opacity-90"
                                  style={{ backgroundColor: accentColor }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNotes(null);
                                    setNoteText("");
                                  }}
                                  className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-300 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg p-3 break-words">
                              {item.notes || "No notes added yet"}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          {item.course["Website URL"] && (
                            <a
                              href={
                                item.course["Website URL"].startsWith("http")
                                  ? item.course["Website URL"]
                                  : `https://${item.course["Website URL"]}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white transition hover:opacity-90 w-full sm:w-auto"
                              style={{ backgroundColor: accentColor }}
                            >
                              <BookOpen size={14} className="sm:w-4 sm:h-4" />
                              View Details
                            </a>
                          )}
                          <a
                            href="/application-builder"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-[#A51C30] text-white transition hover:bg-[#8A1828] w-full sm:w-auto"
                            style={{ backgroundColor: accentColor }}
                          >
                            <Sparkles size={14} className="sm:w-4 sm:h-4" />
                            Apply Now
                          </a>
                          <span className="text-xs text-gray-500">
                            Added{" "}
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    ) : item.item_type === "scholarship" && item.scholarship ? (
                      <>
                        {/* Scholarship Header */}
                        <div className="flex items-start justify-between mb-4 gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 sm:gap-3 mb-3">
                              <Award
                                className="flex-shrink-0 mt-1"
                                style={{ color: accentColor }}
                                size={20}
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 break-words">
                                  {item.scholarship.scholarship_name}
                                </h3>
                                <p className="text-gray-600 text-xs sm:text-sm font-medium break-words">
                                  {item.scholarship.provider}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {getStatusBadge(item.status)}
                              {item.scholarship.degree_level && (
                                <span
                                  className="text-xs px-3 py-1 rounded-full font-medium"
                                  style={{
                                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                                    color: "#16a34a",
                                    border: "1px solid rgba(34, 197, 94, 0.3)",
                                  }}
                                >
                                  {item.scholarship.degree_level}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromShortlist(item.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                            title="Remove from shortlist"
                          >
                            <Trash2 size={18} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        {/* Scholarship Details */}
                        <div
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 pb-4"
                          style={{ borderBottom: `1px solid ${borderColor}` }}
                        >
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <MapPin size={12} />
                              <span>Country</span>
                            </div>
                            <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                              {item.scholarship.country_region}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Calendar size={12} />
                              <span>Deadline</span>
                            </div>
                            <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                              {formatDeadline(item.scholarship.deadline)}
                            </p>
                          </div>
                        </div>

                        {/* Eligibility */}
                        {item.scholarship.detailed_eligibility && (
                          <div className="mb-4 bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              Eligibility
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                              {item.scholarship.detailed_eligibility}
                            </p>
                          </div>
                        )}

                        {/* Status Dropdown */}
                        <div className="mb-4">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Application Status
                          </label>
                          <select
                            value={item.status}
                            onChange={(e) =>
                              updateStatus(item.id, e.target.value)
                            }
                            className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm text-gray-900"
                            style={{
                              border: `1px solid ${borderColor}`,
                              backgroundColor: "white",
                            }}
                          >
                            <option value="interested">Interested</option>
                            <option value="applied">Applied</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>

                        {/* Notes Section */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                              <FileText size={14} />
                              Notes
                            </label>
                            {editingNotes !== item.id && (
                              <button
                                onClick={() => {
                                  setEditingNotes(item.id);
                                  setNoteText(item.notes || "");
                                }}
                                className="text-xs sm:text-sm font-medium hover:opacity-70"
                                style={{ color: accentColor }}
                              >
                                {item.notes ? "Edit" : "Add Note"}
                              </button>
                            )}
                          </div>
                          {editingNotes === item.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add your notes here..."
                                className="w-full px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm text-gray-900"
                                style={{
                                  border: `1px solid ${borderColor}`,
                                  backgroundColor: "white",
                                }}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateNotes(item.id)}
                                  className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white transition hover:opacity-90"
                                  style={{ backgroundColor: accentColor }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNotes(null);
                                    setNoteText("");
                                  }}
                                  className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-300 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg p-3 break-words">
                              {item.notes || "No notes added yet"}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          {item.scholarship.link && (
                            <a
                              href={item.scholarship.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white transition hover:opacity-90 w-full sm:w-auto"
                              style={{ backgroundColor: accentColor }}
                            >
                              <ExternalLink
                                size={14}
                                className="sm:w-4 sm:h-4"
                              />
                              Apply Now
                            </a>
                          )}
                          <span className="text-xs text-gray-500">
                            Added{" "}
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ShortlistBuilder;
