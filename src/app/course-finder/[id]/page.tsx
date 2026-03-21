"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Globe,
  Calendar,
  DollarSign,
  BookOpen,
  Award,
  GraduationCap,
  Clock,
  FileText,
  ExternalLink,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Languages,
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import DefaultLayout from "../../defaultLayout";

interface Course {
  id: number;
  University: string | null;
  "University Ranking": string | null;
  "Program Name": string | null;
  Concentration: string | null;
  "Website URL": string | null;
  Campus: string | null;
  Country: string | null;
  "Study Level": string | null;
  Duration: string | null;
  "Open Intakes": string | null;
  "Intake Year": string | null;
  "Entry Requirements": string | null;
  "IELTS Score": string | null;
  "IELTS No Band Less Than": string | null;
  "TOEFL Score": string | null;
  "PTE Score": string | null;
  "DET Score": string | null;
  "Application Deadline": string | null;
  "Application Fee": string | null;
  "Yearly Tuition Fees": string | null;
  "Scholarship Available": string | null;
  "Scholarship Detail": string | null;
  "Backlog Range": string | null;
  Remarks: string | null;
  "ESL/ELP Detail": string | null;
  ApplicationMode: string | null;
  "English Proficiency Exam Waiver": string | null;
  "PTE No Band Less Than": string | null;
}

const isDeadlineLive = (deadline: string | null): boolean => {
  if (!deadline) return false;
  try {
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return false;
    return deadlineDate > new Date();
  } catch {
    return false;
  }
};

const formatDeadline = (deadline: string | null): string => {
  if (!deadline) return "";
  try {
    const d = new Date(deadline);
    if (isNaN(d.getTime())) return deadline;
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return deadline;
  }
};

export default function CourseMicrosite() {
  const params = useParams();
  const courseId = params?.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    if (courseId) fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", Number(courseId))
        .single();

      if (supabaseError) throw supabaseError;
      setCourse(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch course details"
      );
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "fees", label: "Fees & Duration" },
    { id: "admission", label: "Admission" },
    { id: "english", label: "English Requirements" },
    { id: "contact", label: "Contact" },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Parse rankings into array
  const parseRankings = (ranking: string | null) => {
    if (!ranking) return [];
    return ranking
      .split(/\s{2,}/)
      .map((r) => r.trim())
      .filter(Boolean);
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
          <div className="text-gray-500 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A51C30]"></div>
            <p>Loading course details...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error || !course) {
    return (
      <DefaultLayout>
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
            <AlertCircle size={48} className="mx-auto text-[#A51C30] mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Course Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "The course you're looking for doesn't exist."}
            </p>
            <Link
              href="/course-finder"
              className="inline-flex items-center gap-2 bg-[#A51C30] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#8A1828] transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Course Finder
            </Link>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const rankings = parseRankings(course["University Ranking"]);
  const hasEnglishRequirements =
    course["IELTS Score"] ||
    course["TOEFL Score"] ||
    course["PTE Score"] ||
    course["DET Score"];
  const deadlineLive = isDeadlineLive(course["Application Deadline"]);

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen mt-18 sm:mt-0">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#A51C30] to-[#7A1424] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            {/* Back Button */}
            <Link
              href="/course-finder"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 sm:mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Course Finder
            </Link>

            {/* Location & Status */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="flex items-center gap-1.5 text-white/90 text-sm">
                <MapPin size={14} />
                {course.Campus || course.Country || "N/A"}
                {course.Campus && course.Country
                  ? `, ${course.Country}`
                  : ""}
              </span>
              {deadlineLive && (
                <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  Admissions Open
                </span>
              )}
            </div>

            {/* University & Program */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
              {course.University}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 font-medium">
              {course["Program Name"] || "Program Details"}
            </p>
            {course.Concentration && (
              <p className="text-sm text-white/70 mt-1">
                Concentration: {course.Concentration}
              </p>
            )}
          </div>
        </div>

        {/* Sticky Navigation */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <nav className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeSection === section.id
                      ? "border-[#A51C30] text-[#A51C30]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Overview Section */}
              <section
                id="overview"
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
                  <span className="text-xs font-semibold text-[#A51C30]/70 uppercase tracking-wider">
                    Program Profile
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    About This Program
                    <span className="text-[#A51C30]">.</span>
                  </h2>
                </div>
                <div className="px-5 sm:px-6 py-5">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {course["Program Name"]} at{" "}
                    <span className="font-semibold text-gray-800">
                      {course.University}
                    </span>{" "}
                    is a{" "}
                    <span className="font-semibold">
                      {course["Study Level"]?.toLowerCase() || ""}
                    </span>{" "}
                    program
                    {course.Duration
                      ? ` with a duration of ${course.Duration}`
                      : ""}
                    {course.Campus ? `, located at ${course.Campus}` : ""}
                    {course.Country ? `, ${course.Country}` : ""}.
                    {course.Concentration
                      ? ` The program focuses on ${course.Concentration}.`
                      : ""}
                    {course["Scholarship Available"] === "Yes"
                      ? " Scholarships are available for eligible students."
                      : ""}
                  </p>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                      <GraduationCap
                        size={20}
                        className="mx-auto text-[#A51C30] mb-2"
                      />
                      <div className="text-xs text-gray-500 mb-1">
                        Study Level
                      </div>
                      <div className="font-semibold text-sm text-gray-800">
                        {course["Study Level"] || "N/A"}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                      <Clock
                        size={20}
                        className="mx-auto text-[#A51C30] mb-2"
                      />
                      <div className="text-xs text-gray-500 mb-1">
                        Duration
                      </div>
                      <div className="font-semibold text-sm text-gray-800">
                        {course.Duration || "N/A"}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                      <Globe
                        size={20}
                        className="mx-auto text-[#A51C30] mb-2"
                      />
                      <div className="text-xs text-gray-500 mb-1">Country</div>
                      <div className="font-semibold text-sm text-gray-800">
                        {course.Country || "N/A"}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100">
                      <Award
                        size={20}
                        className="mx-auto text-[#A51C30] mb-2"
                      />
                      <div className="text-xs text-gray-500 mb-1">
                        Scholarship
                      </div>
                      <div className="font-semibold text-sm text-gray-800">
                        {course["Scholarship Available"] || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Rankings */}
                  {rankings.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        University Rankings
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {rankings.map((rank, idx) => (
                          <span
                            key={idx}
                            className="bg-[#A51C30]/5 text-[#A51C30] text-xs sm:text-sm px-3 py-1.5 rounded-lg font-medium border border-[#A51C30]/15"
                          >
                            {rank}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Fees & Duration Section */}
              <section
                id="fees"
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
                  <span className="text-xs font-semibold text-[#A51C30]/70 uppercase tracking-wider">
                    Academic &amp; Financials
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    Fees &amp; Duration
                    <span className="text-[#A51C30]">.</span>
                  </h2>
                </div>
                <div className="px-5 sm:px-6 py-5">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 pr-4">
                            Detail
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">
                            Information
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="py-3 pr-4 text-sm text-gray-600">
                            Program
                          </td>
                          <td className="py-3 text-sm font-semibold text-gray-900">
                            {course["Program Name"] || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-4 text-sm text-gray-600">
                            Duration
                          </td>
                          <td className="py-3 text-sm font-semibold text-gray-900">
                            {course.Duration || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-4 text-sm text-gray-600">
                            Yearly Tuition Fees
                          </td>
                          <td className="py-3 text-sm font-semibold text-gray-900">
                            {course["Yearly Tuition Fees"] || "N/A"}
                          </td>
                        </tr>
                        {course["Application Fee"] && (
                          <tr>
                            <td className="py-3 pr-4 text-sm text-gray-600">
                              Application Fee
                            </td>
                            <td className="py-3 text-sm font-semibold text-gray-900">
                              {course["Application Fee"]}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-3 pr-4 text-sm text-gray-600">
                            Scholarship
                          </td>
                          <td className="py-3 text-sm font-semibold text-gray-900">
                            {course["Scholarship Available"] === "Yes" ? (
                              <span className="inline-flex items-center gap-1.5 text-green-700">
                                <CheckCircle size={14} />
                                Available
                              </span>
                            ) : (
                              course["Scholarship Available"] || "N/A"
                            )}
                          </td>
                        </tr>
                        {course["Scholarship Detail"] && (
                          <tr>
                            <td className="py-3 pr-4 text-sm text-gray-600 align-top">
                              Scholarship Details
                            </td>
                            <td className="py-3 text-sm text-gray-900 leading-relaxed">
                              {course["Scholarship Detail"]}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Admission Section */}
              <section
                id="admission"
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
                  <span className="text-xs font-semibold text-[#A51C30]/70 uppercase tracking-wider">
                    Official Schedule
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    Admission Details
                    <span className="text-[#A51C30]">.</span>
                  </h2>
                </div>
                <div className="px-5 sm:px-6 py-5">
                  {/* Admission Quick Info */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Mode</div>
                      <div className="font-semibold text-sm text-gray-800">
                        {course.ApplicationMode || "Online"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Basis</div>
                      <div className="font-semibold text-sm text-gray-800">
                        Merit/Entrance
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        Scholarship
                      </div>
                      <div className="font-semibold text-sm text-gray-800">
                        {course["Scholarship Available"] === "Yes"
                          ? "Available"
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Admission Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 pr-4">
                            Detail
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">
                            Information
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {course["Open Intakes"] && (
                          <tr>
                            <td className="py-3 pr-4 text-sm text-gray-600">
                              Open Intakes
                            </td>
                            <td className="py-3 text-sm font-semibold text-gray-900">
                              <div className="flex items-center gap-2">
                                {course["Open Intakes"]}
                                {deadlineLive && (
                                  <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                    </span>
                                    LIVE
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                        {course["Intake Year"] && (
                          <tr>
                            <td className="py-3 pr-4 text-sm text-gray-600">
                              Intake Year
                            </td>
                            <td className="py-3 text-sm font-semibold text-gray-900">
                              {course["Intake Year"]}
                            </td>
                          </tr>
                        )}
                        {course["Application Deadline"] && (
                          <tr>
                            <td className="py-3 pr-4 text-sm text-gray-600">
                              Application Deadline
                            </td>
                            <td className="py-3 text-sm font-semibold text-gray-900">
                              {formatDeadline(course["Application Deadline"])}
                            </td>
                          </tr>
                        )}
                        {course["Entry Requirements"] && (
                          <tr>
                            <td className="py-3 pr-4 text-sm text-gray-600 align-top">
                              Entry Requirements
                            </td>
                            <td className="py-3 text-sm text-gray-900 leading-relaxed">
                              {course["Entry Requirements"]}
                            </td>
                          </tr>
                        )}
                        {course["Backlog Range"] && (
                          <tr>
                            <td className="py-3 pr-4 text-sm text-gray-600">
                              Backlog Range
                            </td>
                            <td className="py-3 text-sm font-semibold text-gray-900">
                              {course["Backlog Range"]}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {course.Remarks && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="text-xs font-semibold text-amber-700 mb-1">
                        Additional Notes
                      </div>
                      <p className="text-sm text-amber-900">
                        {course.Remarks}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* English Requirements Section */}
              {hasEnglishRequirements && (
                <section
                  id="english"
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                >
                  <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
                    <span className="text-xs font-semibold text-[#A51C30]/70 uppercase tracking-wider">
                      Language Proficiency
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                      English Requirements
                      <span className="text-[#A51C30]">.</span>
                    </h2>
                  </div>
                  <div className="px-5 sm:px-6 py-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {course["IELTS Score"] && (
                        <div className="bg-gradient-to-br from-[#A51C30]/5 to-[#A51C30]/10 rounded-xl p-4 border border-[#A51C30]/15">
                          <div className="flex items-center gap-2 mb-2">
                            <Languages
                              size={18}
                              className="text-[#A51C30]"
                            />
                            <span className="text-sm font-semibold text-[#A51C30]">
                              IELTS
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {course["IELTS Score"]}
                          </div>
                          {course["IELTS No Band Less Than"] && (
                            <div className="text-xs text-gray-600">
                              No band less than{" "}
                              {course["IELTS No Band Less Than"]}
                            </div>
                          )}
                        </div>
                      )}
                      {course["TOEFL Score"] && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Languages size={18} className="text-blue-600" />
                            <span className="text-sm font-semibold text-blue-700">
                              TOEFL
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {course["TOEFL Score"]}
                          </div>
                        </div>
                      )}
                      {course["PTE Score"] && (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Languages size={18} className="text-purple-600" />
                            <span className="text-sm font-semibold text-purple-700">
                              PTE
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {course["PTE Score"]}
                          </div>
                          {course["PTE No Band Less Than"] && (
                            <div className="text-xs text-gray-600">
                              No band less than {course["PTE No Band Less Than"]}
                            </div>
                          )}
                        </div>
                      )}
                      {course["DET Score"] && (
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Languages
                              size={18}
                              className="text-emerald-600"
                            />
                            <span className="text-sm font-semibold text-emerald-700">
                              DET
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {course["DET Score"]}
                          </div>
                        </div>
                      )}
                    </div>

                    {course["English Proficiency Exam Waiver"] && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm font-semibold text-green-800">
                            Exam Waiver Available
                          </span>
                        </div>
                        <p className="text-sm text-green-700">
                          {course["English Proficiency Exam Waiver"]}
                        </p>
                      </div>
                    )}

                    {course["ESL/ELP Detail"] && (
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen size={16} className="text-blue-600" />
                          <span className="text-sm font-semibold text-blue-800">
                            ESL/ELP Pathway Available
                          </span>
                        </div>
                        <p className="text-sm text-blue-700">
                          {course["ESL/ELP Detail"]}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact / Apply Card */}
              <section
                id="contact"
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-16"
              >
                <div className="px-5 py-4 border-b border-gray-100">
                  <span className="text-xs font-semibold text-[#A51C30]/70 uppercase tracking-wider">
                    Official Channels
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    Contact &amp; Apply
                    <span className="text-[#A51C30]">.</span>
                  </h3>
                </div>
                <div className="px-5 py-5 space-y-4">
                  {/* Campus Info */}
                  <div>
                    <div className="text-xs text-gray-500 font-medium mb-1">
                      Campus Location
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <MapPin size={14} className="text-[#A51C30]" />
                      {course.Campus || "N/A"}
                      {course.Country ? `, ${course.Country}` : ""}
                    </div>
                  </div>

                  {/* Website */}
                  {course["Website URL"] && (
                    <div>
                      <div className="text-xs text-gray-500 font-medium mb-1">
                        University Website
                      </div>
                      <a
                        href={
                          course["Website URL"].startsWith("http")
                            ? course["Website URL"]
                            : `https://${course["Website URL"]}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#A51C30] hover:underline font-medium"
                      >
                        <ExternalLink size={14} />
                        Visit Website
                      </a>
                    </div>
                  )}

                  <hr className="border-gray-100" />

                  {/* Apply Section */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                      Ready to Apply
                      <span className="text-[#A51C30]">?</span>
                    </h4>
                    <p className="text-xs text-gray-600 mb-4">
                      Start your application journey with personalized guidance
                      from our experts.
                    </p>
                    <Link
                      href={`/application-builder?course_id=${course.id}`}
                      className="w-full flex items-center justify-center gap-2 bg-[#A51C30] text-white py-3 rounded-xl font-semibold hover:bg-[#8A1828] transition-colors text-sm shadow-lg shadow-[#A51C30]/20"
                    >
                      <Sparkles size={16} />
                      Apply Now
                    </Link>
                  </div>

                  {course["Website URL"] && (
                    <a
                      href={
                        course["Website URL"].startsWith("http")
                          ? course["Website URL"]
                          : `https://${course["Website URL"]}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-white text-[#A51C30] py-3 rounded-xl font-semibold border-2 border-[#A51C30] hover:bg-[#A51C30]/5 transition-colors text-sm"
                    >
                      <BookOpen size={16} />
                      Visit University Page
                    </a>
                  )}
                </div>
              </section>

              {/* Key Facts Card */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">
                    Quick Facts
                    <span className="text-[#A51C30]">.</span>
                  </h3>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {[
                    {
                      icon: GraduationCap,
                      label: "Study Level",
                      value: course["Study Level"],
                    },
                    {
                      icon: Clock,
                      label: "Duration",
                      value: course.Duration,
                    },
                    {
                      icon: DollarSign,
                      label: "Tuition (Annual)",
                      value: course["Yearly Tuition Fees"],
                    },
                    {
                      icon: Calendar,
                      label: "Open Intakes",
                      value: course["Open Intakes"],
                    },
                    {
                      icon: FileText,
                      label: "Application Fee",
                      value: course["Application Fee"],
                    },
                    {
                      icon: Globe,
                      label: "Country",
                      value: course.Country,
                    },
                  ]
                    .filter((item) => item.value)
                    .map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <item.icon
                          size={16}
                          className="text-[#A51C30] mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500">
                            {item.label}
                          </div>
                          <div className="text-sm font-semibold text-gray-800 break-words">
                            {item.value}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

