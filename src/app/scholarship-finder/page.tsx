"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
  Search,
  Heart,
  Calendar,
  Award,
  ExternalLink,
  MapPin,
  Filter,
  X,
  AlertCircle,
  Sparkles,
  Trophy,
  Target,
  Star,
} from "lucide-react"
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import DefaultLayout from '../defaultLayout';
import { useSavedItems } from '../../../components/Scholarship/SavedItemsManager';
import { FilterPanel } from '../../../components/Scholarship//FilterPanel';
import { BlurOverlay } from '../../../components/Scholarship//BlurOverlay';
import { calculateMatchScore } from '../../../components/Scholarship//MatchScoreCalculator';

interface Scholarship {
  id: number
  country_region: string
  scholarship_name: string
  provider: string
  degree_level: string
  deadline: string
  detailed_eligibility: string
  link?: string
  price?: string
  created_at?: string
  matchScore?: number
  isFeatured?: boolean
}

interface UserProfile {
  target_countries: string[]
  degree: string
  program: string
}

const accentColor = '#A51C30';
const primaryBg = '#FFFFFF';
const borderColor = '#FECDD3';

const FEATURED_SCHOLARSHIP: Scholarship = {
  id: -1,
  country_region: "All",
  scholarship_name: "Pt. J.S. Mishra",
  provider: "Edu Abroad",
  degree_level: "Undergraduate / Postgraduate",
  deadline: "Varies by university",
  detailed_eligibility:
    "High-achieving Indian students facing significant economic barriers; program highlights inclusion for persons with disabilities and displaced youth; leadership & community impact valued",
  price: "5 Lakh+",
  link: "#",
  matchScore: 100,
  isFeatured: true,
}

const degreeLevels = ["Undergraduate", "Graduate", "Master", "Postgraduate", "PhD", "Postdoc"]

const ScholarshipFinder: React.FC = () => {
  const { user } = useAuth()
  const { savedItems: savedScholarships, toggleSaveItem } = useSavedItems(user?.id, 'scholarship')
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [viewMode, setViewMode] = useState<"all" | "recommended">("all")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [user])

  useEffect(() => {
    if (!loadingProfile) {
      if (viewMode === "all") {
        fetchScholarships()
      } else {
        fetchRecommendedScholarships()
      }
    }
  }, [loadingProfile, viewMode])

  useEffect(() => {
    if (viewMode === "all") {
      applyFilters()
    }
  }, [searchQuery, selectedCountry, selectedLevel, scholarships, viewMode])

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true)
      if (!user) {
        setUserProfile(null)
        setLoadingProfile(false)
        return
      }

      const { data, error: profileError } = await supabase
        .from("admit_profiles")
        .select("target_countries, degree, program")
        .eq("user_id", user.id)
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

  const fetchRecommendedScholarships = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!userProfile || !userProfile.target_countries?.length || !userProfile.degree) {
        setError("Please complete your profile to see personalized recommendations")
        setFilteredScholarships([{ ...FEATURED_SCHOLARSHIP, matchScore: 100 }])
        setLoading(false)
        return
      }

      const { data, error: supabaseError } = await supabase
        .from("scholarship_new")
        .select("*")
        .order("deadline", { ascending: true })

      if (supabaseError) throw supabaseError

      const filtered = (data || []).filter((scholarship) => {
        if (!scholarship.scholarship_name) return false
        if (!userProfile.target_countries.includes(scholarship.country_region || "")) return false
        return true
      })

      const scoredScholarships = filtered.map((scholarship) => ({
        ...scholarship,
        matchScore: calculateMatchScore(scholarship, userProfile),
      }))

      const relevantScholarships = scoredScholarships.filter((s) => (s.matchScore || 0) > 10)
      const topRecommendations = relevantScholarships
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 9)

      if (topRecommendations.length < 9) {
        const remaining = scoredScholarships
          .filter((s) => !topRecommendations.find((t) => t.id === s.id))
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
          .slice(0, 9 - topRecommendations.length)
        topRecommendations.push(...remaining)
      }

      setFilteredScholarships([{ ...FEATURED_SCHOLARSHIP, matchScore: 100 }, ...topRecommendations])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recommended scholarships")
      console.error("Error fetching recommended scholarships:", err)
      setFilteredScholarships([{ ...FEATURED_SCHOLARSHIP, matchScore: 100 }])
    } finally {
      setLoading(false)
    }
  }

  const fetchScholarships = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from("scholarship_new")
        .select("*")
        .order("deadline", { ascending: true })

      if (supabaseError) throw supabaseError

      const validScholarships = (data || []).filter((s) => s.scholarship_name !== null)
      setScholarships([FEATURED_SCHOLARSHIP, ...validScholarships])
      setFilteredScholarships([FEATURED_SCHOLARSHIP, ...validScholarships])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch scholarships")
      console.error("Error fetching scholarships:", err)
      setScholarships([FEATURED_SCHOLARSHIP])
      setFilteredScholarships([FEATURED_SCHOLARSHIP])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    const dbScholarships = scholarships.filter((s) => s.id !== -1)
    let filtered = [...dbScholarships]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (scholarship) =>
          scholarship.scholarship_name?.toLowerCase().includes(query) ||
          scholarship.provider?.toLowerCase().includes(query) ||
          scholarship.country_region?.toLowerCase().includes(query),
      )
    }

    if (selectedCountry) {
      filtered = filtered.filter((s) => s.country_region === selectedCountry)
    }

    if (selectedLevel) {
      filtered = filtered.filter((s) => s.degree_level?.includes(selectedLevel))
    }

    setFilteredScholarships([FEATURED_SCHOLARSHIP, ...filtered])
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCountry("")
    setSelectedLevel("")
  }

  const clearFilter = (filterName: string) => {
    switch (filterName) {
      case "country": setSelectedCountry(""); break
      case "level": setSelectedLevel(""); break
      case "search": setSearchQuery(""); break
    }
  }

  const getMatchBadge = (scholarship: Scholarship) => {
    if (scholarship.isFeatured) {
      return (
        <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#d97706', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
          <Star size={14} className="fill-current" />
          <span className="hidden sm:inline">Top Recommended</span>
          <span className="sm:hidden">Top</span>
        </span>
      )
    }

    if (viewMode !== "recommended" || !scholarship.matchScore) return null

    const score = scholarship.matchScore
    const badges = [
      { min: 90, bg: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', icon: Trophy, label: 'Perfect Match' },
      { min: 75, bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', icon: Award, label: 'Excellent Match' },
      { min: 60, bg: 'rgba(168, 85, 247, 0.1)', color: '#9333ea', icon: Target, label: 'Great Match' },
      { min: 40, bg: 'rgba(250, 204, 21, 0.1)', color: '#ca8a04', icon: null, label: 'Good Match' },
      { min: 0, bg: 'rgba(148, 163, 184, 0.1)', color: '#64748b', icon: null, label: 'Relevant' },
    ]

    const badge = badges.find(b => score >= b.min)
    if (!badge) return null

    const Icon = badge.icon

    return (
      <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.bg}` }}>
        {Icon && <Icon size={14} />}
        <span className="hidden sm:inline">{badge.label} ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>
    )
  }

  const formatDeadline = (dateString: string) => {
    if (!dateString || dateString === "") return "Check website"
    if (dateString.toLowerCase().includes("varies") || dateString.toLowerCase().includes("rolling") || dateString.toLowerCase().includes("typically")) {
      return dateString
    }

    try {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
      }
      return dateString
    } catch {
      return dateString
    }
  }

  const getUniqueCountries = () => {
    const countries = scholarships.filter((s) => s.id !== -1).map((s) => s.country_region)
    return [...new Set(countries)].filter(Boolean).sort()
  }

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const activeFiltersCount = [searchQuery, selectedCountry, selectedLevel].filter(Boolean).length
  const hasProfileData = userProfile && userProfile.target_countries?.length > 0 && userProfile.degree && userProfile.program
  const canShowRecommendations = hasProfileData && !loadingProfile

  return (
    <DefaultLayout>
      <div className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-[72px] sm:mt-0" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2" style={{ color: accentColor }}>
              Find Scholarships to Fuel Your Dream
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Discover scholarships from top universities and institutions worldwide</p>
          </div>

          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button onClick={() => { setViewMode("all"); resetFilters(); }} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
              style={viewMode === "all" ? { backgroundColor: accentColor, color: 'white' } : { backgroundColor: 'white', color: '#6b7280', border: `1px solid ${borderColor}` }}>
              <Award size={18} className="sm:w-5 sm:h-5" />
              All Scholarships
            </button>
            <button onClick={() => { if (canShowRecommendations) { setViewMode("recommended"); resetFilters(); } }} disabled={!canShowRecommendations}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
              style={viewMode === "recommended" ? { backgroundColor: accentColor, color: 'white' } : canShowRecommendations ? { backgroundColor: 'white', color: '#6b7280', border: `1px solid ${borderColor}` } : { backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }}
              title={!hasProfileData ? "Complete your profile to see recommendations" : ""}>
              <Sparkles size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Recommended For You</span>
              <span className="sm:inline md:hidden">Recommended</span>
              {!loadingProfile && !hasProfileData && <span className="text-xs ml-1 hidden lg:inline">(Complete profile)</span>}
            </button>
          </div>

          {viewMode === "recommended" && userProfile && hasProfileData && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: 'rgba(165, 28, 48, 0.05)', borderLeft: `4px solid ${accentColor}`, border: `1px solid ${borderColor}` }}>
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 flex-shrink-0" style={{ color: accentColor }} size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold mb-1" style={{ color: accentColor }}>Showing your top personalized recommendations</p>
                  <p className="text-xs text-gray-700 break-words">
                    Based on: <strong>{userProfile.degree}</strong> degree | Countries: <strong>{userProfile.target_countries.join(", ")}</strong>
                    {userProfile.program && <> | Program: <strong>{userProfile.program}</strong></>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {viewMode === "all" && (
            <>
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input type="text" placeholder="Search scholarships..." className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400"
                      style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <Search className="absolute right-3 top-2.5 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all" style={{ backgroundColor: accentColor, color: 'white' }}>
                    <Filter size={18} className="sm:w-5 sm:h-5" />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold" style={{ color: accentColor }}>{activeFiltersCount}</span>}
                  </button>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {searchQuery && (
                      <div className="px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(165, 28, 48, 0.1)', color: accentColor }}>
                        <span className="font-medium truncate max-w-[150px]">Search: {searchQuery}</span>
                        <button onClick={() => clearFilter("search")} className="hover:opacity-70 rounded-full p-0.5 flex-shrink-0"><X size={14} /></button>
                      </div>
                    )}
                    {selectedCountry && (
                      <div className="px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(165, 28, 48, 0.1)', color: accentColor }}>
                        <span className="font-medium truncate max-w-[150px]">{selectedCountry}</span>
                        <button onClick={() => clearFilter("country")} className="hover:opacity-70 rounded-full p-0.5 flex-shrink-0"><X size={14} /></button>
                      </div>
                    )}
                    {selectedLevel && (
                      <div className="px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(165, 28, 48, 0.1)', color: accentColor }}>
                        <span className="font-medium truncate max-w-[150px]">{selectedLevel}</span>
                        <button onClick={() => clearFilter("level")} className="hover:opacity-70 rounded-full p-0.5 flex-shrink-0"><X size={14} /></button>
                      </div>
                    )}
                    <button onClick={resetFilters} className="text-xs sm:text-sm font-medium px-2 hover:opacity-70" style={{ color: accentColor }}>Clear All</button>
                  </div>
                )}
              </div>

              <FilterPanel showFilters={showFilters} selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
                selectedLevel={selectedLevel} setSelectedLevel={setSelectedLevel} countries={getUniqueCountries()}
                degreeLevels={degreeLevels} accentColor={accentColor} borderColor={borderColor} />
            </>
          )}

          {error && (
            <div className="rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3" style={{ backgroundColor: 'rgba(165, 28, 48, 0.05)', border: `1px solid ${borderColor}` }}>
              <AlertCircle className="flex-shrink-0 mt-0.5" style={{ color: accentColor }} size={20} />
              <div>
                <h3 className="font-semibold text-sm sm:text-base" style={{ color: accentColor }}>Notice</h3>
                <p className="text-xs sm:text-sm text-gray-700">{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 rounded-lg shadow-sm p-3 sm:p-4 gap-2" style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }}>
            <div className="flex items-center gap-2">
              <Award style={{ color: accentColor }} size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base text-gray-900">
                {filteredScholarships.length.toLocaleString()} {viewMode === "recommended" ? "recommended " : ""}scholarship{filteredScholarships.length !== 1 ? 's' : ''} found,  stay tuned for more !
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart style={{ color: accentColor }} size={16} className="sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm text-gray-600">{savedScholarships.size} saved</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2" style={{ borderColor: accentColor }}></div>
                <p className="text-sm sm:text-base text-gray-600">Loading scholarships...</p>
              </div>
            </div>
          ) : filteredScholarships.length === 0 ? (
            <div className="text-center py-12 sm:py-16 rounded-lg shadow-sm" style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }}>
              <Award size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {viewMode === "recommended" ? "No recommended scholarships found" : "No scholarships found"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                {viewMode === "recommended" ? "Try updating your profile or check back later for more options" : "Try adjusting your filters or search query"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredScholarships.map((s, index) => {
                const isBlurred = viewMode === "recommended" && index >= 3
                const isFeatured = s.isFeatured

                return (
                  <div key={s.id} className={`rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow relative ${isBlurred ? "overflow-hidden" : ""}`}
                    style={isFeatured ? { backgroundColor: 'white', border: `2px solid #fbbf24`, boxShadow: '0 4px 6px -1px rgba(251, 191, 36, 0.1)' } : { backgroundColor: 'white', border: `1px solid ${borderColor}` }}>
                    
                    {isFeatured && (
                      <div className="absolute -top-1 -right-1">
                        <div className="text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-md flex items-center gap-1" style={{ backgroundColor: '#fbbf24' }}>
                          <Star size={12} className="fill-white" />
                          FEATURED
                        </div>
                      </div>
                    )}

                    <BlurOverlay isBlurred={isBlurred} remainingCount={filteredScholarships.length - index - 1} accentColor={accentColor} borderColor={borderColor} />

                    <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-base sm:text-lg leading-tight mb-2 break-words ${isFeatured ? 'text-amber-900' : 'text-gray-900'}`}>
                          {s.scholarship_name}
                        </h3>

                        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm mb-2">
                          <MapPin size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                          <span className="truncate">{s.country_region}</span>
                        </div>

                        {s.provider && <p className="text-gray-700 font-medium text-xs sm:text-sm mb-2 truncate">{s.provider}</p>}
                        {isFeatured && s.price && <p className="text-amber-700 font-semibold text-xs sm:text-sm mb-2">Value: {s.price}</p>}

                        <div className="mt-2">{getMatchBadge(s)}</div>
                      </div>

                      <button onClick={() => toggleSaveItem(s.id)} disabled={isBlurred}
                        className={`transition-colors flex-shrink-0 ${isBlurred ? "opacity-50 cursor-not-allowed" : savedScholarships.has(s.id) ? "" : "text-gray-400"}`}
                        style={savedScholarships.has(s.id) && !isBlurred ? { color: accentColor } : {}}
                        title={isBlurred ? "Contact experts to unlock" : savedScholarships.has(s.id) ? "Remove from saved" : "Save scholarship"}>
                        <Heart size={18} className="sm:w-5 sm:h-5" fill={savedScholarships.has(s.id) ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {s.detailed_eligibility && <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">{truncateText(s.detailed_eligibility, 180)}</p>}

                    <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                      {s.degree_level && (
                        <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-medium"
                          style={isFeatured ? { backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#d97706' } : { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>
                          {s.degree_level}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-700 mb-3 sm:mb-4 pt-3 sm:pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                      <Calendar size={14} className="sm:w-4 sm:h-4 flex-shrink-0" style={{ color: accentColor }} />
                      <span className="text-xs sm:text-sm"><strong>Deadline:</strong> {formatDeadline(s.deadline)}</span>
                    </div>

                    {s.link && (
                      <a href={s.link} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${isBlurred ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                        style={isFeatured ? { backgroundColor: '#fbbf24', color: 'white' } : { backgroundColor: accentColor, color: 'white' }}>
                        <span className="hidden sm:inline">{isFeatured ? "Apply Now - Highly Recommended" : "Apply Now"}</span>
                        <span className="sm:hidden">Apply Now</span>
                        <ExternalLink size={14} className="sm:w-4 sm:h-4" />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  )
}

export default ScholarshipFinder