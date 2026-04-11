"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Globe, Calendar, DollarSign, BookOpen, Award,
  GraduationCap, Clock, FileText, ExternalLink, Sparkles, CheckCircle,
  AlertCircle, Languages, ChevronLeft, ChevronRight, Play
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import DefaultLayout from "../../defaultLayout";
import CourseMatchCard from "../../../../components/CourseMatchCard";

interface Course {
  id: number;
  University: string | null;
  "University Ranking": string | null;
  "Program Name": string | null;
  Concentration: string | null;
  "Website URL": string | null;
  Campus: string | null;
  Country: string | null;
  "Study Level": string | null;
  Duration: string | null;
  "Open Intakes": string | null;
  "Intake Year": string | null;
  "Entry Requirements": string | null;
  "IELTS Score": string | null;
  "IELTS No Band Less Than": string | null;
  "TOEFL Score": string | null;
  "PTE Score": string | null;
  "DET Score": string | null;
  "Application Deadline": string | null;
  "Application Fee": string | null;
  "Yearly Tuition Fees": string | null;
  "Scholarship Available": string | null;
  "Scholarship Detail": string | null;
  "Backlog Range": string | null;
  Remarks: string | null;
  "ESL/ELP Detail": string | null;
  ApplicationMode: string | null;
  "English Proficiency Exam Waiver": string | null;
  "PTE No Band Less Than": string | null;
  image: string | null;
  video: string | null;
}

const parseMedia = (m: string | null): string[] => {
  if (!m) return [];
  try {
    const p = JSON.parse(m);
    return Array.isArray(p) ? p : [m];
  } catch { return [m]; }
};

const isDeadlineLive = (deadline: string | null): boolean => {
  if (!deadline) return false;
  try {
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return false;
    return deadlineDate > new Date();
  } catch { return false; }
};

const formatDeadline = (deadline: string | null): string => {
  if (!deadline) return "";
  try {
    const d = new Date(deadline);
    if (isNaN(d.getTime())) return deadline;
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return deadline; }
};

export default function CourseMicrosite() {
  const params = useParams();
  const courseId = params?.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    if (courseId) fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsLoggedIn(true);
          const { data: profile } = await supabase
            .from("admit_profiles")
            .select("name, degree, city")
            .eq("user_id", user.id)
            .single();
          if (profile?.name && profile?.degree) setIsProfileComplete(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch { setIsLoggedIn(false); }
    };
    checkAuth();
  }, []);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", Number(courseId))
        .single();
      if (supabaseError) throw supabaseError;
      setCourse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch course details");
    } finally {
      setLoading(false);
    }
  };

  const rankings = parseRankings(course?.["University Ranking"] || null);
  const mediaItems = course ? [
    ...parseMedia(course.image).map(url => ({ type: 'image', url })),
    ...parseMedia(course.video).map(url => ({ type: 'video', url })),
  ] : [];

  useEffect(() => {
    if (mediaItems.length > 1 && !isPlaying && !isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % mediaItems.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [mediaItems.length, isPlaying, isPaused]);

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "fees", label: "Fees & Duration" },
    { id: "admission", label: "Admission" },
    { id: "english", label: "English Requirements" },
    { id: "contact", label: "Contact" },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  function parseRankings(ranking: string | null) {
    if (!ranking) return [];
    return ranking.split(/\s{2,}/).map((r) => r.trim()).filter(Boolean);
  }

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
          <div className="text-gray-500 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A51C30]"></div>
            <p className="font-medium">Curating course details...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error || !course) {
    return (
      <DefaultLayout>
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md border border-gray-100">
            <AlertCircle size={48} className="mx-auto text-[#A51C30] mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "The course you're looking for doesn't exist."}</p>
            <Link href="/course-finder" className="inline-flex items-center gap-2 bg-[#A51C30] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#8A1828] transition-all transform hover:scale-105">
              <ArrowLeft size={18} />
              Back to Course Finder
            </Link>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const hasEnglishRequirements = course["IELTS Score"] || course["TOEFL Score"] || course["PTE Score"] || course["DET Score"];
  const deadlineLive = isDeadlineLive(course["Application Deadline"]);
  const current = mediaItems[currentSlide];
  
  const getYouTubeId = (url: string) => {
    const m = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return m ? m[1] : null;
  };
  const ytId = current?.type === 'video' ? getYouTubeId(current.url) : null;

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen mt-18 sm:mt-0">

        {/* --- HERO HEADER --- */}
        <div className="relative bg-[#A51C30] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#A51C30] via-[#8A1828] to-[#5a121c]" />
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-16">
            {/* Back Button */}
            <Link href="/course-finder" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 sm:mb-8 transition-all hover:-translate-x-1 group">
              <ArrowLeft size={16} className="group-hover:scale-110 transition-transform" />
              Back to Course Finder
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center gap-6 sm:gap-10 xl:gap-16">
              
              {/* MOBILE IMAGE PRIORITY - Visible only on Mobile (<1024px) */}
              {mediaItems.length > 0 && (
                <div 
                  className="block lg:hidden w-full group"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-black">
                    {current.type === 'image' ? (
                      <img key={current.url} src={current.url} alt="Campus" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full">
                        {/* Video components remain same as desktop but smaller for mobile grid */}
                        {!isPlaying ? (
                          <div className="relative w-full h-full cursor-pointer" onClick={() => setIsPlaying(true)}>
                             <img src={ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ""} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 flex items-center justify-center bg-black/30"><Play size={32} fill="white"/></div>
                          </div>
                        ) : (
                          <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} frameBorder="0" allowFullScreen />
                        )}
                      </div>
                    )}
                    {mediaItems.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {mediaItems.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all ${i === currentSlide ? 'bg-white w-4' : 'bg-white/30 w-1'}`} />
                            ))}
                        </div>
                    )}
                  </div>
                </div>
              )}

              {/* LEFT CONTENT */}
              <div className="flex-1 space-y-4 sm:space-y-6">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white">
                      <MapPin size={10} className="text-red-300" />
                      {course.Campus || "N/A"}{course.Country ? `, ${course.Country}` : ""}
                    </span>
                    {deadlineLive && (
                      <span className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                        <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                          <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative rounded-full h-full w-full bg-emerald-400"></span>
                        </span>
                        ADMISSIONS OPEN
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-sm">
                    {course.University}
                  </h1>
                  <p className="text-base sm:text-2xl text-white/80 font-medium max-w-2xl leading-snug">
                    {course["Program Name"] || "Program Details"}
                  </p>
                </div>

                {/* HERO STATS - SINGLE ROW ON MOBILE */}
                <div className="flex flex-row justify-between sm:grid sm:grid-cols-3 gap-2 sm:gap-6 pt-4 sm:pt-8 border-t border-white/10 overflow-hidden">
                  <div className="flex-1 sm:block">
                    <p className="text-white/50 text-[8px] sm:text-[10px] uppercase font-black tracking-widest mb-0.5 sm:mb-1">Duration</p>
                    <p className="text-white text-[11px] sm:text-base font-bold flex items-center gap-1 sm:gap-2"><Clock size={12} className="text-red-300 shrink-0"/> {course.Duration || "N/A"}</p>
                  </div>
                  <div className="flex-1 sm:block border-x border-white/10 px-2 sm:border-none sm:px-0 text-center sm:text-left">
                    <p className="text-white/50 text-[8px] sm:text-[10px] uppercase font-black tracking-widest mb-0.5 sm:mb-1">Scholarship</p>
                    <p className="text-white text-[11px] sm:text-base font-bold flex items-center justify-center sm:justify-start gap-1 sm:gap-2"><Award size={12} className="text-red-300 shrink-0"/> {course["Scholarship Available"] || "N/A"}</p>
                  </div>
                  <div className="flex-1 sm:block text-right sm:text-left">
                    <p className="text-white/50 text-[8px] sm:text-[10px] uppercase font-black tracking-widest mb-0.5 sm:mb-1">Level</p>
                    <p className="text-white text-[11px] sm:text-base font-bold flex items-center justify-end sm:justify-start gap-1 sm:gap-2"><GraduationCap size={12} className="text-red-300 shrink-0"/> {course["Study Level"] || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* DESKTOP MEDIA SLIDER - Hidden on Mobile */}
              {mediaItems.length > 0 && (
                <div 
                  className="hidden lg:block w-[45%] group perspective-1000" 
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)} 
                >
                  <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black transition-all duration-500 group-hover:scale-[1.02]">
                    {current.type === 'image' ? (
                      <img key={current.url} src={current.url} alt="Campus" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full">
                         {!isPlaying ? (
                          <div className="relative w-full h-full cursor-pointer" onClick={() => setIsPlaying(true)}>
                             <img src={ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : ""} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Play size={50} fill="white"/></div>
                          </div>
                        ) : (
                          <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} frameBorder="0" allowFullScreen />
                        )}
                      </div>
                    )}
                    {mediaItems.length > 1 && (
                      <>
                        <button onClick={() => setCurrentSlide(p => (p - 1 + mediaItems.length) % mediaItems.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><ChevronLeft/></button>
                        <button onClick={() => setCurrentSlide(p => (p + 1) % mediaItems.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><ChevronRight/></button>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                           {mediaItems.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'bg-white w-8' : 'bg-white/30 w-1.5'}`} />))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- STICKY NAVIGATION --- */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <nav className="flex gap-2 overflow-x-auto scrollbar-hide -mb-px">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`whitespace-nowrap px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all border-b-2 ${
                    activeSection === section.id ? "border-[#A51C30] text-[#A51C30]" : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {course && (
            <div className="mb-8">
              <CourseMatchCard course={course} isLoggedIn={isLoggedIn} isProfileComplete={isProfileComplete} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <section id="overview" className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                    <span className="text-[10px] font-bold text-[#A51C30] uppercase tracking-widest">Program Profile</span>
                    <h2 className="text-2xl font-bold text-gray-900 mt-0.5">About This Program<span className="text-[#A51C30]">.</span></h2>
                </div>
                <div className="px-6 py-6">
                  <p className="text-gray-600 leading-relaxed text-lg mb-8">
                    {course["Program Name"]} at <span className="font-bold text-gray-900">{course.University}</span> is a <span className="font-bold text-[#A51C30]">{course["Study Level"]?.toLowerCase() || ""}</span> degree 
                    {course.Duration ? ` designed for a duration of ${course.Duration}` : ""}
                    {course.Campus ? `, based in ${course.Campus}` : ""}
                    {course.Country ? `, ${course.Country}` : ""}.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Study Level", val: course["Study Level"], icon: GraduationCap },
                      { label: "Duration", val: course.Duration, icon: Clock },
                      { label: "Country", val: course.Country, icon: Globe },
                      { label: "Scholarship", val: course["Scholarship Available"], icon: Award },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 text-center">
                        <item.icon size={20} className="mx-auto text-[#A51C30] mb-2" />
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">{item.label}</p>
                        <p className="font-bold text-sm text-gray-800">{item.val || "N/A"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Fees */}
              <section id="fees" className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                  <span className="text-[10px] font-bold text-[#A51C30] uppercase tracking-widest">Financials</span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-0.5">Fees & Duration<span className="text-[#A51C30]">.</span></h2>
                </div>
                <div className="px-6 py-6 overflow-x-auto">
                    <table className="w-full text-left min-w-[300px]">
                      <tbody className="divide-y divide-gray-200">
                        {[
                          { label: "Duration", value: course.Duration },
                          { label: "Yearly Tuition Fees", value: course["Yearly Tuition Fees"], highlight: true },
                          { label: "Application Fee", value: course["Application Fee"] },
                        ].filter(r => r.value).map((row, i) => (
                          <tr key={i}>
                            <td className="py-4 px-2 sm:px-6 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">{row.label}</td>
                            <td className={`py-4 px-2 sm:px-6 text-xs sm:text-sm font-bold ${row.highlight ? 'text-[#A51C30] text-lg' : 'text-gray-900'}`}>{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </section>

              {/* Admission */}
              <section id="admission" className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                  <span className="text-[10px] font-bold text-[#A51C30] uppercase tracking-widest">Enrollment</span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-0.5">Admission Details<span className="text-[#A51C30]">.</span></h2>
                </div>
                <div className="px-6 py-6">
                  <div className="space-y-4">
                    {course["Open Intakes"] && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-xs sm:text-sm font-bold text-gray-600">Available Intakes</span>
                            <span className="text-xs sm:text-sm font-black text-gray-900">{course["Open Intakes"]}</span>
                        </div>
                    )}
                    {course["Application Deadline"] && (
                        <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100/50">
                            <span className="text-xs sm:text-sm font-bold text-gray-600">Deadline</span>
                            <span className="text-xs sm:text-sm font-black text-[#A51C30]">{formatDeadline(course["Application Deadline"])}</span>
                        </div>
                    )}
                  </div>
                </div>
              </section>

              {/* English */}
              {hasEnglishRequirements && (
                <section id="english" className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <span className="text-[10px] font-bold text-[#A51C30] uppercase tracking-widest">Proficiency</span>
                    <h2 className="text-2xl font-bold text-gray-900 mt-0.5">English Requirements<span className="text-[#A51C30]">.</span></h2>
                  </div>
                  <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {course["IELTS Score"] && (
                        <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-5 border border-red-100 text-center sm:text-left">
                          <p className="font-black text-[#A51C30] tracking-widest text-[10px] mb-4">IELTS</p>
                          <div className="text-3xl sm:text-4xl font-black text-gray-900">{course["IELTS Score"]}</div>
                        </div>
                      )}
                      {course["PTE Score"] && (
                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-5 border border-purple-100 text-center sm:text-left">
                          <p className="font-black text-purple-700 tracking-widest text-[10px] mb-4">PTE</p>
                          <div className="text-3xl sm:text-4xl font-black text-gray-900">{course["PTE Score"]}</div>
                        </div>
                      )}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-6">
              <section id="contact" className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg lg:sticky lg:top-20">
                <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Apply Today<span className="text-[#A51C30]">.</span></h3>
                </div>
                <div className="px-6 py-6 space-y-6">
                    <Link href={`/application-builder?course_id=${course.id}`} className="w-full flex items-center justify-center gap-2 bg-[#A51C30] text-white py-4 rounded-xl font-bold hover:bg-[#8A1828] transition-all shadow-lg active:scale-95">
                      <Sparkles size={18} /> Apply for this Course
                    </Link>
                </div>
              </section>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Quick Facts</h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  {[
                    { icon: Clock, label: "Duration", value: course.Duration },
                    { icon: DollarSign, label: "Tuition", value: course["Yearly Tuition Fees"] },
                    { icon: Globe, label: "Country", value: course.Country },
                  ].filter(i => i.value).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <item.icon size={16} className="text-[#A51C30] shrink-0" />
                      <div>
                        <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                        <p className="text-xs sm:text-sm font-bold text-gray-800">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}