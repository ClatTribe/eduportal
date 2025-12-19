import React, { useState, useEffect } from 'react';
import { 
  Heart,
  BookOpen,
  DollarSign,
  MapPin,
  GraduationCap,
  Calendar,
  Globe,
  Award,
  Sparkles,
  Trophy,
  Target,
  Users,
  AlertCircle
} from 'lucide-react';

// Types
interface Course {
  id: number;
  University: string | null;
  Campus: string | null;
  Country: string | null;
}

interface Scholarship {
  id: number;
  scholarship_name: string;
  organisation: string;
  deadline: string;
}

interface AdmitProfile {
  name: string;
  univ: string;
  status: string;
}

interface CourseFeaturesProps {
  activeTab?: 'courses' | 'scholarships' | 'admits';
}

export const CourseFeatures: React.FC<CourseFeaturesProps> = ({ activeTab = 'courses' }) => {
  const [currentTab, setCurrentTab] = useState<'courses' | 'scholarships' | 'admits'>(activeTab);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<Set<number>>(new Set());

  const accentColor = '#A51C30';

  // Dummy data for courses - simplified
  const courses: Course[] = [
  { id: 1, University: "Harvard University", Campus: "Cambridge, Massachusetts", Country: "USA" },
  { id: 2, University: "Stanford University", Campus: "Stanford, California", Country: "USA" },
  { id: 3, University: "University of Oxford", Campus: "Oxford", Country: "UK" },
  { id: 4, University: "University of Cambridge", Campus: "Cambridge", Country: "UK" },
  { id: 5, University: "London Business School", Campus: "London", Country: "UK" },
  { id: 6, University: "INSEAD", Campus: "Fontainebleau", Country: "France" },
  { id: 7, University: "HEC Paris", Campus: "Jouy-en-Josas", Country: "France" },
  { id: 8, University: "University of Toronto", Campus: "Toronto", Country: "Canada" },
  { id: 9, University: "University of Melbourne", Campus: "Melbourne", Country: "Australia" },
  { id: 10, University: "National University of Singapore", Campus: "Singapore", Country: "Singapore" },
  { id: 11, University: "ETH Zurich", Campus: "Zurich", Country: "Switzerland" },
  { id: 12, University: "Technical University of Munich", Campus: "Munich", Country: "Germany" }
];


 const scholarships: Scholarship[] = [
  { id: 1, scholarship_name: "Harvard Global Scholarship", organisation: "Harvard University", deadline: "2025-03-15" },
  { id: 2, scholarship_name: "Stanford Knight-Hennessy Scholars", organisation: "Stanford University", deadline: "2025-04-01" },
  { id: 3, scholarship_name: "Rhodes Scholarship", organisation: "University of Oxford", deadline: "2025-03-20" },
  { id: 4, scholarship_name: "Cambridge Trust Scholarship", organisation: "University of Cambridge", deadline: "2025-04-10" },
  { id: 5, scholarship_name: "LBS Fund Scholarship", organisation: "London Business School", deadline: "2025-03-25" },
  { id: 6, scholarship_name: "INSEAD Diversity Scholarship", organisation: "INSEAD", deadline: "2025-04-05" },
  { id: 7, scholarship_name: "HEC Paris Excellence Award", organisation: "HEC Paris", deadline: "2025-03-30" },
  { id: 8, scholarship_name: "Ontario Graduate Scholarship", organisation: "University of Toronto", deadline: "2025-04-15" },
  { id: 9, scholarship_name: "Melbourne International Scholarship", organisation: "University of Melbourne", deadline: "2025-03-18" },
  { id: 10, scholarship_name: "NUS Global Merit Scholarship", organisation: "National University of Singapore", deadline: "2025-04-20" }
];

  // Dummy data for admits
  const admitProfiles: AdmitProfile[] = [
    { name: "Sarah Johnson", univ: "Harvard Business School", status: "Admitted" },
    { name: "Raj Patel", univ: "Stanford GSB", status: "Admitted" },
    { name: "Emma Chen", univ: "London Business School", status: "Waitlisted" },
    { name: "Mohammed Ali", univ: "INSEAD", status: "Admitted" },
    { name: "Lisa Anderson", univ: "MIT Sloan", status: "Admitted" },
    { name: "Carlos Rodriguez", univ: "Wharton School", status: "Waitlisted" }
  ];

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentTab]);

  const toggleSaved = (id: number) => {
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDeadline = (dateString: string) => {
    if (!dateString || dateString === "") return "Check website";

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

  const renderContent = () => {
    if (currentTab === 'courses') {
      return (
        <>
          <div className="border-b border-gray-200 pb-3 flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase"
                   style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                <BookOpen className="w-4 h-4" />
                Course Finder
              </div>
              <GraduationCap className="w-7 h-7 text-gray-400" />
            </div>

            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 tracking-tight"
                style={{ color: accentColor }}>
              Find Your Perfect Course
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              Explore programs and universities worldwide
            </p>
          </div>

          <div className="flex-1 overflow-hidden relative min-h-0">
            {loading ? (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" 
                     style={{ borderColor: accentColor }}></div>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto h-full pr-2 pb-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                         style={{ 
                           backgroundColor: `${accentColor}15`,
                           border: `1px solid ${accentColor}30`,
                           color: accentColor 
                         }}>
                      <GraduationCap size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base text-gray-900 mb-2">
                        {course.University}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={14} style={{ color: accentColor }} className="flex-shrink-0" />
                        <span className="truncate">{course.Campus}, {course.Country}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSaved(course.id)}
                      className={`transition-colors ml-2 flex-shrink-0 ${
                        savedItems.has(course.id) ? 'text-[#A51C30]' : 'text-gray-400 hover:text-[#A51C30]'
                      }`}
                    >
                      <Heart size={20} fill={savedItems.has(course.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      );
    }

    if (currentTab === 'scholarships') {
      return (
        <>
          <div className="border-b border-gray-200 pb-3 flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase"
                   style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                <Sparkles className="w-4 h-4" />
                Scholarship Finder
              </div>
              <Award className="w-7 h-7 text-gray-400" />
            </div>

            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 tracking-tight"
                style={{ color: accentColor }}>
              Find Scholarships to Fuel Your Dreams
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              Discover financial aid opportunities worldwide
            </p>
          </div>

          <div className="flex-1 overflow-hidden relative min-h-0">
            {loading ? (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" 
                     style={{ borderColor: accentColor }}></div>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto h-full pr-2 pb-4">
                {scholarships.map((scholarship) => (
                  <div
                    key={scholarship.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ 
                             backgroundColor: `${accentColor}15`,
                             border: `1px solid ${accentColor}30`,
                             color: accentColor 
                           }}>
                        <Award size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm mb-2 break-words">
                          {scholarship.scholarship_name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                          <Globe size={12} style={{ color: accentColor }} className="flex-shrink-0" />
                          <span className="break-words">{scholarship.organisation}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar size={12} style={{ color: accentColor }} className="flex-shrink-0" />
                          <span className="break-words"><strong>Deadline:</strong> {formatDeadline(scholarship.deadline)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSaved(scholarship.id)}
                        className={`transition-colors flex-shrink-0 ${
                          savedItems.has(scholarship.id) ? 'text-[#A51C30]' : 'text-gray-400 hover:text-[#A51C30]'
                        }`}
                      >
                        <Heart size={18} fill={savedItems.has(scholarship.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      );
    }

    // Admits tab
    return (
      <>
        <div className="border-b border-gray-200 pb-3 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase"
                 style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
              <Target className="w-4 h-4" />
              Admit Finder
            </div>
            <Users className="w-7 h-7 text-gray-400" />
          </div>

          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 tracking-tight"
              style={{ color: accentColor }}>
            Access 375K+ Admits & Rejects!
          </h3>
          <p className="text-xs md:text-sm text-gray-600">
            Find folks at your dream school with the same background as you
          </p>
        </div>

        <div className="flex-1 overflow-hidden relative min-h-0">
          {loading ? (
            <div className="flex justify-center items-center h-full min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" 
                   style={{ borderColor: accentColor }}></div>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto h-full pr-2 pb-4">
              {admitProfiles.map((item, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                         style={{ 
                           backgroundColor: `${accentColor}15`,
                           border: `1px solid ${accentColor}30`,
                           color: accentColor 
                         }}>
                      <GraduationCap size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm mb-2">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                        <Users size={12} style={{ color: accentColor }} />
                        <span>{item.univ}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.status === 'Admitted' 
                          ? 'bg-green-500/20 text-green-700 border border-green-500/30' 
                          : 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="w-full h-full p-1 rounded-2xl" 
         style={{ background: `linear-gradient(to bottom right, ${accentColor}, #8A1828)` }}>
      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 backdrop-blur-xl rounded-xl p-4 md:p-6 flex flex-col gap-4 border border-gray-200 shadow-2xl">
        {renderContent()}
      </div>
    </div>
  );
};