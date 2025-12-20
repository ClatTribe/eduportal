"use client"
import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  MapPin,
  DollarSign,
  Globe,
  Calendar,
  Award,
  X,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  BookOpen,
  Star
} from 'lucide-react';
import DefaultLayout from "../defaultLayout"
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";

interface Course {
  id: number
  University: string | null
  "University Ranking": string | null
  "Program Name": string | null
  Concentration: string | null
  "Website URL": string | null
  Campus: string | null
  Country: string | null
  "Study Level": string | null
  Duration: string | null
  "Open Intakes": string | null
  "Intake Year": string | null
  "Entry Requirements": string | null
  "IELTS Score": string | null
  "IELTS No Band Less Than": string | null
  "TOEFL Score": string | null
  "PTE Score": string | null
  "DET Score": string | null
  "Application Deadline": string | null
  "Application Fee": string | null
  "Yearly Tuition Fees": string | null
  "Scholarship Available": string | null
  "Backlog Range": string | null
  Remarks: string | null
  ApplicationMode: string | null
  "English Proficiency Exam Waiver": string | null
  matchScore?: number
}

const CourseComparePage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCompareCoursesFromDB();
    } else {
      fetchCompareCoursesFromLocalStorage();
    }
  }, [user]);

  const fetchCompareCoursesFromDB = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: compareData, error: compareError } = await supabase
        .from("compare_colleges")
        .select("college_id")
        .eq("user_id", user.id);
      if (compareError) throw compareError;
      if (!compareData || compareData.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }
      const collegeIds = compareData.map(item => item.college_id);
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .in("id", collegeIds);
      if (coursesError) throw coursesError;
      setCourses(coursesData || []);
    } catch (err) {
      console.error("Error fetching compare courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompareCoursesFromLocalStorage = () => {
    try {
      const compareIds = JSON.parse(localStorage.getItem('compareColleges') || '[]') as number[];
      if (compareIds.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }
      const cachedCourses = JSON.parse(localStorage.getItem('allColleges') || '[]') as Course[];
      const selectedCourses = cachedCourses.filter((c: Course) => compareIds.includes(c.id));
      setCourses(selectedCourses);
    } catch (err) {
      console.error("Error fetching from localStorage:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const removeCourse = async (id: number) => {
    if (!confirm("Are you sure you want to remove this course from comparison?")) return;
    try {
      if (user) {
        const { error } = await supabase.from("compare_colleges").delete().eq("user_id", user.id).eq("college_id", id);
        if (error) throw error;
      } else {
        const compareIds = JSON.parse(localStorage.getItem('compareColleges') || '[]') as number[];
        const updatedIds = compareIds.filter(cid => cid !== id);
        localStorage.setItem('compareColleges', JSON.stringify(updatedIds));
      }
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error removing course:", err);
      alert("Failed to remove course. Please try again.");
    }
  };

  const goBack = () => window.history.back();

  const resetComparison = async () => {
    if (!confirm("Are you sure you want to clear all comparisons?")) return;
    try {
      if (user) {
        const { error } = await supabase.from("compare_colleges").delete().eq("user_id", user.id);
        if (error) throw error;
      } else {
        localStorage.removeItem('compareColleges');
      }
      setCourses([]);
    } catch (err) {
      console.error("Error clearing comparisons:", err);
      alert("Failed to clear comparisons. Please try again.");
    }
  };

  const getLowestFees = (): number | null => {
    if (courses.length === 0) return null;
    const values = courses.map((c: Course) => {
      const val = c["Yearly Tuition Fees"];
      if (!val) return Infinity;
      const num = parseFloat(val.toString().replace(/[^0-9.]/g, ''));
      return isNaN(num) ? Infinity : num;
    });
    const minVal = Math.min(...values);
    return courses.find((c: Course) => {
      const val = c["Yearly Tuition Fees"];
      if (!val) return false;
      const num = parseFloat(val.toString().replace(/[^0-9.]/g, ''));
      return num === minVal;
    })?.id || null;
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center mt-[72px] sm:mt-0 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A51C30] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading comparison...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (courses.length === 0) {
    return (
      <DefaultLayout>
        <div className="min-h-screen p-6 mt-[72px] sm:mt-0 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto">
            <button onClick={goBack} className="flex items-center gap-2 text-[#A51C30] font-semibold mb-6 hover:opacity-80 transition-opacity">
              <ArrowLeft size={20} />
              Back to Courses
            </button>
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
              <GraduationCap size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Courses to Compare</h2>
              <p className="text-gray-600 mb-6">
                {user ? "Select 2-3 courses from the course finder to compare them" : "Login and select 2-3 courses from the course finder to compare them"}
              </p>
              <button onClick={goBack} className="bg-[#A51C30] text-white px-6 py-3 rounded-lg hover:bg-[#8A1828] transition-colors">
                Browse Courses
              </button>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const lowestFees = getLowestFees();

  return (
    <DefaultLayout>
      <div className="min-h-screen p-4 md:p-6 mt-[72px] sm:mt-0 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={goBack} className="flex items-center gap-2 text-[#A51C30] font-semibold hover:opacity-80 transition-opacity">
              <ArrowLeft size={20} />
              Back to Courses
            </button>
            <button onClick={resetComparison} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-[#A51C30] mb-2">Course Comparison</h1>
            <p className="text-gray-600">Comparing {courses.length} course{courses.length !== 1 ? 's' : ''} side by side</p>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#A51C30]">
                    <th className="p-4 text-left text-white font-semibold sticky left-0 z-10 bg-[#A51C30]">Category</th>
                    {courses.map((course: Course) => (
                      <th key={course.id} className="p-4 text-center text-white min-w-[280px]">
                        <div className="flex flex-col items-center gap-2">
                          <button onClick={() => removeCourse(course.id)} className="ml-auto text-white hover:text-red-200 transition-colors">
                            <X size={18} />
                          </button>
                          <h3 className="font-bold text-lg">{course.University}</h3>
                          <p className="text-sm font-normal opacity-90">{course["Program Name"]}</p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2"><MapPin size={16} className="text-[#A51C30]" />Campus</div>
                    </td>
                    {courses.map((c: Course) => (
                      <td key={c.id} className="p-4 text-center">{c.Campus ? <div className="text-sm font-medium text-gray-800">{c.Campus}</div> : <span className="text-gray-400 text-sm">N/A</span>}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2"><Globe size={16} className="text-[#A51C30]" />Country</div>
                    </td>
                    {courses.map((c: Course) => (
                      <td key={c.id} className="p-4 text-center">{c.Country ? <div className="text-sm font-medium text-gray-800">{c.Country}</div> : <span className="text-gray-400 text-sm">N/A</span>}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2"><Calendar size={16} className="text-[#A51C30]" />Duration</div>
                    </td>
                    {courses.map((c: Course) => (
                      <td key={c.id} className="p-4 text-center">{c.Duration ? <div className="text-sm font-medium text-gray-800">{c.Duration}</div> : <span className="text-gray-400 text-sm">N/A</span>}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2"><DollarSign size={16} className="text-[#A51C30]" />Tuition Fees</div>
                    </td>
                    {courses.map((c: Course) => (
                      <td key={c.id} className="p-4 text-center">
                        {c["Yearly Tuition Fees"] ? (
                          <div className={`font-semibold ${lowestFees === c.id ? 'text-green-600 bg-green-50 py-2 rounded-lg' : 'text-gray-800'}`}>
                            {c["Yearly Tuition Fees"]}
                            {lowestFees === c.id && <div className="text-xs text-green-600 mt-1">Most Affordable</div>}
                          </div>
                        ) : <span className="text-gray-400 text-sm">N/A</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2"><Calendar size={16} className="text-[#A51C30]" />Open Intakes</div>
                    </td>
                    {courses.map((c: Course) => (
                      <td key={c.id} className="p-4 text-center">{c["Open Intakes"] ? <div className="text-sm font-medium text-gray-800">{c["Open Intakes"]}</div> : <span className="text-gray-400 text-sm">N/A</span>}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2"><Award size={16} className="text-[#A51C30]" />IELTS</div>
                    </td>
                    {courses.map((c: Course) => (
                      <td key={c.id} className="p-4 text-center">{c["IELTS Score"] ? <div className="text-sm font-medium text-gray-800">{c["IELTS Score"]}</div> : <span className="text-gray-400 text-sm">N/A</span>}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2"><Award size={16} className="text-[#A51C30]" />TOEFL</div>
                    </td>
                    {courses.map((c: Course) => (
                      <td key={c.id} className="p-4 text-center">{c["TOEFL Score"] ? <div className="text-sm font-medium text-gray-800">{c["TOEFL Score"]}</div> : <span className="text-gray-400 text-sm">N/A</span>}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2"><Sparkles size={16} className="text-[#A51C30]" />Scholarship</div>
                    </td>
                    {courses.map((c: Course) => (
                      <td key={c.id} className="p-4 text-center">
                        {c["Scholarship Available"] === "Yes" ? (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                            <Sparkles size={12} />Available
                          </span>
                        ) : <span className="text-gray-400 text-sm">No</span>}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className={`grid ${courses.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-px bg-[#A51C30]`}>
                {courses.map((c: Course) => (
                  <div key={c.id} className="p-3 text-center relative">
                    <button onClick={() => removeCourse(c.id)} className="absolute top-2 right-2 text-white hover:text-red-200 z-10">
                      <X size={16} />
                    </button>
                    <h3 className="font-bold text-xs text-white leading-tight pr-6">{c.University}</h3>
                  </div>
                ))}
              </div>
              <div className="divide-y divide-gray-200">
                {['Campus', 'Country', 'Duration', 'Tuition Fees', 'Open Intakes', 'IELTS', 'TOEFL', 'Scholarship'].map((label) => (
                  <div key={label} className={`grid ${courses.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-px bg-gray-200`}>
                    {courses.map((c: Course) => {
                      let value = '';
                      if (label === 'Campus') value = c.Campus || '';
                      else if (label === 'Country') value = c.Country || '';
                      else if (label === 'Duration') value = c.Duration || '';
                      else if (label === 'Tuition Fees') value = c["Yearly Tuition Fees"] || '';
                      else if (label === 'Open Intakes') value = c["Open Intakes"] || '';
                      else if (label === 'IELTS') value = c["IELTS Score"] || '';
                      else if (label === 'TOEFL') value = c["TOEFL Score"] || '';
                      else if (label === 'Scholarship') value = c["Scholarship Available"] === "Yes" ? "Yes" : "No";
                      
                      return (
                        <div key={c.id} className="p-3 text-center bg-white">
                          {value ? (
                            <div>
                              <p className={`text-xs font-medium ${label === 'Tuition Fees' && lowestFees === c.id ? 'text-green-600' : 'text-gray-800'}`}>{value}</p>
                              <p className="text-gray-500 text-[9px] mt-1">({label})</p>
                            </div>
                          ) : (
                            <div>
                              <span className="text-gray-400 text-xs">N/A</span>
                              <p className="text-gray-500 text-[9px] mt-1">({label})</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CourseComparePage;