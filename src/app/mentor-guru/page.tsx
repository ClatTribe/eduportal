"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Star,
  Users,
  Briefcase,
  MapPin,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";
import DefaultLayout from "../defaultLayout";

interface Mentor {
  id: string;
  full_name: string;
  headshot_url: string | null;
  headline: string | null;
  bio: string | null;
  specializations: string[] | null;
  degree_level: string[] | null;
  countries: string[] | null;
  universities: string[] | null;
  years_experience: number | null;
  students_guided: number | null;
  rating: number | null;
  sort_order: number | null;
}

interface Answers {
  degree: string;
  countries: string[];
  program: string;
}

const STORAGE_KEY = "mentorGuruAnswers";

const DEGREES = [
  { label: "Undergraduate", sub: "Bachelors abroad" },
  { label: "Postgraduate", sub: "Masters or MBA" },
  { label: "PhD", sub: "Doctorate or research" },
  { label: "PG Diploma /Certificate", sub: "Short programmes" },
];

// Students and mentors use different words for the same level.
const DEGREE_MAP: Record<string, string[]> = {
  Undergraduate: ["bachelors", "undergraduate", "bachelor"],
  Postgraduate: ["masters", "mba", "postgraduate", "master"],
  PhD: ["phd", "doctorate"],
  "PG Diploma /Certificate": ["pg diploma", "diploma", "certificate", "masters"],
};

const COUNTRIES = [
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Germany",
  "Ireland",
  "Netherlands",
  "New Zealand",
  "France",
  "Italy",
  "Singapore",
  "Switzerland",
  "Sweden",
  "Dubai / UAE",
];

// Same country, different spellings between profile data and mentor data.
const COUNTRY_ALIASES: Record<string, string> = {
  usa: "usa",
  "united states": "usa",
  "united states of america": "usa",
  us: "usa",
  uk: "uk",
  "united kingdom": "uk",
  england: "uk",
  britain: "uk",
  "dubai / uae": "uae",
  dubai: "uae",
  uae: "uae",
  "new zealand": "new zealand",
  netherlands: "netherlands",
  holland: "netherlands",
};

const canon = (c: string) => {
  const k = (c || "").trim().toLowerCase();
  return COUNTRY_ALIASES[k] || k;
};

const initials = (n: string) =>
  n.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();

const MentorGuruPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Answers>({
    degree: "",
    countries: [],
    program: "",
  });
  const [profileComplete, setProfileComplete] = useState(false);
  const [myMentorId, setMyMentorId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [fieldQuery, setFieldQuery] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [booked, setBooked] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const titleCase = (s: string) =>
    s
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error: mErr } = await supabase
        .from("mentors")
        .select(
          "id, full_name, headshot_url, headline, bio, specializations, degree_level, countries, universities, years_experience, students_guided, rating, sort_order"
        )
        .eq("status", "active")
        .order("students_guided", { ascending: false });

      if (mErr) throw mErr;
      setMentors((data as Mentor[]) || []);

      let fromProfile: Answers | null = null;

      if (user) {
        const { data: p } = await supabase
          .from("admit_profiles")
          .select("degree, program, target_countries, mentor_id")
          .eq("user_id", user.id)
          .single();

        setMyMentorId(p?.mentor_id || null);

        if (p?.degree && p?.program) {
          setProfileComplete(true);
          fromProfile = {
            degree: p.degree,
            program: p.program,
            countries: p.target_countries || [],
          };
        }
      }

      if (fromProfile) {
        setAnswers(fromProfile);
      } else if (typeof window !== "undefined") {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            setAnswers(JSON.parse(saved));
          } catch {}
        }
      }
    } catch (e: any) {
      console.error("Mentor Guru load error:", e);
      setError("Could not load mentors right now.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  const finish = (final: Answers) => {
    setAnswers(final);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
    } catch {}
  };

  const restart = () => {
    setAnswers(null);
    setDraft({ degree: "", countries: [], program: "" });
    setStep(0);
  };

  const chooseMentor = async (id: string) => {
    if (!user) {
      router.push("/register");
      return;
    }
    try {
      setSaving(id);
      const { error: e } = await supabase
        .from("admit_profiles")
        .update({ mentor_id: id, mentor_assigned_at: new Date().toISOString() })
        .eq("user_id", user.id);
      if (e) throw e;
      setMyMentorId(id);
    } catch (e: any) {
      setError(e?.message || "Could not save your mentor.");
    } finally {
      setSaving(null);
    }
  };

  const fields = Array.from(
    new Set(mentors.flatMap((m) => m.specializations || []))
  ).sort();

  const scoreOf = (m: Mentor, a: Answers) => {
    let s = 0;
    const spec = (m.specializations || []).map((x) => x.toLowerCase());
    if (a.program && spec.includes(a.program.toLowerCase())) s += 50;

    const wanted = DEGREE_MAP[a.degree] || [a.degree.toLowerCase()];
    const levels = (m.degree_level || []).map((x) => x.toLowerCase());
    if (levels.some((l) => wanted.includes(l))) s += 25;

    const mine = (a.countries || []).map(canon);
    const theirs = (m.countries || []).map(canon);
    s += theirs.filter((c) => mine.includes(c)).length * 15;

    return s;
  };

  if (authLoading || loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <RefreshCw className="animate-spin text-red-600" size={22} />
        </div>
      </DefaultLayout>
    );
  }

  // ── The three questions ────────────────────────────────────────────────
  if (!answers) {
    const canNext =
      (step === 0 && draft.degree) ||
      (step === 1 && draft.countries.length > 0) ||
      (step === 2 && draft.program);

    return (
      <DefaultLayout>
        <div className="min-h-screen bg-[#FAFAFA] p-4 pt-24 sm:p-6 sm:pt-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-7">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Find your mentor
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Three quick questions. No signup needed.
              </p>
            </div>

            <div className="flex gap-1.5 mb-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= step ? "bg-[#af0100]" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            <div className="bg-white border border-red-200 rounded-2xl p-5 sm:p-7">
              {step === 0 && (
                <>
                  <p className="text-xs text-gray-400 mb-1">Question 1 of 3</p>
                  <h2 className="text-lg font-semibold text-gray-900 mb-5">
                    What do you want to study abroad?
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {DEGREES.map((d) => (
                      <button
                        key={d.label}
                        onClick={() => {
                          setDraft({ ...draft, degree: d.label });
                          setStep(1);
                        }}
                        className={`text-left border rounded-xl p-4 transition-all hover:border-[#af0100] hover:shadow-[0_4px_14px_-8px_rgba(175,1,0,0.45)] ${
                          draft.degree === d.label
                            ? "border-[#af0100] bg-red-50"
                            : "border-gray-200"
                        }`}
                      >
                        <p className="font-medium text-gray-900">{d.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{d.sub}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <p className="text-xs text-gray-400 mb-1">Question 2 of 3</p>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Where do you want to go?
                  </h2>
                  <p className="text-xs text-gray-500 mb-4">
                    Pick as many as you like, or type your own
                  </p>

                  {draft.countries.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {draft.countries.map((c) => (
                        <span
                          key={c}
                          className="text-sm bg-[#af0100] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5"
                        >
                          {c}
                          <button
                            onClick={() =>
                              setDraft({
                                ...draft,
                                countries: draft.countries.filter((x) => x !== c),
                              })
                            }
                            aria-label={`Remove ${c}`}
                            className="hover:opacity-70"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="relative mb-4">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={countryQuery}
                      onChange={(e) => setCountryQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && countryQuery.trim()) {
                          e.preventDefault();
                          const v = titleCase(countryQuery);
                          if (!draft.countries.some((c) => canon(c) === canon(v)))
                            setDraft({
                              ...draft,
                              countries: [...draft.countries, v],
                            });
                          setCountryQuery("");
                        }
                      }}
                      placeholder="Search or type a country, then press Enter"
                      className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#af0100]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {COUNTRIES.filter((c) =>
                      c.toLowerCase().includes(countryQuery.trim().toLowerCase())
                    ).map((c) => {
                      const on = draft.countries.includes(c);
                      return (
                        <button
                          key={c}
                          onClick={() => {
                            setDraft({
                              ...draft,
                              countries: on
                                ? draft.countries.filter((x) => x !== c)
                                : [...draft.countries, c],
                            });
                            setCountryQuery("");
                          }}
                          className={`text-sm px-3.5 py-2 rounded-full border transition-colors ${
                            on
                              ? "bg-[#af0100] text-white border-[#af0100]"
                              : "bg-white text-gray-700 border-gray-200 hover:border-[#af0100]"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}

                    {countryQuery.trim() &&
                      !COUNTRIES.some(
                        (c) => canon(c) === canon(countryQuery)
                      ) && (
                        <button
                          onClick={() => {
                            const v = titleCase(countryQuery);
                            if (
                              !draft.countries.some((c) => canon(c) === canon(v))
                            )
                              setDraft({
                                ...draft,
                                countries: [...draft.countries, v],
                              });
                            setCountryQuery("");
                          }}
                          className="text-sm px-3.5 py-2 rounded-full border border-dashed border-[#af0100] text-[#af0100] hover:bg-red-50"
                        >
                          Add &ldquo;{titleCase(countryQuery)}&rdquo;
                        </button>
                      )}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="text-xs text-gray-400 mb-1">Question 3 of 3</p>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    What field are you interested in?
                  </h2>
                  <p className="text-xs text-gray-500 mb-4">
                    Search the fields our mentors cover, or type your own
                  </p>

                  <div className="relative mb-4">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={fieldQuery}
                      onChange={(e) => setFieldQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && fieldQuery.trim()) {
                          e.preventDefault();
                          finish({ ...draft, program: titleCase(fieldQuery) });
                        }
                      }}
                      placeholder="e.g. Physics, Data Science, Nursing"
                      className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#af0100]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                    {fields
                      .filter((f) =>
                        f.toLowerCase().includes(fieldQuery.trim().toLowerCase())
                      )
                      .map((f) => (
                        <button
                          key={f}
                          onClick={() => finish({ ...draft, program: f })}
                          className="text-sm px-3.5 py-2 rounded-full border bg-white text-gray-700 border-gray-200 hover:border-[#af0100] hover:bg-red-50 transition-colors"
                        >
                          {f}
                        </button>
                      ))}

                    {fieldQuery.trim() &&
                      !fields.some(
                        (f) =>
                          f.toLowerCase() === fieldQuery.trim().toLowerCase()
                      ) && (
                        <button
                          onClick={() =>
                            finish({ ...draft, program: titleCase(fieldQuery) })
                          }
                          className="text-sm px-3.5 py-2 rounded-full border border-dashed border-[#af0100] text-[#af0100] hover:bg-red-50"
                        >
                          Use &ldquo;{titleCase(fieldQuery)}&rdquo;
                        </button>
                      )}

                    {!fieldQuery.trim() && (
                      <button
                        onClick={() => finish({ ...draft, program: "Other" })}
                        className="text-sm px-3.5 py-2 rounded-full border border-gray-200 text-gray-500 hover:border-[#af0100]"
                      >
                        Something else
                      </button>
                    )}
                  </div>
                </>
              )}

              <div className="flex items-center justify-between mt-7 pt-5 border-t border-gray-100">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-0 flex items-center gap-1"
                >
                  <ArrowLeft size={15} /> Back
                </button>
                {step < 2 && (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canNext}
                    className="bg-[#af0100] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────
  const scored = mentors
    .map((m) => ({ m, score: scoreOf(m, answers) }))
    .filter(({ m }) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        m.full_name.toLowerCase().includes(q) ||
        (m.headline || "").toLowerCase().includes(q) ||
        (m.specializations || []).some((s) => s.toLowerCase().includes(q)) ||
        (m.countries || []).some((c) => c.toLowerCase().includes(q))
      );
    })
    .sort(
      (a, b) =>
        (b.m.sort_order || 0) - (a.m.sort_order || 0) ||
        b.score - a.score ||
        (b.m.students_guided || 0) - (a.m.students_guided || 0)
    );

  const recommended = scored.filter((x) => x.score >= 15);
  const others = scored.filter((x) => x.score < 15);

  const Card = ({ m, score }: { m: Mentor; score: number }) => {
    const mine = m.id === myMentorId;
    const fieldMatch = (m.specializations || []).some(
      (s) => s.toLowerCase() === answers.program.toLowerCase()
    );
    const degreeMatch = (m.degree_level || []).some((l) =>
      (DEGREE_MAP[answers.degree] || []).includes(l.toLowerCase())
    );
    const countryMatch = (m.countries || []).some((c) =>
      answers.countries.map(canon).includes(canon(c))
    );
    const reasons = [
      fieldMatch && "Advises on your field",
      degreeMatch && "Same degree level",
      countryMatch && "Knows your country",
    ].filter(Boolean) as string[];

    return (
      <div
        className={`group bg-white rounded-xl p-4 flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_-8px_rgba(175,1,0,0.45)] ${
          mine
            ? "border-2 border-[#af0100]"
            : "border border-red-200 hover:border-[#af0100]"
        }`}
      >
        <div className="flex items-start gap-3 mb-3">
          {m.headshot_url ? (
            <img
              src={m.headshot_url}
              alt={m.full_name}
              className="w-11 h-11 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-11 h-11 shrink-0 rounded-full bg-red-50 text-red-700 font-semibold text-sm flex items-center justify-center group-hover:bg-red-100 transition-colors">
              {initials(m.full_name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 leading-snug break-words">
              {m.full_name}
            </h3>
            <p className="text-xs text-gray-500 leading-snug break-words">
              {m.headline}
            </p>
          </div>
        </div>

        {!!m.specializations?.length && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {m.specializations.slice(0, 3).map((s) => (
              <span
                key={s}
                className={`text-[11px] px-2.5 py-1 rounded-full ${
                  s.toLowerCase() === answers.program.toLowerCase()
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {m.bio && (
          <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
            {m.bio}
          </p>
        )}

        {reasons.length > 0 && (
          <div className="space-y-1 mb-3">
            {reasons.map((r) => (
              <p key={r} className="text-xs text-gray-700 flex items-center gap-1.5">
                <Check size={13} className="text-green-600 shrink-0" />
                {r}
              </p>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 mb-4 mt-auto pt-3 border-t border-gray-100">
          {!!m.years_experience && (
            <span className="flex items-center gap-1">
              <Briefcase size={12} /> {m.years_experience} yrs
            </span>
          )}
          {!!m.students_guided && (
            <span className="flex items-center gap-1">
              <Users size={12} /> {m.students_guided}
            </span>
          )}
          {!!m.rating && (
            <span className="flex items-center gap-1">
              <Star size={12} /> {m.rating}
            </span>
          )}
          {!!m.countries?.length && (
            <span className="flex items-center gap-1 truncate">
              <MapPin size={12} /> {m.countries.join(", ")}
            </span>
          )}
        </div>

        {user ? (
          <button
            onClick={() => chooseMentor(m.id)}
            disabled={saving === m.id || mine}
            className={`w-full text-sm font-medium py-2.5 rounded-xl border transition-all disabled:opacity-60 ${
              mine
                ? "border-[#af0100] text-[#af0100] bg-red-50"
                : "border-gray-200 text-gray-700 group-hover:bg-[#af0100] group-hover:text-white group-hover:border-[#af0100]"
            }`}
          >
            {mine
              ? "Your mentor"
              : saving === m.id
              ? "Saving..."
              : "Choose as my mentor"}
          </button>
        ) : (
          <button
            onClick={() =>
              setBooked((prev) =>
                prev.includes(m.id) ? prev : [...prev, m.id]
              )
            }
            className={`w-full text-sm font-medium py-2.5 rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
              booked.includes(m.id)
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-gray-200 text-gray-700 group-hover:bg-[#af0100] group-hover:text-white group-hover:border-[#af0100]"
            }`}
          >
            {booked.includes(m.id) ? (
              <>
                <Check size={15} className="text-green-600" />
                Appointment requested
              </>
            ) : (
              "Book an appointment"
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-[#FAFAFA] p-4 pt-24 sm:p-6 sm:pt-6">
        <div className="max-w-6xl mx-auto">
          {!profileComplete && (
            <div className="bg-white border border-red-200 rounded-xl p-4 mb-5 flex items-start gap-3">
              <Sparkles size={18} className="text-[#af0100] mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Get more than mentors
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Complete your profile to unlock university shortlisting,
                  document feedback and scholarship matches.
                </p>
              </div>
              <button
                onClick={() => router.push(user ? "/profile" : "/register")}
                className="bg-[#af0100] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 shrink-0"
              >
                {user ? "Complete profile" : "Sign up free"}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Mentor Guru
              </h1>
              <span className="text-sm text-gray-400">{mentors.length}</span>
            </div>
            <div className="relative w-full sm:w-64">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search mentors"
                className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-red-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 mb-5">
            <span>Showing for</span>
            {[answers.degree, answers.program, ...answers.countries]
              .filter(Boolean)
              .map((c) => (
                <span
                  key={c}
                  className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full"
                >
                  {c}
                </span>
              ))}
            <button
              onClick={profileComplete ? () => router.push("/profile") : restart}
              className="underline hover:text-red-600 flex items-center gap-1"
            >
              <X size={12} /> change
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          {recommended.length > 0 && (
            <>
              <div className="flex items-baseline gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Recommended for you
                </h2>
                <span className="text-sm text-gray-400">
                  {recommended.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-7">
                {recommended.map(({ m, score }) => (
                  <Card key={m.id} m={m} score={score} />
                ))}
              </div>
            </>
          )}

          {others.length > 0 && (
            <>
              <div className="flex items-baseline gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {recommended.length > 0 ? "All other mentors" : "All mentors"}
                </h2>
                <span className="text-sm text-gray-400">{others.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {others.map(({ m, score }) => (
                  <Card key={m.id} m={m} score={score} />
                ))}
              </div>
            </>
          )}

          {scored.length === 0 && !error && (
            <div className="bg-white border border-red-200 rounded-xl p-10 text-center">
              <p className="text-gray-600 text-sm">
                No mentors found. Try clearing the search.
              </p>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MentorGuruPage;