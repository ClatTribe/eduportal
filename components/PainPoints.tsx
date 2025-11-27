import React from 'react';
import { Check, X } from 'lucide-react';

export const PainPoints: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-2">
            {/* The Old Way */}
            <div className="p-10 bg-slate-800/50 text-slate-300 border-b md:border-b-0 md:border-r border-slate-700">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Other Platforms
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <X className="text-red-500 shrink-0" />
                  <span>Unsolicited calls & SMS bombardment after signup</span>
                </li>
                <li className="flex gap-4">
                  <X className="text-red-500 shrink-0" />
                  <span>Impossible to delete account or stop data sharing</span>
                </li>
                <li className="flex gap-4">
                  <X className="text-red-500 shrink-0" />
                  <span>Biased, paid, or fake reviews</span>
                </li>
                <li className="flex gap-4">
                  <X className="text-red-500 shrink-0" />
                  <span>Outdated fee structures and eligibility criteria</span>
                </li>
              </ul>
            </div>

            {/* The EduNext Way */}
            <div className="p-10 bg-gradient-to-br from-primary-900 to-slate-900 text-white">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                EduNext
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <Check className="text-emerald-400 shrink-0" />
                  <span>100% Private. You initiate contact, not them.</span>
                </li>
                <li className="flex gap-4">
                  <Check className="text-emerald-400 shrink-0" />
                  <span>Full data control. Delete account instantly.</span>
                </li>
                <li className="flex gap-4">
                  <Check className="text-emerald-400 shrink-0" />
                  <span>Verified student reviews only via LinkedIn/College email.</span>
                </li>
                <li className="flex gap-4">
                  <Check className="text-emerald-400 shrink-0" />
                  <span>Real-time API sync with university databases.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-16">
           <p className="text-slate-500 text-sm mb-6">Join 10,000+ students who switched for peace of mind.</p>
           <button className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full transition-all shadow-lg shadow-primary-600/30">
             Experience the Difference
           </button>
        </div>
      </div>
    </section>
  );
};