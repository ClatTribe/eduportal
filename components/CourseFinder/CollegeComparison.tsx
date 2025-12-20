import React, { useState, useEffect } from "react"
import { GitCompare, X, ArrowRight } from "lucide-react"
import { supabase } from "../../lib/supabase"

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

interface CourseComparisonProps {
  user: any
  courses: Course[]
}

// Changed from React.FC to a regular hook function
const useCourseComparison = ({ user, courses }: CourseComparisonProps) => {
  const [compareColleges, setCompareColleges] = useState<Course[]>([])

  // Load compare colleges on mount
  useEffect(() => {
    if (user) {
      fetchCompareCollegesFromDB()
    } else {
      fetchCompareCollegesFromLocalStorage()
    }
  }, [user, courses])

  // Fetch compare colleges from database (for logged-in users)
  const fetchCompareCollegesFromDB = async () => {
    if (!user || courses.length === 0) return

    try {
      const { data: compareData, error: compareError } = await supabase!
        .from("compare_colleges")
        .select("college_id")
        .eq("user_id", user.id)

      if (compareError) throw compareError

      if (compareData && compareData.length > 0) {
        const collegeIds = compareData.map(item => item.college_id)
        const selectedColleges = courses.filter(c => collegeIds.includes(c.id))
        setCompareColleges(selectedColleges)
      }
    } catch (err) {
      console.error("Error fetching compare colleges:", err)
    }
  }

  // Fetch compare colleges from localStorage (for non-logged-in users)
  const fetchCompareCollegesFromLocalStorage = () => {
    if (courses.length === 0) return

    try {
      const storedCompareIds = JSON.parse(localStorage.getItem('compareColleges') || '[]')
      if (storedCompareIds.length > 0) {
        const selectedColleges = courses.filter(c => storedCompareIds.includes(c.id))
        setCompareColleges(selectedColleges)
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err)
    }
  }

  // Toggle compare (add/remove college)
  const toggleCompare = async (course: Course) => {
    const exists = compareColleges.find(c => c.id === course.id)

    if (exists) {
      // Remove from compare
      if (user) {
        try {
          const { error } = await supabase!
            .from("compare_colleges")
            .delete()
            .eq("user_id", user.id)
            .eq("college_id", course.id)

          if (error) throw error

          setCompareColleges(prev => prev.filter(c => c.id !== course.id))
        } catch (err) {
          console.error("Error removing from compare:", err)
          alert("Failed to remove from comparison. Please try again.")
        }
      } else {
        // Remove from localStorage
        const storedIds = JSON.parse(localStorage.getItem('compareColleges') || '[]')
        const updatedIds = storedIds.filter((id: number) => id !== course.id)
        localStorage.setItem('compareColleges', JSON.stringify(updatedIds))
        setCompareColleges(prev => prev.filter(c => c.id !== course.id))
      }
    } else {
      // Add to compare (max 3)
      if (compareColleges.length >= 3) {
        alert('You can compare maximum 3 courses at a time')
        return
      }

      if (user) {
        try {
          const { error } = await supabase!
            .from("compare_colleges")
            .insert({
              user_id: user.id,
              college_id: course.id
            })

          if (error) {
            // Check if it's a duplicate error
            if (error.code === '23505') {
              console.log("Course already in comparison")
              return
            }
            throw error
          }

          setCompareColleges(prev => [...prev, course])
        } catch (err) {
          console.error("Error adding to compare:", err)
          alert("Failed to add to comparison. Please try again.")
        }
      } else {
        // Add to localStorage
        const storedIds = JSON.parse(localStorage.getItem('compareColleges') || '[]')
        storedIds.push(course.id)
        localStorage.setItem('compareColleges', JSON.stringify(storedIds))
        
        // Also cache all courses for comparison page
        localStorage.setItem('allColleges', JSON.stringify(courses))
        
        setCompareColleges(prev => [...prev, course])
      }
    }
  }

  const removeFromCompare = async (courseId: number) => {
    if (user) {
      try {
        const { error } = await supabase!
          .from("compare_colleges")
          .delete()
          .eq("user_id", user.id)
          .eq("college_id", courseId)

        if (error) throw error

        setCompareColleges(prev => prev.filter(c => c.id !== courseId))
      } catch (err) {
        console.error("Error removing from compare:", err)
      }
    } else {
      const storedIds = JSON.parse(localStorage.getItem('compareColleges') || '[]')
      const updatedIds = storedIds.filter((id: number) => id !== courseId)
      localStorage.setItem('compareColleges', JSON.stringify(updatedIds))
      setCompareColleges(prev => prev.filter(c => c.id !== courseId))
    }
  }

  const isInCompare = (courseId: number) => {
    return compareColleges.some(c => c.id === courseId)
  }

  const goToComparison = () => {
    // For non-logged-in users, also save to localStorage before navigation
    if (!user && courses.length > 0) {
      localStorage.setItem('allColleges', JSON.stringify(courses))
    }
    window.location.href = '/compare-your-college'
  }

  return {
    compareColleges,
    toggleCompare,
    removeFromCompare,
    isInCompare,
    goToComparison,
  }
}

// Compare Badge Component (for cards)
export const CompareBadge: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null

  return (
    <div className="mb-3">
      <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-300">
        <GitCompare size={12} />
        Added to Compare
      </span>
    </div>
  )
}

// Floating Compare Button Component
export const CompareFloatingButton: React.FC<{
  compareCount: number
  onCompareClick: () => void
}> = ({ compareCount, onCompareClick }) => {
  const [isHovered, setIsHovered] = useState(false)

  // Hide button if no courses selected
  if (compareCount === 0) return null

  const handleClick = () => {
    if (compareCount < 2) {
      alert('Please select at least 2 courses for comparison')
      return
    }
    onCompareClick()
  }

  return (
    <div 
      className="fixed right-6 z-40 transition-all duration-300"
      style={{ 
        bottom: '90px', // Positioned above contact button (which is at bottom-4 = 16px)
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes comparePing {
          75%, 100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        .compare-ping-animation {
          animation: comparePing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}} />
      
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 group rounded-full
          md:px-5 md:py-3 px-4 py-3
          hover:scale-105 active:scale-95
        "
      >
        <GitCompare
          size={20}
          className={`transition-transform duration-300 ${
            isHovered ? 'rotate-12 scale-110' : ''
          }`}
        />
        
        {/* Desktop Text */}
        <span className="font-bold text-sm whitespace-nowrap hidden md:inline">
          Compare ({compareCount})
        </span>
        
        {/* Mobile Text */}
        <span className="font-bold text-sm whitespace-nowrap md:hidden">
          Compare ({compareCount})
        </span>

        <ArrowRight 
          size={18} 
          className={`transition-transform duration-300 hidden md:inline ${
            isHovered ? 'translate-x-1' : ''
          }`}
        />

        {/* Pulse Animation Ring */}
        <div className="absolute inset-0 rounded-full bg-purple-600 compare-ping-animation opacity-20"></div>

        {/* Badge for count */}
        {compareCount === 3 && (
          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
            ✓
          </div>
        )}
      </button>
    </div>
  )
}

export default useCourseComparison