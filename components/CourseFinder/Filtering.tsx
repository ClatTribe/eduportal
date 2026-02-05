import React, { useState, useEffect } from "react"
import {
  Search,
  ChevronDown,
  Filter,
  X,
  GraduationCap,
  Globe,
  Calendar,
  BookOpen,
} from "lucide-react"
import { Course } from "./types"

interface FilterProps {
  courses: Course[]
  viewMode: "all" | "recommended"
  onFilterChange: (filtered: Course[]) => void
}

const countries = ['Australia', 'Canada', 'China', 'Denmark', 'Finland', 'France', 'Georgia', 'Hungary', 'Indonesia', 'Ireland', 'Italy', 'Japan', 'Kazakhstan', 'Lithuania', 'Luxembourg', 'Malaysia', 'Monaco', 'Netherlands', 'New Zealand', 'Poland', 'Russia', 'Singapore', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'United Arab Emirates', 'United Kingdom', 'United States of America', 'Vietnam'];

const studyLevels = [
  'Undergraduate',
  'Postgraduate',
  'PhD',
  'UG Diploma /Certificate /Associate Degree',
  'PG Diploma /Certificate'
]

// ✅ FIXED: Changed to match actual Open Intakes field values
const intakeOptions = [
  { value: 'Spring', label: 'Spring (Jan/Feb/Mar/Apr)' },
  { value: 'Summer', label: 'Summer (May/Jun/Jul)' },
  { value: 'Fall', label: 'Fall (Aug/Sep/Oct)' },
  { value: 'Winter', label: 'Winter (Nov/Dec)' }
]

const FilterComponent: React.FC<FilterProps> = ({ courses, viewMode, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedStudyLevel, setSelectedStudyLevel] = useState("")
  const [selectedUniversity, setSelectedUniversity] = useState("")
  const [selectedIntake, setSelectedIntake] = useState("")
  const [programNameInput, setProgramNameInput] = useState("")
  const [selectedProgramName, setSelectedProgramName] = useState("")
  const [showProgramDropdown, setShowProgramDropdown] = useState(false)

  // ✅ FIXED: Helper function to check if course matches selected intake season
  const matchesIntake = (course: Course, intakeValue: string): boolean => {
    const openIntakes = (course as any)["Open Intakes"] || ''
    
    if (!openIntakes) return false
    
    const intakeLower = openIntakes.toLowerCase()
    const seasonLower = intakeValue.toLowerCase()
    
    // Check if the Open Intakes field contains the season
    // For example: "Springjan", "Springmar", "Spring" all match "Spring"
    return intakeLower.includes(seasonLower)
  }

  useEffect(() => {
    if (viewMode === "all") {
      applyFilters()
    }
  }, [
    searchQuery,
    selectedCountry,
    selectedStudyLevel,
    selectedUniversity,
    selectedIntake,
    programNameInput,
    selectedProgramName,
    courses,
    viewMode,
  ])

  const applyFilters = () => {
    let filtered = [...courses]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (course) =>
          course["Program Name"]?.toLowerCase().includes(query) ||
          course.University?.toLowerCase().includes(query) ||
          course.Campus?.toLowerCase().includes(query)
      )
    }

    if (selectedCountry) {
      filtered = filtered.filter((course) => course.Country === selectedCountry)
    }

    if (selectedStudyLevel) {
      filtered = filtered.filter((course) => course["Study Level"] === selectedStudyLevel)
    }

    if (selectedUniversity) {
      filtered = filtered.filter((course) => course.University === selectedUniversity)
    }

    // ✅ FIXED: Filter by intake season
    if (selectedIntake) {
      filtered = filtered.filter((course) => matchesIntake(course, selectedIntake))
    }

    // Program Name filter - works with both input and dropdown
    if (programNameInput) {
      const query = programNameInput.toLowerCase()
      filtered = filtered.filter((course) => 
        course["Program Name"]?.toLowerCase().includes(query)
      )
    }

    if (selectedProgramName) {
      filtered = filtered.filter((course) => course["Program Name"] === selectedProgramName)
    }

    onFilterChange(filtered)
  }

  const handleFilterChange = (
    filterSetter: React.Dispatch<React.SetStateAction<string>>,
    value: string,
    dependentFilters?: (() => void)[]
  ) => {
    filterSetter(value)
    dependentFilters?.forEach((reset) => reset())
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCountry("")
    setSelectedStudyLevel("")
    setSelectedUniversity("")
    setSelectedIntake("")
    setProgramNameInput("")
    setSelectedProgramName("")
  }

  const clearFilter = (filterName: string) => {
    switch (filterName) {
      case "country":
        setSelectedCountry("")
        break
      case "studyLevel":
        setSelectedStudyLevel("")
        break
      case "university":
        setSelectedUniversity("")
        break
      case "intake":
        setSelectedIntake("")
        break
      case "search":
        setSearchQuery("")
        break
      case "programName":
        setProgramNameInput("")
        setSelectedProgramName("")
        break
    }
  }

  const getFilteredUniversities = () => {
    let filtered = courses
    if (selectedCountry) filtered = filtered.filter((c) => c.Country === selectedCountry)
    if (selectedStudyLevel) filtered = filtered.filter((c) => c["Study Level"] === selectedStudyLevel)
    return Array.from(new Set(filtered.map((c) => c.University).filter((u): u is string => Boolean(u))))
  }

  const getFilteredProgramNames = () => {
    let filtered = courses
    if (selectedCountry) filtered = filtered.filter((c) => c.Country === selectedCountry)
    if (selectedStudyLevel) filtered = filtered.filter((c) => c["Study Level"] === selectedStudyLevel)
    if (selectedUniversity) filtered = filtered.filter((c) => c.University === selectedUniversity)
    if (programNameInput) {
      const query = programNameInput.toLowerCase()
      filtered = filtered.filter((c) => c["Program Name"]?.toLowerCase().includes(query))
    }
    return Array.from(new Set(filtered.map((c) => c["Program Name"]).filter((p): p is string => Boolean(p)))).sort()
  }

  const uniqueUniversities = getFilteredUniversities()
  const uniqueProgramNames = getFilteredProgramNames()

  const activeFiltersCount = [
    searchQuery,
    selectedCountry,
    selectedStudyLevel,
    selectedUniversity,
    selectedIntake,
    programNameInput || selectedProgramName,
  ].filter(Boolean).length

  const displayProgramValue = selectedProgramName || programNameInput

  if (viewMode !== "all") return null

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search for programs, universities, or campus..."
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A51C30]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-[#A51C30] text-white rounded-lg font-medium hover:bg-[#8A1828] transition-colors shadow-sm"
          >
            <Filter size={20} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-white text-[#A51C30] px-2 py-0.5 rounded-full text-sm font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchQuery && (
              <div className="bg-[#A51C30]/10 text-[#A51C30] px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-[#A51C30]/20">
                <span className="font-medium">Search: {searchQuery}</span>
                <button onClick={() => clearFilter("search")} className="hover:bg-[#A51C30]/20 rounded-full p-0.5 transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedCountry && (
              <div className="bg-[#A51C30]/10 text-[#A51C30] px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-[#A51C30]/20">
                <span className="font-medium">{selectedCountry}</span>
                <button onClick={() => clearFilter("country")} className="hover:bg-[#A51C30]/20 rounded-full p-0.5 transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedStudyLevel && (
              <div className="bg-[#A51C30]/10 text-[#A51C30] px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-[#A51C30]/20">
                <span className="font-medium">{selectedStudyLevel}</span>
                <button onClick={() => clearFilter("studyLevel")} className="hover:bg-[#A51C30]/20 rounded-full p-0.5 transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedUniversity && (
              <div className="bg-[#A51C30]/10 text-[#A51C30] px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-[#A51C30]/20">
                <span className="font-medium">{selectedUniversity}</span>
                <button onClick={() => clearFilter("university")} className="hover:bg-[#A51C30]/20 rounded-full p-0.5 transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedIntake && (
              <div className="bg-[#A51C30]/10 text-[#A51C30] px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-[#A51C30]/20">
                <span className="font-medium">{intakeOptions.find(opt => opt.value === selectedIntake)?.label}</span>
                <button onClick={() => clearFilter("intake")} className="hover:bg-[#A51C30]/20 rounded-full p-0.5 transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}

            {(programNameInput || selectedProgramName) && (
              <div className="bg-[#A51C30]/10 text-[#A51C30] px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-[#A51C30]/20">
                <span className="font-medium">Program: {displayProgramValue}</span>
                <button onClick={() => clearFilter("programName")} className="hover:bg-[#A51C30]/20 rounded-full p-0.5 transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}

            <button onClick={resetFilters} className="text-sm text-[#A51C30] hover:text-[#8A1828] font-medium px-2 transition-colors">
              Clear All
            </button>
          </div>
        )}
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200 animate-fadeIn">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Filter size={20} className="text-[#A51C30]" />
            Refine Your Search
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Globe size={16} className="text-[#A51C30]" />
                Country
              </label>
              <div className="relative">
                <select
                  className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#A51C30]"
                  value={selectedCountry}
                  onChange={(e) =>
                    handleFilterChange(setSelectedCountry, e.target.value, [
                      () => setSelectedUniversity(""),
                    ])
                  }
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <GraduationCap size={16} className="text-[#A51C30]" />
                Study Level
              </label>
              <div className="relative">
                <select
                  className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#A51C30]"
                  value={selectedStudyLevel}
                  onChange={(e) => handleFilterChange(setSelectedStudyLevel, e.target.value, [
                    () => setSelectedUniversity(""),
                    () => setSelectedProgramName(""),
                    () => setProgramNameInput("")
                  ])}
                >
                  <option value="">All Study Levels</option>
                  {studyLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <GraduationCap size={16} className="text-[#A51C30]" />
                University
              </label>
              <div className="relative">
                <select
                  className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#A51C30]"
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                >
                  <option value="">All Universities</option>
                  {uniqueUniversities.map((uni) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
              </div>
            </div>

            {/* ✅ FIXED: Intake filter now matches actual data structure */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="text-[#A51C30]" />
                Intake
              </label>
              <div className="relative">
                <select
                  className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#A51C30]"
                  value={selectedIntake}
                  onChange={(e) => setSelectedIntake(e.target.value)}
                >
                  <option value="">All Intakes</option>
                  {intakeOptions.map((intake) => (
                    <option key={intake.value} value={intake.value}>
                      {intake.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
              </div>
            </div>

            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <BookOpen size={16} className="text-[#A51C30]" />
                Program Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type or select..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#A51C30]"
                  value={displayProgramValue}
                  onChange={(e) => {
                    setProgramNameInput(e.target.value)
                    setSelectedProgramName("")
                    setShowProgramDropdown(true)
                  }}
                  onFocus={() => setShowProgramDropdown(true)}
                  onBlur={() => setTimeout(() => setShowProgramDropdown(false), 200)}
                />
                <button
                  onClick={() => setShowProgramDropdown(!showProgramDropdown)}
                  className="absolute right-2 top-3 cursor-pointer"
                >
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {showProgramDropdown && uniqueProgramNames.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {uniqueProgramNames.map((program) => (
                      <div
                        key={program}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setSelectedProgramName(program)
                          setProgramNameInput("")
                          setShowProgramDropdown(false)
                        }}
                      >
                        {program}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default FilterComponent