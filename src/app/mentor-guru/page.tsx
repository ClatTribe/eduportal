"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Check,
  Star,
  Users,
  Briefcase,
  MapPin,
  RefreshCw,
  ArrowRight,
  Search,
  X,
  Info,
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
  match_score: number;
}

interface Criteria {
  program: string;
  degree: string;
  target_countries: string[];
  mentor_id: string | null;
}

const has = (arr: string[] | null | undefined, v: string) =>
  !!v && (arr || []).some((x) => x.toLowerCase() === v.toLowerCase());

const overlaps = (arr: string[] | null | undefined, vs: string[]) =>
  (arr || []).some((x) =>
    (vs || []).some((v) => v.toLowerCase() === x.toLowerCase())
  );

const initials = (n: string) =>
  n.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();

const MentorGuruPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState<Criteria | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [field, setField] = useState("All");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/register");
  }, [authLoading, user, router]);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const { data: profile } = await supabase
        .from("admit_profiles")
        .select("program, degree, target_countries, mentor_id")
        .eq("user_id", user.id)
        .single();

      const crit: Criteria = {
        program: profile?.program || "",
        degree: profile?.degree || "",
        target_countries: profile?.target_countries || [],
        mentor_id: profile?.mentor_id || null,
      };
      setCriteria(crit);

      if (crit.program && crit.degree) {
        const { data, error: rpcError } = await supabase.rpc("match_mentors");
        if (rpcError) throw rpcError;
        setMentors((data as Mentor[]) || []);
      }
    } catch (e: any) {
      console.error("Mentor Guru load error:", e);
      setError(e?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const chooseMentor = async (id: string) => {
    if (!user) return;
    try {
      setSaving(id);
      const { error: e } = await supabase
        .from("admit_profiles")
        .update({ mentor_id: id, mentor_assigned_at: new Date().toISOString() })
        .eq("user_id", user.id);
      if (e) throw e;
      setCriteria((p) => (p ? { ...p, mentor_id: id } : p));
    } catch (e: any) {
      setError(e?.message || "Could not save your mentor.");
    } finally {
      setSaving(null);
    }
  };

  const cancelMentor = async () => {
    if (!user) return;
    if (!confirm("Remove this mentor? You can choose another one anytime.")) return;
    try {
      setSaving("cancel");
      const { error: e } = await supabase
        .from("admit_profiles")
        .update({ mentor_id: null, mentor_assigned_at: null })
        .eq("user_id", user.id);
      if (e) throw e;
      setCriteria((p) => (p ? { ...p, mentor_id: null } : p));
    } catch (e: any) {
      setError(e?.message || "Could not remove your mentor.");
    } finally {
      setSaving(null);
    }
  };

  if (authLoading || loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <div className="text-red-600 flex items-center gap-2">
            <RefreshCw className="animate-spin" size={20} />
            Loading mentors...
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!user) return null;

  const missing: string[] = [];
  if (!criteria?.degree) missing.push("Target degree");
  if (!criteria?.program) missing.push("Field of study");
  if (!criteria?.target_countries?.length) missing.push("Target countries");
  const completion = Math.round(((3 - missing.length) / 3) * 100);

  if (!criteria?.program || !criteria?.degree) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-[#FAFAFA] p-4 pt-24 sm:p-6 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-red-600" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your mentor is waiting
            </h1>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              We connect you with mentors who studied what you want to study.
              Complete your profile so we know what to look for.
            </p>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mb-5">
              {completion}% complete &middot; {missing.length} field
              {missing.length === 1 ? "" : "s"} left
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-7">
              {missing.map((m) => (
                <span
                  key={m}
                  className="text-xs bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full border border-amber-100"
                >
                  {m}
                </span>
              ))}
            </div>
            <button
              onClick={() => router.push("/profile")}
              className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              Complete profile <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const allFields = Array.from(
    new Set(mentors.flatMap((m) => m.specializations || []))
  ).sort();

  const visible = mentors.filter((m) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      m.full_name.toLowerCase().includes(q) ||
      (m.headline || "").toLowerCase().includes(q) ||
      (m.specializations || []).some((s) => s.toLowerCase().includes(q)) ||
      (m.countries || []).some((c) => c.toLowerCase().includes(q));
    const matchesField = field === "All" || has(m.specializations, field);
    return matchesQuery && matchesField;
  });

  const isRecommended = (m: Mentor) =>
    has(m.specializations, criteria!.program) ||
    overlaps(m.countries, criteria!.target_countries);

  const myMentor = visible.find((m) => m.id === criteria?.mentor_id);
  const rest = visible.filter((m) => m.id !== criteria?.mentor_id);
  const recommended = rest.filter(isRecommended);
  const others = rest.filter((m) => !isRecommended(m));

  const Card = ({ mentor, mine = false }: { mentor: Mentor; mine?: boolean }) => {
    const fieldMatch = has(mentor.specializations, criteria!.program);
    const degreeMatch = has(mentor.degree_level, criteria!.degree);
    const countryMatch = overlaps(mentor.countries, criteria!.target_countries);
    const reasons = [
      fieldMatch && "Studied your field",
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
          {mentor.headshot_url ? (
            <img
              src={mentor.headshot_url}
              alt={mentor.full_name}
              className="w-11 h-11 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-11 h-11 shrink-0 rounded-full bg-red-50 text-red-700 font-semibold text-sm flex items-center justify-center group-hover:bg-red-100 transition-colors">
              {initials(mentor.full_name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 leading-snug break-words">
              {mentor.full_name}
            </h3>
            <p className="text-xs text-gray-500 leading-snug break-words">
              {mentor.headline}
            </p>
          </div>
        </div>

        {!!mentor.specializations?.length && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {mentor.specializations.slice(0, 3).map((s) => (
              <span
                key={s}
                className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                  has([criteria!.program], s)
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-50 text-gray-600 group-hover:bg-gray-100"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {mentor.bio && (
          <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
            {mentor.bio}
          </p>
        )}

        {reasons.length > 0 && (
          <div className="space-y-1 mb-3">
            {reasons.map((r) => (
              <p
                key={r}
                className="text-xs text-gray-700 flex items-center gap-1.5"
              >
                <Check size={13} className="text-green-600 shrink-0" />
                {r}
              </p>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 mb-4 mt-auto pt-3 border-t border-gray-100">
          {!!mentor.years_experience && (
            <span className="flex items-center gap-1">
              <Briefcase size={12} /> {mentor.years_experience} yrs
            </span>
          )}
          {!!mentor.students_guided && (
            <span className="flex items-center gap-1">
              <Users size={12} /> {mentor.students_guided}
            </span>
          )}
          {!!mentor.rating && (
            <span className="flex items-center gap-1">
              <Star size={12} /> {mentor.rating}
            </span>
          )}
          {!!mentor.countries?.length && (
            <span className="flex items-center gap-1 truncate">
              <MapPin size={12} /> {mentor.countries.join(", ")}
            </span>
          )}
        </div>

        {mine ? (
          <button
            onClick={cancelMentor}
            disabled={saving === "cancel"}
            className="w-full text-sm font-medium py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            <X size={15} />
            {saving === "cancel" ? "Removing..." : "Remove mentor"}
          </button>
        ) : (
          <button
            onClick={() => chooseMentor(mentor.id)}
            disabled={saving === mentor.id}
            className="w-full text-sm font-medium py-2.5 rounded-xl border border-gray-200 text-gray-700 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all disabled:opacity-60"
          >
            {saving === mentor.id
              ? "Saving..."
              : criteria?.mentor_id
              ? "Switch to this mentor"
              : "Choose as my mentor"}
          </button>
        )}
      </div>
    );
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-[#FAFAFA] p-4 pt-24 sm:p-6 sm:pt-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Mentor Guru
              </h1>
              <span className="text-sm text-gray-400">{mentors.length}</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search mentors"
                  className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-red-400 transition-colors"
                />
              </div>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-red-400 max-w-[9rem]"
              >
                <option value="All">All fields</option>
                {allFields.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 mb-5">
            <span>Matching on</span>
            {[
              criteria?.degree,
              criteria?.program,
              ...(criteria?.target_countries || []),
            ]
              .filter(Boolean)
              .map((chip) => (
                <span
                  key={chip as string}
                  className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full"
                >
                  {chip}
                </span>
              ))}
            <button
              onClick={() => router.push("/profile")}
              className="underline hover:text-red-600"
            >
              edit
            </button>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-1 hover:text-red-600"
            >
              <Info size={13} /> how this works
            </button>
          </div>

          {showHelp && (
            <p className="text-sm text-gray-600 leading-relaxed bg-white border border-gray-200 rounded-xl p-3 mb-5">
              You can see every mentor on our panel. A mentor is marked
              recommended when they advise on your field of study, or have
              studied in one of your target countries. The green ticks on each
              card show which applied.
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          {myMentor && (
            <>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Your mentor
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-7">
                <Card mentor={myMentor} mine />
              </div>
            </>
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
                {recommended.map((m) => (
                  <Card key={m.id} mentor={m} />
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
                {others.map((m) => (
                  <Card key={m.id} mentor={m} />
                ))}
              </div>
            </>
          )}

          {visible.length === 0 && !error && (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
              <p className="text-gray-600 text-sm">
                No mentors found. Try clearing the search or filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MentorGuruPage;