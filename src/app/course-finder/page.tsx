// "use client";
// import React, { useState, useEffect } from 'react';
// import { Search, ChevronDown, Heart, BookOpen, DollarSign, MapPin, Users, GraduationCap, Filter, X, ChevronLeft, ChevronRight, AlertCircle, Trophy, Award, Sparkles } from 'lucide-react';
// import DefaultLayout from '../defaultLayout';

// const API_KEY = 'SRI6Nb7vQxcpNFVnE5D02zzze7vIdfZUqmRPe93y';
// const API_BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools.json';

// interface College {
//   id: number;
//   'school.name': string;
//   'school.city': string;
//   'school.state': string;
//   'latest.cost.tuition.in_state': number | null;
//   'latest.cost.tuition.out_of_state': number | null;
//   'latest.admissions.admission_rate.overall': number | null;
//   'school.school_url': string | null;
//   'school.locale': number | null;
//   'latest.student.size': number | null;
//   'latest.admissions.sat_scores.average.overall': number | null;
//   'latest.admissions.sat_scores.midpoint.math': number | null;
//   'latest.admissions.sat_scores.midpoint.critical_reading': number | null;
//   'latest.admissions.act_scores.midpoint.cumulative': number | null;
//   'latest.admissions.act_scores.midpoint.math': number | null;
//   'latest.admissions.act_scores.midpoint.english': number | null;
//   'latest.academics.program_available.bachelors': number | null;
//   'latest.academics.program_available.masters': number | null;
//   'latest.academics.program_available.doctorate': number | null;
//   'latest.academics.program_percentage.business_marketing': number | null;
//   'latest.academics.program_percentage.computer': number | null;
//   'latest.academics.program_percentage.health': number | null;
//   'latest.academics.program_percentage.education': number | null;
//   'latest.academics.program_percentage.engineering': number | null;
//   'latest.academics.program_percentage.biological': number | null;
//   'latest.academics.program_percentage.mathematics': number | null;
//   'latest.academics.program_percentage.physical_science': number | null;
//   'latest.academics.program_percentage.psychology': number | null;
//   'latest.academics.program_percentage.social_science': number | null;
//   matchScore?: number;
// }

// interface UserProfile {
//   program: string;
//   country: string;
//   degree: string;
//   last_course_cgpa: string;
//   test_scores?: Array<{ exam: string; score: string }>;
// }

// const PROGRAM_TO_API_FIELD: Record<string, string> = {
//   'Computer Science': 'computer',
//   'Information Technology': 'computer',
//   'Data Science': 'computer',
//   'Artificial Intelligence': 'computer',
//   'Software Engineering': 'computer',
//   'Electrical Engineering': 'engineering',
//   'Electronics Engineering': 'engineering',
//   'Mechanical Engineering': 'engineering',
//   'Civil Engineering': 'engineering',
//   'Chemical Engineering': 'engineering',
//   'Aerospace Engineering': 'engineering',
//   'Industrial Engineering': 'engineering',
//   'Business Administration (MBA)': 'business_marketing',
//   'Finance': 'business_marketing',
//   'Marketing': 'business_marketing',
//   'Human Resources': 'business_marketing',
//   'Biotechnology': 'biological',
//   'Biomedical Engineering': 'biological',
//   'Bioinformatics': 'biological',
//   'Medicine': 'health',
//   'Pharmacy': 'health',
//   'Public Health': 'health',
//   'Psychology': 'psychology',
//   'Architecture': 'engineering',
//   'Environmental Science': 'physical_science',
//   'Physics': 'physical_science',
//   'Mathematics': 'mathematics',
//   'Chemistry': 'physical_science',
// };

// const CourseFinder: React.FC = () => {
//   const [colleges, setColleges] = useState<College[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedState, setSelectedState] = useState('');
//   const [selectedLocale, setSelectedLocale] = useState('');
//   const [minTuition, setMinTuition] = useState('');
//   const [maxTuition, setMaxTuition] = useState('');
//   const [currentPage, setCurrentPage] = useState(0);
//   const [totalResults, setTotalResults] = useState(0);
//   const [savedColleges, setSavedColleges] = useState<Set<number>>(new Set());
//   const [viewMode, setViewMode] = useState<'all' | 'recommended'>('all');
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [loadingProfile, setLoadingProfile] = useState(true);
//   const perPage = 15;

//   const US_STATES = {
//     'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
//     'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
//     'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
//     'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
//     'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
//     'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
//     'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
//     'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
//     'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
//     'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
//   };

//   const LOCALE_TYPES = {
//     '': 'All Locations', '11': 'City - Large', '12': 'City - Midsize', '13': 'City - Small',
//     '21': 'Suburb - Large', '22': 'Suburb - Midsize', '23': 'Suburb - Small',
//     '31': 'Town - Fringe', '32': 'Town - Distant', '33': 'Town - Remote',
//     '41': 'Rural - Fringe', '42': 'Rural - Distant', '43': 'Rural - Remote'
//   };

//   useEffect(() => {
//     fetchUserProfile();
//     loadSavedColleges();
//   }, []);

//   useEffect(() => {
//     if (!loadingProfile) {
//       fetchColleges();
//     }
//   }, [currentPage, viewMode, loadingProfile]);

//   const loadSavedColleges = () => {
//     try {
//       const saved = localStorage.getItem('shortlisted-colleges');
//       if (saved) {
//         const data = JSON.parse(saved);
//         setSavedColleges(new Set(data.ids || []));
//       }
//     } catch (error) {
//       console.log('No saved colleges found:', error);
//     }
//   };

//   const saveToStorage = (ids: number[], colleges: College[]) => {
//     try {
//       localStorage.setItem('shortlisted-colleges', JSON.stringify({ ids, colleges }));
//       window.dispatchEvent(new Event('shortlist-updated'));
//     } catch (error) {
//       console.error('Error saving to storage:', error);
//     }
//   };

//   const fetchUserProfile = async () => {
//     try {
//       setLoadingProfile(true);
      
//       // Mock user profile - Replace with actual Supabase/API call
//       const mockProfile: UserProfile = {
//         program: 'Computer Science',
//         country: 'USA',
//         degree: 'PG',
//         last_course_cgpa: '8.5',
//         test_scores: [
//           { exam: 'GRE', score: '315' },
//           { exam: 'TOEFL', score: '105' }
//         ]
//       };
      
//       setUserProfile(mockProfile);
//       console.log('User profile loaded:', mockProfile);
//     } catch (err) {
//       console.error('Error in fetchUserProfile:', err);
//       setUserProfile(null);
//     } finally {
//       setLoadingProfile(false);
//     }
//   };

//   const calculateMatchScore = (college: College): number => {
//     if (!userProfile) return 0;

//     let score = 0;
//     let maxScore = 0;

//     // Program Relevance (40 points)
//     maxScore += 40;
//     const programField = PROGRAM_TO_API_FIELD[userProfile.program];
//     if (programField) {
//       const programPercentage = college[`latest.academics.program_percentage.${programField}` as keyof College] as number | null;
//       if (programPercentage !== null && programPercentage !== undefined) {
//         if (programPercentage >= 0.15) score += 40;
//         else if (programPercentage >= 0.10) score += 35;
//         else if (programPercentage >= 0.05) score += 28;
//         else if (programPercentage >= 0.02) score += 20;
//         else if (programPercentage >= 0.01) score += 12;
//         else if (programPercentage > 0) score += 8;
//       } else {
//         score += 5;
//       }
//     } else {
//       score += 15;
//     }

//     // Degree Availability (20 points)
//     maxScore += 20;
//     if (userProfile.degree) {
//       const degreeType = userProfile.degree === 'UG' ? 'bachelors' : 
//                         userProfile.degree === 'PG' ? 'masters' : 
//                         userProfile.degree === 'PhD' ? 'doctorate' : null;
      
//       if (degreeType) {
//         const hasProgram = college[`latest.academics.program_available.${degreeType}` as keyof College];
//         if (hasProgram === 1) {
//           score += 20;
//         } else {
//           score += 5;
//         }
//       }
//     }

//     // Academic Match based on CGPA and Admission Rate (25 points)
//     maxScore += 25;
//     const cgpa = parseFloat(userProfile.last_course_cgpa);
//     const admissionRate = college['latest.admissions.admission_rate.overall'];
    
//     if (!isNaN(cgpa) && admissionRate !== null && admissionRate !== undefined) {
//       const cgpaPercent = cgpa * 10;
      
//       if (cgpaPercent >= 85) {
//         if (admissionRate <= 0.25) score += 25;
//         else if (admissionRate <= 0.45) score += 22;
//         else if (admissionRate <= 0.65) score += 18;
//         else score += 15;
//       } else if (cgpaPercent >= 75) {
//         if (admissionRate >= 0.25 && admissionRate <= 0.65) score += 25;
//         else if (admissionRate <= 0.25) score += 18;
//         else score += 20;
//       } else if (cgpaPercent >= 65) {
//         if (admissionRate >= 0.45) score += 25;
//         else if (admissionRate >= 0.25) score += 20;
//         else score += 15;
//       } else {
//         if (admissionRate >= 0.60) score += 25;
//         else if (admissionRate >= 0.40) score += 20;
//         else score += 15;
//       }
//     } else {
//       score += 12;
//     }

//     // Test Score Alignment (10 points)
//     maxScore += 10;
//     if (userProfile.test_scores && userProfile.test_scores.length > 0) {
//       const greScore = userProfile.test_scores.find(t => t.exam.toUpperCase() === 'GRE');
//       const satScore = userProfile.test_scores.find(t => t.exam.toUpperCase() === 'SAT');
//       const collegeSAT = college['latest.admissions.sat_scores.average.overall'];
      
//       if (satScore && collegeSAT) {
//         const satNum = parseFloat(satScore.score);
//         const diff = Math.abs(satNum - collegeSAT);
//         if (diff <= 50) score += 10;
//         else if (diff <= 100) score += 8;
//         else if (diff <= 150) score += 6;
//         else score += 4;
//       } else if (greScore) {
//         const greNum = parseFloat(greScore.score);
//         if (!isNaN(greNum)) {
//           if (greNum >= 325) score += 10;
//           else if (greNum >= 315) score += 9;
//           else if (greNum >= 305) score += 7;
//           else if (greNum >= 295) score += 5;
//           else score += 3;
//         }
//       } else {
//         score += 5;
//       }
//     } else {
//       score += 5;
//     }

//     // Location/Country Match (5 points)
//     maxScore += 5;
//     if (userProfile.country === 'USA') {
//       score += 5;
//     } else {
//       score += 3;
//     }

//     return Math.round((score / maxScore) * 100);
//   };

//   const fetchColleges = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const params = new URLSearchParams({
//         api_key: API_KEY,
//         fields: 'id,school.name,school.city,school.state,school.school_url,school.locale,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.admissions.admission_rate.overall,latest.admissions.sat_scores.average.overall,latest.admissions.sat_scores.midpoint.math,latest.admissions.sat_scores.midpoint.critical_reading,latest.admissions.act_scores.midpoint.cumulative,latest.admissions.act_scores.midpoint.math,latest.admissions.act_scores.midpoint.english,latest.student.size,latest.academics.program_available.bachelors,latest.academics.program_available.masters,latest.academics.program_available.doctorate,latest.academics.program_percentage.business_marketing,latest.academics.program_percentage.computer,latest.academics.program_percentage.health,latest.academics.program_percentage.education,latest.academics.program_percentage.engineering,latest.academics.program_percentage.biological,latest.academics.program_percentage.mathematics,latest.academics.program_percentage.physical_science,latest.academics.program_percentage.psychology,latest.academics.program_percentage.social_science'
//       });

//       if (viewMode === 'all') {
//         params.set('per_page', perPage.toString());
//         params.set('page', currentPage.toString());
        
//         if (searchQuery) params.append('school.name', searchQuery);
//         if (selectedState) params.append('school.state', selectedState);
//         if (selectedLocale) params.append('school.locale', selectedLocale);
//         if (minTuition && maxTuition) {
//           params.set('latest.cost.tuition.in_state__range', `${minTuition}..${maxTuition}`);
//         } else if (minTuition) {
//           params.append('latest.cost.tuition.in_state__range', `${minTuition}..`);
//         } else if (maxTuition) {
//           params.append('latest.cost.tuition.in_state__range', `..${maxTuition}`);
//         }

//         const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        
//         if (!response.ok) {
//           throw new Error(`API Error: ${response.status} ${response.statusText}`);
//         }

//         const data = await response.json();
//         setColleges(data.results || []);
//         setTotalResults(data.metadata?.total || 0);
//       } else if (viewMode === 'recommended' && userProfile) {
//         // Only show recommendations if country is USA
//         if (userProfile.country !== 'USA') {
//           setColleges([]);
//           setTotalResults(0);
//           setError('Recommendations are currently only available for students planning to study in the USA. Please update your profile country to USA to see recommendations.');
//           return;
//         }

//         params.set('per_page', '1000');
//         params.set('page', '0');
        
//         const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        
//         if (!response.ok) {
//           throw new Error(`API Error: ${response.status} ${response.statusText}`);
//         }

//         const data = await response.json();
//         const results = data.results || [];

//         const scoredColleges = results.map((college: College) => ({
//           ...college,
//           matchScore: calculateMatchScore(college)
//         }));

//         const programField = PROGRAM_TO_API_FIELD[userProfile.program];
//         const degreeType = userProfile.degree === 'UG' ? 'bachelors' : 
//                           userProfile.degree === 'PG' ? 'masters' : 
//                           userProfile.degree === 'PhD' ? 'doctorate' : null;
        
//         let filteredColleges = scoredColleges.filter((college: College) => {
//           if (degreeType) {
//             const hasProgram = college[`latest.academics.program_available.${degreeType}` as keyof College];
//             if (hasProgram !== 1) return false;
//           }
          
//           return (college.matchScore || 0) >= 30;
//         });

//         // If we have program field, try to prioritize colleges with that program
//         if (programField && filteredColleges.length < 3) {
//           filteredColleges = scoredColleges.filter((college: College) => {
//             if (degreeType) {
//               const hasProgram = college[`latest.academics.program_available.${degreeType}` as keyof College];
//               if (hasProgram !== 1) return false;
//             }
//             return (college.matchScore || 0) >= 20;
//           });
//         }

//         // If still not enough, lower the threshold further
//         if (filteredColleges.length < 3) {
//           filteredColleges = scoredColleges.filter((college: College) => {
//             if (degreeType) {
//               const hasProgram = college[`latest.academics.program_available.${degreeType}` as keyof College];
//               if (hasProgram === 1) return true;
//             }
//             return (college.matchScore || 0) >= 15;
//           });
//         }

//         // Final fallback - just get colleges with the right degree
//         if (filteredColleges.length < 3 && degreeType) {
//           filteredColleges = scoredColleges.filter((college: College) => {
//             const hasProgram = college[`latest.academics.program_available.${degreeType}` as keyof College];
//             return hasProgram === 1;
//           });
//         }

//         const recommendedColleges = filteredColleges
//           .sort((a: College, b: College) => (b.matchScore || 0) - (a.matchScore || 0))
//           .slice(0, 10);

//         setColleges(recommendedColleges);
//         setTotalResults(recommendedColleges.length);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to fetch colleges');
//       console.error('Error fetching colleges:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = () => {
//     setCurrentPage(0);
//     fetchColleges();
//   };

//   const resetFilters = () => {
//     setSearchQuery('');
//     setSelectedState('');
//     setSelectedLocale('');
//     setMinTuition('');
//     setMaxTuition('');
//     setCurrentPage(0);
//   };

//   const toggleSaved = (college: College) => {
//     try {
//       let currentShortlist: College[] = [];
//       let currentIds: number[] = [];
      
//       const saved = localStorage.getItem('shortlisted-colleges');
//       if (saved) {
//         const data = JSON.parse(saved);
//         currentShortlist = data.colleges || [];
//         currentIds = data.ids || [];
//       }

//       const newSaved = new Set(savedColleges);
//       let newShortlist = [...currentShortlist];
//       let newIds = [...currentIds];

//       if (newSaved.has(college.id)) {
//         newSaved.delete(college.id);
//         newShortlist = newShortlist.filter(c => c.id !== college.id);
//         newIds = newIds.filter(id => id !== college.id);
//       } else {
//         newSaved.add(college.id);
//         newShortlist.push(college);
//         newIds.push(college.id);
//       }

//       setSavedColleges(newSaved);
//       saveToStorage(newIds, newShortlist);
//     } catch (error) {
//       console.error('Error toggling saved college:', error);
//     }
//   };

//   const getMatchBadge = (college: College) => {
//     if (viewMode !== 'recommended' || !college.matchScore) return null;
    
//     const score = college.matchScore;
    
//     if (score >= 80) {
//       return <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
//         <Trophy size={14} />
//         Excellent Match ({score}%)
//       </span>;
//     } else if (score >= 65) {
//       return <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
//         <Award size={14} />
//         Great Match ({score}%)
//       </span>;
//     } else if (score >= 50) {
//       return <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
//         Good Match ({score}%)
//       </span>;
//     } else if (score >= 30) {
//       return <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
//         Match ({score}%)
//       </span>;
//     }
//     return <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-semibold">
//       Potential Match ({score}%)
//     </span>;
//   };

//   const formatCurrency = (amount: number | null) => {
//     if (amount === null || amount === undefined) return 'N/A';
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const formatPercent = (rate: number | null) => {
//     if (rate === null || rate === undefined) return 'N/A';
//     return `${(rate * 100).toFixed(1)}%`;
//   };

//   const formatNumber = (num: number | null) => {
//     if (num === null || num === undefined) return 'N/A';
//     return new Intl.NumberFormat('en-US').format(num);
//   };

//   const getStateName = (stateCode: string) => {
//     return US_STATES[stateCode as keyof typeof US_STATES] || stateCode;
//   };

//   const getPageNumbers = () => {
//     const pages: (number | string)[] = [];
//     const maxVisible = 5;
    
//     if (totalPages <= maxVisible) {
//       for (let i = 0; i < totalPages; i++) pages.push(i);
//     } else {
//       if (currentPage <= 2) {
//         for (let i = 0; i < 4; i++) pages.push(i);
//         pages.push('...');
//         pages.push(totalPages - 1);
//       } else if (currentPage >= totalPages - 3) {
//         pages.push(0);
//         pages.push('...');
//         for (let i = totalPages - 4; i < totalPages; i++) pages.push(i);
//       } else {
//         pages.push(0);
//         pages.push('...');
//         for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
//         pages.push('...');
//         pages.push(totalPages - 1);
//       }
//     }
//     return pages;
//   };

//   const hasProfileData = userProfile && userProfile.program && userProfile.country && userProfile.degree;
//   const canShowRecommendations = hasProfileData && userProfile?.country === 'USA';
//   const totalPages = Math.ceil(totalResults / perPage);
//   const activeFiltersCount = [searchQuery, selectedState, selectedLocale, minTuition, maxTuition].filter(Boolean).length;

//   return (
//     <DefaultLayout>
//     <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-red-600 mb-2">Find Your Perfect College</h1>
//           <p className="text-gray-600">Explore colleges and universities across the United States</p>
//         </div>

//         <div className="mb-6 flex gap-3">
//           <button
//             onClick={() => {
//               setViewMode('all');
//               setCurrentPage(0);
//             }}
//             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
//               viewMode === 'all'
//                 ? 'bg-red-600 text-white shadow-lg'
//                 : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
//             }`}
//           >
//             <GraduationCap size={20} />
//             All Colleges
//           </button>
//           <button
//             onClick={() => {
//               if (canShowRecommendations && !loadingProfile) {
//                 setViewMode('recommended');
//                 setCurrentPage(0);
//               }
//             }}
//             disabled={!canShowRecommendations || loadingProfile}
//             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
//               viewMode === 'recommended'
//                 ? 'bg-red-600 text-white shadow-lg'
//                 : canShowRecommendations && !loadingProfile
//                   ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
//                   : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
//             }`}
//             title={
//               !hasProfileData && !loadingProfile 
//                 ? 'Complete your profile (program, country, degree) to see recommendations' 
//                 : hasProfileData && userProfile?.country !== 'USA'
//                   ? 'Recommendations only available for USA colleges. Update country to USA.'
//                   : ''
//             }
//           >
//             <Sparkles size={20} />
//             Recommended For You
//             {!loadingProfile && !hasProfileData && <span className="text-xs ml-1">(Complete profile)</span>}
//             {!loadingProfile && hasProfileData && userProfile?.country !== 'USA' && <span className="text-xs ml-1">(USA only)</span>}
//           </button>
//         </div>

//         {viewMode === 'recommended' && userProfile && (
//           <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//             <div className="flex items-start gap-2">
//               <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
//               <div className="flex-1">
//                 <p className="text-sm font-semibold text-blue-900">Matching colleges based on your profile:</p>
//                 <p className="text-xs text-blue-700">
//                   Program: <strong>{userProfile.program}</strong> | 
//                   Country: <strong>{userProfile.country}</strong> | 
//                   Degree: <strong>{userProfile.degree}</strong> | 
//                   CGPA: <strong>{userProfile.last_course_cgpa}</strong>
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {viewMode === 'all' && (
//           <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-semibold flex items-center gap-2">
//                 <Filter size={20} className="text-red-600" />
//                 Filters {activeFiltersCount > 0 && (
//                   <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">{activeFiltersCount}</span>
//                 )}
//               </h2>
//               {activeFiltersCount > 0 && (
//                 <button onClick={resetFilters} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
//                   <X size={16} /> Clear All
//                 </button>
//               )}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//               <div className="relative">
//                 <select 
//                   className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   value={selectedState}
//                   onChange={(e) => setSelectedState(e.target.value)}
//                 >
//                   <option value="">All States</option>
//                   {Object.entries(US_STATES).map(([code, name]) => (
//                     <option key={code} value={code}>{name}</option>
//                   ))}
//                 </select>
//                 <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
//               </div>

//               <div className="relative">
//                 <select 
//                   className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   value={selectedLocale}
//                   onChange={(e) => setSelectedLocale(e.target.value)}
//                 >
//                   {Object.entries(LOCALE_TYPES).map(([value, label]) => (
//                     <option key={value} value={value}>{label}</option>
//                   ))}
//                 </select>
//                 <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
//               </div>

//               <div>
//                 <input
//                   type="number"
//                   placeholder="Min Tuition ($)"
//                   className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   value={minTuition}
//                   onChange={(e) => setMinTuition(e.target.value)}
//                 />
//               </div>

//               <div>
//                 <input
//                   type="number"
//                   placeholder="Max Tuition ($)"
//                   className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   value={maxTuition}
//                   onChange={(e) => setMaxTuition(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="relative mb-4">
//               <input
//                 type="text"
//                 placeholder="Search for colleges by name..."
//                 className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//               />
//               <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
//             </div>

//             <button
//               onClick={handleSearch}
//               className="w-full bg-red-600 text-white rounded-lg py-3 hover:bg-red-700 transition-colors font-medium"
//             >
//               Search Colleges
//             </button>
//           </div>
//         )}

//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
//             <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
//             <div>
//               <h3 className="font-semibold text-red-800">Notice</h3>
//               <p className="text-red-600 text-sm">{error}</p>
//             </div>
//           </div>
//         )}

//         <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
//           <div className="flex items-center gap-2">
//             <GraduationCap className="text-red-600" size={24} />
//             <span className="font-semibold text-lg">
//               {totalResults.toLocaleString()} {viewMode === 'recommended' ? 'recommended ' : ''}colleges found
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Heart className="text-red-600" size={18} />
//             <span className="text-sm text-gray-600">{savedColleges.size} saved</span>
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="text-gray-500 flex flex-col items-center gap-3">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
//               <p>Loading colleges...</p>
//             </div>
//           </div>
//         ) : colleges.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-lg shadow-sm">
//             <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
//             <h3 className="text-xl font-semibold text-gray-700 mb-2">
//               {viewMode === 'recommended' ? 'No recommended colleges found' : 'No colleges found'}
//             </h3>
//             <p className="text-gray-500">
//               {viewMode === 'recommended' 
//                 ? 'Try adjusting your profile information or check back later'
//                 : 'Try adjusting your filters or search query'}
//             </p>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {colleges.map((college) => (
//                 <div key={college.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex-1">
//                       <h3 className="font-semibold text-lg text-gray-800 mb-1">
//                         {college['school.name'] || 'Unknown College'}
//                       </h3>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
//                         <MapPin size={14} />
//                         <span>{college['school.city']}, {getStateName(college['school.state'])}</span>
//                       </div>
//                       {getMatchBadge(college)}
//                     </div>
//                     <button
//                       onClick={() => toggleSaved(college)}
//                       className={`transition-colors ${
//                         savedColleges.has(college.id) ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
//                       }`}
//                       title={savedColleges.has(college.id) ? 'Remove from shortlist' : 'Add to shortlist'}
//                     >
//                       <Heart size={20} fill={savedColleges.has(college.id) ? 'currentColor' : 'none'} />
//                     </button>
//                   </div>

//                   <div className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
//                       <div>
//                         <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
//                           <DollarSign size={14} />
//                           <span>In-State Tuition</span>
//                         </div>
//                         <p className="font-semibold text-gray-800 text-sm">
//                           {formatCurrency(college['latest.cost.tuition.in_state'])}
//                         </p>
//                       </div>
//                       <div>
//                         <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
//                           <DollarSign size={14} />
//                           <span>Out-of-State</span>
//                         </div>
//                         <p className="font-semibold text-gray-800 text-sm">
//                           {formatCurrency(college['latest.cost.tuition.out_of_state'])}
//                         </p>
//                       </div>
//                       <div>
//                         <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
//                           <Trophy size={14} />
//                           <span>Admission Rate</span>
//                         </div>
//                         <p className="font-semibold text-gray-800 text-sm">
//                           {formatPercent(college['latest.admissions.admission_rate.overall'])}
//                         </p>
//                       </div>
//                       <div>
//                         <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
//                           <Users size={14} />
//                           <span>Students</span>
//                         </div>
//                         <p className="font-semibold text-gray-800 text-sm">
//                           {formatNumber(college['latest.student.size'])}
//                         </p>
//                       </div>
//                     </div>

//                     {(college['latest.admissions.sat_scores.average.overall'] || 
//                       college['latest.admissions.act_scores.midpoint.cumulative']) && (
//                       <div className="pt-4 border-t border-gray-100">
//                         <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
//                           <Award size={14} className="text-red-600" />
//                           Test Scores
//                         </h4>
//                         <div className="grid grid-cols-2 gap-3">
//                           {college['latest.admissions.sat_scores.average.overall'] && (
//                             <div className="bg-blue-50 rounded-lg p-2">
//                               <div className="text-xs text-blue-600 mb-1">SAT Average</div>
//                               <p className="font-bold text-lg text-blue-700">
//                                 {Math.round(college['latest.admissions.sat_scores.average.overall'])}
//                               </p>
//                             </div>
//                           )}
//                           {college['latest.admissions.act_scores.midpoint.cumulative'] && (
//                             <div className="bg-green-50 rounded-lg p-2">
//                               <div className="text-xs text-green-600 mb-1">ACT Midpoint</div>
//                               <p className="font-bold text-lg text-green-700">
//                                 {Math.round(college['latest.admissions.act_scores.midpoint.cumulative'])}
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {(college['latest.academics.program_available.bachelors'] === 1 || 
//                       college['latest.academics.program_available.masters'] === 1 ||
//                       college['latest.academics.program_available.doctorate'] === 1) && (
//                       <div className="pt-4 border-t border-gray-100">
//                         <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
//                           <GraduationCap size={14} className="text-red-600" />
//                           Programs Offered
//                         </h4>
//                         <div className="flex flex-wrap gap-2">
//                           {college['latest.academics.program_available.bachelors'] === 1 && (
//                             <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
//                               Bachelors
//                             </span>
//                           )}
//                           {college['latest.academics.program_available.masters'] === 1 && (
//                             <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
//                               Masters
//                             </span>
//                           )}
//                           {college['latest.academics.program_available.doctorate'] === 1 && (
//                             <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">
//                               Doctorate
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     <div className="flex items-center gap-4 pt-4">
//                       {college['school.school_url'] && (
//                         <a
//                           href={college['school.school_url'].startsWith('http') 
//                             ? college['school.school_url'] 
//                             : `https://${college['school.school_url']}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="flex-1 bg-red-600 text-white rounded-lg py-2 px-4 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
//                         >
//                           <BookOpen size={16} />
//                           View Details
//                         </a>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {viewMode === 'all' && totalPages > 1 && (
//               <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
//                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//                   <div className="text-sm text-gray-600">
//                     Showing <span className="font-semibold">{currentPage * perPage + 1}</span> to{' '}
//                     <span className="font-semibold">{Math.min((currentPage + 1) * perPage, totalResults)}</span> of{' '}
//                     <span className="font-semibold">{totalResults.toLocaleString()}</span> colleges
//                   </div>
                  
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => {
//                         setCurrentPage(currentPage - 1);
//                         window.scrollTo({ top: 0, behavior: 'smooth' });
//                       }}
//                       disabled={currentPage === 0}
//                       className={`px-3 py-2 rounded-lg border flex items-center gap-1 ${
//                         currentPage === 0
//                           ? 'border-gray-200 text-gray-400 cursor-not-allowed'
//                           : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                       }`}
//                     >
//                       <ChevronLeft size={16} />
//                       <span className="hidden sm:inline">Previous</span>
//                     </button>
                    
//                     <div className="flex items-center gap-1">
//                       {getPageNumbers().map((page, index) => (
//                         <React.Fragment key={index}>
//                           {page === '...' ? (
//                             <span className="px-3 py-2 text-gray-400">...</span>
//                           ) : (
//                             <button
//                               onClick={() => {
//                                 setCurrentPage(page as number);
//                                 window.scrollTo({ top: 0, behavior: 'smooth' });
//                               }}
//                               className={`min-w-[40px] px-3 py-2 rounded-lg border transition-colors ${
//                                 currentPage === page
//                                   ? 'bg-red-600 text-white border-red-600'
//                                   : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                               }`}
//                             >
//                               {(page as number) + 1}
//                             </button>
//                           )}
//                         </React.Fragment>
//                       ))}
//                     </div>
                    
//                     <button
//                       onClick={() => {
//                         setCurrentPage(currentPage + 1);
//                         window.scrollTo({ top: 0, behavior: 'smooth' });
//                       }}
//                       disabled={currentPage === totalPages - 1}
//                       className={`px-3 py-2 rounded-lg border flex items-center gap-1 ${
//                         currentPage === totalPages - 1
//                           ? 'border-gray-200 text-gray-400 cursor-not-allowed'
//                           : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                       }`}
//                     >
//                       <span className="hidden sm:inline">Next</span>
//                       <ChevronRight size={16} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//      </div>
//     </DefaultLayout>
//   );
// };

// export default CourseFinder;

"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Heart, BookOpen, DollarSign, MapPin, Users, GraduationCap, Filter, X, ChevronLeft, ChevronRight, AlertCircle, Calendar, Globe, Award } from 'lucide-react';
import DefaultLayout from '../defaultLayout';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Course {
  id: number;
  University: string | null;
  'University Ranking': string | null;
  'Program Name': string | null;
  Concentration: string | null;
  'Website URL': string | null;
  Campus: string | null;
  Country: string | null;
  'Study Level': string | null;
  Duration: string | null;
  'Open Intakes': string | null;
  'Intake Year': string | null;
  'Entry Requirements': string | null;
  'IELTS Score': string | null;
  'IELTS No Band Less Than': string | null;
  'TOEFL Score': string | null;
  'Application Deadline': string | null;
  'Application Fee': string | null;
  'Yearly Tuition Fees': string | null;
  'Scholarship Available': string | null;
  'Backlog Range': string | null;
  Remarks: string | null;
  ApplicationMode: string | null;
  'English Proficiency Exam Waiver': string | null;
}

const CourseFinder: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedStudyLevel, setSelectedStudyLevel] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [savedCourses, setSavedCourses] = useState<Set<number>>(new Set());
  const perPage = 15;

  const countries = ['Italy']; // Based on your data
  const studyLevels = ['Undergraduate', 'Postgraduate'];

  useEffect(() => {
    fetchCourses();
    loadSavedCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCountry, selectedStudyLevel, selectedUniversity, courses]);

  const loadSavedCourses = () => {
    try {
      const saved = localStorage.getItem('shortlisted-courses');
      if (saved) {
        const data = JSON.parse(saved);
        setSavedCourses(new Set(data.ids || []));
      }
    } catch (error) {
      console.log('No saved courses found:', error);
    }
  };

  const saveToStorage = (ids: number[], courses: Course[]) => {
    try {
      localStorage.setItem('shortlisted-courses', JSON.stringify({ ids, courses }));
      window.dispatchEvent(new Event('shortlist-updated'));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('courses')
        .select('*')
        .order('id', { ascending: true });

      if (supabaseError) throw supabaseError;

      // Filter out rows where University is null (empty rows in your data)
      const validCourses = (data || []).filter(course => course.University !== null);
      setCourses(validCourses);
      setFilteredCourses(validCourses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course['Program Name']?.toLowerCase().includes(query) ||
        course.University?.toLowerCase().includes(query) ||
        course.Campus?.toLowerCase().includes(query)
      );
    }

    if (selectedCountry) {
      filtered = filtered.filter(course => course.Country === selectedCountry);
    }

    if (selectedStudyLevel) {
      filtered = filtered.filter(course => course['Study Level'] === selectedStudyLevel);
    }

    if (selectedUniversity) {
      filtered = filtered.filter(course => course.University === selectedUniversity);
    }

    setFilteredCourses(filtered);
    setCurrentPage(0);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('');
    setSelectedStudyLevel('');
    setSelectedUniversity('');
    setCurrentPage(0);
  };

  const toggleSaved = (course: Course) => {
    try {
      let currentShortlist: Course[] = [];
      let currentIds: number[] = [];
      
      const saved = localStorage.getItem('shortlisted-courses');
      if (saved) {
        const data = JSON.parse(saved);
        currentShortlist = data.courses || [];
        currentIds = data.ids || [];
      }

      const newSaved = new Set(savedCourses);
      let newShortlist = [...currentShortlist];
      let newIds = [...currentIds];

      if (newSaved.has(course.id)) {
        newSaved.delete(course.id);
        newShortlist = newShortlist.filter(c => c.id !== course.id);
        newIds = newIds.filter(id => id !== course.id);
      } else {
        newSaved.add(course.id);
        newShortlist.push(course);
        newIds.push(course.id);
      }

      setSavedCourses(newSaved);
      saveToStorage(newIds, newShortlist);
    } catch (error) {
      console.error('Error toggling saved course:', error);
    }
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(filteredCourses.length / perPage);
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i < 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push(0);
        pages.push('...');
        for (let i = totalPages - 4; i < totalPages; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages - 1);
      }
    }
    return pages;
  };

  const uniqueUniversities = Array.from(new Set(courses.map(c => c.University).filter(Boolean)));
  const totalPages = Math.ceil(filteredCourses.length / perPage);
  const activeFiltersCount = [searchQuery, selectedCountry, selectedStudyLevel, selectedUniversity].filter(Boolean).length;
  const paginatedCourses = filteredCourses.slice(currentPage * perPage, (currentPage + 1) * perPage);

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-red-600 mb-2">Find Your Perfect Course</h1>
            <p className="text-gray-600">Explore programs and universities in Italy</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Filter size={20} className="text-red-600" />
                Filters {activeFiltersCount > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">{activeFiltersCount}</span>
                )}
              </h2>
              {activeFiltersCount > 0 && (
                <button onClick={resetFilters} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                  <X size={16} /> Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <select 
                  className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
              </div>

              <div className="relative">
                <select 
                  className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={selectedStudyLevel}
                  onChange={(e) => setSelectedStudyLevel(e.target.value)}
                >
                  <option value="">All Study Levels</option>
                  {studyLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
              </div>

              <div className="relative md:col-span-2">
                <select 
                  className="appearance-none w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                >
                  <option value="">All Universities</option>
                  {uniqueUniversities.map((uni) => (
                    <option key={uni} value={uni || ''}>{uni}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-gray-500" />
              </div>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search for programs, universities, or campus..."
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>

            <button
              onClick={handleSearch}
              className="w-full bg-red-600 text-white rounded-lg py-3 hover:bg-red-700 transition-colors font-medium"
            >
              Search Courses
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-red-600" size={24} />
              <span className="font-semibold text-lg">
                {filteredCourses.length.toLocaleString()} courses found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="text-red-600" size={18} />
              <span className="text-sm text-gray-600">{savedCourses.size} saved</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p>Loading courses...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {paginatedCourses.map((course) => (
                  <div key={course.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800 mb-1">
                          {course['Program Name'] || 'Unknown Program'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <GraduationCap size={14} />
                          <span>{course.University}</span>
                        </div>
                        {course.Concentration && (
                          <div className="text-xs text-gray-600 mb-2">
                            <span className="font-medium">Concentration:</span> {course.Concentration}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => toggleSaved(course)}
                        className={`transition-colors ${
                          savedCourses.has(course.id) ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
                        }`}
                        title={savedCourses.has(course.id) ? 'Remove from shortlist' : 'Add to shortlist'}
                      >
                        <Heart size={20} fill={savedCourses.has(course.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <MapPin size={14} />
                            <span>Campus</span>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {course.Campus || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <Globe size={14} />
                            <span>Country</span>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {course.Country || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <Calendar size={14} />
                            <span>Duration</span>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {course.Duration || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <DollarSign size={14} />
                            <span>Tuition Fees</span>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {course['Yearly Tuition Fees'] || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {(course['Open Intakes'] || course['Application Deadline']) && (
                        <div className="pt-4 border-t border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <Calendar size={14} className="text-red-600" />
                            Intake Information
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {course['Open Intakes'] && (
                              <div className="bg-blue-50 rounded-lg p-2">
                                <div className="text-xs text-blue-600 mb-1">Open Intakes</div>
                                <p className="font-semibold text-sm text-blue-700">
                                  {course['Open Intakes']}
                                </p>
                              </div>
                            )}
                            {course['Application Deadline'] && (
                              <div className="bg-orange-50 rounded-lg p-2">
                                <div className="text-xs text-orange-600 mb-1">Deadline</div>
                                <p className="font-semibold text-sm text-orange-700">
                                  {course['Application Deadline']}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(course['IELTS Score'] || course['TOEFL Score']) && (
                        <div className="pt-4 border-t border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <Award size={14} className="text-red-600" />
                            English Requirements
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {course['IELTS Score'] && (
                              <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                                IELTS: {course['IELTS Score']}
                              </span>
                            )}
                            {course['TOEFL Score'] && (
                              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                                TOEFL: {course['TOEFL Score']}
                              </span>
                            )}
                            {course['English Proficiency Exam Waiver'] && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                                Waiver: {course['English Proficiency Exam Waiver']}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-4">
                        {course['Website URL'] && (
                          <a
                            href={course['Website URL'].startsWith('http') 
                              ? course['Website URL'] 
                              : `https://${course['Website URL']}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-red-600 text-white rounded-lg py-2 px-4 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <BookOpen size={16} />
                            View Details
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-semibold">{currentPage * perPage + 1}</span> to{' '}
                      <span className="font-semibold">{Math.min((currentPage + 1) * perPage, filteredCourses.length)}</span> of{' '}
                      <span className="font-semibold">{filteredCourses.length.toLocaleString()}</span> courses
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentPage(currentPage - 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === 0}
                        className={`px-3 py-2 rounded-lg border flex items-center gap-1 ${
                          currentPage === 0
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Previous</span>
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                          <React.Fragment key={index}>
                            {page === '...' ? (
                              <span className="px-3 py-2 text-gray-400">...</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setCurrentPage(page as number);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`min-w-[40px] px-3 py-2 rounded-lg border transition-colors ${
                                  currentPage === page
                                    ? 'bg-red-600 text-white border-red-600'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {(page as number) + 1}
                              </button>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => {
                          setCurrentPage(currentPage + 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === totalPages - 1}
                        className={`px-3 py-2 rounded-lg border flex items-center gap-1 ${
                          currentPage === totalPages - 1
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CourseFinder;