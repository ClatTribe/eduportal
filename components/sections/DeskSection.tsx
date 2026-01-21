import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { History, Target, TrendingUp } from 'lucide-react';

const data = [
  { year: '2020', applicants: 60000, cutoff: 95 },
  { year: '2021', applicants: 72000, cutoff: 102 },
  { year: '2022', applicants: 68000, cutoff: 88 },
  { year: '2023', applicants: 85000, cutoff: 94 },
  { year: '2024', applicants: 98000, cutoff: 108 },
];

export const DeskSection: React.FC = () => {
  const accentColor = '#A51C30';
  const secondaryAccent = '#8B1528';
  const borderColor = '#FECDD3';
  const lightBg = '#FEF2F3';

  return (
    <div className="space-y-12 pb-12">
      {/* Historical Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            <History className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-black mb-6 leading-tight text-gray-800">History & Evolution of CLAT</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
            <p>CLAT was initiated in 2008 following a Public Interest Litigation to bring uniformity to law admissions. Starting with just 7 NLUs, it has now grown into a massive ecosystem encompassing 24+ National Law Universities.</p>
            <p>Over the years, the exam pattern has shifted from rote-memorization to a logic-driven, comprehension-based format, making it one of India's most challenging entrance exams.</p>
          </div>
        </div>
        <div 
          className="bg-white p-8 rounded-[2rem]"
          style={{ border: `1px solid ${borderColor}` }}
        >
           <div className="flex items-center justify-between mb-8">
             <h4 className="font-bold flex items-center gap-2 text-gray-800">
               <TrendingUp className="w-5 h-5 text-green-600" /> Applicant Growth
             </h4>
             <span className="text-xs text-gray-500">Last 5 Years</span>
           </div>
           <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                 <defs>
                   <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor={accentColor} stopOpacity={0.3}/>
                     <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                 <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                 <YAxis stroke="#6b7280" fontSize={12} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: borderColor, borderRadius: '12px' }}
                    itemStyle={{ color: accentColor }}
                 />
                 <Area type="monotone" dataKey="applicants" stroke={accentColor} fillOpacity={1} fill="url(#colorApp)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="p-8 rounded-3xl bg-white"
          style={{ border: `1px solid ${borderColor}` }}
        >
          <p className="text-gray-500 text-sm font-bold uppercase mb-2">Total Seats</p>
          <div className="text-4xl font-black text-gray-800">~3,200</div>
          <p className="text-xs text-gray-500 mt-2">Across all 24 NLUs</p>
        </div>
        <div 
          className="p-8 rounded-3xl bg-white"
          style={{ border: `1px solid ${borderColor}` }}
        >
          <p className="text-gray-500 text-sm font-bold uppercase mb-2">Selection %</p>
          <div className="text-4xl font-black text-gray-800">~3.5%</div>
          <p className="text-xs text-gray-500 mt-2">Highly competitive ratio</p>
        </div>
        <div 
          className="p-8 rounded-3xl bg-white"
          style={{ border: `1px solid ${borderColor}` }}
        >
          <p className="text-gray-500 text-sm font-bold uppercase mb-2">Ideal Score</p>
          <div className="text-4xl font-black text-gray-800">95-105</div>
          <p className="text-xs text-gray-500 mt-2">For top 3 NLUs</p>
        </div>
      </div>
    </div>
  );
};