"use client";

import React, { useState } from "react";
import { ArrowRight, Check, Lock } from "lucide-react";
import { supabase } from "../../../lib/supabase";

const COUNTRIES = [
  "UK",
  "USA",
  "Canada",
  "Australia",
  "Ireland",
  "Germany",
  "Europe (other)",
  "New Zealand",
  "Singapore / Dubai",
  "Not sure yet",
];

const INTAKES = ["2026", "2027", "2028", "Later"];

type Variant = "card" | "inline" | "dark";

interface Props {
  variant?: Variant;
  /** Where on the page the form sits, saved with the lead so you can see which placement converts. */
  placement?: string;
  /** Article slug or topic, used in the heading and saved with the lead. */
  context?: string;
  id?: string;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function cleanMobile(v: string) {
  return v.replace(/[^\d]/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
}

export function EnquiryForm({ variant = "card", placement = "sidebar", context, id }: Props) {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", country: "", year: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const inline = variant === "inline" || variant === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mobile = cleanMobile(form.mobile);
    if (!form.name.trim()) return setError("Add your name so we know who to call.");
    if (!/^[6-9]\d{9}$/.test(mobile)) return setError("Enter a valid 10-digit Indian mobile number.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("That email doesn't look right.");
    if (!form.country) return setError("Pick a country (or 'Not sure yet').");

    setError("");
    setLoading(true);
    const source_url = typeof window !== "undefined" ? window.location.href : null;
    const message = [
      `Country: ${form.country}`,
      `Placement: magazine/${placement}`,
      context ? `Article: ${context}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
    const payload = {
      name: form.name.trim(),
      mobile,
      email: form.email.trim(),
      target_year: form.year || "Not sure",
      message,
      source_url,
    };

    try {
      const { error: sbError } = await supabase.from("enquiries").insert(payload);
      if (sbError) throw sbError;

      // Email notification; a failure here should not block the student.
      fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});

      window.dataLayer?.push({
        event: "magazine_lead",
        lead_placement: placement,
        lead_country: form.country,
        article: context || null,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Enquiry submission error:", err);
      setError("Something went wrong. Try again, or WhatsApp us at 90444 42989.");
    } finally {
      setLoading(false);
    }
  };

  const shell = inline
    ? "rounded-2xl border border-[#FECDD3] bg-gradient-to-br from-[#FEF2F3] to-white p-6 sm:p-8"
    : "rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/50";

  const input =
    "h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-[#0F172A] placeholder:text-slate-400 focus:border-[#A51C30] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#A51C30]/10";

  if (submitted) {
    return (
      <div id={id} className={`${shell} scroll-mt-24 text-center`}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF2F3] text-[#A51C30]">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <h3 className="text-xl font-bold text-[#0F172A]">Thank you! You&apos;re on the list.</h3>
        <p className="mt-2 text-sm text-slate-500">A counsellor will call you within 24 hours with your roadmap.</p>
        <a
          href="https://wa.me/919044442989?text=Hi%20EduAbroad%2C%20I%20just%20requested%20a%20study%20abroad%20roadmap"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600"
        >
          Chat with us on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={handleSubmit} className={`${shell} scroll-mt-24`} noValidate>
      <span className="inline-flex items-center rounded-full border border-[#FECDD3] bg-[#FEF2F3] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#A51C30]">
        Free · 1-on-1 Counselling
      </span>
      <h2 className={`mt-4 font-bold leading-tight text-[#0F172A] ${inline ? "text-2xl" : "text-xl"}`}>
        {inline ? "Want a personalised study abroad plan?" : "Get your free study abroad roadmap"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        A Harvard-Cambridge alumni-led counsellor calls you within 24 hours with universities, budget and scholarships for your profile.
      </p>

      <div className={`mt-5 grid gap-3 ${inline ? "sm:grid-cols-2" : "grid-cols-1"}`}>
        <input className={input} placeholder="Your name" autoComplete="name" aria-label="Your name"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={input} placeholder="Mobile (10 digits)" inputMode="tel" autoComplete="tel" aria-label="Mobile number"
          value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        <input className={input} placeholder="Email" type="email" autoComplete="email" aria-label="Email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <select className={input} aria-label="Preferred country"
          value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
          <option value="">Preferred country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Planning to start in</p>
        <div className="flex flex-wrap gap-2">
          {INTAKES.map((y) => {
            const active = form.year === y;
            return (
              <button
                type="button"
                key={y}
                onClick={() => setForm({ ...form, year: y })}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active ? "bg-[#A51C30] text-white" : "border border-gray-200 bg-white text-slate-600 hover:border-[#FECDD3] hover:text-[#A51C30]"
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-[#A51C30]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#A51C30] py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#8B1528] disabled:opacity-60"
      >
        {loading ? "Sending..." : "Get my free roadmap"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <Lock className="h-3 w-3" /> Your details stay with EduAbroad. No spam calls.
      </p>
    </form>
  );
}

export default EnquiryForm;
