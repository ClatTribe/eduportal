"use client"; 
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import DefaultLayout from '../defaultLayout';
import { supabase } from '../../../lib/supabase';
import ApplicationCard from '../../../components/ApplicationCard';
import { 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Target,
  Sparkles,
  ArrowRight,
  User
} from 'lucide-react';

interface TestScore {
  exam: string;
  score: string;
}

interface ProfileData {
  name?: string;
  degree?: string;
  program?: string;
  term?: string;
  test_scores?: TestScore[];
  email?: string;
  phone?: string;
  target_countries?: string[];
  tenth_score?: string;
  twelfth_score?: string;
  university?: string;
  extracurricular?: string;
  last_course_cgpa?: string;
}

interface ApplicationBuilderRow {
  id?: number;
  user_id: string;
  university: string | null;
  program: string | null;
  documents: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

// Global cache to persist data across page navigations
let cachedProfileData: ProfileData | null = null;
let cachedSimilarCount = 0;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const DashboardPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(cachedProfileData);
  const [similarProfilesCount, setSimilarProfilesCount] = useState(cachedSimilarCount);
  const [loadingProfile, setLoadingProfile] = useState(!cachedProfileData);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [applications, setApplications] = useState<ApplicationBuilderRow[]>([]);

  // Memoize calculations with new required fields
  const profileMetrics = useMemo(() => {
    if (!profileData) {
      return {
        completion: 0,
        missingFields: [
          'Degree', 'Program/Field', 'Target Term', 'Test Scores',
          'Email', 'Phone', 'Target Countries', '10th Score', '12th Score'
        ]
      };
    }

    const hasTestScores = profileData.test_scores && profileData.test_scores.length > 0;
    const hasTargetCountries = profileData.target_countries && profileData.target_countries.length > 0;
    
    // Required fields only
    const fields = [
      profileData.degree,              // 1. Degree
      profileData.program,             // 2. Program
      profileData.term,                // 3. Term
      hasTestScores,                   // 4. Test Scores
      profileData.email,               // 5. Email
      profileData.phone,               // 6. Phone
      hasTargetCountries,              // 7. Target Countries
      profileData.tenth_score,         // 8. 10th Score
      profileData.twelfth_score        // 9. 12th Score
    ];

    const filledCount = fields.filter(f => f && (typeof f === 'boolean' ? f : f.toString().trim() !== '')).length;
    const completion = Math.round((filledCount / fields.length) * 100);

    const missing: string[] = [];
    if (!profileData.degree) missing.push('Degree');
    if (!profileData.program) missing.push('Program/Field');
    if (!profileData.term) missing.push('Target Term');
    if (!hasTestScores) missing.push('Test Scores');
    if (!profileData.email) missing.push('Email');
    if (!profileData.phone) missing.push('Phone');
    if (!hasTargetCountries) missing.push('Target Countries');
    if (!profileData.tenth_score) missing.push('10th Score');
    if (!profileData.twelfth_score) missing.push('12th Score');

    return { completion, missingFields: missing };
  }, [profileData]);

  const userName = useMemo(() => {
    return profileData?.name?.split(' ')[0] || 
           user?.user_metadata?.full_name?.split(' ')[0] || 
           user?.email?.split('@')[0] || 
           'User';
  }, [profileData?.name, user]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/register');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      const now = Date.now();
      const isCacheValid = cachedProfileData && (now - cacheTimestamp < CACHE_DURATION);
      
      if (!isCacheValid) {
        fetchProfileData();
      } else {
        setLoadingProfile(false);
      }
      
      // Fetch applications
      fetchApplications();
    }
  }, [user, loading]);

  useEffect(() => {
    // Load initial shortlist count
    loadShortlistCount();

    // Listen for updates from Course Finder or Shortlist Builder
    const handleShortlistUpdate = () => {
      loadShortlistCount();
    };

    window.addEventListener('shortlist-updated', handleShortlistUpdate);

    return () => {
      window.removeEventListener('shortlist-updated', handleShortlistUpdate);
    };
  }, []);

  const loadShortlistCount = () => {
    try {
      const saved = localStorage.getItem('shortlisted-colleges');
      if (saved) {
        const data = JSON.parse(saved);
        setShortlistedCount(data.ids?.length || 0);
      } else {
        setShortlistedCount(0);
      }
    } catch (error) {
      console.log('No saved colleges found:', error);
      setShortlistedCount(0);
    }
  };

  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      setLoadingProfile(true);
      
      const { data, error } = await supabase
        .from('admit_profiles')
        .select('name, degree, program, term, test_scores, email, phone, target_countries, tenth_score, twelfth_score, university, extracurricular, last_course_cgpa')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        cachedProfileData = null;
        setProfileData(null);
      } else if (data) {
        cachedProfileData = data;
        cacheTimestamp = Date.now();
        setProfileData(data);
        
        if (data.test_scores?.length > 0 || data.program || data.degree) {
          fetchSimilarProfilesCount(data);
        }
      } else {
        cachedProfileData = null;
        setProfileData(null);
      }
    } catch (err) {
      console.error('Error:', err);
      cachedProfileData = null;
      setProfileData(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchSimilarProfilesCount = async (profile: ProfileData) => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('admit_profiles')
        .select('id', { count: 'exact', head: true })
        .neq('user_id', user.id);

      // Extract GRE score from test_scores array
      const greScore = profile.test_scores?.find(t => t.exam === 'GRE')?.score;
      const greNum = greScore ? parseFloat(greScore) : null;
      
      if (greNum) {
        query = query.gte('gre', greNum - 10).lte('gre', greNum + 10);
      }
      if (profile.degree) {
        query = query.eq('degree', profile.degree);
      }

      const { count, error } = await query;

      if (!error && count !== null) {
        cachedSimilarCount = count;
        setSimilarProfilesCount(count);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("application_builder")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      
      if (data) {
        setApplications(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const getProgressColor = useCallback(() => {
    if (profileMetrics.completion >= 80) return 'from-[#A51C30] to-[#8B1528]';
    if (profileMetrics.completion >= 50) return 'from-[#A51C30] to-[#C02340]';
    return 'from-[#8B1528] to-[#A51C30]';
  }, [profileMetrics.completion]);

  const getProgressMessage = useCallback(() => {
    if (profileMetrics.completion === 100) return '🎉 Your profile is complete!';
    if (profileMetrics.completion >= 80) return '🌟 Almost there! Complete your profile';
    if (profileMetrics.completion >= 50) return '⚡ You\'re halfway there!';
    return '🚀 Let\'s get started!';
  }, [profileMetrics.completion]);

  const handleProfileClick = useCallback(() => router.push('/profile'), [router]);
  const handleAdmitFinderClick = useCallback(() => router.push('/admit-finder'), [router]);
  const handleCourseFinderClick = useCallback(() => router.push('/course-finder'), [router]);
  const handleScholarshipClick = useCallback(() => router.push('/scholarship-finder'), [router]);
  const handleShortlistClick = useCallback(() => router.push('/shortlist-builder'), [router]);

  if (loading || loadingProfile) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-[#A51C30] flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A51C30]"></div>
            Loading...
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!user) return null;

  return (
    <DefaultLayout>
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {greeting}, {userName}! 👋
            </h1>
            <p className="text-gray-600">Ready to take the next step in your academic journey?</p>
          </div>
          

          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-[#FECDD3]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${getProgressColor()} rounded-full flex items-center justify-center`}>
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Profile Completion</h2>
                  <p className="text-gray-600">{getProgressMessage()}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#A51C30] to-[#8B1528] bg-clip-text text-transparent">
                  {profileMetrics.completion}%
                </div>
                <p className="text-sm text-gray-500">Complete</p>
              </div>
            </div>

            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div 
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-700 ease-out rounded-full`}
                style={{ width: `${profileMetrics.completion}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
              </div>
            </div>

            {profileMetrics.missingFields.length > 0 && (
              <div className="bg-gradient-to-r from-[#FEF2F3] to-[#FEF2F3] rounded-xl p-4 border border-[#FECDD3]">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-[#A51C30] mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Complete these required fields to unlock full features:</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profileMetrics.missingFields.slice(0, 5).map((field, idx) => (
                        <span key={idx} className="text-xs bg-white text-[#A51C30] px-3 py-1 rounded-full border border-[#FECDD3] font-medium">
                          {field}
                        </span>
                      ))}
                      {profileMetrics.missingFields.length > 5 && (
                        <span className="text-xs bg-white text-gray-600 px-3 py-1 rounded-full border border-gray-200 font-medium">
                          +{profileMetrics.missingFields.length - 5} more
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#A51C30] to-[#8B1528] text-white px-4 py-2 rounded-lg hover:from-[#8B1528] hover:to-[#A51C30] transition-all text-sm font-semibold shadow-lg"
                    >
                      <User size={16} />
                      Complete Your Profile
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {profileMetrics.completion === 100 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-800">Awesome! Your profile is 100% complete! 🎉</h3>
                    <p className="text-sm text-gray-600">You can now access all features and find similar profiles.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Applications Section */}
          {applications.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border-2 border-[#FECDD3]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#A51C30] to-[#8B1528] rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">🎯</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">Your Applications</h2>
                </div>
                <button
                  onClick={() => router.push('/application-builder')}
                  className="text-sm text-[#A51C30] hover:text-[#8B1528] font-semibold flex items-center gap-1"
                >
                  View All
                  <ArrowRight size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
                {applications.map((app, index) => (
                  <ApplicationCard
                    key={app.id || index}
                    application={app}
                    index={index}
                    variant="circular"
                    onClick={() => router.push('/application-builder')}
                  />
                ))}
              </div>
            </div>
          )}

          {profileMetrics.completion >= 50 && (
            <div 
              onClick={handleAdmitFinderClick}
              className="bg-white rounded-2xl shadow-lg p-6 mt-6 mb-6 border-2 border-[#FECDD3] cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#FEF2F3] rounded-full flex items-center justify-center">
                    <Users className="text-[#A51C30]" size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Find Similar Profiles</h2>
                    <p className="text-gray-600">
                      {similarProfilesCount > 0 
                        ? `${similarProfilesCount} students with similar background found!` 
                        : 'Discover students with profiles like yours'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="text-[#A51C30]" size={28} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-[#FECDD3] hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Shortlisted</p>
                  <p className="text-3xl font-bold text-[#A51C30]">{shortlistedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Programs saved</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#FEF2F3] to-[#FECDD3] rounded-full flex items-center justify-center">
                  <span className="text-3xl">📚</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Applications</p>
                  <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
                  <p className="text-xs text-gray-500 mt-1">In progress</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📝</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Scholarships</p>
                  <p className="text-3xl font-bold text-green-600">0</p>
                  <p className="text-xs text-gray-500 mt-1">Opportunities</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Admits</p>
                  <p className="text-3xl font-bold text-purple-600">0</p>
                  <p className="text-xs text-gray-500 mt-1">Received</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🎓</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-[#FECDD3]">
            <div className="flex items-center gap-2 mb-6">
              <Target className="text-[#A51C30]" size={24} />
              <h2 className="text-2xl font-semibold text-gray-800">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={handleCourseFinderClick}
                className="group p-6 border-2 border-[#FECDD3] rounded-xl hover:bg-[#FEF2F3] transition-all text-left hover:shadow-lg"
              >
                <div className="text-4xl mb-3">🔍</div>
                <div className="font-bold text-gray-800 mb-1 text-lg">Find Courses</div>
                <div className="text-sm text-gray-600">Explore programs worldwide</div>
                <ArrowRight className="text-[#A51C30] mt-2 group-hover:translate-x-1 transition-transform" size={20} />
              </button>

              <button 
                onClick={handleAdmitFinderClick}
                className="group p-6 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all text-left hover:shadow-lg"
              >
                <div className="text-4xl mb-3">👥</div>
                <div className="font-bold text-gray-800 mb-1 text-lg">Admit Finder</div>
                <div className="text-sm text-gray-600">Connect with admits</div>
                <ArrowRight className="text-blue-600 mt-2 group-hover:translate-x-1 transition-transform" size={20} />
              </button>

              <button 
                onClick={handleScholarshipClick}
                className="group p-6 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-all text-left hover:shadow-lg"
              >
                <div className="text-4xl mb-3">💵</div>
                <div className="font-bold text-gray-800 mb-1 text-lg">Scholarships</div>
                <div className="text-sm text-gray-600">Find funding options</div>
                <ArrowRight className="text-green-600 mt-2 group-hover:translate-x-1 transition-transform" size={20} />
              </button>

              <button 
                onClick={handleShortlistClick}
                className="group p-6 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition-all text-left hover:shadow-lg"
              >
                <div className="text-4xl mb-3">⭐</div>
                <div className="font-bold text-gray-800 mb-1 text-lg">Shortlist Builder</div>
                <div className="text-sm text-gray-600">Build your dream list</div>
                <ArrowRight className="text-purple-600 mt-2 group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </div>
          </div>

          {profileMetrics.completion < 100 && (
            <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-yellow-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2 text-lg">💡 Pro Tip</h3>
                  <p className="text-gray-700">
                    Complete all 9 required fields in your profile to unlock personalized recommendations and connect with students who have similar academic backgrounds!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DashboardPage;