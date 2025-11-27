import React from 'react';
import { Search, Filter, Bookmark, Sparkles } from 'lucide-react';

export const ScholarshipVisual: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] rounded-xl border border-[#FECDD3] shadow-2xl overflow-hidden">
      <div className="p-8 border-b border-[#FECDD3] bg-[#FEF2F3]">
        <h3 className="text-3xl font-bold text-[#A51C30] mb-2 tracking-tight">Find Scholarships to Fuel Your Dreams</h3>
        <p className="text-[#A51C30]/70 mb-8 text-lg">Discover scholarships from top universities and institutions worldwide</p>
        
        <div className="flex gap-4 mb-8">
           <button className="bg-[#A51C30] text-[#FFFFFF] px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#FCA5A5]/30 hover:bg-[#FCA5A5] transition-colors">
             <Bookmark size={18} /> All Scholarships
           </button>
           <button className="bg-[#FFFFFF] border border-[#FECDD3] text-[#A51C30] px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#FEF2F3] transition-colors">
             <Sparkles size={18} className="text-[#FCA5A5]" /> Recommended For You
           </button>
        </div>
        
        <div className="flex gap-4">
           <div className="relative flex-1 group">
             <input 
                type="text" 
                placeholder="Search for scholarships by name, provider, or country..." 
                className="w-full border border-[#FECDD3] rounded-lg pl-5 pr-12 py-4 text-[#A51C30] focus:ring-2 focus:ring-[#FCA5A5]/40 focus:border-[#A51C30] transition-all outline-none text-lg" 
             />
             <Search className="absolute right-4 top-4.5 text-[#FCA5A5]/70 group-focus-within:text-[#A51C30] transition-colors" size={24} />
           </div>
           <button className="bg-[#A51C30] text-[#FFFFFF] px-8 py-4 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-[#FCA5A5]/30 hover:bg-[#FCA5A5] transition-colors">
             <Filter size={20} /> Filters
           </button>
        </div>
      </div>
      
      <div className="bg-[#FEF2F3] flex-1 p-6 overflow-hidden relative">
         <div className="space-y-4">
            {[
              { name: "Global Excellence Scholarship", provider: "University of Dublin", amount: "€5,000", deadline: "30 Days left" },
              { name: "Future Leaders Grant", provider: "Tech Foundation", amount: "$10,000", deadline: "12 Days left" },
              { name: "Merit Undergraduate Award", provider: "Govt. of Australia", amount: "AUD 15,000", deadline: "2 Months left" }
            ].map((item, i) => (
              <div key={i} className="bg-[#FFFFFF] p-5 rounded-xl border border-[#FECDD3] shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                 <div>
                    <div className="font-bold text-[#A51C30] text-lg mb-1">{item.name}</div>
                    <div className="text-[#A51C30]/70 text-sm">{item.provider}</div>
                 </div>
                 <div className="flex flex-col items-end gap-1">
                    <div className="text-lg font-bold text-[#A51C30]">{item.amount}</div>
                    <div className="text-xs font-medium text-[#A51C30] bg-[#FECDD3] px-2 py-1 rounded">{item.deadline}</div>
                 </div>
              </div>
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FEF2F3] to-transparent"></div>
         </div>
      </div>
    </div>
  );
};
