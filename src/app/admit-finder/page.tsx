"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, BookOpen, Calendar, Users, User, Building2, Filter, UserCheck, AlertCircle, Sparkles, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import DefaultLayout from '../defaultLayout';

interface TestScore {
  exam: string;
  score: string;
}

interface AdmitProfile {
  id: number;
  name: string;
  test_scores?: TestScore[];
  term: string;
  university: string;
  program: string;
  applications_count: number;
  avatar_type: 'S' | 'G';
  verified: boolean;
  degree?: string;
  last_course_cgpa?: string;
  user_id?: string;
  similarityScore?: number;
}

interface UserProfile {
  test_scores?: TestScore[];
  program: string;
  degree?: string;
  last_course_cgpa?: string;
}

const accentColor = '#A51C30';
const primaryBg = '#FFFFFF';
const borderColor = '#FECDD3';

const AdmitFinder: React.FC = () => {
  const [profiles, setProfiles] = useState<AdmitProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'similar'>('all');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCurrentUserProfile();
  }, []);

  useEffect(() => {
    if (!loadingProfile) {
      fetchProfiles();
    }
  }, [showVerifiedOnly, searchQuery, selectedUniversity, selectedMajor, viewMode, loadingProfile]);

  const fetchCurrentUserProfile = async () => {
    try {
      setLoadingProfile(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('No authenticated user');
        setUserProfile(null);
        setCurrentUserId(null);
        setLoadingProfile(false);
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('admit_profiles')
        .select('test_scores, program, degree, last_course_cgpa')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
      } else if (data) {
        console.log('User profile loaded:', data);
        setUserProfile(data);
      } else {
        console.log('No profile found for user');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error in fetchCurrentUserProfile:', error);
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const parseScore = (score: string | null): number | null => {
    if (!score) return null;
    const parsed = parseFloat(score);
    return isNaN(parsed) ? null : parsed;
  };

  const calculateSimilarityScore = (profile: AdmitProfile): number => {
    if (!userProfile) return 0;
    
    let score = 0;
    let maxScore = 0;

    const userExams = userProfile.test_scores || [];
    const profileExams = profile.test_scores || [];
    
    if (userExams.length > 0 || profileExams.length > 0) {
      const userExamMap = new Map(userExams.map(t => [t.exam.toUpperCase(), t.score]));
      const profileExamMap = new Map(profileExams.map(t => [t.exam.toUpperCase(), t.score]));
      
      const allExamTypes = new Set([...userExamMap.keys(), ...profileExamMap.keys()]);
      
      const examConfig: Record<string, { maxDiff: number[], scores: number[], weight: number }> = {
        'GRE': { maxDiff: [0, 3, 5, 10, 15, 20], scores: [20, 18, 15, 12, 8, 5, 2], weight: 20 },
        'GMAT': { maxDiff: [0, 10, 20, 30, 50, 70], scores: [20, 18, 15, 12, 8, 5, 2], weight: 20 },
        'TOEFL': { maxDiff: [0, 2, 5, 10, 15], scores: [20, 18, 15, 10, 5, 2], weight: 20 },
        'IELTS': { maxDiff: [0, 0.5, 1.0, 1.5, 2.0], scores: [20, 18, 13, 8, 4, 2], weight: 20 },
        'PTE ACADEMIC': { maxDiff: [0, 3, 6, 10, 15], scores: [20, 18, 15, 10, 5, 2], weight: 20 },
        'DUOLINGO ENGLISH TEST': { maxDiff: [0, 5, 10, 15, 20], scores: [20, 18, 15, 10, 5, 2], weight: 20 },
        'SAT': { maxDiff: [0, 20, 50, 100, 150], scores: [20, 18, 15, 10, 5, 2], weight: 20 },
        'ACT': { maxDiff: [0, 1, 2, 3, 4], scores: [20, 18, 15, 10, 5, 2], weight: 20 },
        'TESTDAF': { maxDiff: [0, 1, 2, 3], scores: [20, 15, 10, 5, 2], weight: 15 },
        'GOETHE CERTIFICATE': { maxDiff: [0, 1, 2], scores: [15, 10, 5, 2], weight: 15 },
        'DELF/DALF': { maxDiff: [0, 10, 20, 30], scores: [15, 10, 5, 2], weight: 15 },
        'OTHER': { maxDiff: [0, 5, 10, 20], scores: [10, 8, 5, 2], weight: 10 }
      };

      let totalTestWeight = 0;
      let totalTestScore = 0;

      for (const examType of allExamTypes) {
        const userScore = userExamMap.get(examType);
        const profileScore = profileExamMap.get(examType);
        
        const config = examConfig[examType] || examConfig['OTHER'];
        const weight = config.weight;
        totalTestWeight += weight;

        if (userScore && profileScore) {
          const userNum = parseFloat(userScore);
          const profileNum = parseFloat(profileScore);
          
          if (!isNaN(userNum) && !isNaN(profileNum)) {
            const diff = Math.abs(userNum - profileNum);
            
            let examScore = config.scores[config.scores.length - 1];
            for (let i = 0; i < config.maxDiff.length; i++) {
              if (diff <= config.maxDiff[i]) {
                examScore = config.scores[i];
                break;
              }
            }
            totalTestScore += examScore;
          }
        } else if (!userScore && !profileScore) {
          totalTestScore += weight / 2;
        }
      }

      if (totalTestWeight > 0) {
        maxScore += 60;
        score += (totalTestScore / totalTestWeight) * 60;
      }
    } else {
      maxScore += 60;
      score += 30;
    }

    maxScore += 25;
    if (userProfile.program && profile.program) {
      const userProg = userProfile.program.toLowerCase().trim();
      const profProg = profile.program.toLowerCase().trim();
      
      if (userProg === profProg) {
        score += 25;
      } else if (userProg.includes(profProg) || profProg.includes(userProg)) {
        score += 20;
      } else {
        const csFields = ['computer', 'software', 'data', 'artificial intelligence', 'machine learning', 'ai', 'ml', 'cse', 'cs'];
        const eeFields = ['electrical', 'electronics', 'robotics', 'ee'];
        const meFields = ['mechanical', 'industrial', 'manufacturing', 'me'];
        const ceFields = ['civil', 'architecture', 'construction', 'ce'];
        const bioFields = ['bio', 'biotechnology', 'biomedical', 'bioinformatics'];
        
        const relatedFields = [csFields, eeFields, meFields, ceFields, bioFields];
        
        for (const group of relatedFields) {
          const userInGroup = group.some(field => userProg.includes(field));
          const profInGroup = group.some(field => profProg.includes(field));
          if (userInGroup && profInGroup) {
            score += 15;
            break;
          }
        }
      }
    }

    maxScore += 10;
    if (userProfile.degree && profile.degree) {
      if (userProfile.degree === profile.degree) {
        score += 10;
      }
    } else if (!userProfile.degree && !profile.degree) {
      score += 5;
    }

    maxScore += 5;
    if (userProfile.last_course_cgpa && profile.last_course_cgpa) {
      const userCGPA = parseFloat(userProfile.last_course_cgpa);
      const profileCGPA = parseFloat(profile.last_course_cgpa);
      
      if (!isNaN(userCGPA) && !isNaN(profileCGPA)) {
        const cgpaDiff = Math.abs(userCGPA - profileCGPA);
        if (cgpaDiff <= 2) score += 5;
        else if (cgpaDiff <= 5) score += 4;
        else if (cgpaDiff <= 10) score += 2;
        else score += 1;
      }
    } else if (!userProfile.last_course_cgpa && !profile.last_course_cgpa) {
      score += 2;
    }

    const finalScore = (score / maxScore) * 100;
    return Math.round(finalScore * 10) / 10;
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('admit_profiles')
        .select('*');

      if (showVerifiedOnly) {
        query = query.eq('verified', true);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%,program.ilike.%${searchQuery}%`);
      }

      if (selectedUniversity) {
        query = query.eq('university', selectedUniversity);
      }

      if (selectedMajor) {
        query = query.ilike('program', `%${selectedMajor}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        setProfiles([]);
        setLoading(false);
        return;
      }

      let allProfiles = data || [];
      console.log(`Fetched ${allProfiles.length} total profiles from database`);

      if (currentUserId) {
        allProfiles = allProfiles.filter((p: AdmitProfile) => p.user_id !== currentUserId);
      }

      if (viewMode === 'similar' && userProfile) {
        console.log('Calculating similarity scores...');
        
        const profilesWithScores = allProfiles.map((profile: AdmitProfile) => ({
          ...profile,
          similarityScore: calculateSimilarityScore(profile)
        }));

        const similarProfiles = profilesWithScores
          .filter((p: AdmitProfile) => (p.similarityScore || 0) >= 20)
          .sort((a: AdmitProfile, b: AdmitProfile) => (b.similarityScore || 0) - (a.similarityScore || 0));

        console.log(`Found ${similarProfiles.length} similar profiles`);
        setProfiles(similarProfiles);
      } else {
        console.log(`Showing ${allProfiles.length} profiles`);
        setProfiles(allProfiles);
      }
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityBadge = (profile: AdmitProfile) => {
    if (viewMode !== 'similar' || !profile.similarityScore) return null;
    
    const score = profile.similarityScore;
    
    if (score >= 80) {
      return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
        <span className="hidden sm:inline">Very Similar ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    } else if (score >= 60) {
      return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <span className="hidden sm:inline">Similar ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    } else if (score >= 40) {
      return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)', color: '#ca8a04', border: '1px solid rgba(250, 204, 21, 0.3)' }}>
        <span className="hidden sm:inline">Somewhat Similar ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    } else if (score >= 20) {
      return <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(148, 163, 184, 0.1)', color: '#64748b', border: '1px solid rgba(148, 163, 184, 0.3)' }}>
        <span className="hidden sm:inline">Match ({score}%)</span>
        <span className="sm:hidden">{score}%</span>
      </span>;
    }
    return null;
  };

  const formatTestScoresForDisplay = (testScores?: TestScore[]): string => {
    if (!testScores || testScores.length === 0) return 'None';
    return testScores.map(t => `${t.exam}: ${t.score}`).join(' | ');
  };

  const hasProfileData = userProfile && (
    (userProfile.test_scores && userProfile.test_scores.length > 0) ||
    userProfile.program || 
    userProfile.degree || 
    userProfile.last_course_cgpa
  );

  return (
    <DefaultLayout>
      <div className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-[72px] sm:mt-0" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2" style={{ color: accentColor }}>
              Access 375K+ Admits & Rejects!
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Find folks at your dream school with the same background, interests, and stats as you</p>
          </div>

          {/* Profile Info Banner */}
          {viewMode === 'similar' && userProfile && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: 'rgba(165, 28, 48, 0.05)', borderLeft: `4px solid ${accentColor}`, border: `1px solid ${borderColor}` }}>
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 flex-shrink-0" style={{ color: accentColor }} size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold mb-1" style={{ color: accentColor }}>Matching based on your profile:</p>
                  <p className="text-xs text-gray-700 break-words">
                    Tests: {formatTestScoresForDisplay(userProfile.test_scores)} | 
                    Program: {userProfile.program || 'N/A'} | Degree: {userProfile.degree || 'N/A'} | CGPA: {userProfile.last_course_cgpa || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setViewMode('all')}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
              style={viewMode === 'all'
                ? { backgroundColor: accentColor, color: 'white' }
                : { backgroundColor: 'white', color: '#6b7280', border: `1px solid ${borderColor}` }
              }
            >
              <Users size={18} className="sm:w-5 sm:h-5" />
              All Profiles
            </button>
            <button
              onClick={() => {
                if (hasProfileData && !loadingProfile) {
                  setViewMode('similar');
                }
              }}
              disabled={!hasProfileData || loadingProfile}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all"
              style={viewMode === 'similar'
                ? { backgroundColor: accentColor, color: 'white' }
                : hasProfileData && !loadingProfile
                  ? { backgroundColor: 'white', color: '#6b7280', border: `1px solid ${borderColor}` }
                  : { backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }
              }
              title={!hasProfileData && !loadingProfile ? 'Complete your profile to see similar profiles' : ''}
            >
              <UserCheck size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Similar Profiles</span>
              <span className="sm:inline md:hidden">Similar</span>
              {!loadingProfile && !hasProfileData && <span className="text-xs ml-1 hidden lg:inline">(Complete profile first)</span>}
            </button>
          </div>

          {/* Mobile Filter Toggle Button */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: 'white', border: `1px solid ${borderColor}`, color: '#6b7280' }}
            >
              <span className="flex items-center gap-2">
                <Filter size={18} />
                Filters {(selectedUniversity || selectedMajor || searchQuery) && '(Active)'}
              </span>
              {showFilters ? <X size={18} /> : <ChevronDown size={18} />}
            </button>

            {/* Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:flex flex-col lg:flex-row gap-3 lg:gap-4 mt-3 lg:mt-0`}>
              <div className="relative w-full lg:w-auto">
                <select 
                  className="w-full lg:w-auto appearance-none rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 text-gray-900"
                  style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }}
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                >
                  <option value="">All Universities</option>
                  <option>Stanford University</option>
                  <option>Duke University</option>
                  <option>Carnegie Mellon University</option>
                  <option>University of California Berkeley</option>
                  <option>Massachusetts Institute of Technology</option>
                  <option>Harvard University</option>
                  <option>Columbia University</option>
                  <option>Cornell University</option>
                  <option>University of Pennsylvania</option>
                  <option>Georgia Institute of Technology</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 pointer-events-none text-gray-400" />
              </div>

              <div className="relative w-full lg:w-auto">
                <select 
                  className="w-full lg:w-auto appearance-none rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 text-gray-900"
                  style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }}
                  value={selectedMajor}
                  onChange={(e) => setSelectedMajor(e.target.value)}
                >
                  <option value="">All Majors</option>
                  <option>Computer Science</option>
                  <option>CSE</option>
                  <option>Data Science</option>
                  <option>Electrical Engineering</option>
                  <option>Mechanical Engineering</option>
                  <option>Artificial Intelligence</option>
                  <option>Machine Learning</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 pointer-events-none text-gray-400" />
              </div>

              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name, university, or program"
                  className="w-full px-3 sm:px-4 py-2 pr-10 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400"
                  style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-3 top-2.5 sm:top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Results Count and Verified Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 rounded-lg shadow-sm p-3 sm:p-4" style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }}>
            <div className="flex items-center gap-2">
              <Users className="flex-shrink-0" style={{ color: accentColor }} size={20} />
              <span className="font-semibold text-sm sm:text-base text-gray-900">
                {profiles.length} {viewMode === 'similar' ? 'similar ' : ''}profile{profiles.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600">Show Verified only</span>
              <button
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{ backgroundColor: showVerifiedOnly ? accentColor : '#d1d5db' }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    showVerifiedOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2" style={{ borderColor: accentColor }}></div>
                <p className="text-sm sm:text-base text-gray-600">Loading profiles...</p>
              </div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12 sm:py-16 rounded-lg shadow-sm" style={{ backgroundColor: 'white', border: `1px solid ${borderColor}` }}>
              <UserCheck size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {viewMode === 'similar' 
                  ? 'No similar profiles found'
                  : 'No profiles found'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                {viewMode === 'similar' 
                  ? 'Try adjusting your filters or complete more profile information'
                  : 'Try adjusting your search filters'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {profiles.map((profile, index) => {
                const isBlurred = viewMode === 'similar' && index >= 2;
                
                return (
                  <div 
                    key={profile.id} 
                    className={`rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow bg-white relative ${
                      isBlurred ? 'overflow-hidden' : ''
                    }`}
                    style={{ border: `1px solid ${borderColor}` }}
                  >
                    {isBlurred && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl">
                        <div className="bg-white shadow-2xl rounded-2xl p-4 sm:p-6 text-center max-w-sm" style={{ border: `2px solid ${borderColor}` }}>
                          <div className="mb-4 flex justify-center">
                            <div className="rounded-full p-3" style={{ backgroundColor: 'rgba(165, 28, 48, 0.1)' }}>
                              <AlertCircle style={{ color: accentColor }} size={28} />
                            </div>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                            Unlock More Profiles
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-5">
                            Talk to our experts to view detailed information about this and {profiles.length - index - 1} more similar profiles
                          </p>
                          <button className="text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors w-full flex items-center justify-center gap-2 text-xs sm:text-sm" style={{ backgroundColor: accentColor }}>
                            <Sparkles size={16} />
                            Contact Our Experts
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Header with Avatar and Name - Full Width */}
                    <div className="flex items-center justify-between mb-4 gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${
                          profile.avatar_type === 'S' ? 'bg-purple-600' : 'bg-green-600'
                        } text-white flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0`}>
                          {profile.name ? profile.name.charAt(0).toUpperCase() : profile.avatar_type}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-base sm:text-lg text-gray-900 break-words mb-1 flex items-center gap-1">
                            <span className="truncate">{profile.name}</span>
                            {profile.verified && (
                              <span className="text-sm flex-shrink-0" style={{ color: accentColor }}>👑</span>
                            )}
                          </h3>
                          {getSimilarityBadge(profile)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 flex-shrink-0">
                        <Calendar size={14} className="sm:w-4 sm:h-4" />
                        <span className="whitespace-nowrap">{profile.term}</span>
                      </div>
                    </div>

                    {/* 2x2 Grid Layout */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* Test Scores - Top Left */}
                      {profile.test_scores && profile.test_scores.length > 0 && (
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(165, 28, 48, 0.05)' }}>
                          <div className="flex items-center gap-1 mb-2">
                            <BookOpen size={14} style={{ color: accentColor }} />
                            <span className="text-xs font-medium text-gray-600">Test Scores</span>
                          </div>
                          <div className="space-y-1.5">
                            {profile.test_scores.slice(0, 2).map((test, idx) => (
                              <div key={idx} className="flex justify-between items-center">
                                <span className="text-xs text-gray-600 truncate">{test.exam}</span>
                                <span className="font-bold text-sm ml-2" style={{ color: accentColor }}>{test.score}</span>
                              </div>
                            ))}
                            {profile.test_scores.length > 2 && (
                              <span className="text-xs text-gray-500">+{profile.test_scores.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Program - Top Right */}
                      <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(165, 28, 48, 0.05)' }}>
                        <div className="flex items-center gap-1 mb-2">
                          <Building2 size={14} style={{ color: accentColor }} />
                          <span className="text-xs font-medium text-gray-600">Program</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{profile.program}</p>
                        {profile.degree && (
                          <p className="text-xs text-gray-500 truncate">{profile.degree}</p>
                        )}
                      </div>

                      {/* University - Bottom Left */}
                      <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(165, 28, 48, 0.05)' }}>
                        <span className="text-xs font-medium text-gray-600 block mb-2">University</span>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">{profile.university}</p>
                      </div>

                      {/* Applications - Bottom Right */}
                      <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(165, 28, 48, 0.05)' }}>
                        <span className="text-xs font-medium text-gray-600 block mb-2">Applications</span>
                        <p className="text-2xl font-bold" style={{ color: accentColor }}>{profile.applications_count}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdmitFinder;