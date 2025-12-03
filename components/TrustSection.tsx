import React from 'react';
import { ShieldCheck, UserX, Database, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const TrustSection: React.FC = () => {
  return (
    <section id="trust" className="py-24 relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{ backgroundColor: '#FEF2F3', color: '#A51C30' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A51C30' }}></span>
              The New Standard
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold leading-tight"
              style={{ color: '#A51C30' }}
            >
              We fixed what is broken in education search.
            </motion.h2>
          </div>
          <div className="md:mb-2">
            <p className="text-lg max-w-sm">
              No spam. No sold data. Just the tools you need to succeed on your own terms.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 grid-rows-2 gap-6 h-auto md:h-[600px]">
          {/* Card 1: Privacy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-4 rounded-3xl p-8 md:p-12 relative overflow-hidden group border hover:shadow-xl transition-all duration-500"
            style={{ backgroundColor: '#FEF2F3', borderColor: '#FCA5A5' }}
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-6" style={{ backgroundColor: '#FFFFFF', color: '#A51C30' }}>
                  <UserX size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-4" style={{ color: '#A51C30' }}>Zero Spam Calls. Your Data Your Contact.</h3>
                <p className="text-lg max-w-md">
                  We never sell your phone number. Unlike other platforms that trigger 200+ spam calls, EduAbroad keeps your data 100% private until you choose to share it.
                </p>
              </div>
              <div className="mt-8">
                <div className="inline-flex items-center gap-2 font-mono text-sm px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: '#FFFFFF', color: '#A51C30', borderColor: '#FCA5A5' }}
                >
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#A51C30' }}></span>
                  Data Protection Active
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 w-1/2 h-full pointer-events-none" 
              style={{ background: 'linear-gradient(to left, #FFFFFF80, transparent)' }} 
            />
            <ShieldCheck className="absolute -right-12 -bottom-12 w-96 h-96 group-hover:scale-110 transition-transform duration-700" style={{ color: '#FECDD3AA' }} />
          </motion.div>

          {/* Card 2: Verification */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-500"
            style={{ backgroundColor: '#A51C30' }}
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#FECDD3', color: '#A51C30' }}>
                <Database size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#FFFFFF' }}>Verified Admits</h3>
              <p style={{ color: '#FEF2F3' }}>We verify every admit profile via university email or acceptance letter. No fake stats.</p>
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
              style={{ background: 'linear-gradient(135deg, #FECDD3AA, transparent)' }}
            />
          </motion.div>

          {/* Card 3: Speed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 rounded-3xl p-8 relative overflow-hidden group border hover:shadow-xl transition-all duration-500"
            style={{ backgroundColor: '#FEF2F3', borderColor: '#FCA5A5' }}
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#FCA5A5', color: '#A51C30' }}>
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#A51C30' }}>Scholarship For All</h3>
              <p>Tuition fees and deadlines synced daily from university portals.</p>
            </div>
          </motion.div>

          {/* Card 4: CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-4 rounded-3xl p-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-xl transition-colors group cursor-pointer"
            style={{ backgroundColor: '#A51C30' }}
          >
            <div>
              <h3 className="text-3xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Ready to find your dream College?</h3>
              <p className="text-lg" style={{ color: '#FECDD3' }}>Join 10,000+ students who switched to EduAbroad today.</p>
            </div>
            <button className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all shadow-lg"
              style={{ backgroundColor: '#FFFFFF', color: '#A51C30' }}
            >
              Get Started Free <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
