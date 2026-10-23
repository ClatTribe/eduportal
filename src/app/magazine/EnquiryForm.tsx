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

  const dark = variant === "dark";
  const inline = variant === "inline" || dark;

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

  const shell = dark
    ? "rounded-[28px] bg-[#0E0E10] text-white p-6 sm:p-8"
    : inline
      ? "rounded-[28px] border-2 border-[#0E0E10] bg-[#FFF8E7] p-6 sm:p-8 shadow-[6px_6px_0_#0E0E10]"
      : "rounded-[28px] border-2 border-[#0E0E10] bg-white p-6 shadow-[6px_6px_0_#0E0E10]";

  const input = dark
    ? "h-12 w-full rounded-2xl bg-white/10 border border-white/15 px-4 text-[15px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#D9F99D] focus:bg-white/15"
    : "h-12 w-full rounded-2xl bg-[#F4F2EE] border-2 border-transparent px-4 text-[15px] text-[#0E0E10] placeholder:text-[#0E0E10]/40 focus:outline-none focus:border-[#0E0E10] focus:bg-white";

  if (submitted) {
    return (
      <div id={id} className={`${shell} text-center scroll-mt-24`}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#D9F99D] text-[#0E0E10]">
          <Check className="h-7 w-7" strokeWidth={3} />
        </div>
        <h3 className={`font-display text-2xl font-bold ${dark ? "text-white" : "text-[#0E0E10]"}`}>
          You&apos;re in! 🎉
        </h3>
        <p className={`mt-2 text-sm ${dark ? "text-white/60" : "text-[#0E0E10]/60"}`}>
          A real counsellor will call you within 24 hours with your roadmap.
        </p>
        <a
          href="https://wa.me/919044442989?text=Hi%20EduAbroad%2C%20I%20just%20requested%20a%20study%20abroad%20roadmap"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white"
        >
          Can&apos;t wait? Ping us on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={handleSubmit} className={`${shell} scroll-mt-24`} noValidate>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
          dark ? "bg-[#D9F99D] text-[#0E0E10]" : "bg-[#A51C30] text-white"
        }`}
      >
        Free · 1:1 · No spam
      </span>
      <h2
        className={`font-display mt-4 font-bold tracking-tight ${
          inline ? "text-2xl sm:text-[28px]" : "text-[22px]"
        } leading-[1.1] ${dark ? "text-white" : "text-[#0E0E10]"}`}
      >
        {dark ? "Book your free 1:1 roadmap call" : inline ? "Reading is step one. Want a plan made for you?" : "Get your study abroad roadmap, free"}
      </h2>
      <p className={`mt-2 text-sm leading-relaxed ${dark ? "text-white/60" : "text-[#0E0E10]/60"}`}>
        A Harvard-Cambridge alumni-led counsellor calls you within 24 hours with universities, budget and scholarship options for your profile.
      </p>

      <div className={`mt-5 grid gap-3 ${inline ? "sm:grid-cols-2" : "grid-cols-1"}`}>
        <input
          className={input}
          placeholder="Your name"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          aria-label="Your name"
        />
        <input
          className={input}
          placeholder="Mobile (10 digits)"
          inputMode="tel"
          autoComplete="tel"
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          aria-label="Mobile number"
        />
        <input
          className={input}
          placeholder="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          aria-label="Email"
        />
        <select
          className={input}
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          aria-label="Dream country"
        >
          <option value="">Dream country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c} className="text-[#0E0E10]">
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3">
        <p className={`mb-2 text-[12px] font-semibold ${dark ? "text-white/50" : "text-[#0E0E10]/50"}`}>
          When do you want to fly?
        </p>
        <div className="flex flex-wrap gap-2">
          {INTAKES.map((y) => {
            const active = form.year === y;
            return (
              <button
                type="button"
                key={y}
                onClick={() => setForm({ ...form, year: y })}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? dark
                      ? "bg-[#D9F99D] text-[#0E0E10]"
                      : "bg-[#0E0E10] text-white"
                    : dark
                      ? "bg-white/10 text-white/70 hover:bg-white/20"
                      : "bg-[#F4F2EE] text-[#0E0E10]/70 hover:bg-[#ECE8E1]"
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-[#E11D48]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold transition-transform active:scale-[0.98] disabled:opacity-60 ${
          dark ? "bg-[#D9F99D] text-[#0E0E10] hover:bg-[#ECFCCB]" : "bg-[#A51C30] text-white hover:bg-[#8B1728]"
        }`}
      >
        {loading ? "Sending..." : "Get my free roadmap"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
      <p
        className={`mt-3 flex items-center justify-center gap-1.5 text-[11px] ${
          dark ? "text-white/40" : "text-[#0E0E10]/40"
        }`}
      >
        <Lock className="h-3 w-3" /> We never sell your number. One call, zero spam.
      </p>
    </form>
  );
}

export default EnquiryForm;
