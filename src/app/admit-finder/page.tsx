"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, BookOpen, Calendar, Users, User, Building2, Filter, UserCheck, AlertCircle } from 'lucide-react';
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

  // Helper function to get test score by exam name
  const getTestScore = (testScores: TestScore[] | undefined, examName: string): string | null => {
    if (!testScores) return null;
    const test = testScores.find(t => t.exam.toUpperCase() === examName.toUpperCase());
    return test ? test.score : null;
  };

  // Helper function to parse numeric score
  const parseScore = (score: string | null): number | null => {
    if (!score) return null;
    const parsed = parseFloat(score);
    return isNaN(parsed) ? null : parsed;
  };

  const calculateSimilarityScore = (profile: AdmitProfile): number => {
    if (!userProfile) return 0;
    
    let score = 0;
    let maxScore = 0;

    // GRE Score Similarity (Weight: 20 points)
    maxScore += 20;
    const userGRE = parseScore(getTestScore(userProfile.test_scores, 'GRE'));
    const profileGRE = parseScore(getTestScore(profile.test_scores, 'GRE'));
    
    if (userGRE && profileGRE) {
      const greDiff = Math.abs(userGRE - profileGRE);
      if (greDiff === 0) score += 20;
      else if (greDiff <= 3) score += 18;
      else if (greDiff <= 5) score += 15;
      else if (greDiff <= 10) score += 12;
      else if (greDiff <= 15) score += 8;
      else if (greDiff <= 20) score += 5;
      else score += 2;
    } else if (!userGRE && !profileGRE) {
      score += 10;
    }

    // TOEFL Score Similarity (Weight: 20 points)
    maxScore += 20;
    const userTOEFL = parseScore(getTestScore(userProfile.test_scores, 'TOEFL'));
    const profileTOEFL = parseScore(getTestScore(profile.test_scores, 'TOEFL'));
    
    if (userTOEFL && profileTOEFL) {
      const toeflDiff = Math.abs(userTOEFL - profileTOEFL);
      if (toeflDiff === 0) score += 20;
      else if (toeflDiff <= 2) score += 18;
      else if (toeflDiff <= 5) score += 15;
      else if (toeflDiff <= 10) score += 10;
      else if (toeflDiff <= 15) score += 5;
      else score += 2;
    } else if (!userTOEFL && !profileTOEFL) {
      score += 10;
    }

    // IELTS Score Similarity (Weight: 20 points)
    maxScore += 20;
    const userIELTS = parseScore(getTestScore(userProfile.test_scores, 'IELTS'));
    const profileIELTS = parseScore(getTestScore(profile.test_scores, 'IELTS'));
    
    if (userIELTS && profileIELTS) {
      const ieltsDiff = Math.abs(userIELTS - profileIELTS);
      if (ieltsDiff === 0) score += 20;
      else if (ieltsDiff <= 0.5) score += 18;
      else if (ieltsDiff <= 1.0) score += 13;
      else if (ieltsDiff <= 1.5) score += 8;
      else if (ieltsDiff <= 2.0) score += 4;
      else score += 2;
    } else if (!userIELTS && !profileIELTS) {
      score += 10;
    }

    // Program Similarity (Weight: 25 points)
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

    // Degree Similarity (Weight: 10 points)
    maxScore += 10;
    if (userProfile.degree && profile.degree) {
      if (userProfile.degree === profile.degree) {
        score += 10;
      }
    } else if (!userProfile.degree && !profile.degree) {
      score += 5;
    }

    // CGPA Similarity (Weight: 5 points)
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
        allProfiles = allProfiles.filter(p => p.user_id !== currentUserId);
      }

      if (viewMode === 'similar' && userProfile) {
        console.log('Calculating similarity scores...');
        
        const profilesWithScores = allProfiles.map(profile => ({
          ...profile,
          similarityScore: calculateSimilarityScore(profile)
        }));

        const similarProfiles = profilesWithScores
          .filter(p => (p.similarityScore || 0) >= 20)
          .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));

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
      return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Very Similar ({score}%)</span>;
    } else if (score >= 60) {
      return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">Similar ({score}%)</span>;
    } else if (score >= 40) {
      return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">Somewhat Similar ({score}%)</span>;
    } else if (score >= 20) {
      return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">Match ({score}%)</span>;
    }
    return null;
  };

  // Helper to format test scores for display in info banner
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
    <div className="flex-1 bg-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Access 375K+ Admits & Rejects!</h1>
        <p className="text-gray-600">Find folks at your dream school with the same background, interests, and stats as you</p>
      </div>

      {viewMode === 'similar' && userProfile && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-900">Matching based on your profile:</p>
              <p className="text-xs text-blue-700 break-words">
                Tests: {formatTestScoresForDisplay(userProfile.test_scores)} | 
                Program: {userProfile.program || 'N/A'} | Degree: {userProfile.degree || 'N/A'} | CGPA: {userProfile.last_course_cgpa || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setViewMode('all')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            viewMode === 'all'
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users size={20} />
          All Profiles
        </button>
        <button
          onClick={() => {
            if (hasProfileData && !loadingProfile) {
              setViewMode('similar');
            }
          }}
          disabled={!hasProfileData || loadingProfile}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            viewMode === 'similar'
              ? 'bg-red-600 text-white shadow-lg'
              : hasProfileData && !loadingProfile
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title={!hasProfileData && !loadingProfile ? 'Complete your profile to see similar profiles' : ''}
        >
          <UserCheck size={20} />
          Similar Profiles
          {!loadingProfile && !hasProfileData && <span className="text-xs ml-1">(Complete profile first)</span>}
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
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
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-600" />
        </div>

        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
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
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-600" />
        </div>

        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name, university, or program"
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="text-red-600" size={20} />
          <span className="font-semibold">
            {profiles.length} {viewMode === 'similar' ? 'similar ' : ''}profile{profiles.length !== 1 ? 's' : ''} found
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show Verified only</span>
          <button
            onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showVerifiedOnly ? 'bg-red-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                showVerifiedOnly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 text-lg">Loading profiles...</div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <UserCheck size={48} className="text-gray-300 mb-4" />
          <div className="text-gray-500 text-lg mb-2">
            {viewMode === 'similar' 
              ? 'No similar profiles found'
              : 'No profiles found'}
          </div>
          <div className="text-gray-400 text-sm">
            {viewMode === 'similar' 
              ? 'Try adjusting your filters or complete more profile information'
              : 'Try adjusting your search filters'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${
                    profile.avatar_type === 'S' ? 'bg-purple-600' : 'bg-green-600'
                  } text-white flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                    {profile.name ? profile.name.charAt(0).toUpperCase() : profile.avatar_type}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold flex items-center gap-1 text-gray-800">
                      {profile.name}
                      {profile.verified && (
                        <span className="text-red-600 text-sm">👑</span>
                      )}
                    </h3>
                    {getSimilarityBadge(profile)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
                  <Calendar size={16} />
                  <span className="whitespace-nowrap">{profile.term}</span>
                </div>
              </div>

              {/* Display Test Scores Dynamically */}
              {profile.test_scores && profile.test_scores.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {profile.test_scores.slice(0, 3).map((test, idx) => (
                    <div key={idx} className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <BookOpen size={12} />
                        <span className="truncate">{test.exam}</span>
                      </div>
                      <p className="font-bold text-sm text-gray-800 truncate">{test.score}</p>
                    </div>
                  ))}
                  {profile.test_scores.length > 3 && (
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-xs text-gray-500">+{profile.test_scores.length - 3} more</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-800 line-clamp-1">{profile.university}</span>
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">{profile.program}</div>
                {profile.degree && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Degree:</span> {profile.degree}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Applications:</span>
                  <span className="font-semibold text-gray-800">{profile.applications_count}</span>
                </div>
              </div>

              <button className="w-full border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50 hover:border-red-600 flex items-center justify-center gap-2 text-gray-700 hover:text-red-600 transition-all">
                <User size={16} />
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    </DefaultLayout>
  );
};

export default AdmitFinder;