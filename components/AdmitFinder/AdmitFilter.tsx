import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Filter,
  X,
  Calendar,
  Briefcase,
  BookOpen,
  GraduationCap,
} from "lucide-react";

interface AdmitFinderData {
  id: number;
  intake: string | null;
  years: string | null;
  "University Name": string | null;
  "Course": string | null;
  "Undergrad Institute & Branch": string | null;
  "Undergraduate Major": string | null;
  "GPA": string | null;
  "GRE": string | null;
  "IELTS/TOEFL": string | null;
  "Papers": string | null;
  "Work Exp": string | null;
}

interface FilterProps {
  data: AdmitFinderData[];
  onFilterChange: (filtered: AdmitFinderData[]) => void;
}

const AdmitFilter: React.FC<FilterProps> = ({ data, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIntake, setSelectedIntake] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedWorkExp, setSelectedWorkExp] = useState("");

  // Extract unique values and filter out nulls with proper trimming
  const intakes = Array.from(
    new Set(
      data
        .map((d) => d.intake)
        .filter((v): v is string => v !== null && v.trim() !== "")
        .map(v => v.trim()) // Trim to remove extra spaces
    )
  ).sort();

  // Sort years in descending order (2025, 2024, 2023, 2022)
  const years = Array.from(
    new Set(
      data
        .map((d) => d.years)
        .filter((v): v is string => v !== null && v.trim() !== "")
        .map(v => v.trim())
    )
  ).sort((a, b) => {
    // Parse years and sort in descending order
    const yearA = parseInt(a);
    const yearB = parseInt(b);
    return yearB - yearA; // Descending order
  });

  const courses = Array.from(
    new Set(
      data
        .map((d) => d["Course"])
        .filter((v): v is string => v !== null && v.trim() !== "")
        .map(v => v.trim())
    )
  ).sort();
  
  // Work experience ranges
  const workExpRanges = [
    { label: "No Experience (0 months)", value: "0" },
    { label: "0-6 months", value: "0-6" },
    { label: "6-12 months", value: "6-12" },
    { label: "1-2 years", value: "12-24" },
    { label: "2-3 years", value: "24-36" },
    { label: "3-5 years", value: "36-60" },
    { label: "5+ years", value: "60+" },
  ];

  // Helper function to extract months from work_exp
  const extractMonths = (workExp: string | null): number | null => {
    if (!workExp) return null;
    
    const monthMatch = workExp.match(/(\d+)\s*mon/i);
    if (monthMatch) {
      return parseInt(monthMatch[1], 10);
    }
    
    // Also check for "months" format
    const monthsMatch = workExp.match(/(\d+)\s*months?/i);
    if (monthsMatch) {
      return parseInt(monthsMatch[1], 10);
    }
    
    // Check for just numbers
    const numMatch = workExp.match(/^(\d+)$/);
    if (numMatch) {
      return parseInt(numMatch[1], 10);
    }
    
    return null;
  };

  // Helper function to check if work experience matches range
  const matchesWorkExpRange = (admit: AdmitFinderData, rangeValue: string): boolean => {
    const months = extractMonths(admit["Work Exp"]);
    
    if (rangeValue === "0") {
      return months === 0 || months === null || admit["Work Exp"] === "NA";
    }
    
    if (rangeValue === "60+") {
      return months !== null && months >= 60;
    }
    
    const [min, max] = rangeValue.split("-").map(Number);
    return months !== null && months >= min && months <= max;
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedIntake, selectedYear, selectedCourse, selectedWorkExp, data]);

  const applyFilters = () => {
    let filtered = [...data];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (admit) =>
          admit["University Name"]?.toLowerCase().includes(query) ||
          admit["Course"]?.toLowerCase().includes(query) ||
          admit["Undergrad Institute & Branch"]?.toLowerCase().includes(query) ||
          admit["Undergraduate Major"]?.toLowerCase().includes(query)
      );
    }

    if (selectedIntake) {
      filtered = filtered.filter((admit) => admit.intake?.trim() === selectedIntake);
    }

    if (selectedYear) {
      filtered = filtered.filter((admit) => admit.years?.trim() === selectedYear);
    }

    if (selectedCourse) {
      filtered = filtered.filter((admit) => admit["Course"]?.trim() === selectedCourse);
    }

    if (selectedWorkExp) {
      filtered = filtered.filter((admit) => matchesWorkExpRange(admit, selectedWorkExp));
    }

    onFilterChange(filtered);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedIntake("");
    setSelectedYear("");
    setSelectedCourse("");
    setSelectedWorkExp("");
  };

  const clearFilter = (filterName: string) => {
    switch (filterName) {
      case "intake":
        setSelectedIntake("");
        break;
      case "year":
        setSelectedYear("");
        break;
      case "course":
        setSelectedCourse("");
        break;
      case "workExp":
        setSelectedWorkExp("");
        break;
      case "search":
        setSearchQuery("");
        break;
    }
  };

  const activeFiltersCount = [
    searchQuery,
    selectedIntake,
    selectedYear,
    selectedCourse,
    selectedWorkExp,
  ].filter(Boolean).length;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-rose-100">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by university, course, or institute..."
              className="w-full px-4 py-2 sm:py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A51C30] text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#A51C30] text-white rounded-lg font-medium hover:bg-[#8A1828] transition-colors shadow-sm text-sm sm:text-base"
          >
            <Filter size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filter</span>
            {activeFiltersCount > 0 && (
              <span className="bg-white text-[#A51C30] px-2 py-0.5 rounded-full text-xs sm:text-sm font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchQuery && (
              <div className="bg-[#A51C30]/10 text-[#A51C30] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2 border border-[#A51C30]/20">
                <span className="font-medium truncate max-w-[150px]">Search: {searchQuery}</span>
                <button
                  onClick={() => clearFilter("search")}
                  className="hover:bg-[#A51C30]/20 rounded-full p-0.5 transition-colors flex-shrink-0"
                >
                  <X size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            )}

            {selectedIntake && (
              <div className="bg-[#A51C30]/10 text-[#A51C30] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2 border border-[#A51C30]/20">
                <span className="font-medium">{selectedIntake}</span>
                <button
                  onClick={() => clearFilter("intake")}
                  className="hover:bg-[#A51C30]/20 rounded-full p-0.5 transition-colors flex-shrink-0"
                >
                  <X size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            )}

            {selectedYear && (
              <div className="bg-[#A51C30]/10 text-[#A51C30] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2 border border-[#A51C30]/20">
                <span className="font-medium">{selectedYear}</span>
                <button
                  onClick={() => clearFilter("year")}
                  className="hover:bg-[#A51C30]/20 rounded-full p-0.5 transition-colors flex-shrink-0"
                >
                  <X size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            )}

            {selectedCourse && (
              <div className="bg-[#A51C30]/10 text-[#A51C30] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2 border border-[#A51C30]/20">
                <span className="font-medium truncate max-w-[150px]">{selectedCourse}</span>
                <button
                  onClick={() => clearFilter("course")}
                  className="hover:bg-[#A51C30]/20 rounded-full p-0.5 transition-colors flex-shrink-0"
                >
                  <X size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            )}

            {selectedWorkExp && (
              <div className="bg-[#A51C30]/10 text-[#A51C30] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2 border border-[#A51C30]/20">
                <span className="font-medium truncate max-w-[150px]">
                  {workExpRanges.find((r) => r.value === selectedWorkExp)?.label}
                </span>
                <button
                  onClick={() => clearFilter("workExp")}
                  className="hover:bg-[#A51C30]/20 rounded-full p-0.5 transition-colors flex-shrink-0"
                >
                  <X size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={resetFilters}
              className="text-xs sm:text-sm text-[#A51C30] hover:text-[#8A1828] font-medium px-2 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-rose-100 animate-fadeIn">
          <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2">
            <Filter size={18} className="sm:w-5 sm:h-5 text-[#A51C30]" />
            Refine Your Search
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <Calendar size={14} className="sm:w-4 sm:h-4 text-[#A51C30]" />
                Intake
              </label>
              <div className="relative">
                <select
                  className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#A51C30] text-sm sm:text-base"
                  value={selectedIntake}
                  onChange={(e) => setSelectedIntake(e.target.value)}
                >
                  <option value="">All Intakes</option>
                  {intakes.map((intake) => (
                    <option key={intake} value={intake}>
                      {intake}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 pointer-events-none text-gray-500" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <Calendar size={14} className="sm:w-4 sm:h-4 text-[#A51C30]" />
                Year
              </label>
              <div className="relative">
                <select
                  className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#A51C30] text-sm sm:text-base"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 pointer-events-none text-gray-500" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <BookOpen size={14} className="sm:w-4 sm:h-4 text-[#A51C30]" />
                Course
              </label>
              <div className="relative">
                <select
                  className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#A51C30] text-sm sm:text-base"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 pointer-events-none text-gray-500" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <Briefcase size={14} className="sm:w-4 sm:h-4 text-[#A51C30]" />
                Work Experience
              </label>
              <div className="relative">
                <select
                  className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#A51C30] text-sm sm:text-base"
                  value={selectedWorkExp}
                  onChange={(e) => setSelectedWorkExp(e.target.value)}
                >
                  <option value="">All Experience</option>
                  {workExpRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 pointer-events-none text-gray-500" />
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
  );
};

export default AdmitFilter;