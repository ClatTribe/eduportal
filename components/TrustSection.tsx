import React from 'react';
import { ShieldCheck, UserX, Database, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const TrustSection: React.FC = () => {
  return (
    <section id="trust" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-4"
                >
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    The New Standard
                </motion.div>
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight"
                >
                    We fixed what is broken in education search.
                </motion.h2>
            </div>
            <div className="md:mb-2">
                <p className="text-slate-500 text-lg max-w-sm">No spam. No sold data. Just the tools you need to succeed on your own terms.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 grid-rows-2 gap-6 h-auto md:h-[600px]">
            {/* Card 1: Privacy - Large Box */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-4 bg-slate-50 rounded-3xl p-8 md:p-12 relative overflow-hidden group border border-slate-100 hover:shadow-xl transition-all duration-500"
            >
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-blue-600">
                            <UserX size={32} />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-4">Zero Unsolicited Calls. Period.</h3>
                        <p className="text-slate-600 text-lg max-w-md">We never sell your phone number. Unlike other platforms that trigger 200+ spam calls, EduNext keeps your data 100% private until you choose to share it.</p>
                    </div>
                    <div className="mt-8">
                        <div className="inline-flex items-center gap-2 text-slate-400 font-mono text-sm bg-white px-4 py-2 rounded-lg border border-slate-200">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Data Protection Active
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-white/50 to-transparent pointer-events-none" />
                <ShieldCheck className="absolute -right-12 -bottom-12 text-slate-200/50 w-96 h-96 group-hover:scale-110 transition-transform duration-700" />
            </motion.div>

            {/* Card 2: Verification */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="md:col-span-2 bg-slate-900 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-500"
            >
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-white backdrop-blur-sm">
                        <Database size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Verified Admits</h3>
                    <p className="text-slate-400">We verify every admit profile via university email or acceptance letter. No fake stats.</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>

            {/* Card 3: Speed */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="md:col-span-2 bg-blue-50 rounded-3xl p-8 relative overflow-hidden group border border-blue-100 hover:shadow-xl transition-all duration-500"
            >
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Real-Time Sync</h3>
                    <p className="text-slate-600">Tuition fees and deadlines synced daily from university portals.</p>
                </div>
            </motion.div>

            {/* Card 4: CTA */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="md:col-span-4 bg-blue-600 rounded-3xl p-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-[#be123c] transition-colors group cursor-pointer shadow-xl shadow-red-900/20"
            >
                <div className="text-white">
                    <h3 className="text-3xl font-bold mb-2">Ready to find your dream university?</h3>
                    <p className="text-red-100 text-lg">Join 10,000+ students who switched to EduNext today.</p>
                </div>
                <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg flex items-center gap-2 group-hover:gap-4 transition-all shadow-lg">
                    Get Started Free <ArrowRight size={20} />
                </button>
            </motion.div>
        </div>
      </div>
    </section>
  );
};