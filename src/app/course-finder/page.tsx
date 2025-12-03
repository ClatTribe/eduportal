"use client"
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
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { useAuth } from "../../../contexts/AuthContext"
import DefaultLayout from "../defaultLayout"
import Pagination from "../../../components/CourseFinder/Pagination"
import FilterComponent from "../../../components/CourseFinder/Filtering"
import useSavedCourses from "../../../components/CourseFinder/SavedCourses"
import CoursesRecommend from "../../../components/CourseFinder/CoursesRecommend"

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

const CourseFinder: React.FC = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [viewMode, setViewMode] = useState<"all" | "recommended">("all")

  const { savedCourses, toggleSaved } = useSavedCourses(user)

  const perPage = 15

  useEffect(() => {
    if (viewMode === "all") {
      fetchCourses()
    }
  }, [viewMode])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      let allCourses: Course[] = []
      let from = 0
      const batchSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error: supabaseError } = await supabase
          .from("courses")
          .select("*")
          .order("id", { ascending: true })
          .range(from, from + batchSize - 1)

        if (supabaseError) throw supabaseError

        if (data && data.length > 0) {
          allCourses = [...allCourses, ...data]
          hasMore = data.length === batchSize
          from += batchSize
        } else {
          hasMore = false
        }
      }

      const validCourses = allCourses.filter((course) => course.University !== null)
      setCourses(validCourses)
      setFilteredCourses(validCourses)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses")
      console.error("Error fetching courses:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRecommendedCoursesChange = (recommendedCourses: Course[]) => {
    setFilteredCourses(recommendedCourses)
    setCurrentPage(0)
  }

  const handleFilterChange = (filtered: Course[]) => {
    setFilteredCourses(filtered)
    setCurrentPage(0)
  }

  const getMatchBadge = (course: Course) => {
    if (viewMode !== "recommended" || !course.matchScore) return null

    const score = course.matchScore

    if (score >= 90) {
      return (
        <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1 border border-green-200">
          <Trophy size={14} />
          Perfect Match ({score}%)
        </span>
      )
    } else if (score >= 75) {
      return (
        <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1 border border-blue-200">
          <Award size={14} />
          Excellent Match ({score}%)
        </span>
      )
    } else if (score >= 60) {
      return (
        <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1 border border-purple-200">
          <Target size={14} />
          Great Match ({score}%)
        </span>
      )
    } else if (score >= 40) {
      return (
        <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold border border-amber-200">
          Good Match ({score}%)
        </span>
      )
    }

    return (
      <span className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-full font-semibold border border-gray-200">
        Relevant ({score}%)
      </span>
    )
  }

  const paginatedCourses = filteredCourses.slice(currentPage * perPage, (currentPage + 1) * perPage)

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#A51C30] mb-2">Find Your Perfect Course</h1>
            <p className="text-gray-600">Explore programs and universities worldwide</p>
          </div>

          {/* View Mode Toggle */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => {
                setViewMode("all")
                setCurrentPage(0)
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === "all"
                  ? "bg-[#A51C30] text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <GraduationCap size={20} />
              All Courses
            </button>

            <button
              onClick={() => {
                setViewMode("recommended")
                setCurrentPage(0)
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === "recommended"
                  ? "bg-[#A51C30] text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <Sparkles size={20} />
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
          <FilterComponent courses={courses} viewMode={viewMode} onFilterChange={handleFilterChange} />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="text-[#A51C30] flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-[#A51C30]">Notice</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-[#A51C30]" size={24} />
              <span className="font-semibold text-lg text-gray-800">
                {filteredCourses.length.toLocaleString()} {viewMode === "recommended" ? "recommended " : ""}
                courses found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="text-[#A51C30]" size={18} />
              <span className="text-sm text-gray-600">{savedCourses.size} saved</span>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A51C30]"></div>
                <p>Loading courses...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
              <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {viewMode === "recommended" ? "No recommended courses found" : "No courses found"}
              </h3>
              <p className="text-gray-500">
                {viewMode === "recommended"
                  ? "Try updating your profile or check back later for more options"
                  : "Try adjusting your filters or search query"}
              </p>
            </div>
          ) : (
            <>
              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {paginatedCourses.map((course, index) => {
                  const isBlurred = viewMode === "recommended" && index >= 2
                  const courseIndex = currentPage * perPage + index

                  return (
                    <div
                      key={course.id}
                      className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 relative ${
                        isBlurred ? "overflow-hidden" : ""
                      }`}
                    >
                      {isBlurred && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 rounded-xl">
                          <div className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-sm border-2 border-[#A51C30]/20">
                            <div className="mb-4 flex justify-center">
                              <div className="bg-[#A51C30]/10 rounded-full p-4">
                                <AlertCircle className="text-[#A51C30]" size={32} />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Unlock More Recommendations</h3>
                            <p className="text-gray-600 mb-6">
                              Talk to our experts to view detailed information about this and {10 - courseIndex - 1}{" "}
                              more personalized course recommendations
                            </p>
                            <button className="bg-[#A51C30] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#8A1828] transition-colors w-full flex items-center justify-center gap-2">
                              <Sparkles size={18} />
                              Contact Our Experts
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Course Card Content */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="font-bold text-2xl text-gray-900 mb-2 leading-tight">
                            {/* <GraduationCap size={14} /> */}
                            <span className="font-Bold">{course.University}</span>
                          </div>
                          <h3 className="font-medium text-lg text-gray-600 mb-2 leading-tight">
                            {course["Program Name"] || "Unknown Program"}
                          </h3>
                          {course.Concentration && (
                            <div className="text-xs text-gray-600 mb-2 bg-gray-50 inline-block px-2 py-1 rounded">
                              <span className="font-medium">Concentration:</span> {course.Concentration}
                            </div>
                          )}
                          {viewMode === "recommended" && <div className="mt-3">{getMatchBadge(course)}</div>}
                        </div>

                        <button
                          onClick={() => toggleSaved(course)}
                          disabled={isBlurred}
                          className={`transition-colors ml-3 ${
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
                          <Heart size={22} fill={savedCourses.has(course.id) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <MapPin size={14} />
                              <span>Campus</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">{course.Campus || "N/A"}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Globe size={14} />
                              <span>Country</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">{course.Country || "N/A"}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Calendar size={14} />
                              <span>Duration</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">{course.Duration || "N/A"}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <DollarSign size={14} />
                              <span>Tuition Fees</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {course["Yearly Tuition Fees"] || "N/A"}
                            </p>
                          </div>
                        </div>

                        {(course["Open Intakes"] || course["Entry Requirements"]) && (
                          <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
                              <Calendar size={14} className="text-[#A51C30]" />
                              Program Information
                            </h4>
                            <div className="space-y-2">
                              {course["Open Intakes"] && (
                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                  <div className="text-xs text-blue-600 font-medium mb-1">Open Intakes</div>
                                  <p className="font-semibold text-sm text-blue-800">{course["Open Intakes"]}</p>
                                </div>
                              )}
                              {course["Entry Requirements"] && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="text-xs text-gray-600 font-medium mb-1">Entry Requirements</div>
                                  <p className="text-sm text-gray-700">{course["Entry Requirements"]}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {(course["IELTS Score"] ||
                          course["TOEFL Score"] ||
                          course["PTE Score"] ||
                          course["DET Score"]) && (
                          <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
                              <Award size={14} className="text-[#A51C30]" />
                              English Requirements
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {course["IELTS Score"] && (
                                <span className="bg-[#A51C30]/5 text-[#A51C30] text-xs px-3 py-1.5 rounded-md font-medium border border-[#A51C30]/20">
                                  IELTS: {course["IELTS Score"]}
                                </span>
                              )}
                              {course["TOEFL Score"] && (
                                <span className="bg-[#8A1828]/5 text-[#8A1828] text-xs px-3 py-1.5 rounded-md font-medium border border-[#8A1828]/20">
                                  TOEFL: {course["TOEFL Score"]}
                                </span>
                              )}
                              {course["PTE Score"] && (
                                <span className="bg-[#C22E44]/5 text-[#C22E44] text-xs px-3 py-1.5 rounded-md font-medium border border-[#C22E44]/20">
                                  PTE: {course["PTE Score"]}
                                </span>
                              )}
                              {course["DET Score"] && (
                                <span className="bg-[#8B0A1A]/5 text-[#8B0A1A] text-xs px-3 py-1.5 rounded-md font-medium border border-[#8B0A1A]/20">
                                  DET: {course["DET Score"]}
                                </span>
                              )}
                              {course["English Proficiency Exam Waiver"] && (
                                <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-md font-medium border border-emerald-200">
                                  Waiver: {course["English Proficiency Exam Waiver"]}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {course["Scholarship Available"] === "Yes" && (
                          <div className="pt-4 border-t border-gray-200">
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-3 py-2 rounded-md font-medium border border-emerald-200">
                              <Award size={14} />
                              Scholarship Available
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-4 pt-4">
                          {course["Website URL"] && (
                            <a
                              href={
                                course["Website URL"].startsWith("http")
                                  ? course["Website URL"]
                                  : `https://${course["Website URL"]}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-[#A51C30] text-white rounded-lg py-2.5 px-4 hover:bg-[#8A1828] transition-colors flex items-center justify-center gap-2 text-sm font-semibold shadow-sm"
                            >
                              <BookOpen size={16} />
                              View Details
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
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
      </div>
    </DefaultLayout>
  )
}

export default CourseFinder