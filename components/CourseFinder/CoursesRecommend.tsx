import React, { useState, useEffect } from "react"
import { Sparkles, Trophy, Award, Target } from "lucide-react"
import { supabase } from "../../lib/supabase"

interface Course {
  id: number
  University: string | null
  'University Ranking': string | null
  'Program Name': string | null
  Concentration: string | null
  'Website URL': string | null
  Campus: string | null
  Country: string | null
  'Study Level': string | null
  Duration: string | null
  'Open Intakes': string | null
  'Intake Year': string | null
  'Entry Requirements': string | null
  'IELTS Score': string | null
  'IELTS No Band Less Than': string | null
  'TOEFL Score': string | null
  'PTE Score': string | null
  'DET Score': string | null
  'Application Deadline': string | null
  'Application Fee': string | null
  'Yearly Tuition Fees': string | null
  'Scholarship Available': string | null
  'Backlog Range': string | null
  Remarks: string | null
  ApplicationMode: string | null
  'English Proficiency Exam Waiver': string | null
  matchScore?: number
}

interface UserProfile {
  target_countries: string[]
  degree: string
  program: string
  budget: string | null
  twelfth_score: string | null
  ug_score: string | null
  pg_score: string | null
  test_scores: Array<{ exam: string; score: string }>
  has_experience: string | null
  experience_years: string | null
}

interface CoursesRecommendProps {
  user: unknown
  viewMode: "all" | "recommended"
  onRecommendedCoursesChange: (courses: Course[]) => void
  onLoadingChange: (loading: boolean) => void
  onErrorChange: (error: string | null) => void
}

const CoursesRecommend: React.FC<CoursesRecommendProps> = ({
  user,
  viewMode,
  onRecommendedCoursesChange,
  onLoadingChange,
  onErrorChange,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [user])

  useEffect(() => {
    if (!loadingProfile && viewMode === "recommended") {
      fetchRecommendedCourses()
    }
  }, [loadingProfile, viewMode])

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true)
      if (!user || typeof user !== "object" || !("id" in user)) {
        setUserProfile(null)
        setLoadingProfile(false)
        return
      }

      const { data, error: profileError } = await supabase
        .from("admit_profiles")
        .select(
          "target_countries, degree, program, budget, twelfth_score, ug_score, pg_score, test_scores, has_experience, experience_years"
        )
        .eq("user_id", (user as { id: string }).id)
        .single()

      if (profileError) {
        console.error("Profile fetch error:", profileError)
        setUserProfile(null)
      } else if (data) {
        setUserProfile(data)
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      setUserProfile(null)
    } finally {
      setLoadingProfile(false)
    }
  }

  const calculateMatchScore = (course: Course): number => {
    if (!userProfile) return 0

    let score = 0

    // Program/Concentration matching (max 50 points)
    if (userProfile.program && course["Program Name"]) {
      const userProgram = userProfile.program.toLowerCase().trim()
      const courseName = course["Program Name"].toLowerCase()
      const concentration = (course.Concentration || "").toLowerCase()
      const combinedCourseText = `${courseName} ${concentration}`

      const commonWords = ["in", "of", "and", "the", "for", "with", "on", "at", "to", "a", "an"]
      const userKeywords = userProgram.split(/[\s,\-/]+/).filter((k) => k.length > 2 && !commonWords.includes(k))

      // Exact match
      if (courseName.includes(userProgram) || concentration.includes(userProgram)) {
        score += 50
      } else if (userProgram.includes(courseName.split(" ").slice(0, 3).join(" "))) {
        score += 48
      } else {
        // Keyword-based matching
        let keywordMatches = 0
        const totalKeywords = userKeywords.length || 1

        for (const keyword of userKeywords) {
          if (combinedCourseText.includes(keyword)) {
            keywordMatches++
          }
        }

        const matchPercentage = keywordMatches / totalKeywords

        if (matchPercentage >= 0.8) score += 45
        else if (matchPercentage >= 0.6) score += 38
        else if (matchPercentage >= 0.4) score += 30
        else if (matchPercentage >= 0.2) score += 20
        else if (keywordMatches > 0) score += 10
      }

      // Field group matching (bonus points)
      const fieldGroups: Record<string, string[]> = {
        cs: [
          "computer",
          "software",
          "data",
          "artificial",
          "intelligence",
          "machine",
          "learning",
          "cyber",
          "information",
          "technology",
        ],
        business: ["business", "management", "mba", "finance", "accounting", "marketing", "economics"],
        engineering: ["engineering", "mechanical", "electrical", "civil", "chemical", "industrial"],
        science: ["science", "biology", "chemistry", "physics", "mathematics", "statistics"],
        arts: ["art", "design", "music", "theatre", "media", "communication", "journalism"],
      }

      for (const group of Object.values(fieldGroups)) {
        const userInGroup = group.some((term) => userProgram.includes(term))
        const courseInGroup = group.some((term) => combinedCourseText.includes(term))
        if (userInGroup && courseInGroup && score < 30) {
          score += 15
          break
        }
      }
    }

    // Country matching (30 points)
    if (userProfile.target_countries && userProfile.target_countries.length > 0) {
      if (userProfile.target_countries.includes(course.Country || "")) {
        score += 30
      }
    }

    // Study Level matching (20 points)
    const targetStudyLevel = userProfile.degree === "Bachelors" ? "Undergraduate" : "Postgraduate"
    if (course["Study Level"] === targetStudyLevel) {
      score += 20
    }

    return score
  }

  const fetchRecommendedCourses = async () => {
    try {
      onLoadingChange(true)
      onErrorChange(null)

      if (!userProfile) {
        onErrorChange("Please complete your profile to see personalized recommendations")
        onRecommendedCoursesChange([])
        onLoadingChange(false)
        return
      }

      if (!userProfile.target_countries || userProfile.target_countries.length === 0) {
        onErrorChange("Please select at least one target country in your profile")
        onRecommendedCoursesChange([])
        onLoadingChange(false)
        return
      }

      if (!userProfile.degree) {
        onErrorChange("Please select your target degree in your profile")
        onRecommendedCoursesChange([])
        onLoadingChange(false)
        return
      }

      if (!userProfile.program) {
        onErrorChange("Please select your field of study in your profile")
        onRecommendedCoursesChange([])
        onLoadingChange(false)
        return
      }

      // Fetch all courses in batches
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

      const targetStudyLevel = userProfile.degree === "Bachelors" ? "Undergraduate" : "Postgraduate"

      // Filter courses
      const filtered = allCourses.filter((course) => {
        if (!course.University) return false
        if (course["Study Level"] !== targetStudyLevel) return false
        if (!userProfile.target_countries.includes(course.Country || "")) return false
        return true
      })

      // Calculate match scores for all courses
      const scoredCourses = filtered.map((course) => ({
        ...course,
        matchScore: calculateMatchScore(course),
      }))

      // Filter for relevant courses (score > 10)
      const relevantCourses = scoredCourses.filter((c) => (c.matchScore || 0) > 10)

      // Get top 10 recommendations
      const topRecommendations = relevantCourses.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, 10)

      // If we don't have 10 recommendations, fill with the best remaining courses
      if (topRecommendations.length < 10) {
        const remaining = scoredCourses
          .filter((c) => !topRecommendations.find((t) => t.id === c.id))
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
          .slice(0, 10 - topRecommendations.length)

        topRecommendations.push(...remaining)
      }

      onRecommendedCoursesChange(topRecommendations)
    } catch (err) {
      onErrorChange(err instanceof Error ? err.message : "Failed to fetch recommended courses")
      console.error("Error fetching recommended courses:", err)
    } finally {
      onLoadingChange(false)
    }
  }

  const getMatchBadge = (matchScore?: number) => {
    if (!matchScore) return null

    if (matchScore >= 90) {
      return (
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Trophy size={14} />
          Perfect Match ({matchScore}%)
        </span>
      )
    } else if (matchScore >= 75) {
      return (
        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Award size={14} />
          Excellent Match ({matchScore}%)
        </span>
      )
    } else if (matchScore >= 60) {
      return (
        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Target size={14} />
          Great Match ({matchScore}%)
        </span>
      )
    } else if (matchScore >= 40) {
      return (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
          Good Match ({matchScore}%)
        </span>
      )
    }

    return (
      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
        Relevant ({matchScore}%)
      </span>
    )
  }

  const hasProfileData =
    userProfile &&
    userProfile.target_countries &&
    userProfile.target_countries.length > 0 &&
    userProfile.degree &&
    userProfile.program

  return (
    <>
      {viewMode === "recommended" && userProfile && hasProfileData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">
                Showing your top 10 personalized recommendations
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Based on: <strong>{userProfile.degree}</strong> degree | Countries:{" "}
                <strong>{userProfile.target_countries.join(", ")}</strong>
                {userProfile.program && (
                  <>
                    {" "}
                    | Program: <strong>{userProfile.program}</strong>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CoursesRecommend