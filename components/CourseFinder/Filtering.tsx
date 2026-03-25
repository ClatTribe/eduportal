import React, { useState, useEffect, useRef, useCallback } from "react"
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
import { FilterValues } from "./types"
import { supabase } from "../../lib/supabase"

interface FilterProps {
  viewMode: "all" | "recommended"
  onFilterValuesChange: (filters: FilterValues) => void
}

const countries = ['Australia', 'Canada', 'China', 'Denmark', 'Finland', 'France', 'Georgia', 'Hungary', 'Indonesia', 'Ireland', 'Italy', 'Japan', 'Kazakhstan', 'Lithuania', 'Luxembourg', 'Malaysia', 'Monaco', 'Netherlands', 'New Zealand', 'Poland', 'Russia', 'Singapore', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'United Arab Emirates', 'United Kingdom', 'United States of America', 'Vietnam'];

const studyLevels = [
  'Undergraduate',
  'Postgraduate',
  'PhD',
  'UG Diploma /Certificate /Associate Degree',
  'PG Diploma /Certificate'
]

const intakeOptions = [
  { value: 'Spring', label: 'Spring (Jan/Feb/Mar/Apr)' },
  { value: 'Summer', label: 'Summer (May/Jun/Jul)' },
  { value: 'Fall', label: 'Fall (Aug/Sep/Oct)' },
  { value: 'Winter', label: 'Winter (Nov/Dec)' }
]

// Smart search: map common abbreviations/keywords to filter values
const countryAliases: Record<string, string> = {
  'usa': 'United States of America',
  'us': 'United States of America',
  'america': 'United States of America',
  'united states': 'United States of America',
  'uk': 'United Kingdom',
  'britain': 'United Kingdom',
  'england': 'United Kingdom',
  'canada': 'Canada',
  'australia': 'Australia',
  'aus': 'Australia',
  'new zealand': 'New Zealand',
  'nz': 'New Zealand',
  'ireland': 'Ireland',
  'france': 'France',
  'germany': 'Germany',
  'italy': 'Italy',
  'spain': 'Spain',
  'netherlands': 'Netherlands',
  'holland': 'Netherlands',
  'switzerland': 'Switzerland',
  'sweden': 'Sweden',
  'denmark': 'Denmark',
  'finland': 'Finland',
  'japan': 'Japan',
  'south korea': 'South Korea',
  'korea': 'South Korea',
  'singapore': 'Singapore',
  'malaysia': 'Malaysia',
  'china': 'China',
  'russia': 'Russia',
  'poland': 'Poland',
  'hungary': 'Hungary',
  'indonesia': 'Indonesia',
  'vietnam': 'Vietnam',
  'uae': 'United Arab Emirates',
  'dubai': 'United Arab Emirates',
  'sri lanka': 'Sri Lanka',
  'luxembourg': 'Luxembourg',
  'lithuania': 'Lithuania',
  'georgia': 'Georgia',
  'kazakhstan': 'Kazakhstan',
  'monaco': 'Monaco',
}

const studyLevelAliases: Record<string, { level: string; programKeyword?: string }> = {
  'ug': { level: 'Undergraduate' },
  'undergraduate': { level: 'Undergraduate' },
  'bachelors': { level: 'Undergraduate' },
  'bachelor': { level: 'Undergraduate' },
  'btech': { level: 'Undergraduate', programKeyword: 'BTech' },
  'b.tech': { level: 'Undergraduate', programKeyword: 'BTech' },
  'bba': { level: 'Undergraduate', programKeyword: 'BBA' },
  'b.b.a': { level: 'Undergraduate', programKeyword: 'BBA' },
  'bsc': { level: 'Undergraduate', programKeyword: 'BSc' },
  'b.sc': { level: 'Undergraduate', programKeyword: 'BSc' },
  'bcom': { level: 'Undergraduate', programKeyword: 'BCom' },
  'b.com': { level: 'Undergraduate', programKeyword: 'BCom' },
  'ba': { level: 'Undergraduate', programKeyword: 'BA' },
  'b.a': { level: 'Undergraduate', programKeyword: 'BA' },
  'beng': { level: 'Undergraduate', programKeyword: 'BEng' },
  'b.eng': { level: 'Undergraduate', programKeyword: 'BEng' },
  'pg': { level: 'Postgraduate' },
  'postgraduate': { level: 'Postgraduate' },
  'masters': { level: 'Postgraduate' },
  'master': { level: 'Postgraduate' },
  'mba': { level: 'Postgraduate', programKeyword: 'MBA' },
  'm.b.a': { level: 'Postgraduate', programKeyword: 'MBA' },
  'mtech': { level: 'Postgraduate', programKeyword: 'MTech' },
  'm.tech': { level: 'Postgraduate', programKeyword: 'MTech' },
  'msc': { level: 'Postgraduate', programKeyword: 'MSc' },
  'm.sc': { level: 'Postgraduate', programKeyword: 'MSc' },
  'mcom': { level: 'Postgraduate', programKeyword: 'MCom' },
  'm.com': { level: 'Postgraduate', programKeyword: 'MCom' },
  'ma': { level: 'Postgraduate', programKeyword: 'MA' },
  'm.a': { level: 'Postgraduate', programKeyword: 'MA' },
  'ms': { level: 'Postgraduate', programKeyword: 'MS' },
  'm.s': { level: 'Postgraduate', programKeyword: 'MS' },
  'meng': { level: 'Postgraduate', programKeyword: 'MEng' },
  'm.eng': { level: 'Postgraduate', programKeyword: 'MEng' },
  'mca': { level: 'Postgraduate', programKeyword: 'MCA' },
  'llm': { level: 'Postgraduate', programKeyword: 'LLM' },
  'phd': { level: 'PhD' },
  'ph.d': { level: 'PhD' },
  'doctorate': { level: 'PhD' },
  'doctoral': { level: 'PhD' },
  'diploma': { level: 'UG Diploma /Certificate /Associate Degree' },
  'certificate': { level: 'UG Diploma /Certificate /Associate Degree' },
  'pg diploma': { level: 'PG Diploma /Certificate' },
  'pg certificate': { level: 'PG Diploma /Certificate' },
}

const parseSmartSearch = (query: string): { country: string; studyLevel: string; programKeyword: string; remainingSearch: string } => {
  let remaining = query.trim()
  let detectedCountry = ''
  let detectedStudyLevel = ''
  let detectedProgramKeyword = ''

  // Normalize for matching
  const lower = remaining.toLowerCase()

  // Detect study level (check multi-word aliases first, then single-word)
  const sortedStudyAliases = Object.keys(studyLevelAliases).sort((a, b) => b.length - a.length)
  for (const alias of sortedStudyAliases) {
    const regex = new RegExp('\\b' + alias.replace(/\./g, '\\\\.') + '\\b', 'i')
    if (regex.test(remaining)) {
      const match = studyLevelAliases[alias]
      detectedStudyLevel = match.level
      if (match.programKeyword) {
        detectedProgramKeyword = match.programKeyword
      }
      remaining = remaining.replace(regex, ' ')
      break
    }
  }

  // Detect country (check multi-word aliases first, then single-word)
  const sortedCountryAliases = Object.keys(countryAliases).sort((a, b) => b.length - a.length)
  for (const alias of sortedCountryAliases) {
    const regex = new RegExp('\\b' + alias.replace(/\./g, '\\\\.') + '\\b', 'i')
    if (regex.test(remaining)) {
      detectedCountry = countryAliases[alias]
      remaining = remaining.replace(regex, ' ')
      break
    }
  }

  // Clean up: remove filler words and extra spaces
  remaining = remaining
    .replace(/\b(in|at|for|from|the|of|colleges?|universities?|university|courses?|programs?|schools?|institutes?)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return { country: detectedCountry, studyLevel: detectedStudyLevel, programKeyword: detectedProgramKeyword, remainingSearch: remaining }
}

const FilterComponent: React.FC<FilterProps> = ({ viewMode, onFilterValuesChange }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedStudyLevel, setSelectedStudyLevel] = useState("")
  const [selectedUniversity, setSelectedUniversity] = useState("")
  const [selectedIntake, setSelectedIntake] = useState("")
  const [programNameInput, setProgramNameInput] = useState("")
  const [selectedProgramName, setSelectedProgramName] = useState("")
  const [showProgramDropdown, setShowProgramDropdown] = useState(false)

  const [universityOptions, setUniversityOptions] = useState<string[]>([])
  const [programOptions, setProgramOptions] = useState<string[]>([])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Use refs for text inputs so dropdown useEffect always reads latest values
  // without needing them in the dependency array (they have their own debounced effect)
  const searchQueryRef = useRef(searchQuery)
  searchQueryRef.current = searchQuery
  const programNameInputRef = useRef(programNameInput)
  programNameInputRef.current = programNameInput

  // Immediate filter update when any dropdown changes
  useEffect(() => {
    if (viewMode === "all") {
      onFilterValuesChange({
        search: searchQueryRef.current,
        country: selectedCountry,
        studyLevel: selectedStudyLevel,
        university: selectedUniversity,
        intake: selectedIntake,
        programName: selectedProgramName || programNameInputRef.current,
      })
    }
  }, [selectedCountry, selectedStudyLevel, selectedUniversity, selectedIntake, selectedProgramName, viewMode])

  // Debounced filter update for text inputs (search bar + program name typing)
  useEffect(() => {
    if (viewMode !== "all") return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onFilterValuesChange({
        search: searchQuery,
        country: selectedCountry,
        studyLevel: selectedStudyLevel,
        university: selectedUniversity,
        intake: selectedIntake,
        programName: selectedProgramName || programNameInput,
      })
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery, programNameInput])



  useEffect(() => {
    if (!showFilters) return
    const fetchUniversities = async () => {
      try {
        let query = supabase
          .from('courses')
          .select('University')
          .not('University', 'is', null)
        if (selectedCountry) query = query.eq('Country', selectedCountry)
        if (selectedStudyLevel) query = query.eq('Study Level', selectedStudyLevel)
        query = query.limit(10000)
        const { data } = await query
        if (data) {
          const unique = [...new Set(
            data.map((d: { University: string | null }) => d.University).filter(Boolean)
          )] as string[]
          setUniversityOptions(unique.sort())
        }
      } catch (err) {
        console.error('Error fetching university options:', err)
      }
    }
    fetchUniversities()
  }, [showFilters, selectedCountry, selectedStudyLevel])

  useEffect(() => {
    if (!showFilters) return
    const fetchPrograms = async () => {
      try {
        let query = supabase
          .from('courses')
          .select('Program Name')
          .not('Program Name', 'is', null)
        if (selectedCountry) query = query.eq('Country', selectedCountry)
        if (selectedStudyLevel) query = query.eq('Study Level', selectedStudyLevel)
        if (selectedUniversity) query = query.eq('University', selectedUniversity)
        if (programNameInput) query = query.ilike('Program Name', `%${programNameInput}%`)
        query = query.limit(5000)
        const { data } = await query
        if (data) {
          const unique = [...new Set(
            (data as unknown as Record<string, string | null>[]).map((d) => d['Program Name']).filter(Boolean)
          )] as string[]
          setProgramOptions(unique.sort())
        }
      } catch (err) {
        console.error('Error fetching program options:', err)
      }
    }
    fetchPrograms()
  }, [showFilters, selectedCountry, selectedStudyLevel, selectedUniversity, programNameInput])

  // Smart search: triggered when user presses Enter in search bar
  const handleSmartSearch = () => {
    if (!searchQuery || searchQuery.length < 2) return

    const { country, studyLevel, programKeyword, remainingSearch } = parseSmartSearch(searchQuery)

    if (country || studyLevel) {
      if (country) {
        setSelectedCountry(country)
        setSelectedUniversity("")
      }
      if (studyLevel) {
        setSelectedStudyLevel(studyLevel)
        setSelectedUniversity("")
        setSelectedProgramName("")
        setProgramNameInput("")
      }
      if (programKeyword) {
        setProgramNameInput(programKeyword)
      }
      setSearchQuery(remainingSearch)
      // Open filters panel to show applied filters
      setShowFilters(true)
    }
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
    onFilterValuesChange({
      search: '', country: '', studyLevel: '', university: '', intake: '', programName: '',
    })
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
              placeholder='Try "MBA colleges in USA", "BBA in UK", "MSc in Canada"...'
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A51C30]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSmartSearch(); } }}
            />
            <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 cursor-pointer hover:text-[#A51C30] transition-colors" onClick={handleSmartSearch} />
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
                  {universityOptions.map((uni) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
              </div>
            </div>

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

                {showProgramDropdown && programOptions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {programOptions.map((program) => (
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