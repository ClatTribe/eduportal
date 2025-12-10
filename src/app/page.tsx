"use client";
import React, { useState, useEffect } from "react";
import { BookOpen, GraduationCap, Target, ArrowRight, Menu, X, ChevronRight, LogOut, User, Users, CheckCircle2, } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { CourseMatcherVisual } from "../../components/CourseMatcherVisual";
import { ScholarshipVisual } from "../../components/ScholarshipVisual";
import { AdmitFinderVisual } from "../../components/AdmitFinderVisual";
import { TrustSection } from "../../components/TrustSection";
import { PainPoints } from "../../components/PainPoints";
import PlaneRoadmap from "../../components/PlaneRoadmap";
import { Testimonial } from "../../components/Testimonial";

const features = [
  {
    id: "courses",
    title: "Course Matcher",
    description: "Find your perfect stream based on your actual grades and interests.",
    icon: BookOpen,
    component: CourseMatcherVisual,
    cta: "Find Courses",
  },
  {
    id: "scholarships",
    title: "Scholarship Finder",
    description: "Match with thousands of financial aid opportunities instantly.",
    icon: GraduationCap,
    component: ScholarshipVisual,
    cta: "Find Scholarships",
  },
  {
    id: "admits",
    title: "Admit Finder",
    description: "See real profiles of students who got into your dream colleges.",
    icon: Target,
    component: AdmitFinderVisual,
    cta: "See Admits",
  },
];

// Navbar Component
const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center gap-2">
            <img
              src="/images.svg"
              alt="EduNext Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold text-black">EduAbroad</span>
          </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-[#A51C30] transition-colors cursor-pointer">
            Features
          </a>
          <a href="#mission" className="text-sm font-medium text-slate-600 hover:text-[#A51C30] transition-colors cursor-pointer">
            Our Mission
          </a>
          <a href="#trust" className="text-sm font-medium text-slate-600 hover:text-[#A51C30] transition-colors cursor-pointer">
            Why Us
          </a>

          {user ? (
            // User is logged in
            <>
              <Link href="/home" className="px-4 py-2 text-sm font-medium text-[#A51C30] bg-blue-50 hover:bg-blue-100 rounded-full transition-colors cursor-pointer">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="group px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition-all flex items-center gap-1 cursor-pointer"
              >
                Logout <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                <User size={16} className="text-[#A51C30]" />
                <span className="text-sm font-medium text-slate-700">{user.user_metadata?.full_name || user.email}</span>
              </div>
            </>
          ) : (
            // User is not logged in
            <>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-[#A51C30] bg-blue-50 hover:bg-blue-100 rounded-full transition-colors cursor-pointer">
                Log In
              </Link>
              <Link href="/register" className="group px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-all flex items-center gap-1 cursor-pointer">
                Get Started <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 cursor-pointer">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl">
          {user && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl mb-2">
              <User size={20} className="text-[#A51C30]" />
              <span className="text-sm font-medium text-slate-700">{user.user_metadata?.full_name || user.email}</span>
            </div>
          )}

          <a href="#features" className="text-lg font-medium text-slate-800 cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
            Features
          </a>
          <a href="#mission" className="text-lg font-medium text-slate-800 cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
            Our Mission
          </a>
          <a href="#trust" className="text-lg font-medium text-slate-800 cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
            Why Us
          </a>
          <hr className="border-slate-100" />

          {user ? (
            // User is logged in
            <>
              <Link href="/home" className="w-full py-3 text-center font-medium text-[#A51C30] bg-blue-50 hover:bg-blue-100 rounded-xl cursor-pointer">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-3 text-center font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            // User is not logged in
            <>
              <Link href="/register" className="w-full py-3 text-center font-medium text-[#A51C30] bg-blue-50 hover:bg-blue-100 rounded-xl cursor-pointer">
                Log In
              </Link>
              <Link href="/register" className="w-full py-3 text-center font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer">
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default function Hero() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const handleFeatureClick = (index: number) => {
    setActiveFeature(index);
    setAutoPlay(false);
  };

  const ActiveComponent = features[activeFeature].component;

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
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
  <div className="flex flex-col items-center text-center mb-12 sm:mb-20 bg-white/50 backdrop-blur-xs m py-10">

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-sm mb-6 sm:mb-8 group cursor-pointer hover:bg-slate-100 transition-colors"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A51C30] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A51C30]"></span>
      </span>
      <span className="text-xs font-bold text-slate-600 tracking-wide ">
        New: Admit Finder 2.0 is live
      </span>
      <ArrowRight size={12} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
    </motion.div>

    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 sm:mb-8 leading-[1.1] px-4"
    >
      Get your Dream University <br />
      <span className="text-[#A51C30]">Without the Noise.</span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-4"
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
      className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-12 sm:mt-16 px-4"
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
          <div className="text-sm text-slate-700">Admission in 1 of your 5 choice</div>
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
      <section id="roadmap">
        <Testimonial />
      </section>
      {/* Trust Section */}
      <TrustSection />

      {/* Pain Points Section */}
      <PainPoints />
    </>
  );
}