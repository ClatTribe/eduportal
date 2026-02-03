import React from "react";
import {
  ShieldCheck,
  UserX,
  Database,
  Zap,
  ArrowRight,
  MousePointerClick,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export const TrustSection: React.FC = () => {
  return (
    <section
      id="trust"
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{ backgroundColor: "#FEF2F3", color: "#A51C30" }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#A51C30" }}
              ></span>
              The New Standard
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold leading-tight"
              style={{ color: "#A51C30" }}
            >
              Study Abroad, Disrupted.
            </motion.h2>
          </div>
          <div className="md:mb-2">
            <p className="text-lg max-w-sm">
              No spam. No sold data. Just the tools you need to succeed on your
              own terms.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 h-auto">
          {/* Card 1: Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-4 rounded-3xl p-8 md:p-12 relative overflow-hidden group border hover:shadow-xl transition-all duration-500"
            style={{ backgroundColor: "#FEF2F3", borderColor: "#FCA5A5" }}
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div
                  className="w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-6"
                  style={{ backgroundColor: "#FFFFFF", color: "#A51C30" }}
                >
                  <UserX size={32} />
                </div>
                <h3
                  className="text-3xl font-bold mb-4"
                  style={{ color: "#A51C30" }}
                >
                  Zero Spam Calls. Our Promise.
                </h3>
                <p className="text-lg">
                  We never sell your phone number. Unlike other platforms that
                  trigger 200+ spam calls, EduAbroad keeps your data 100%
                  private until you choose to share it.
                </p>
              </div>
              <div className="mt-8">
                <div
                  className="inline-flex items-center gap-2 font-mono text-sm px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#A51C30",
                    borderColor: "#FCA5A5",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: "#A51C30" }}
                  ></span>
                  Data Protection Active
                </div>
              </div>
            </div>
            <div
              className="absolute right-0 bottom-0 w-1/2 h-full pointer-events-none"
              style={{
                background: "linear-gradient(to left, #FFFFFF80, transparent)",
              }}
            />
            <ShieldCheck
              className="absolute -right-12 -bottom-12 w-96 h-96 group-hover:scale-110 transition-transform duration-700"
              style={{ color: "#FECDD3AA" }}
            />
          </motion.div>

          {/* Card 2: Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-500"
            style={{ backgroundColor: "#A51C30" }}
          >
            <div className="relative z-10">
              <div
                className="w-12 h-10 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: "#FECDD3", color: "#A51C30" }}
              >
                <Database size={24} />
              </div>
              <h3
                className="text-2xl font-bold mb-3"
                style={{ color: "#FFFFFF" }}
              >
                Verified Admits
              </h3>
              <p style={{ color: "#FEF2F3" }}>
                Verified student admits only. No fake data.
              </p>
            </div>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "linear-gradient(135deg, #FECDD3AA, transparent)",
              }}
            />
          </motion.div>

          {/* Card 3: Speed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 rounded-3xl p-8 relative overflow-hidden group border hover:shadow-xl transition-all duration-500"
            style={{ backgroundColor: "#FEF2F3", borderColor: "#FCA5A5" }}
          >
            <div className="relative z-10">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: "#FCA5A5", color: "#A51C30" }}
              >
                <Zap size={24} />
              </div>
              <h3
                className="text-2xl font-bold mb-3"
                style={{ color: "#A51C30" }}
              >
                Scholarship For All
              </h3>
              <p>We Provide Scholarships to 100% of our students</p>
            </div>
          </motion.div>

          {/* Card 4: 3 Clicks Promise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-4 rounded-3xl p-8 relative overflow-hidden group border hover:shadow-xl transition-all duration-500"
            style={{ backgroundColor: "#FEF2F3", borderColor: "#FCA5A5" }}
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div
                  className="w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-6"
                  style={{ backgroundColor: "#FFFFFF", color: "#A51C30" }}
                >
                  <MousePointerClick size={32} />
                </div>
                <h3
                  className="text-3xl font-bold mb-4"
                  style={{ color: "#A51C30" }}
                >
                  3 Clicks Promise
                </h3>
                <p className="text-lg">
                  Get desired information in 3 Clicks. No endless forms, no
                  complicated steps. Just three simple clicks to access
                  everything you need.
                </p>
              </div>
              {/* <div className="mt-8 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#A51C30', color: '#FFFFFF' }}>1</div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#FCA5A5', color: '#FFFFFF' }}>2</div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#FECDD3', color: '#A51C30' }}>3</div>
        </div>
        <span className="text-sm font-medium" style={{ color: '#A51C30' }}>That's it!</span>
      </div> */}
            </div>
            <div
              className="absolute right-0 top-0 w-1/3 h-full pointer-events-none"
              style={{
                background: "linear-gradient(to left, #FECDD380, transparent)",
              }}
            />
          </motion.div>

          {/* Card 5: CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-6 rounded-3xl p-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-xl transition-colors group"
            style={{ backgroundColor: "#A51C30" }}
          >
            <div>
              <h3
                className="text-3xl font-bold mb-2"
                style={{ color: "#FFFFFF" }}
              >
                Find your dream College?
              </h3>
              <p className="text-lg" style={{ color: "#FECDD3" }}>
                Join 10,000+ students who switched to EduAbroad today.
              </p>
            </div>
            <Link
              href="/home"
              className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all shadow-lg  cursor-pointer"
              style={{ backgroundColor: "#FFFFFF", color: "#A51C30" }}
            >
              Get Started for FREE <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
