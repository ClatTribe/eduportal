"use client";
import React, { useState, useEffect } from "react";
import {
  Heart,
  BookOpen,
  DollarSign,
  MapPin,
  GraduationCap,
  AlertCircle,
  Calendar,
  Globe,
  Award,
  Sparkles,
  Trophy,
  Target,
  GitCompare,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import DefaultLayout from "../defaultLayout";
import Pagination from "../../../components/CourseFinder/Pagination";
import FilterComponent from "../../../components/CourseFinder/Filtering";
import useSavedCourses from "../../../components/CourseFinder/SavedCourses";
import CoursesRecommend from "../../../components/CourseFinder/CoursesRecommend";
import CollegeComparison, {
  CompareBadge,
  CompareFloatingButton,
} from "../../../components/CourseFinder/CollegeComparison";
import Link from "next/link";

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
  "Backlog Range": string | null;
  Remarks: string | null;
  ApplicationMode: string | null;
  "English Proficiency Exam Waiver": string | null;
  matchScore?: number;
}

// Utility function to extract QS Ranking from the ranking string
const extractQSRanking = (rankingString: string | null): number | null => {
  if (!rankingString) return null;

  // Match "QS Ranking - [number]" or "QS Ranking - NA"
  const qsMatch = rankingString.match(/QS Ranking\s*-\s*(\d+|NA)/i);

  if (!qsMatch) return null;

  const rankValue = qsMatch[1];

  // If it's "NA" or not a number, return null
  if (rankValue.toUpperCase() === "NA" || isNaN(Number(rankValue))) {
    return null;
  }

  return Number(rankValue);
};

// Sorting function for courses by QS Ranking
const sortCoursesByQSRanking = (courses: Course[]): Course[] => {
  return [...courses].sort((a, b) => {
    const qsA = extractQSRanking(a["University Ranking"]);
    const qsB = extractQSRanking(b["University Ranking"]);

    // If both have QS rankings, sort by number (lower is better)
    if (qsA !== null && qsB !== null) {
      return qsA - qsB;
    }

    // If only A has QS ranking, A comes first
    if (qsA !== null && qsB === null) {
      return -1;
    }

    // If only B has QS ranking, B comes first
    if (qsA === null && qsB !== null) {
      return 1;
    }

    // If neither has QS ranking, maintain original order
    return 0;
  });
};

const CourseFinder: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<"all" | "recommended">("all");

  const { savedCourses, toggleSaved } = useSavedCourses(user);

  const perPage = 15;

  useEffect(() => {
    if (viewMode === "all") {
      fetchCourses();
    }
  }, [viewMode]);

  const {
    compareColleges,
    toggleCompare,
    removeFromCompare,
    isInCompare,
    goToComparison,
  } = CollegeComparison({ user, courses });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      let allCourses: Course[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error: supabaseError } = await supabase
          .from("courses")
          .select("*")
          .order("id", { ascending: true })
          .range(from, from + batchSize - 1);

        if (supabaseError) throw supabaseError;

        if (data && data.length > 0) {
          allCourses = [...allCourses, ...data];
          hasMore = data.length === batchSize;
          from += batchSize;
        } else {
          hasMore = false;
        }
      }

      const validCourses = allCourses.filter(
        (course) => course.University !== null,
      );

      // Sort by QS Ranking
      const sortedCourses = sortCoursesByQSRanking(validCourses);

      setCourses(sortedCourses);
      setFilteredCourses(sortedCourses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendedCoursesChange = (recommendedCourses: Course[]) => {
    setFilteredCourses(recommendedCourses);
    setCurrentPage(0);
  };

  const handleFilterChange = (filtered: Course[]) => {
    // Apply QS Ranking sort to filtered results
    const sortedFiltered = sortCoursesByQSRanking(filtered);
    setFilteredCourses(sortedFiltered);
    setCurrentPage(0);
  };

  const getMatchBadge = (course: Course) => {
    if (viewMode !== "recommended" || !course.matchScore) return null;

    const score = course.matchScore;

    if (score >= 90) {
      return (
        <span className="text-xs bg-green-50 text-green-700 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1 border border-green-200">
          <Trophy size={14} className="flex-shrink-0" />
          <span className="hidden sm:inline">Perfect Match ({score}%)</span>
          <span className="sm:hidden">{score}%</span>
        </span>
      );
    } else if (score >= 75) {
      return (
        <span className="text-xs bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1 border border-blue-200">
          <Award size={14} className="flex-shrink-0" />
          <span className="hidden sm:inline">Excellent Match ({score}%)</span>
          <span className="sm:hidden">{score}%</span>
        </span>
      );
    } else if (score >= 60) {
      return (
        <span className="text-xs bg-purple-50 text-purple-700 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1 border border-purple-200">
          <Target size={14} className="flex-shrink-0" />
          <span className="hidden sm:inline">Great Match ({score}%)</span>
          <span className="sm:hidden">{score}%</span>
        </span>
      );
    } else if (score >= 40) {
      return (
        <span className="text-xs bg-amber-50 text-amber-700 px-2 sm:px-3 py-1 rounded-full font-semibold border border-amber-200">
          <span className="hidden sm:inline">Good Match ({score}%)</span>
          <span className="sm:hidden">{score}%</span>
        </span>
      );
    }

    return (
      <span className="text-xs bg-gray-50 text-gray-600 px-2 sm:px-3 py-1 rounded-full font-semibold border border-gray-200">
        <span className="hidden sm:inline">Relevant ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>
    );
  };

  const paginatedCourses = filteredCourses.slice(
    currentPage * perPage,
    (currentPage + 1) * perPage,
  );

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-3 sm:p-4 md:p-6 mt-18 sm:mt-0">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#A51C30] mb-1 sm:mb-2">
              Find Your Perfect Course
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Explore programs and universities worldwide
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => {
                setViewMode("all");
                setCurrentPage(0);
              }}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                viewMode === "all"
                  ? "bg-[#A51C30] text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <GraduationCap
                size={18}
                className="sm:w-5 sm:h-5 flex-shrink-0"
              />
              All Courses
            </button>

            <button
              onClick={() => {
                setViewMode("recommended");
                setCurrentPage(0);
              }}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                viewMode === "recommended"
                  ? "bg-[#A51C30] text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <Sparkles size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
              Recommended For You
            </button>
          </div>

          {/* Recommendation Component */}
          <CoursesRecommend
            user={user}
            viewMode={viewMode}
            onRecommendedCoursesChange={handleRecommendedCoursesChange}
            onLoadingChange={setLoading}
            onErrorChange={setError}
          />

          {/* Filter Component */}
          <FilterComponent
            courses={courses}
            viewMode={viewMode}
            onFilterChange={handleFilterChange}
          />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3">
              <AlertCircle
                className="text-[#A51C30] flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-[#A51C30] text-sm sm:text-base">
                  Notice
                </h3>
                <p className="text-red-700 text-xs sm:text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200">
            <div className="flex items-center gap-2">
              <GraduationCap
                className="text-[#A51C30] flex-shrink-0"
                size={20}
              />
              <span className="font-semibold text-base sm:text-lg text-gray-800">
                {filteredCourses.length.toLocaleString()}{" "}
                {viewMode === "recommended" ? "recommended " : ""}
                courses found
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Heart className="text-[#A51C30] flex-shrink-0" size={16} />
                <span className="text-xs sm:text-sm text-gray-600">
                  {savedCourses.size} saved
                </span>
              </div>
              <div className="flex items-center gap-2">
                <GitCompare
                  className="text-purple-600 flex-shrink-0"
                  size={16}
                />
                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                  {compareColleges.length}/3 to compare
                </span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#A51C30]"></div>
                <p className="text-sm sm:text-base">Loading courses...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-sm border border-gray-200">
              <GraduationCap
                size={40}
                className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4"
              />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {viewMode === "recommended"
                  ? "No recommended courses found"
                  : "No courses found"}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 px-4">
                {viewMode === "recommended"
                  ? "Try updating your profile or check back later for more options"
                  : "Try adjusting your filters or search query"}
              </p>
            </div>
          ) : (
            <>
              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {paginatedCourses.map((course, index) => {
                  const isBlurred = viewMode === "recommended" && index >= 2;
                  const courseIndex = currentPage * perPage + index;
                  const inCompare = isInCompare(course.id);
                  return (
                    <div
                      key={course.id}
                      className={`bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 relative ${
                        isBlurred ? "overflow-hidden" : ""
                      } ${inCompare ? "border-2 border-purple-500" : "border border-gray-200"}`}
                    >
                      {isBlurred && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-10 flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl">
                          <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 text-center max-w-sm border-2 border-[#A51C30]/20">
                            <div className="mb-4 flex justify-center">
                              <div className="bg-[#A51C30]/10 rounded-full p-3 sm:p-4">
                                <AlertCircle
                                  className="text-[#A51C30]"
                                  size={28}
                                />
                              </div>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                              Unlock More Recommendations
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-6">
                              Talk to our experts to view detailed information
                              about this and {10 - courseIndex - 1} more
                              personalized course recommendations
                            </p>
                            <Link href="/application-builder">
                              <button className="bg-[#A51C30] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-[#8A1828] transition-colors w-full flex items-center justify-center gap-2">
                                <Sparkles size={16} />
                                Apply Now
                              </button>
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Course Card Content */}
                      <div className="flex justify-between items-start gap-3 mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xl sm:text-2xl text-gray-900 mb-2 leading-tight break-words">
                            <span className="font-Bold">
                              {course.University}
                            </span>
                          </div>
                          <h3 className="font-medium text-base sm:text-lg text-gray-600 mb-2 leading-tight break-words">
                            {course["Program Name"] || "Unknown Program"}
                          </h3>
                          {course.Concentration && (
                            <div className="text-xs text-gray-600 mb-2 bg-gray-50 inline-block px-2 py-1 rounded break-words">
                              <span className="font-medium">
                                Concentration:
                              </span>{" "}
                              {course.Concentration}
                            </div>
                          )}
                          {viewMode === "recommended" && (
                            <div className="mt-2 sm:mt-3">
                              {getMatchBadge(course)}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Compare Checkbox */}
                          <label
                            className="flex items-center gap-1.5 cursor-pointer group"
                            title="Add to compare"
                          >
                            <input
                              type="checkbox"
                              checked={inCompare}
                              onChange={() => toggleCompare(course)}
                              disabled={isBlurred}
                              className="w-4 h-4 accent-purple-600 cursor-pointer disabled:opacity-50"
                            />
                            <span className="text-xs text-gray-600 group-hover:text-gray-800 transition-colors">
                              Compare
                            </span>
                          </label>

                          {/* Heart Button */}
                          <button
                            onClick={() => toggleSaved(course)}
                            disabled={isBlurred}
                            className={`transition-colors flex-shrink-0 ${
                              isBlurred
                                ? "opacity-50 cursor-not-allowed"
                                : savedCourses.has(course.id)
                                  ? "text-[#A51C30]"
                                  : "text-gray-400 hover:text-[#A51C30]"
                            }`}
                            title={
                              isBlurred
                                ? "Contact experts to unlock"
                                : savedCourses.has(course.id)
                                  ? "Remove from shortlist"
                                  : "Add to shortlist"
                            }
                          >
                            <Heart
                              size={20}
                              className="sm:w-[22px] sm:h-[22px]"
                              fill={
                                savedCourses.has(course.id)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <MapPin
                                size={12}
                                className="sm:w-3.5 sm:h-3.5 flex-shrink-0"
                              />
                              <span>Campus</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">
                              {course.Campus || "N/A"}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Globe
                                size={12}
                                className="sm:w-3.5 sm:h-3.5 flex-shrink-0"
                              />
                              <span>Country</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">
                              {course.Country || "N/A"}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Calendar
                                size={12}
                                className="sm:w-3.5 sm:h-3.5 flex-shrink-0"
                              />
                              <span>Duration</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">
                              {course.Duration || "N/A"}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <DollarSign
                                size={12}
                                className="sm:w-3.5 sm:h-3.5 flex-shrink-0"
                              />
                              <span className="hidden sm:inline">
                                Tuition Fees Per Annum
                              </span>
                              <span className="sm:hidden">Tuition Fees</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">
                              {course["Yearly Tuition Fees"] || "N/A"}
                            </p>
                          </div>
                        </div>

                        {(course["Open Intakes"] ||
                          course["University Ranking"] ||
                          course["Entry Requirements"]) && (
                          <div className="pt-3 sm:pt-4 border-t border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1">
                              <Calendar
                                size={12}
                                className="sm:w-3.5 sm:h-3.5 text-[#A51C30] flex-shrink-0"
                              />
                              Program Information
                            </h4>
                            <div className="space-y-2">
                              {(course["Open Intakes"] ||
                                course["University Ranking"]) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {course["Open Intakes"] && (
                                    <div className="bg-[#A51C30]/5 rounded-lg p-2 sm:p-3 border border-[#A51C30]/20">
                                      <div className="text-xs text-[#A51C30] font-medium mb-1">
                                        Open Intakes
                                      </div>
                                      <p className="font-semibold text-xs sm:text-sm text-[#A51C30] break-words">
                                        {course["Open Intakes"]}
                                      </p>
                                    </div>
                                  )}
                                  {course["University Ranking"] && (
                                    <div className="bg-[#A51C30]/5 rounded-lg p-2 sm:p-3 border border-[#A51C30]/20">
                                      <div className="text-xs text-[#A51C30] font-medium mb-1">
                                        University Ranking
                                      </div>
                                      <div className="text-xs text-[#A51C30] space-y-0.5">
                                        {course["University Ranking"]
                                          .split(/\s{2,}/)
                                          .map((ranking, idx) => {
                                            const trimmed = ranking.trim();
                                            if (!trimmed) return null;
                                            return (
                                              <div
                                                key={idx}
                                                className="font-semibold break-words"
                                              >
                                                {trimmed}
                                              </div>
                                            );
                                          })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {course["Entry Requirements"] && (
                                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                                  <div className="text-xs text-gray-600 font-medium mb-1">
                                    Entry Requirements
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-700 break-words">
                                    {course["Entry Requirements"]}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {(course["IELTS Score"] ||
                          course["TOEFL Score"] ||
                          course["PTE Score"] ||
                          course["DET Score"]) && (
                          <div className="pt-3 sm:pt-4 border-t border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1">
                              <Award
                                size={12}
                                className="sm:w-3.5 sm:h-3.5 text-[#A51C30] flex-shrink-0"
                              />
                              English Requirements
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {course["IELTS Score"] && (
                                <span className="bg-[#A51C30]/5 text-[#A51C30] text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-medium border border-[#A51C30]/20">
                                  IELTS: {course["IELTS Score"]}
                                </span>
                              )}
                              {course["TOEFL Score"] && (
                                <span className="bg-[#A51C30]/5 text-[#A51C30] text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-medium border border-[#A51C30]/20">
                                  TOEFL: {course["TOEFL Score"]}
                                </span>
                              )}
                              {course["PTE Score"] && (
                                <span className="bg-[#A51C30]/5 text-[#A51C30] text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-medium border border-[#A51C30]/20">
                                  PTE: {course["PTE Score"]}
                                </span>
                              )}
                              {course["DET Score"] && (
                                <span className="bg-[#A51C30]/5 text-[#A51C30] text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-medium border border-[#A51C30]/20">
                                  DET: {course["DET Score"]}
                                </span>
                              )}
                              {course["English Proficiency Exam Waiver"] && (
                                <span className="bg-[#A51C30]/5 text-[#A51C30] text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-medium border border-[#A51C30]/20">
                                  Waiver:{" "}
                                  {course["English Proficiency Exam Waiver"]}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {course["Scholarship Available"] === "Yes" && (
                          <div className="pt-3 sm:pt-4 border-t border-[#A51C30]/20">
                            <span className="inline-flex items-center gap-1.5 text-[#A51C30] text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-md font-medium bg-[#A51C30]/5">
                              <Award
                                size={12}
                                className="sm:w-3.5 sm:h-3.5 flex-shrink-0"
                              />
                              Scholarship Available
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4">
                          {course["Website URL"] && (
                            <a
                              href={
                                course["Website URL"].startsWith("http")
                                  ? course["Website URL"]
                                  : `https://${course["Website URL"]}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-[#A51C30] text-white rounded-lg py-2 sm:py-2.5 px-3 sm:px-4 hover:bg-[#8A1828] transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-sm"
                            >
                              <BookOpen
                                size={14}
                                className="sm:w-4 sm:h-4 flex-shrink-0"
                              />
                              View Details
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Component */}
              <Pagination
                totalItems={filteredCourses.length}
                currentPage={currentPage}
                perPage={perPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
        <CompareFloatingButton
          compareCount={compareColleges.length}
          onCompareClick={goToComparison}
        />
      </div>
    </DefaultLayout>
  );
};

<<<<<<< HEAD
export default CourseFinder

/*"use client"
import React, { useState, useEffect } from "react"
import {
  Heart,
  BookOpen,
  DollarSign,
  MapPin,
  GraduationCap,
  AlertCircle,
  Calendar,
  Globe,
  Award,
  Sparkles,
  Trophy,
  Target,
  GitCompare,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { useAuth } from "../../../contexts/AuthContext"
import DefaultLayout from "../defaultLayout"
import Pagination from "../../../components/CourseFinder/Pagination"
import FilterComponent from "../../../components/CourseFinder/Filtering"
import useSavedCourses from "../../../components/CourseFinder/SavedCourses"
import CoursesRecommend from "../../../components/CourseFinder/CoursesRecommend"
import CollegeComparison, { CompareBadge, CompareFloatingButton } from "../../../components/CourseFinder/CollegeComparison"

interface Course {
  id: number
  University: string | null
  "University Ranking": string | null
  "Program Name": string | null
  Concentration: string | null
  "Website URL": string | null
  Campus: string | null
  Country: string | null
  "Study Level": string | null
  Duration: string | null
  "Open Intakes": string | null
  "Intake Year": string | null
  "Entry Requirements": string | null
  "IELTS Score": string | null
  "IELTS No Band Less Than": string | null
  "TOEFL Score": string | null
  "PTE Score": string | null
  "DET Score": string | null
  "Application Deadline": string | null
  "Application Fee": string | null
  "Yearly Tuition Fees": string | null
  "Scholarship Available": string | null
  "Backlog Range": string | null
  Remarks: string | null
  ApplicationMode: string | null
  "English Proficiency Exam Waiver": string | null
  matchScore?: number
}

const extractQSRanking = (rankingString: string | null): number | null => {
  if (!rankingString) return null
  const qsMatch = rankingString.match(/QS Ranking\s*-\s*(\d+|NA)/i)
  if (!qsMatch) return null
  const rankValue = qsMatch[1]
  if (rankValue.toUpperCase() === 'NA' || isNaN(Number(rankValue))) return null
  return Number(rankValue)
}

const sortCoursesByQSRanking = (courses: Course[]): Course[] => {
  return [...courses].sort((a, b) => {
    const qsA = extractQSRanking(a["University Ranking"])
    const qsB = extractQSRanking(b["University Ranking"])
    if (qsA !== null && qsB !== null) return qsA - qsB
    if (qsA !== null && qsB === null) return -1
    if (qsA === null && qsB !== null) return 1
    return 0
  })
}

const CourseFinder: React.FC = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalItems, setTotalItems] = useState(0) // Tracks total rows (21k)
  const [viewMode, setViewMode] = useState<"all" | "recommended">("all")

  const { savedCourses, toggleSaved } = useSavedCourses(user)
  const perPage = 15

  // Trigger fetch when page or view mode changes
  useEffect(() => {
    if (viewMode === "all") {
      fetchCourses(currentPage)
    }
  }, [viewMode, currentPage])

  const {
    compareColleges,
    toggleCompare,
    isInCompare,
    goToComparison,
  } = CollegeComparison({ user, courses })

  const fetchCourses = async (page: number) => {
    try {
      setLoading(true)
      setError(null)

      // Calculate exact range for this section (page)
      const from = page * perPage
      const to = from + perPage - 1

      // Fetch ONLY the specific 15 rows for the current page
      const { data, count, error: supabaseError } = await supabase
        .from("courses")
        .select("*", { count: 'exact' }) // Get the 21k total count for pagination UI
        .order("id", { ascending: true })
        .range(from, to)

      if (supabaseError) throw supabaseError

      const validCourses = (data || []).filter((course) => course.University !== null)
      
      // Since validCourses is only 15 items, this sort is now instantaneous
      const sortedCourses = sortCoursesByQSRanking(validCourses)
      
      setCourses(sortedCourses)
      setFilteredCourses(sortedCourses)
      if (count !== null) setTotalItems(count)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses")
      console.error("Error fetching courses:", err)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRecommendedCoursesChange = (recommendedCourses: Course[]) => {
    const sorted = sortCoursesByQSRanking(recommendedCourses)
    setFilteredCourses(sorted)
    setTotalItems(sorted.length)
    setCurrentPage(0)
  }

  const handleFilterChange = (filtered: Course[]) => {
    const sortedFiltered = sortCoursesByQSRanking(filtered)
    setFilteredCourses(sortedFiltered)
    // Note: If using client-side FilterComponent, totalItems would be updated to filtered.length
    setTotalItems(filtered.length) 
    setCurrentPage(0)
  }

  const getMatchBadge = (course: Course) => {
    if (viewMode !== "recommended" || !course.matchScore) return null
    const score = course.matchScore
    if (score >= 90) return <span className="text-xs bg-green-50 text-green-700 px-2 sm:px-3 py-1 rounded-full font-semibold border border-green-200">Perfect Match ({score}%)</span>
    if (score >= 75) return <span className="text-xs bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 rounded-full font-semibold border border-blue-200">Excellent Match ({score}%)</span>
    return <span className="text-xs bg-purple-50 text-purple-700 px-2 sm:px-3 py-1 rounded-full font-semibold border border-purple-200">Match ({score}%)</span>
  }

  // Because we fetch only 15 rows at a time, we no longer need to .slice() the array here
  const displayCourses = filteredCourses

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-3 sm:p-4 md:p-6 mt-18 sm:mt-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#A51C30] mb-1 sm:mb-2">Find Your Perfect Course</h1>
            <p className="text-sm sm:text-base text-gray-600">Explore programs and universities worldwide</p>
          </div>

          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => { setViewMode("all"); setCurrentPage(0); }}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${viewMode === "all" ? "bg-[#A51C30] text-white shadow-lg" : "bg-white text-gray-700 border border-gray-300"}`}
            >
              <GraduationCap size={18} /> All Courses
            </button>
            <button
              onClick={() => { setViewMode("recommended"); setCurrentPage(0); }}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${viewMode === "recommended" ? "bg-[#A51C30] text-white shadow-lg" : "bg-white text-gray-700 border border-gray-300"}`}
            >
              <Sparkles size={18} /> Recommended For You
            </button>
          </div>

          <CoursesRecommend
            user={user}
            viewMode={viewMode}
            onRecommendedCoursesChange={handleRecommendedCoursesChange}
            onLoadingChange={setLoading}
            onErrorChange={setError}
          />

          <FilterComponent courses={courses} viewMode={viewMode} onFilterChange={handleFilterChange} />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3">
              <AlertCircle className="text-[#A51C30] flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-[#A51C30] text-sm sm:text-base">Notice</h3>
                <p className="text-red-700 text-xs sm:text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-[#A51C30] flex-shrink-0" size={20} />
              <span className="font-semibold text-base sm:text-lg text-gray-800">
                {totalItems.toLocaleString()} {viewMode === "recommended" ? "recommended " : ""} courses found
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Heart className="text-[#A51C30] flex-shrink-0" size={16} />
                <span className="text-xs sm:text-sm text-gray-600">{savedCourses.size} saved</span>
              </div>
              <div className="flex items-center gap-2">
                <GitCompare className="text-purple-600 flex-shrink-0" size={16} />
                <span className="text-xs sm:text-sm text-gray-600 font-medium">{compareColleges.length}/3 to compare</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A51C30]"></div>
            </div>
          ) : displayCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
               <h3 className="text-lg font-semibold text-gray-700">No courses found</h3>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {displayCourses.map((course, index) => {
                  const isBlurred = viewMode === "recommended" && index >= 2
                  const inCompare = isInCompare(course.id)
                  return (
                    <div key={course.id} className={`bg-white rounded-xl p-4 sm:p-6 transition-all relative ${inCompare ? 'border-2 border-purple-500 shadow-md' : 'border border-gray-200 hover:shadow-xl'}`}>
                      {isBlurred && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 rounded-xl text-center">
                          <h3 className="font-bold mb-2">Unlock More Recommendations</h3>
                          <button className="bg-[#A51C30] text-white px-4 py-2 rounded-lg text-sm font-semibold">Contact Our Experts</button>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start gap-3 mb-4">
                        <div className="flex-1">
                          <div className="font-bold text-xl text-gray-900 mb-1">{course.University}</div>
                          <div className="text-gray-600 font-medium">{course["Program Name"]}</div>
                          {viewMode === "recommended" && <div className="mt-2">{getMatchBadge(course)}</div>}
                        </div>
                        <div className="flex items-center gap-3">
                           <input type="checkbox" checked={inCompare} onChange={() => toggleCompare(course)} className="w-4 h-4 accent-purple-600" />
                           <button onClick={() => toggleSaved(course)} className={savedCourses.has(course.id) ? "text-[#A51C30]" : "text-gray-400"}>
                              <Heart size={20} fill={savedCourses.has(course.id) ? "currentColor" : "none"} />
                           </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <div className="text-xs text-gray-500">Campus</div>
                          <p className="font-semibold text-sm">{course.Campus || "N/A"}</p>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Country</div>
                          <p className="font-semibold text-sm">{course.Country || "N/A"}</p>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Duration</div>
                          <p className="font-semibold text-sm">{course.Duration || "N/A"}</p>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Fees</div>
                          <p className="font-semibold text-sm">{course["Yearly Tuition Fees"] || "N/A"}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <a href={course["Website URL"] || "#"} target="_blank" className="w-full bg-[#A51C30] text-white rounded-lg py-2.5 flex items-center justify-center gap-2 text-sm font-semibold hover:bg-[#8A1828]">
                          <BookOpen size={14} /> View Details
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Pagination
                totalItems={totalItems}
                currentPage={currentPage}
                perPage={perPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
        <CompareFloatingButton compareCount={compareColleges.length} onCompareClick={goToComparison} />
      </div>
    </DefaultLayout>
  )
}

export default CourseFinder*/ 
=======
export default CourseFinder;
>>>>>>> 236f9af1df350c439a4bc1a3ae580ffdc354f8cf
