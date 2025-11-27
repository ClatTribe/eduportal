import React from 'react';
import { Search, Filter, Bookmark, Sparkles } from 'lucide-react';

export const ScholarshipVisual: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
      <div className="p-8 border-b border-slate-100 bg-white">
        <h3 className="text-3xl font-bold text-blue-600 mb-2 tracking-tight">Find Scholarships to Fuel Your Dreams</h3>
        <p className="text-slate-500 mb-8 text-lg">Discover scholarships from top universities and institutions worldwide</p>
        
        <div className="flex gap-4 mb-8">
           <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-200 hover:bg-[#be123c] transition-colors">
             <Bookmark size={18} /> All Scholarships
           </button>
           <button className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors">
             <Sparkles size={18} className="text-slate-400" /> Recommended For You
           </button>
        </div>
        
        <div className="flex gap-4">
           <div className="relative flex-1 group">
             <input 
                type="text" 
                placeholder="Search for scholarships by name, provider, or country..." 
                className="w-full border border-slate-200 rounded-lg pl-5 pr-12 py-4 text-slate-700 focus:ring-2 focus:ring-red-100 focus:border-blue-600 transition-all outline-none text-lg" 
             />
             <Search className="absolute right-4 top-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
           </div>
           <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-red-200 hover:bg-[#be123c] transition-colors">
             <Filter size={20} /> Filters
           </button>
        </div>
      </div>
      
      <div className="bg-slate-50 flex-1 p-6 overflow-hidden relative">
         <div className="space-y-4">
            {[
              { name: "Global Excellence Scholarship", provider: "University of Dublin", amount: "€5,000", deadline: "30 Days left" },
              { name: "Future Leaders Grant", provider: "Tech Foundation", amount: "$10,000", deadline: "12 Days left" },
              { name: "Merit Undergraduate Award", provider: "Govt. of Australia", amount: "AUD 15,000", deadline: "2 Months left" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                 <div>
                    <div className="font-bold text-slate-900 text-lg mb-1">{item.name}</div>
                    <div className="text-slate-500 text-sm">{item.provider}</div>
                 </div>
                 <div className="flex flex-col items-end gap-1">
                    <div className="text-lg font-bold text-blue-600">{item.amount}</div>
                    <div className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">{item.deadline}</div>
                 </div>
              </div>
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent"></div>
         </div>
      </div>
    </div>
  );
};
