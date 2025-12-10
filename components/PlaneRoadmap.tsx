"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, Users, School, FileCheck, TrendingUp, Plane } from "lucide-react";

interface Station {
  id: number;
  title: string;
  emoji: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  position: "left" | "right";
  icon: React.ElementType;
}

const PlaneRoadmap: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const stationRefs = useRef<(HTMLDivElement | null)[]>([]);

  const stations: Station[] = [
    {
      id: 1,
      title: "Research",
      emoji: "✨",
      description: "Explore 15000+ Dream MBA Colleges",
      buttonText: "Try Course Finder",
      buttonLink: "/course-finder",
      position: "right",
      icon: Search,
    },
    {
      id: 2,
      title: "Discuss",
      emoji: "✨",
      description: "Get 1-on-1 Counselling from our experts",
      buttonText: "Book Free Counselling",
      buttonLink: "/counselling",
      position: "left",
      icon: Users,
    },
    {
      id: 3,
      title: "Ideate",
      emoji: "✨",
      description: "Find the perfect College",
      buttonText: "Get University Shortlist",
      buttonLink: "/shortlist-builder",
      position: "right",
      icon: School,
    },
    {
      id: 4,
      title: "Track",
      emoji: "✨",
      description: "Track your Application real-time",
      buttonText: "Log into Dashboard",
      buttonLink: "/home",
      position: "left",
      icon: FileCheck,
    },
    {
      id: 5,
      title: "Finance",
      emoji: "✨",
      description: "Secure your Education loan",
      buttonText: "Apply for Loan",
      buttonLink: "#",
      position: "right",
      icon: TrendingUp,
    },
    {
      id: 6,
      title: "Visa",
      emoji: "✨",
      description: "Get complete Visa Assistance",
      buttonText: "Apply for Visa",
      buttonLink: "#",
      position: "left",
      icon: TrendingUp,
    },
    {
      id: 7,
      title: "Accommodation ",
      emoji: "✨",
      description: "Find your ideal Home abroad",
      buttonText: "Enquire Now",
      buttonLink: "#",
      position: "right",
      icon: TrendingUp,
    },
    {
      id: 8,
      title: "Essentials & Services ",
      emoji: "✨",
      description: "Get your basics sorted before you fly",
      buttonText: "Visit Essentials",
      buttonLink: "#",
      position: "left",
      icon: TrendingUp,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (roadmapRef.current && stationRefs.current.length > 0) {
        const roadmapTop = roadmapRef.current.getBoundingClientRect().top;
        const roadmapHeight = roadmapRef.current.offsetHeight;
        const windowHeight = window.innerHeight;
        
        const lastStationRef = stationRefs.current[stationRefs.current.length - 1];
        let maxProgress = 80;
        
        if (lastStationRef && roadmapRef.current) {
          const roadmapRect = roadmapRef.current.getBoundingClientRect();
          const lastStationRect = lastStationRef.getBoundingClientRect();
          const lastStationRelativeTop = lastStationRect.top - roadmapRect.top + roadmapRef.current.scrollTop;
          maxProgress = (lastStationRelativeTop / roadmapHeight) * 100;
        }
        
        const viewportProgress = Math.max(0, Math.min(1, -roadmapTop / (roadmapHeight - windowHeight)));
        setScrollProgress(Math.min(viewportProgress * 100, maxProgress));
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollProgress]);

  const handleButtonClick = (link: string) => {
    window.location.href = link;
  };

  return (
    <section className="relative overflow-hidden bg-[#FEF2F3] border-t border-[#FECDD3]">
      <div ref={roadmapRef} className="relative w-full bg-gradient-to-b from-[#FEF2F3] via-[#FEE2E2] to-[#FEF2F3] py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#A51C30] mb-4">
            Your Dream MBA Journey
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-600">
            Start With EduAbroad
          </h2>
        </div>

        {/* Roadmap Container */}
        <div className="max-w-6xl mx-auto relative pb-16">
          {/* Vertical Line - Desktop */}
          <div 
            className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 w-0.5 bg-[#A51C30]/30"
            style={{ 
              height: `${Math.min(scrollProgress, 100)}%`,
              maxHeight: '100%'
            }}
          />
          
          {/* Vertical Line - Mobile */}
          <div 
            className="md:hidden absolute left-8 top-0 w-0.5 bg-[#A51C30]/30"
            style={{ 
              height: `${Math.min(scrollProgress, 100)}%`,
              maxHeight: '100%'
            }}
          />

          {/* Animated Plane - Desktop */}
          <div
            className="hidden md:block absolute left-1/2 transition-all duration-1000 ease-out z-30 pointer-events-none"
            style={{ 
              top: `${scrollProgress}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-14 h-14 bg-[#4A5565] rounded-full flex items-center justify-center shadow-xl">
              <Plane size={28} className="text-white transform rotate-135" />
            </div>
          </div>

          {/* Animated Plane - Mobile */}
          <div
            className="md:hidden absolute left-8 transition-all duration-1000 ease-out z-30 pointer-events-none"
            style={{ 
              top: `${scrollProgress}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center shadow-xl">
              <Plane size={24} className="text-white transform rotate-45" />
            </div>
          </div>

          {/* Stations */}
          <div className="relative space-y-20 md:space-y-24">
            {stations.map((station, index) => (
              <div
                key={station.id}
                ref={(el) => {
                  stationRefs.current[index] = el;
                }}
                className="relative min-h-[120px]"
              >
                {/* Station Circle on Track - Desktop */}
                <div className="hidden md:block absolute left-1/2 top-0 transform -translate-x-1/2 z-20">
                  <div className="w-14 h-14 rounded-full border-3 bg-[#A51C30] border-[#A51C30] flex items-center justify-center shadow-lg shadow-[#A51C30]/20">
                    <station.icon size={24} className="text-white" />
                  </div>
                </div>

                {/* Station Circle on Track - Mobile */}
                <div className="md:hidden absolute left-8 top-0 transform -translate-x-1/2 z-20">
                  <div className="w-12 h-12 rounded-full border-3 bg-[#A51C30] border-[#A51C30] flex items-center justify-center shadow-lg shadow-[#A51C30]/20">
                    <station.icon size={20} className="text-white" />
                  </div>
                </div>

                {/* Content Card - Right Side */}
                {station.position === "right" && (
                  <div className="ml-16 md:ml-0 md:absolute md:left-1/2 md:pl-20 md:top-0 md:w-[400px]">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-xl sm:text-2xl font-bold text-[#A51C30]">
                        {station.title}
                      </h3>
                      <span className="text-lg">{station.emoji}</span>
                    </div>
                    <p className="text-gray-700 text-base sm:text-lg mb-4 leading-relaxed font-medium">
                      {station.description}
                    </p>
                    <button
                      onClick={() => handleButtonClick(station.buttonLink)}
                      className="inline-block px-6 py-2.5 border-2 border-[#A51C30] text-[#A51C30] font-semibold rounded-full hover:bg-[#A51C30] hover:text-white transition-all duration-300 shadow-lg shadow-[#A51C30]/10 hover:shadow-[#A51C30]/30"
                    >
                      {station.buttonText}
                    </button>
                  </div>
                )}

                {/* Content Card - Left Side */}
                {station.position === "left" && (
                  <div className="ml-16 md:ml-0 md:absolute md:right-1/2 md:pr-20 md:top-0 md:w-[400px] md:text-right">
                    <div className="flex items-center gap-2 mb-3 md:justify-end">
                      <h3 className="text-xl sm:text-2xl font-bold text-[#A51C30]">
                        {station.title}
                      </h3>
                      <span className="text-lg">{station.emoji}</span>
                    </div>
                    <p className="text-gray-700 text-base sm:text-lg mb-4 leading-relaxed font-medium">
                      {station.description}
                    </p>
                    <div className="md:flex md:justify-end">
                      <button
                        onClick={() => handleButtonClick(station.buttonLink)}
                        className="inline-block px-6 py-2.5 border-2 border-[#A51C30] text-[#A51C30] font-semibold rounded-full hover:bg-[#A51C30] hover:text-white transition-all duration-300 shadow-lg shadow-[#A51C30]/10 hover:shadow-[#A51C30]/30"
                      >
                        {station.buttonText}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlaneRoadmap;