"use client";

import React, { useState } from "react";

import { supabase } from "../../../lib/supabase"; // adjust path to match yours

export function EnquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    year: "",
    message: "",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.mobile || !form.email || !form.year) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { error: sbError } = await supabase.from("enquiries").insert({
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        target_year: form.year,
        message: form.message || null,
        source_url: typeof window !== "undefined" ? window.location.href : null,
      });
      if (sbError) throw sbError;
      setSubmitted(true);
    } catch (err) {
      console.error("Enquiry submission error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8 text-center">
        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#A51C30"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          You're on the list!
        </h3>
        <p className="text-sm text-gray-500">
          A counsellor will reach out within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 sm:p-8">
      <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-[#A51C30] border border-rose-200 uppercase tracking-wider">
        Free · 1-on-1 Counselling
      </span>
      <h2 className="text-2xl font-extrabold text-gray-900 mt-4 mb-1 tracking-tight">
        Want a personalised study abroad roadmap?
      </h2>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        A real counsellor (not a bot) will call within 24 hours with a plan
        tailored to your goals.
      </p>
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Your name
          </label>
          <input
            className="h-11 border border-gray-200 rounded-xl px-3.5 text-sm bg-gray-50 focus:outline-none focus:border-[#A51C30] focus:bg-white"
            placeholder="Enter your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Mobile
          </label>
          <input
            className="h-11 border border-gray-200 rounded-xl px-3.5 text-sm bg-gray-50 focus:outline-none focus:border-[#A51C30] focus:bg-white"
            placeholder="10-digit mobile"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Email
          </label>
          <input
            className="h-11 border border-gray-200 rounded-xl px-3.5 text-sm bg-gray-50 focus:outline-none focus:border-[#A51C30] focus:bg-white"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Target year
          </label>
          <select
            className="h-11 border border-gray-200 rounded-xl px-3.5 text-sm bg-gray-50 focus:outline-none focus:border-[#A51C30]"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          >
            <option value="">Pick your target year</option>
            <option>2025</option>
            <option>2026</option>
            <option>2027</option>
            <option>2028</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            What do you need help with?{" "}
            <span className="text-gray-300 normal-case font-normal tracking-normal">
              (optional)
            </span>
          </label>
          <textarea
            className="border border-gray-200 rounded-xl px-3.5 py-3 text-sm bg-gray-50 focus:outline-none focus:border-[#A51C30] focus:bg-white resize-none min-h-[80px]"
            placeholder="e.g. Shortlisting universities, SOP review, visa guidance…"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className="w-full h-12 bg-[#A51C30] hover:bg-[#8b1728] text-white rounded-xl text-[15px] font-bold transition-colors flex items-center justify-center gap-2"
      >
        Get my free roadmap →
      </button>
      <p className="text-center text-[11px] text-gray-400 mt-3">
        🔒 Your info stays with us. Zero spam. Unsubscribe anytime.
      </p>
      {/* WhatsApp Community */}
      <div className="mt-5 pt-5 border-t border-gray-100 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#16a34a">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.528 5.855L.057 23.882a.5.5 0 0 0 .61.61l6.037-1.474A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 0 1-5.17-1.438l-.36-.214-3.754.916.948-3.646-.236-.376A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 mb-0.5">
            Talk to others like you
          </p>
          <p className="text-[12px] text-gray-400 leading-snug mb-2.5">
            Join our WhatsApp community to discuss with peers preparing for
            study abroad.
          </p>

          <a
            href="https://wa.me/9044442989"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-[12px] font-bold rounded-lg transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.528 5.855L.057 23.882a.5.5 0 0 0 .61.61l6.037-1.474A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 0 1-5.17-1.438l-.36-.214-3.754.916.948-3.646-.236-.376A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Join WhatsApp community →
          </a>
        </div>
      </div>
    </div>
  );
}
