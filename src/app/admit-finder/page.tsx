"use client";
import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, AlertCircle, BookOpen, TrendingUp, Award, Briefcase, MapPin, Calendar } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import DefaultLayout from '../defaultLayout';
import AdmitFilter from '../../../components/AdmitFinder/AdmitFilter';

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
  created_at?: string;
  updated_at?: string;
}

const accentColor = '#A51C30';
const primaryBg = '#FFFFFF';
const borderColor = '#FECDD3';

const AdmitFinder: React.FC = () => {
  const [admitData, setAdmitData] = useState<AdmitFinderData[]>([]);
  const [filteredData, setFilteredData] = useState<AdmitFinderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchAdmitData();
  }, []);

  const fetchAdmitData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data - note: we'll sort by years and intake after fetching
      const { data, error: supabaseError } = await supabase
        .from('admit_finder')
        .select('*');

      if (supabaseError) throw supabaseError;

      // Filter valid data (non-null University Name and Course)
      let validData = (data || []).filter(
        (item) => 
          item["University Name"] !== null && 
          item["University Name"]?.trim() !== "" &&
          item["Course"] !== null && 
          item["Course"]?.trim() !== ""
      );

      // Sort data by year (descending - 2025 first) and then by id (descending)
      validData.sort((a, b) => {
        // First sort by year (newest first)
        const yearA = Number(a.years?.trim() || "0");
        const yearB = Number(b.years?.trim() || "0");
        
        if (yearB !== yearA) {
          return yearB - yearA; // 2025 before 2024 before 2023 etc.
        }
        
        // If years are same, sort by id (descending - newest entries first)
        return b.id - a.id;
      });

      console.log('Total records from database:', data?.length || 0);
      console.log('Valid records after filtering:', validData.length);
      console.log('Sample data:', validData[0]);
      console.log('Year distribution:', 
        validData.reduce((acc, item) => {
          const year = item.years || 'Unknown';
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      );

      setAdmitData(validData);
      setFilteredData(validData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admit data');
      console.error('Error fetching admit data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filtered: AdmitFinderData[]) => {
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const parseTestScore = (score: string | null): string => {
    if (!score) return 'N/A';
    return score;
  };

  const formatWorkExp = (workExp: string | null): string => {
    if (!workExp || workExp === 'NA') return 'No Experience';
    
    // Handle "months" format
    const monthsMatch = workExp.match(/(\d+)\s*months?/i);
    if (monthsMatch) {
      const months = parseInt(monthsMatch[1], 10);
      if (months === 0) return 'No Experience';
      if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
      return `${years}y ${remainingMonths}m`;
    }
    
    // Handle "mon" format
    const monthMatch = workExp.match(/(\d+)\s*mon/i);
    if (monthMatch) {
      const months = parseInt(monthMatch[1], 10);
      if (months === 0) return 'No Experience';
      if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
      return `${years}y ${remainingMonths}m`;
    }
    
    // Handle just numbers (assume months)
    const numMatch = workExp.match(/^(\d+)$/);
    if (numMatch) {
      const months = parseInt(numMatch[1], 10);
      if (months === 0) return 'No Experience';
      if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
      return `${years}y ${remainingMonths}m`;
    }
    
    return workExp;
  };

  return (
    <DefaultLayout>
      <div className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-[72px] sm:mt-0" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2" style={{ color: accentColor }}>
              Access 1000+ Admit Profiles!
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Explore real admission profiles from students who got into top universities
            </p>
          </div>

          {/* Filter Component - Pass only valid data */}
          <AdmitFilter data={admitData} onFilterChange={handleFilterChange} />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3">
              <AlertCircle className="text-[#A51C30] flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-[#A51C30] text-sm sm:text-base">Error</h3>
                <p className="text-red-700 text-xs sm:text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 rounded-lg shadow-sm p-3 sm:p-4" style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }}>
            <div className="flex items-center gap-2">
              <Users className="flex-shrink-0" style={{ color: accentColor }} size={20} />
              <span className="font-semibold text-sm sm:text-base text-gray-900">
                {filteredData.length.toLocaleString()} profile{filteredData.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2" style={{ borderColor: accentColor }}></div>
                <p className="text-sm sm:text-base text-gray-600">Loading admit profiles...</p>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 sm:py-16 rounded-lg shadow-sm" style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }}>
              <GraduationCap size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No profiles found
              </h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                Try adjusting your search filters
              </p>
            </div>
          ) : (
            <>
              {/* Admit Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {currentData.map((admit) => (
                  <div
                    key={admit.id}
                    className="rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow bg-white"
                    style={{ border: `1px solid ${borderColor}` }}
                  >
                    {/* University & Course Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg sm:text-xl text-gray-900 break-words leading-tight mb-1">
                            {admit["University Name"] || 'University Not Available'}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-700 font-medium break-words">
                            {admit["Course"] || 'Course Not Available'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-2">
                        <Calendar size={14} />
                        <span className="font-medium">
                          {admit.intake || 'N/A'} {admit.years || 'Year N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Academic Background */}
                    {admit["Undergrad Institute & Branch"] && admit["Undergrad Institute & Branch"] !== "NA" && (
                      <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(165, 28, 48, 0.05)' }}>
                        <div className="flex items-center gap-1 mb-1.5">
                          <GraduationCap size={14} style={{ color: accentColor }} />
                          <span className="text-xs font-medium text-gray-600">Undergraduate</span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium break-words">
                          {admit["Undergrad Institute & Branch"]}
                        </p>
                        {admit["Undergraduate Major"] && (
                          <p className="text-xs text-gray-600 mt-1">Major: {admit["Undergraduate Major"]}</p>
                        )}
                      </div>
                    )}

                    {/* Test Scores & Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* GPA */}
                      {admit["GPA"] && admit["GPA"] !== "NA" && (
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(165, 28, 48, 0.05)' }}>
                          <div className="flex items-center gap-1 mb-1">
                            <TrendingUp size={14} style={{ color: accentColor }} />
                            <span className="text-xs font-medium text-gray-600">GPA</span>
                          </div>
                          <p className="font-bold text-sm sm:text-base" style={{ color: accentColor }}>
                            {parseTestScore(admit["GPA"])}
                          </p>
                        </div>
                      )}

                      {/* GRE */}
                      {admit["GRE"] && admit["GRE"] !== "NA" && (
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(165, 28, 48, 0.05)' }}>
                          <div className="flex items-center gap-1 mb-1">
                            <BookOpen size={14} style={{ color: accentColor }} />
                            <span className="text-xs font-medium text-gray-600">GRE</span>
                          </div>
                          <p className="font-bold text-sm sm:text-base" style={{ color: accentColor }}>
                            {parseTestScore(admit["GRE"])}
                          </p>
                        </div>
                      )}

                      {/* IELTS/TOEFL */}
                      {admit["IELTS/TOEFL"] && admit["IELTS/TOEFL"] !== "NA" && (
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(165, 28, 48, 0.05)' }}>
                          <div className="flex items-center gap-1 mb-1">
                            <Award size={14} style={{ color: accentColor }} />
                            <span className="text-xs font-medium text-gray-600">English Test</span>
                          </div>
                          <p className="font-bold text-sm" style={{ color: accentColor }}>
                            {parseTestScore(admit["IELTS/TOEFL"])}
                          </p>
                        </div>
                      )}

                      {/* Work Experience */}
                      {admit["Work Exp"] && admit["Work Exp"] !== "NA" && (
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(165, 28, 48, 0.05)' }}>
                          <div className="flex items-center gap-1 mb-1">
                            <Briefcase size={14} style={{ color: accentColor }} />
                            <span className="text-xs font-medium text-gray-600">Work Exp</span>
                          </div>
                          <p className="font-bold text-sm" style={{ color: accentColor }}>
                            {formatWorkExp(admit["Work Exp"])}
                          </p>
                        </div>
                      )}

                      {/* Research Papers */}
                      {admit["Papers"] && admit["Papers"] !== 'NA' && (
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(165, 28, 48, 0.05)' }}>
                          <div className="flex items-center gap-1 mb-1">
                            <BookOpen size={14} style={{ color: accentColor }} />
                            <span className="text-xs font-medium text-gray-600">Papers</span>
                          </div>
                          <p className="font-bold text-sm sm:text-base" style={{ color: accentColor }}>
                            {admit["Papers"]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8 flex-wrap">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: currentPage === 1 ? '#f3f4f6' : accentColor,
                      color: currentPage === 1 ? '#9ca3af' : 'white',
                    }}
                  >
                    Previous
                  </button>

                  <div className="flex gap-1 sm:gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-colors text-sm sm:text-base"
                          style={{
                            backgroundColor: currentPage === pageNum ? accentColor : 'white',
                            color: currentPage === pageNum ? 'white' : '#6b7280',
                            border: `1px solid ${currentPage === pageNum ? accentColor : borderColor}`,
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: currentPage === totalPages ? '#f3f4f6' : accentColor,
                      color: currentPage === totalPages ? '#9ca3af' : 'white',
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdmitFinder;