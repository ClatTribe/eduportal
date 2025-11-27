import React from 'react';
import { Search, Users, UserCheck, ChevronDown } from 'lucide-react';

export const AdmitFinderVisual: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
      <div className="p-8 border-b border-slate-100 bg-white">
        <h3 className="text-3xl font-bold text-blue-600 mb-2 tracking-tight">Access 375K+ Admits & Rejects!</h3>
        <p className="text-slate-500 mb-8 text-lg">Find folks at your dream school with the same background as you</p>
        
        <div className="flex gap-4 mb-8">
           <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-200 hover:bg-[#be123c] transition-colors">
             <Users size={18} /> All Profiles
           </button>
           <button className="bg-[#f1f5f9] text-slate-700 px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-colors">
             <UserCheck size={18} /> Similar Profiles
           </button>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <div className="relative w-48">
              <select className="w-full appearance-none border border-slate-200 rounded-lg pl-4 pr-10 py-3 bg-white text-slate-700 font-medium outline-none focus:border-blue-600 transition-colors">
                 <option>All Universities</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
           </div>
           <div className="relative w-48">
              <select className="w-full appearance-none border border-slate-200 rounded-lg pl-4 pr-10 py-3 bg-white text-slate-700 font-medium outline-none focus:border-blue-600 transition-colors">
                 <option>All Majors</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
           </div>
           
           <div className="relative flex-1 group">
             <input 
                type="text" 
                placeholder="Search by name, university..." 
                className="w-full border border-slate-200 rounded-lg pl-4 pr-10 py-3 text-slate-700 focus:ring-2 focus:ring-red-100 focus:border-blue-600 transition-all outline-none" 
             />
             <Search className="absolute right-3 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
           </div>
        </div>
      </div>
      
      <div className="bg-slate-50 flex-1 p-6 overflow-hidden relative flex flex-col">
         <div className="flex justify-between items-center mb-4 px-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
                <Users size={18} className="text-blue-600" /> 39 profiles found
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 font-medium">Show Verified only</span>
                <div className="w-11 h-6 bg-slate-200 rounded-full p-1 cursor-pointer transition-colors hover:bg-slate-300">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
            </div>
         </div>

         <div className="space-y-3 flex-1">
            {[
              { name: "Priya S.", univ: "Carnegie Mellon", status: "Admitted", gpa: "9.2/10", gre: "328" },
              { name: "Rahul M.", univ: "Stanford University", status: "Waitlisted", gpa: "9.5/10", gre: "332" },
              { name: "Sarah K.", univ: "MIT", status: "Admitted", gpa: "9.8/10", gre: "335" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer">
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${item.status === 'Admitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                       {item.name[0]}
                    </div>
                    <div>
                       <div className="font-bold text-slate-900">{item.name} <span className="font-normal text-slate-500 text-sm mx-1">applied to</span> {item.univ}</div>
                       <div className="text-xs text-slate-500 flex gap-3 mt-0.5">
                          <span>GPA: <strong className="text-slate-700">{item.gpa}</strong></span>
                          <span>GRE: <strong className="text-slate-700">{item.gre}</strong></span>
                       </div>
                    </div>
                 </div>
                 <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === 'Admitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                        {item.status}
                    </span>
                 </div>
              </div>
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 to-transparent"></div>
         </div>
      </div>
    </div>
  );
};