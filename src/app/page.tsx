"use client";
import React, { useState, useEffect } from "react";
import { BookOpen, GraduationCap, Target, ArrowRight, Menu, X, ChevronRight, LogOut, User, Users, CheckCircle2, } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { TrustSection } from "../../components/TrustSection";
import { PainPoints } from "../../components/PainPoints";
import PlaneRoadmap from "../../components/PlaneRoadmap";
import { Testimonial } from "../../components/Testimonial";
import { CourseFeatures } from "../../components/CourseFeatures";
import { Navbar } from "../../components/Navbar";

const features = [
  {
    id: "courses",
    title: "Find Courses",
    description: "Find your perfect stream based on your actual grades and interests.",
    icon: BookOpen,
    component: () => <CourseFeatures activeTab="courses" />,
    cta: "Find Courses",
  },
  {
    id: "scholarships",
    title: "Find Scholarships",
    description: "Match with thousands of financial aid opportunities instantly.",
    icon: GraduationCap,
    component: () => <CourseFeatures activeTab="scholarships" />,
    cta: "Find Scholarships",
  },
  {
    id: "admits",
    title: "Find Admits",
    description: "See real profiles of students who got into your dream colleges.",
    icon: Target,
    component: () => <CourseFeatures activeTab="admits" />,
    cta: "See Admits",
  },
];

// 3 sub-headings that animate below the frozen main heading
const SUB_HEADINGS = [
  { text: "Without the Noise", isCustom: false },
  { text: "3 Click Promise", isCustom: false },
  { isCustom: true },
];

export default function Hero() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SUB_HEADINGS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleFeatureClick = (index: number) => {
    setActiveFeature(index);
    setAutoPlay(false);
  };

  const ActiveComponent = features[activeFeature].component;

  return (
    <>
      <Navbar />

      <section id="features" className="relative pt-36 pb-20 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
          <div
            className="relative bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://res.cloudinary.com/daetdadtt/image/upload/v1764789875/university_optimized_9000_pyiilj.png')",
            }}
          >
            <div className="flex flex-col items-center text-center mb-12 sm:mb-20 bg-white/50 backdrop-blur-xs py-10 sm:py-12 md:py-16">

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-sm mb-4 sm:mb-6 group cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A51C30] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A51C30]"></span>
                </span>
                <Link href="/home" className="text-xs font-bold text-slate-600 tracking-wide ">
                  New: Admit Finder 2.0 is live
                </Link>
                <ArrowRight size={12} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </motion.div>

              {/* ── HEADING BLOCK ── */}
              <div className="flex flex-col items-center mb-6 sm:mb-8 px-4">

                {/* FROZEN main heading — always visible, never animates out */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="text-3xl sm:text-5xl md:text-8xl font-bold tracking-tight leading-[1.1] py-1 whitespace-nowrap"
                >
                  <span className="bg-gradient-to-t from-slate-900 via-slate-900 to-slate-900 bg-clip-text text-transparent">
                    Your Dream University
                  </span>
                </motion.h1>

                {/* ANIMATED sub-heading carousel — one size smaller */}
                <div className="relative flex items-center justify-center w-full min-h-[56px] sm:min-h-[72px] md:min-h-[88px] mt-1 overflow-visible">
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={`sub-heading-${currentSlide}`}
                      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] py-1 px-2 whitespace-nowrap"
                    >
                      {SUB_HEADINGS[currentSlide].isCustom ? (
                        <span className="flex flex-row items-center justify-center gap-2 md:gap-[0.3ch]">
                          <span className="bg-gradient-to-t from-slate-900 via-slate-900 to-slate-900 bg-clip-text text-transparent">
                            EduAbroad
                          </span>
                          <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#E0314B] to-[#7A1524] font-black [text-shadow:_0_0_1px_#A51C30,0_0_1px_#A51C30]">
                            है न !
                          </span>
                        </span>
                      ) : (
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#E0314B] to-[#7A1524] block">
                          {SUB_HEADINGS[currentSlide].text}
                        </span>
                      )}
                    </motion.h2>
                  </AnimatePresence>
                </div>

              </div>
              {/* ── END HEADING BLOCK ── */}

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-4 sm:mb-6 px-2"
              >
                EduAbroad helps you find the right course, secure scholarships,
                and connect with alumni—all while keeping your data 100% private.
              </motion.p>

              <Link href={user ? "/home" : "/register"}>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-900 text-white rounded-full font-bold text-base sm:text-lg hover:bg-slate-800 transition-all shadow-xl hover:-translate-y-1 flex items-center gap-2 cursor-pointer"
                >
                  {user ? "Go to Dashboard" : "Get Started"} <ArrowRight size={20} />
                </motion.button>
              </Link>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 mt-8 sm:mt-10 md:mt-12 px-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#A51C30]/20 flex items-center justify-center">
                    <Users className="text-[#A51C30]" size={26} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900">10K+</div>
                    <div className="text-sm text-slate-700">Students Placed</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#A51C30]/20 flex items-center justify-center">
                    <CheckCircle2 className="text-[#A51C30]" size={26} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900">95%</div>
                    <div className="text-sm text-slate-700">Visa Success Rate</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#A51C30]/20 flex items-center justify-center">
                    <GraduationCap className="text-[#A51C30]" size={26} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900">Guarantee</div>
                    <div className="text-sm text-slate-700">Admission in 1 of 5</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-4 flex flex-col gap-3 lg:pt-8">
                {features.map((feature, index) => (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureClick(index)}
                    className={`text-left p-4 sm:p-6 rounded-2xl transition-all duration-300 group relative overflow-hidden border cursor-pointer ${
                      activeFeature === index
                        ? "bg-white shadow-xl shadow-slate-200/60 border-slate-100 lg:scale-105 z-10 ring-1 ring-black/5"
                        : "bg-transparent hover:bg-slate-50 border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 bg-[#A51C30] transition-transform duration-300 rounded-l-2xl ${
                        activeFeature === index ? "scale-y-100" : "scale-y-0"
                      }`}
                    />

                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`p-2.5 rounded-xl transition-colors ${
                          activeFeature === index
                            ? "bg-blue-50 text-[#A51C30]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <feature.icon size={22} />
                      </div>
                      <h3
                        className={`font-bold text-base sm:text-lg ${
                          activeFeature === index ? "text-slate-900" : "text-slate-600"
                        }`}
                      >
                        {feature.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pl-1">
                      {feature.description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-8 h-[400px] sm:h-[500px] lg:h-[600px] perspective-1000">
                <div className="relative w-full h-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, x: 50, rotateY: 5 }}
                      animate={{ opacity: 1, x: 0, rotateY: 0 }}
                      exit={{ opacity: 0, x: -50, rotateY: -5 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="w-full h-full"
                    >
                      <ActiveComponent />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-blue-100/30 to-blue-100/30 blur-3xl rounded-full pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="roadmap">
        <PlaneRoadmap />
      </section>
      <section id="testimonials">
        <Testimonial />
      </section>
      <section id="trust-section">
        <TrustSection />
      </section>
      <section id="why-us">
        <PainPoints />
      </section>
    </>
  );
}