"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
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
  Globe,
  GraduationCap,
} from "lucide-react";
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import DefaultLayout from '../defaultLayout';

interface Scholarship {
  id: number;
  country_region: string;
  scholarship_name: string;
  provider: string;
  degree_level: string;
  deadline: string;
  detailed_eligibility: string;
  link: string;
  created_at?: string;
  matchScore?: number;
}

interface UserProfile {
  target_countries: string[];
  degree: string;
  program: string;
}

const ScholarshipFinder: React.FC = () => {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedScholarships, setSavedScholarships] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [viewMode, setViewMode] = useState<'all' | 'recommended'>('all');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const degreeLevels = [
    "Undergraduate",
    "Graduate", 
    "Master",
    "Postgraduate",
    "PhD",
    "Postdoc"
  ];

  useEffect(() => {
    fetchUserProfile();
    if (user) {
      loadSavedScholarships();
    }
  }, [user]);

  useEffect(() => {
    if (!loadingProfile) {
      if (viewMode === 'all') {
        fetchScholarships();
      } else {
        fetchRecommendedScholarships();
      }
    }
  }, [loadingProfile, viewMode]);

  useEffect(() => {
    if (viewMode === 'all') {
      applyFilters();
    }
  }, [searchQuery, selectedCountry, selectedLevel, scholarships, viewMode]);

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      
      if (!user) {
        setUserProfile(null);
        setLoadingProfile(false);
        return;
      }

      const { data, error: profileError } = await supabase
        .from('admit_profiles')
        .select('target_countries, degree, program')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        setUserProfile(null);
      } else if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadSavedScholarships = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('shortlist_builder')
        .select('scholarship_id')
        .eq('user_id', user.id)
        .eq('item_type', 'scholarship');

      if (error) {
        console.error('Error loading saved scholarships:', error);
        return;
      }

      if (data) {
        const scholarshipIds = new Set(data.map(item => item.scholarship_id).filter(Boolean));
        setSavedScholarships(scholarshipIds);
      }
    } catch (error) {
      console.error('Error loading saved scholarships:', error);
    }
  };

  const toggleSaveScholarship = async (scholarshipId: number) => {
    if (!user) {
      alert("Please login to save scholarships");
      return;
    }

    try {
      const isSaved = savedScholarships.has(scholarshipId);

      if (isSaved) {
        const { error } = await supabase
          .from('shortlist_builder')
          .delete()
          .eq('user_id', user.id)
          .eq('scholarship_id', scholarshipId)
          .eq('item_type', 'scholarship');

        if (error) throw error;

        setSavedScholarships(prev => {
          const newSet = new Set(prev);
          newSet.delete(scholarshipId);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from('shortlist_builder')
          .insert({
            user_id: user.id,
            item_type: 'scholarship',
            scholarship_id: scholarshipId,
            status: 'interested'
          });

        if (error) throw error;

        setSavedScholarships(prev => new Set([...prev, scholarshipId]));
      }
    } catch (error) {
      console.error('Error toggling saved scholarship:', error);
      alert('Failed to update shortlist. Please try again.');
    }
  };

  const calculateMatchScore = (scholarship: Scholarship): number => {
    if (!userProfile) return 0;

    let score = 0;

    if (userProfile.target_countries && userProfile.target_countries.length > 0) {
      if (userProfile.target_countries.includes(scholarship.country_region || '')) {
        score += 50;
      }
    }

    if (userProfile.degree) {
      const userDegree = userProfile.degree.toLowerCase();
      const scholarshipLevel = (scholarship.degree_level || '').toLowerCase();
      
      if (userDegree === 'bachelors' && (scholarshipLevel.includes('undergraduate') || scholarshipLevel.includes('bachelor'))) {
        score += 30;
      } else if ((userDegree === 'masters' || userDegree === 'master') && (scholarshipLevel.includes('master') || scholarshipLevel.includes('postgraduate') || scholarshipLevel.includes('graduate'))) {
        score += 30;
      } else if (userDegree === 'phd' && scholarshipLevel.includes('phd')) {
        score += 30;
      }
    }

    if (userProfile.program && scholarship.scholarship_name) {
      const userProgram = userProfile.program.toLowerCase();
      const scholarshipName = (scholarship.scholarship_name || '').toLowerCase();
      const eligibility = (scholarship.detailed_eligibility || '').toLowerCase();
      
      const programKeywords = userProgram.split(/[\s,\-/]+/).filter(k => k.length > 2);
      let keywordMatches = 0;
      
      for (const keyword of programKeywords) {
        if (scholarshipName.includes(keyword) || eligibility.includes(keyword)) {
          keywordMatches++;
        }
      }
      
      const matchPercentage = keywordMatches / (programKeywords.length || 1);
      if (matchPercentage >= 0.5) score += 20;
      else if (matchPercentage >= 0.3) score += 15;
      else if (keywordMatches > 0) score += 10;
    }

    return score;
  };

  const fetchRecommendedScholarships = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userProfile) {
        setError('Please complete your profile to see personalized recommendations');
        setFilteredScholarships([]);
        setLoading(false);
        return;
      }

      if (!userProfile.target_countries || userProfile.target_countries.length === 0) {
        setError('Please select at least one target country in your profile');
        setFilteredScholarships([]);
        setLoading(false);
        return;
      }

      if (!userProfile.degree) {
        setError('Please select your target degree in your profile');
        setFilteredScholarships([]);
        setLoading(false);
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from("scholarship")
        .select("*")
        .order("deadline", { ascending: true });

      if (supabaseError) throw supabaseError;

      let filtered = (data || []).filter(scholarship => {
        if (!scholarship.scholarship_name) return false;
        if (!userProfile.target_countries.includes(scholarship.country_region || '')) return false;
        return true;
      });

      const scoredScholarships = filtered.map(scholarship => ({
        ...scholarship,
        matchScore: calculateMatchScore(scholarship)
      }));

      const relevantScholarships = scoredScholarships.filter(s => (s.matchScore || 0) > 10);

      const topRecommendations = relevantScholarships
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 10);

      if (topRecommendations.length < 10) {
        const remaining = scoredScholarships
          .filter(s => !topRecommendations.find(t => t.id === s.id))
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
          .slice(0, 10 - topRecommendations.length);
        
        topRecommendations.push(...remaining);
      }

      setFilteredScholarships(topRecommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommended scholarships');
      console.error('Error fetching recommended scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("scholarship")
        .select("*")
        .order("deadline", { ascending: true });

      if (supabaseError) throw supabaseError;

      const validScholarships = (data || []).filter(s => s.scholarship_name !== null);
      setScholarships(validScholarships);
      setFilteredScholarships(validScholarships);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scholarships');
      console.error("Error fetching scholarships:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...scholarships];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(scholarship =>
        scholarship.scholarship_name?.toLowerCase().includes(query) ||
        scholarship.provider?.toLowerCase().includes(query) ||
        scholarship.country_region?.toLowerCase().includes(query)
      );
    }

    if (selectedCountry) {
      filtered = filtered.filter(s => s.country_region === selectedCountry);
    }

    if (selectedLevel) {
      filtered = filtered.filter(s => s.degree_level?.includes(selectedLevel));
    }

    setFilteredScholarships(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('');
    setSelectedLevel('');
  };

  const clearFilter = (filterName: string) => {
    switch(filterName) {
      case 'country': setSelectedCountry(''); break;
      case 'level': setSelectedLevel(''); break;
      case 'search': setSearchQuery(''); break;
    }
  };

  const getMatchBadge = (scholarship: Scholarship) => {
    if (viewMode !== 'recommended' || !scholarship.matchScore) return null;
    
    const score = scholarship.matchScore;
    
    if (score >= 90) {
      return (
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Trophy size={14} />
          Perfect Match ({score}%)
        </span>
      );
    } else if (score >= 75) {
      return (
        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Award size={14} />
          Excellent Match ({score}%)
        </span>
      );
    } else if (score >= 60) {
      return (
        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
          <Target size={14} />
          Great Match ({score}%)
        </span>
      );
    } else if (score >= 40) {
      return (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
          Good Match ({score}%)
        </span>
      );
    }
    return (
      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
        Relevant ({score}%)
      </span>
    );
  };

  const formatDeadline = (dateString: string) => {
    if (!dateString || dateString === "") return "Check website";
    
    if (dateString.toLowerCase().includes("varies") || 
        dateString.toLowerCase().includes("rolling") ||
        dateString.toLowerCase().includes("typically")) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const getUniqueCountries = () => {
    const countries = scholarships.map((s) => s.country_region);
    return [...new Set(countries)].filter(Boolean).sort();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const activeFiltersCount = [searchQuery, selectedCountry, selectedLevel].filter(Boolean).length;
  const hasProfileData = userProfile && userProfile.target_countries && userProfile.target_countries.length > 0 && userProfile.degree && userProfile.program;
  const canShowRecommendations = hasProfileData && !loadingProfile;

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-red-600 mb-2">
              Find Scholarships to Fuel Your Dreams
            </h1>
            <p className="text-gray-600">
              Discover scholarships from top universities and institutions worldwide
            </p>
          </div>

          <div className="mb-6 flex gap-3">
            <button
              onClick={() => {
                setViewMode('all');
                resetFilters();
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'all'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <Award size={20} />
              All Scholarships
            </button>
            <button
              onClick={() => {
                if (canShowRecommendations) {
                  setViewMode('recommended');
                  resetFilters();
                }
              }}
              disabled={!canShowRecommendations}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'recommended'
                  ? 'bg-red-600 text-white shadow-lg'
                  : canShowRecommendations
                    ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
              title={!hasProfileData ? 'Complete your profile to see recommendations' : ''}
            >
              <Sparkles size={20} />
              Recommended For You
              {!loadingProfile && !hasProfileData && <span className="text-xs ml-1">(Complete profile)</span>}
            </button>
          </div>

          {viewMode === 'recommended' && userProfile && hasProfileData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">Showing your top 10 personalized recommendations</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Based on: <strong>{userProfile.degree}</strong> degree | 
                    Countries: <strong>{userProfile.target_countries.join(', ')}</strong>
                    {userProfile.program && <> | Program: <strong>{userProfile.program}</strong></>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'all' && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search for scholarships by name, provider, or country..."
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                  >
                    <Filter size={20} />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-sm font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {searchQuery && (
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <span className="font-medium">Search: {searchQuery}</span>
                        <button onClick={() => clearFilter('search')} className="hover:bg-red-200 rounded-full p-0.5">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {selectedCountry && (
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <span className="font-medium">{selectedCountry}</span>
                        <button onClick={() => clearFilter('country')} className="hover:bg-red-200 rounded-full p-0.5">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {selectedLevel && (
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <span className="font-medium">{selectedLevel}</span>
                        <button onClick={() => clearFilter('level')} className="hover:bg-red-200 rounded-full p-0.5">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    <button onClick={resetFilters} className="text-sm text-red-600 hover:text-red-700 font-medium px-2">
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {showFilters && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Filter size={20} className="text-red-600" />
                    Refine Your Search
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Globe size={16} className="text-red-600" />
                        Country
                      </label>
                      <div className="relative">
                        <select 
                          className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                          value={selectedCountry}
                          onChange={(e) => setSelectedCountry(e.target.value)}
                        >
                          <option value="">All Countries</option>
                          {getUniqueCountries().map((country) => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <GraduationCap size={16} className="text-red-600" />
                        Degree Level
                      </label>
                      <div className="relative">
                        <select 
                          className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                          value={selectedLevel}
                          onChange={(e) => setSelectedLevel(e.target.value)}
                        >
                          <option value="">All Levels</option>
                          {degreeLevels.map((level) => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-red-800">Notice</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2">
              <Award className="text-red-600" size={24} />
              <span className="font-semibold text-lg">
                {filteredScholarships.length.toLocaleString()} {viewMode === 'recommended' ? 'recommended ' : ''}scholarships found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="text-red-600" size={18} />
              <span className="text-sm text-gray-600">{savedScholarships.size} saved</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p>Loading scholarships...</p>
              </div>
            </div>
          ) : filteredScholarships.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <Award size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {viewMode === 'recommended' ? 'No recommended scholarships found' : 'No scholarships found'}
              </h3>
              <p className="text-gray-500">
                {viewMode === 'recommended' 
                  ? 'Try updating your profile or check back later for more options'
                  : 'Try adjusting your filters or search query'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredScholarships.map((s, index) => {
                const isBlurred = viewMode === 'recommended' && index >= 2;
                
                return (
                  <div
                    key={s.id}
                    className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow relative ${
                      isBlurred ? 'overflow-hidden' : ''
                    }`}
                  >
                    {isBlurred && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 rounded-xl">
                        <div className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-sm border-2 border-red-100">
                          <div className="mb-4 flex justify-center">
                            <div className="bg-red-100 rounded-full p-4">
                              <AlertCircle className="text-red-600" size={32} />
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Unlock More Recommendations
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Talk to our experts to view detailed information about this and {10 - index - 1} more personalized scholarship recommendations
                          </p>
                          <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors w-full flex items-center justify-center gap-2">
                            <Sparkles size={18} />
                            Contact Our Experts
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2">
                          {s.scholarship_name}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                          <MapPin size={14} />
                          <span>{s.country_region}</span>
                        </div>

                        {s.provider && (
                          <p className="text-gray-700 font-medium text-sm mb-2">
                            {s.provider}
                          </p>
                        )}

                        {viewMode === 'recommended' && (
                          <div className="mt-2">
                            {getMatchBadge(s)}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => toggleSaveScholarship(s.id)}
                        disabled={isBlurred}
                        className={`transition-colors ${
                          isBlurred ? 'opacity-50 cursor-not-allowed' :
                          savedScholarships.has(s.id) ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
                        }`}
                        title={isBlurred ? 'Contact experts to unlock' : savedScholarships.has(s.id) ? 'Remove from saved' : 'Save scholarship'}
                      >
                        <Heart
                          size={20}
                          fill={savedScholarships.has(s.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>

                    {s.detailed_eligibility && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {truncateText(s.detailed_eligibility, 180)}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {s.degree_level && (
                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                          {s.degree_level}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-700 mb-4 pt-4 border-t border-gray-100">
                      <Calendar size={16} className="text-red-600" />
                      <span className="text-sm">
                        <strong>Deadline:</strong> {formatDeadline(s.deadline)}
                      </span>
                    </div>

                    {s.link && (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg font-medium transition-colors ${
                          isBlurred ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-red-700'
                        }`}
                      >
                        Apply Now
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </DefaultLayout>
  );
};

export default ScholarshipFinder;