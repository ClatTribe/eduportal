import React from 'react';
import { Search, Filter, GraduationCap } from 'lucide-react';

export const CourseMatcherVisual: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] rounded-xl border border-[#FECDD3] shadow-2xl overflow-hidden">
      <div className="p-8 border-b border-[#FECDD3] bg-[#FEF2F3]">
        <h3 className="text-3xl font-bold text-[#A51C30] mb-2 tracking-tight">
          Find Your Perfect Course
        </h3>
        <p className="text-[#A51C30] mb-8 text-lg">
          Explore programs and universities worldwide
        </p>
        
        <div className="flex gap-4 mb-8">
          <button className="bg-[#A51C30] text-[#FFFFFF] px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#FCA5A5] hover:bg-[#FECDD3] transition-colors">
            <GraduationCap size={18} /> All Courses
          </button>
          <button className="bg-[#FEF2F3] border border-[#FECDD3] text-[#A51C30] px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#FCA5A5] transition-colors">
            <span className="text-[#FECDD3]">✨</span> Recommended For You
          </button>
        </div>
        
        <div className="flex gap-4">
          <div className="relative flex-1 group">
            <input 
              type="text" 
              placeholder="Search for programs, universities, or campus..." 
              className="w-full border border-[#FECDD3] rounded-lg pl-5 pr-12 py-4 text-[#A51C30] focus:ring-2 focus:ring-[#FCA5A5] focus:border-[#A51C30] transition-all outline-none text-lg" 
            />
            <Search className="absolute right-4 top-4.5 text-[#A51C30] group-focus-within:text-[#FECDD3] transition-colors" size={24} />
          </div>
          <button className="bg-[#A51C30] text-[#FFFFFF] px-8 py-4 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-[#FCA5A5] hover:bg-[#FECDD3] transition-colors">
            <Filter size={20} /> Filters
          </button>
        </div>
      </div>
      
      <div className="bg-[#FEF2F3] flex-1 p-6 overflow-hidden relative">
        <div className="space-y-4">
          {[
            { university: "Technische Universität München", program: "M.Sc. Informatics", location: "Munich, Germany", duration: "2 Years" },
            { university: "University of Toronto", program: "Master of Computer Science", location: "Toronto, Canada", duration: "1.5 Years" },
            { university: "Georgia Tech", program: "MS in Computer Science", location: "Atlanta, USA", duration: "2 Years" }
          ].map((item, i) => (
            <div key={i} className="bg-[#FFFFFF] p-5 rounded-xl border border-[#FECDD3] shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FECDD3] rounded-full flex items-center justify-center font-bold text-[#A51C30] text-lg">
                  {item.university[0]}
                </div>
                <div>
                  <div className="font-bold text-[#A51C30] text-lg">{item.program}</div>
                  <div className="text-[#A51C30]">{item.university} • {item.location}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#A51C30]">{item.duration}</div>
                <div className="text-xs font-bold bg-[#FCA5A5] text-[#A51C30] px-2 py-1 rounded mt-1">High Match</div>
              </div>
            </div>
          ))}
          {/* Fade out overlay to imply scrolling */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FEF2F3] to-transparent"></div>
        </div>
      </div>
    </div>
  );
};
