"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../lib/supabase";
import {
  Globe,
  Wallet,
  TrendingUp,
  BarChart3,
  Users,
  Lock,
  Clock,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ArrowRight,
  ThumbsUp,
  LogIn,
} from "lucide-react";

const TOOL_NAME = "course_match";

const STUDY_LEVEL_PRIORITY: Record<string, number> = {
  Bachelor: 1,
  Master: 2,
  PhD: 3,
  Diploma: 4,
  Certificate: 5,
  Postgraduate: 6,
};

const STUDY_LEVEL_ALIASES: Record<string, string[]> = {
  Bachelor: [
    "bachelor",
    "undergraduate",
    "bachelors",
    "b.sc",
    "bsc",
    "b.a.",
    "ba",
    "b.e.",
    "be",
  ],
  Master: [
    "master",
    "masters",
    "postgraduate",
    "m.sc",
    "msc",
    "m.a.",
    "ma",
    "m.tech",
    "mtech",
  ],
  PhD: ["phd", "doctorate", "ph.d", "doctoral"],
  Diploma: ["diploma"],
  Certificate: ["certificate", "cert"],
};

const COUNTRY_ALIASES: Record<string, string[]> = {
  "United States": ["usa", "us", "united states", "america"],
  "United Kingdom": ["uk", "united kingdom", "england", "britain"],
  Canada: ["canada", "canadian"],
  Australia: ["australia", "australian"],
  Germany: ["germany", "german"],
  France: ["france", "french"],
  Netherlands: ["netherlands", "dutch"],
  Singapore: ["singapore"],
  India: ["india", "indian"],
  China: ["china", "chinese"],
  Japan: ["japan", "japanese"],
};

// ─── Engagement Helpers ──────────────────────────────────────────────────
async function logToolUsage(userId: string) {
  try {
    await supabase.rpc("log_tool_usage", {
      p_user_id: userId,
      p_tool_name: TOOL_NAME,
    });
  } catch (err) {
    console.error("Failed to log tool usage:", err);
  }
}

async function likeCourse(userId: string, courseName: string) {
  try {
    await supabase.rpc("like_course", {
      p_user_id: userId,
      p_course_name: courseName,
    });
  } catch (err) {
    console.error("Failed to like course:", err);
  }
}

async function unlikeCourse(userId: string, courseName: string) {
  try {
    const { error } = await supabase.rpc("unlike_course", {
      p_user_id: userId,
      p_course_name: courseName,
    });
    if (error) {
      const { data: row } = await supabase
        .from("student_engagement")
        .select("liked_courses")
        .eq("user_id", userId)
        .single();
      if (row) {
        const updated = (row.liked_courses || []).filter(
          (c: string) => c !== courseName
        );
        await supabase
          .from("student_engagement")
          .update({
            liked_courses: updated,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      }
    }
  } catch (err) {
    console.error("Failed to unlike course:", err);
  }
}

async function checkIfLiked(
  userId: string,
  courseName: string
): Promise<boolean> {
  try {
    const { data } = await supabase.rpc("check_course_liked", {
      p_user_id: userId,
      p_course_name: courseName,
    });
    return data === true;
  } catch {
    return false;
  }
}

// ─── Data Helpers ────────────────────────────────────────────────────────
function cleanVal(val: any): string {
  if (val === null || val === undefined) return "";
  return val.toString().trim();
}

function textMatchesStudyLevel(text: string, studyLevel: string): boolean {
  const t = text.toLowerCase();
  const aliases = STUDY_LEVEL_ALIASES[studyLevel] || [studyLevel.toLowerCase()];
  return aliases.some((alias) => t.includes(alias));
}

function countryMatchesTarget(
  courseCountry: string,
  targetCountries: string[]
): boolean {
  if (targetCountries.length === 0) return true;
  const loc = courseCountry.toLowerCase();
  return targetCountries.some((country) => {
    const countryKey = country.toLowerCase();
    const aliases = COUNTRY_ALIASES[country] || [countryKey];
    return aliases.some((alias) => loc.includes(alias));
  });
}

// ─── Matching Algorithm ──────────────────────────────────────────────────
interface UserProfile {
  name: string;
  target_degree: string;
  target_countries: string[];
  budget: string;
  target_field: string;
  test_scores?: { exam: string; score: string }[];
}

interface MatchResult {
  score: number;
  factors: {
    label: string;
    score: number;
    detail: string;
    positive: boolean;
  }[];
}

function parseBudgetToUSD(budgetStr: string): { min: number; max: number } {
  if (!budgetStr) return { min: 0, max: 999999 };
  const num = parseInt(budgetStr.replace(/[^0-9]/g, "")) || 0;
  return { min: 0, max: num };
}

function parseFeeString(feeStr: string): number | null {
  if (!feeStr) return null;
  let s = feeStr.toString().trim();
  s = s.replace(/[₹$£€]/g, "").replace(/,/g, "").trim().toLowerCase();
  const numMatch = s.match(/([\d.]+)/);
  if (numMatch) return parseFloat(numMatch[1]);
  return null;
}

function extractEnglishRequirement(
  course: any,
  examType: string
): number | null {
  const scoreField = `${examType} Score`;
  const score = course[scoreField];
  if (!score) return null;
  return parseFloat(score.toString().replace(/[^0-9.]/g, "")) || null;
}

function computeMatch(profile: UserProfile, course: any): MatchResult {
  const factors: MatchResult["factors"] = [];
  let totalWeight = 0;
  let weightedScore = 0;

  const courseLevel = course?.["Study Level"] || "";
  const courseCountry = course?.["Country"] || "";
  const courseFees = course?.["Yearly Tuition Fees"] || "";
  const courseDuration = course?.["Duration"] || "";

  // ── 1. Study Level Match (weight: 25) ──
  const weight1 = 25;
  totalWeight += weight1;
  const userDegree = profile.target_degree || "";
  const levelMatch = textMatchesStudyLevel(courseLevel, userDegree);

  if (levelMatch) {
    weightedScore += weight1;
    factors.push({
      label: "Study Level",
      score: 100,
      detail: `${courseLevel} matches your ${userDegree} interest`,
      positive: true,
    });
  } else if (courseLevel) {
    weightedScore += weight1 * 0.3;
    factors.push({
      label: "Study Level",
      score: 30,
      detail: `${courseLevel} doesn't match ${userDegree}`,
      positive: false,
    });
  } else {
    weightedScore += weight1 * 0.5;
    factors.push({
      label: "Study Level",
      score: 50,
      detail: "Study level data unavailable",
      positive: false,
    });
  }

  // ── 2. Country Match (weight: 20) ──
  const weight2 = 20;
  totalWeight += weight2;
  const countryMatch = countryMatchesTarget(
    courseCountry,
    profile.target_countries
  );

  if (countryMatch) {
    weightedScore += weight2;
    factors.push({
      label: "Country",
      score: 100,
      detail: `${courseCountry} is in your preferred countries`,
      positive: true,
    });
  } else if (profile.target_countries.length === 0) {
    weightedScore += weight2 * 0.5;
    factors.push({
      label: "Country",
      score: 50,
      detail: "No country preference set",
      positive: true,
    });
  } else {
    weightedScore += weight2 * 0.15;
    factors.push({
      label: "Country",
      score: 15,
      detail: `${courseCountry} not in your preferences`,
      positive: false,
    });
  }

  // ── 3. Budget Fit (weight: 20) ──
  const weight3 = 20;
  totalWeight += weight3;
  if (courseFees && profile.budget) {
    const feesUSD = parseFeeString(courseFees);
    const { max } = parseBudgetToUSD(profile.budget);
    if (feesUSD !== null && max < 999999) {
      if (feesUSD <= max) {
        weightedScore += weight3;
        factors.push({
          label: "Budget",
          score: 100,
          detail: `Fees $${feesUSD.toFixed(0)} — within your budget`,
          positive: true,
        });
      } else if (feesUSD <= max * 1.2) {
        weightedScore += weight3 * 0.6;
        factors.push({
          label: "Budget",
          score: 60,
          detail: `Fees $${feesUSD.toFixed(0)} — slightly above budget`,
          positive: false,
        });
      } else {
        weightedScore += weight3 * 0.2;
        factors.push({
          label: "Budget",
          score: 20,
          detail: `Fees $${feesUSD.toFixed(0)} — over budget`,
          positive: false,
        });
      }
    } else {
      weightedScore += weight3 * 0.5;
      factors.push({
        label: "Budget",
        score: 50,
        detail: "Fee data unclear",
        positive: true,
      });
    }
  } else {
    weightedScore += weight3 * 0.5;
    factors.push({
      label: "Budget",
      score: 50,
      detail: profile.budget ? "Fee data unavailable" : "No budget set",
      positive: true,
    });
  }

  // ── 4. English Requirements (weight: 15) ──
  const weight4 = 15;
  totalWeight += weight4;
  const testScores = profile.test_scores || [];
  let bestEnglishResult: {
    score: number;
    detail: string;
    positive: boolean;
  } | null = null;

  if (testScores.length > 0) {
    for (const ts of testScores) {
      if (!ts.exam || !ts.score) continue;
      const studentScore = parseFloat(ts.score);
      if (isNaN(studentScore)) continue;

      let courseRequirement = null;
      let examMatch = false;

      if (ts.exam.toLowerCase().includes("ielts")) {
        courseRequirement = extractEnglishRequirement(course, "IELTS");
        examMatch = !!courseRequirement;
      } else if (ts.exam.toLowerCase().includes("toefl")) {
        courseRequirement = extractEnglishRequirement(course, "TOEFL");
        examMatch = !!courseRequirement;
      } else if (ts.exam.toLowerCase().includes("pte")) {
        courseRequirement = extractEnglishRequirement(course, "PTE");
        examMatch = !!courseRequirement;
      }

      if (examMatch && courseRequirement) {
        if (studentScore >= courseRequirement) {
          bestEnglishResult = {
            score: 100,
            detail: `${ts.exam} ${studentScore} — meets requirement (${courseRequirement})`,
            positive: true,
          };
          break;
        } else {
          const gap = courseRequirement - studentScore;
          const s = gap <= 1 ? 70 : gap <= 2 ? 50 : 30;
          if (!bestEnglishResult || s > bestEnglishResult.score) {
            bestEnglishResult = {
              score: s,
              detail: `${ts.exam} ${studentScore} — below requirement (${courseRequirement})`,
              positive: false,
            };
          }
        }
      }
    }
  }

  if (bestEnglishResult) {
    weightedScore += weight4 * (bestEnglishResult.score / 100);
    factors.push({ label: "English Proficiency", ...bestEnglishResult });
  } else {
    weightedScore += weight4 * 0.4;
    factors.push({
      label: "English Proficiency",
      score: 40,
      detail: "Add test scores for eligibility check",
      positive: false,
    });
  }

  // ── 5. Duration & Intake (weight: 20) ──
  const weight5 = 20;
  totalWeight += weight5;
  if (courseDuration) {
    weightedScore += weight5 * 0.7;
    factors.push({
      label: "Duration",
      score: 70,
      detail: `${courseDuration} duration available`,
      positive: true,
    });
  } else {
    weightedScore += weight5 * 0.5;
    factors.push({
      label: "Duration",
      score: 50,
      detail: "Duration data unavailable",
      positive: false,
    });
  }

  const score =
    totalWeight > 0
      ? Math.round((weightedScore / totalWeight) * 100)
      : 50;
  return { score, factors };
}

// ─── Sub-components ──────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  iconColor = "#A51C30",
  blurred = false,
}: {
  icon: any;
  label: string;
  value: string | null;
  iconColor?: string;
  blurred?: boolean;
}) {
  if (!value && !blurred) return null;
  return (
    <div
      className="relative p-4 rounded-xl border overflow-hidden"
      style={{ borderColor: "#FECDD3", backgroundColor: "#FEF2F3" }}
    >
      <Icon
        className="w-3.5 h-3.5 mb-1.5 opacity-60"
        style={{ color: iconColor }}
      />
      <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">
        {label}
      </p>
      <div
        className={
          blurred ? "blur-[6px] select-none pointer-events-none" : ""
        }
      >
        <p className="text-sm font-black text-gray-800 truncate">
          {value || "$45,000"}
        </p>
      </div>
      {blurred && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/30">
          <Lock
            className="w-3.5 h-3.5 opacity-40"
            style={{ color: "#A51C30" }}
          />
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 70 ? "#10b981" : score >= 45 ? "#A51C30" : "#ef4444";
  const label =
    score >= 70 ? "Strong Match" : score >= 45 ? "Moderate" : "Weak Match";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="5"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-gray-800">{score}</span>
        </div>
      </div>
      <span
        className="text-[9px] font-bold uppercase tracking-widest"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

function FactorRow({
  label,
  score,
  detail,
  positive,
}: {
  label: string;
  score: number;
  detail: string;
  positive: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="shrink-0">
        {positive ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <AlertTriangle
            className="w-3.5 h-3.5"
            style={{ color: "#A51C30" }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">
            {label}
          </span>
          <span className="text-[9px] font-bold text-gray-500">{score}%</span>
        </div>
        <div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${score}%`,
              backgroundColor:
                score >= 70 ? "#10b981" : score >= 40 ? "#A51C30" : "#ef4444",
            }}
          />
        </div>
        <p className="text-[9px] text-gray-500 mt-0.5">{detail}</p>
      </div>
    </div>
  );
}

function RecommendedCard({
  course,
}: {
  course: {
    id: number;
    University: string;
    "Program Name": string;
    Country: string;
    matchScore: number;
  };
}) {
  const color = course.matchScore >= 70 ? "#10b981" : "#A51C30";
  return (
    <Link href={`/course/${course.id}`} className="group block">
      <div
        className="flex items-center gap-3 p-3 rounded-xl border hover:border-opacity-50 transition-all"
        style={{ borderColor: "#FECDD3" }}
      >
        <div
          className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border"
          style={{ borderColor: `${color}30`, color }}
        >
          {course.matchScore}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate group-hover:opacity-75">
            {course["Program Name"]}
          </p>
          <p className="text-[9px] text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-2.5 h-2.5" />
            {course.Country || "International"}
          </p>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </Link>
  );
}

function LikeButton({
  isLiked,
  loading,
  disabled,
  onClick,
}: {
  isLiked: boolean;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading || disabled) return;
    if (!isLiked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || disabled}
      className="relative shrink-0 group/like"
      title={
        disabled
          ? "Login to like courses"
          : isLiked
          ? "Remove like"
          : "Like this course"
      }
    >
      <style jsx>{`
        @keyframes like-pop {
          0% {
            transform: scale(1);
          }
          15% {
            transform: scale(1.4) rotate(-8deg);
          }
          30% {
            transform: scale(0.85) rotate(4deg);
          }
          50% {
            transform: scale(1.15) rotate(-2deg);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes like-burst {
          0% {
            opacity: 0.8;
            transform: scale(0.6);
          }
          100% {
            opacity: 0;
            transform: scale(2.5);
          }
        }
        .like-pop {
          animation: like-pop 0.55s cubic-bezier(0.17, 0.89, 0.32, 1.28);
        }
        .like-burst {
          animation: like-burst 0.5s ease-out forwards;
        }
      `}</style>

      {animating && (
        <div
          className="like-burst absolute inset-0 rounded-full pointer-events-none"
          style={{ border: "2px solid #A51C30", margin: "-6px" }}
        />
      )}

      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : isLiked
            ? "border"
            : "bg-gray-50 hover:bg-red-50 border"
        } ${animating ? "like-pop" : ""}`}
        style={{
          borderColor: isLiked ? "#A51C30" : "#FECDD3",
          backgroundColor: isLiked ? "#FEF2F3" : undefined,
        }}
      >
        {loading ? (
          <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
        ) : (
          <ThumbsUp
            className={`w-4 h-4 transition-all ${
              disabled
                ? "text-gray-400"
                : isLiked
                ? "fill-current"
                : "text-gray-400 group-hover/like:text-red-500"
            }`}
            style={isLiked ? { color: "#A51C30" } : {}}
          />
        )}
      </div>
    </button>
  );
}

function LoginButton() {
  return (
    <Link
      href="/register"
      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-[9px] sm:text-xs font-bold uppercase tracking-widest shrink-0"
    >
      <LogIn className="w-3 h-3" />
      Login
    </Link>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

interface CourseMatchCardProps {
  course: any;
  isLoggedIn?: boolean;
  isProfileComplete?: boolean;
}

export default function CourseMatchCard({
  course,
  isLoggedIn = false,
  isProfileComplete = false,
}: CourseMatchCardProps) {
  const params = useParams();
  const courseId = params?.id as string;

  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loadingMatch, setLoadingMatch] = useState(false);

  // Like state
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // ─── FIX: Internal auth + profile state ───────────────────────────────
  // Instead of relying solely on props (which can be stale / incomplete),
  // we re-check auth and profile completeness inside this component too.
  const [authChecked, setAuthChecked] = useState(false);
  const [internalLoggedIn, setInternalLoggedIn] = useState(false);
  const [internalProfileComplete, setInternalProfileComplete] = useState(false);

  // Derive final flags: props OR internal check — whichever is true wins
  const effectiveLoggedIn = isLoggedIn || internalLoggedIn;
  const effectiveProfileComplete = isProfileComplete || internalProfileComplete;

  // Extract course fields — safe to do before hooks
  const courseName = course?.["Program Name"] || "This Course";
  const university = course?.["University"] || "";
  const country = course?.["Country"] || "";
  const studyLevel = course?.["Study Level"] || "";
  const duration = course?.["Duration"] || "";
  const fees = course?.["Yearly Tuition Fees"] || "";
  const intakes = course?.["Open Intakes"] || "";

  // ─── FIX: ALL hooks must be declared before any early return ──────────

  // Hook 1: Auth check + like status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setCurrentUserId(user.id);
          setInternalLoggedIn(true);

          // ─── FIX: Re-check profile completeness here ────────────────
          // Checks more fields so it's less likely to incorrectly show as incomplete
          const { data: profile, error: profileError } = await supabase
            .from("admit_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (profileError) {
            console.warn("CourseMatchCard: profile fetch error", profileError);
          }

          // ─── FIX: More lenient check — only name OR degree needed ────
          // Original code required BOTH name AND degree which caused blank state
          // when either was missing. Now we also accept target_countries or budget
          // as signal that the profile is at least partially complete.
          const hasProfile =
            !!profile &&
            (!!profile.name ||
              !!profile.degree ||
              (profile.target_countries &&
                profile.target_countries.length > 0) ||
              !!profile.budget);

          if (hasProfile) {
            setInternalProfileComplete(true);
          }

          // Check like status
          const liked = await checkIfLiked(user.id, courseName);
          setIsLiked(liked);
        } else {
          setInternalLoggedIn(false);
        }
      } catch (err) {
        console.warn("CourseMatchCard: auth check failed", err);
        setInternalLoggedIn(false);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [courseName]);

  // Hook 2: Fetch profile + compute match when dropdown opens
  useEffect(() => {
    if (!isOpen || !effectiveLoggedIn || !effectiveProfileComplete || matchResult)
      return;

    const run = async () => {
      setLoadingMatch(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        await logToolUsage(user.id);

        const { data: profile, error: profileError } = await supabase
          .from("admit_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError || !profile) {
          console.warn(
            "CourseMatchCard: could not load profile for match",
            profileError
          );
          return;
        }

        const p: UserProfile = {
          name: profile.name || "",
          target_degree: profile.degree || "",
          target_countries: profile.target_countries || [],
          budget: profile.budget || "",
          target_field: profile.target_field || "",
          test_scores: profile.test_scores || [],
        };
        setUserProfile(p);

        const result = computeMatch(p, course);
        setMatchResult(result);

        // Fetch recommended courses
        const targetCountries =
          p.target_countries.length > 0
            ? p.target_countries
            : [country].filter(Boolean);

        let query = supabase
          .from("courses")
          .select(
            'id, University, "Program Name", Country, "Yearly Tuition Fees", "Study Level", Duration'
          )
          .neq("id", course.id)
          .limit(12);

        if (targetCountries.length > 0) {
          const orFilter = targetCountries
            .filter(Boolean)
            .map((s) => `Country.ilike.%${s}%`)
            .join(",");
          if (orFilter) {
            query = query.or(orFilter);
          }
        }

        const { data: candidates } = await query;

        if (candidates && candidates.length > 0) {
          const scored = candidates.map((c: any) => {
            const cMatch = computeMatch(p, c);
            return {
              id: c.id,
              University: c.University,
              "Program Name": c["Program Name"],
              Country: c.Country,
              matchScore: cMatch.score,
            };
          });

          const top = scored
            .filter((c) => c.id !== Number(courseId))
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 2);

          setRecommended(top);
        }
      } catch (err) {
        console.error("Match computation error:", err);
      } finally {
        setLoadingMatch(false);
      }
    };
    run();
  }, [
    isOpen,
    effectiveLoggedIn,
    effectiveProfileComplete,
    courseId,
    course,
    country,
    matchResult,
  ]);

  // ─── FIX: Early return NOW — after all hooks ──────────────────────────
  const hasData =
    university && studyLevel && (duration || fees || intakes);
  if (!hasData) return null;

  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!currentUserId || !effectiveLoggedIn) return;
    setLikeLoading(true);
    try {
      if (isLiked) {
        await unlikeCourse(currentUserId, courseName);
        setIsLiked(false);
      } else {
        await likeCourse(currentUserId, courseName);
        setIsLiked(true);
        await logToolUsage(currentUserId);
      }
    } catch (err) {
      console.error("Like toggle error:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <section className="scroll-mt-28">
      <style jsx>{`
        @keyframes shimmer-slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .shimmer-bar::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(165, 28, 48, 0.08) 40%,
            rgba(165, 28, 48, 0.15) 50%,
            rgba(165, 28, 48, 0.08) 60%,
            transparent 100%
          );
          animation: shimmer-slide 3s ease-in-out infinite;
        }
      `}</style>

      <div
        className="relative rounded-2xl border overflow-hidden transition-all duration-500"
        style={{ borderColor: "#FECDD3", backgroundColor: "#FFFFFF" }}
      >
        {/* ── COLLAPSED BAR ── */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="shimmer-bar relative w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4 group/bar cursor-pointer transition-colors hover:bg-red-50"
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{
              background:
                "linear-gradient(to bottom, #A51C30, rgba(165, 28, 48, 0.3))",
            }}
          />
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#FEF2F3" }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "#A51C30" }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight leading-snug group-hover/bar:opacity-75 transition-opacity">
                Is this course right for you?
              </h3>
              {!isOpen && (
                <p className="text-[10px] text-gray-500 font-medium mt-0.5 truncate max-w-md">
                  {university} • {country}
                </p>
              )}
            </div>
          </div>
          <div
            className="shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-transform duration-300"
            style={{
              borderColor: "#FECDD3",
              backgroundColor: "#FEF2F3",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <ChevronDown
              className="w-3.5 h-3.5"
              style={{ color: "#A51C30" }}
            />
          </div>
        </button>

        {/* ── EXPANDED CONTENT ── */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isOpen ? "max-h-[1400px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className="border-t px-5 sm:px-6 pt-5 pb-6 space-y-5"
            style={{ borderColor: "#FECDD3" }}
          >
            {/* Course Info + Like Button */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500">
                  Program Details
                </p>
                {effectiveLoggedIn ? (
                  <LikeButton
                    isLiked={isLiked}
                    loading={likeLoading}
                    disabled={false}
                    onClick={handleLikeToggle}
                  />
                ) : (
                  <LoginButton />
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    University
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {university}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Country
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {country}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Key Numbers
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatCard
                  icon={BarChart3}
                  label="Study Level"
                  value={studyLevel}
                  iconColor="#A51C30"
                />
                <StatCard
                  icon={Clock}
                  label="Duration"
                  value={duration}
                  iconColor="#10b981"
                />
                <StatCard
                  icon={Wallet}
                  label="Yearly Fees"
                  value={fees}
                  iconColor="#3b82f6"
                />
                <StatCard
                  icon={Globe}
                  label="Intakes"
                  value={intakes}
                  iconColor="#8b5cf6"
                />
              </div>
            </div>

            {/* ── PERSONALIZED SECTION ── */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{
                borderColor: "#FECDD3",
                borderStyle: "dashed",
                backgroundColor: "#FEF2F3",
              }}
            >
              {/* Wait for auth check before rendering personalized content */}
              {!authChecked ? (
                <div className="flex items-center justify-center gap-2 py-6">
                  <div
                    className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{
                      borderColor: "#A51C30",
                      borderTopColor: "transparent",
                    }}
                  />
                  <span className="text-xs text-gray-600 font-medium">
                    Checking your profile...
                  </span>
                </div>
              ) : effectiveProfileComplete && effectiveLoggedIn ? (
                <div className="p-4 sm:p-5">
                  {/* Loading state */}
                  {loadingMatch && (
                    <div className="flex items-center justify-center gap-2 py-6">
                      <div
                        className="w-4 h-4 border-2 rounded-full animate-spin"
                        style={{
                          borderColor: "#A51C30",
                          borderTopColor: "transparent",
                        }}
                      />
                      <span className="text-xs text-gray-600 font-medium">
                        Analyzing your match...
                      </span>
                    </div>
                  )}

                  {/* Error / Fallback State */}
                  {!matchResult && !loadingMatch && (
                    <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                      <AlertTriangle
                        className="w-10 h-10 mb-3 opacity-80"
                        style={{ color: "#A51C30" }}
                      />
                      <p className="text-sm font-bold text-gray-800 mb-1">
                        Match Data Unavailable
                      </p>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">
                        We need more details in your profile (like target degree, countries, or budget) to calculate your match score.
                      </p>
                      <Link
                        href="/profile"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: "#A51C30" }}
                      >
                        Update Profile
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {/* Match Result */}
                  {matchResult && !loadingMatch && (
                    <div className="space-y-5">
                      {/* Score + Factors */}
                      <div className="flex flex-col sm:flex-row gap-5">
                        <div className="shrink-0 flex justify-center">
                          <ScoreRing score={matchResult.score} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                            Match Breakdown
                          </p>
                          {matchResult.factors.map((f, i) => (
                            <FactorRow key={i} {...f} />
                          ))}
                        </div>
                      </div>

                      {/* Status Banner */}
                      {matchResult.score >= 70 ? (
                        <div
                          className="flex items-start gap-2.5 p-3 rounded-lg border"
                          style={{
                            backgroundColor: "#ecfdf5",
                            borderColor: "#a7f3d0",
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-green-700">
                              Great fit for your profile
                            </p>
                            <p className="text-[10px] text-gray-600 mt-0.5">
                              {matchResult.factors
                                .filter((f) => f.positive)
                                .map((f) => f.label)
                                .join(", ")}{" "}
                              — perfect match for you.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="flex items-start gap-2.5 p-3 rounded-lg border"
                          style={{
                            backgroundColor: "#FEF2F3",
                            borderColor: "#FECDD3",
                          }}
                        >
                          <AlertTriangle
                            className="w-4 h-4 mt-0.5 shrink-0"
                            style={{ color: "#A51C30" }}
                          />
                          <div>
                            <p
                              className="text-xs font-bold"
                              style={{ color: "#A51C30" }}
                            >
                              Partial match — explore other options
                            </p>
                            <p className="text-[10px] text-gray-600 mt-0.5">
                              {matchResult.factors
                                .filter((f) => !f.positive)
                                .map((f) => f.label)
                                .join(", ")}{" "}
                              could be better elsewhere.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Recommended Courses */}
                      {recommended.length > 0 && (
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                            {matchResult.score >= 70
                              ? "Similar Courses"
                              : "Better Matches For You"}
                          </p>
                          <div className="space-y-2">
                            {recommended.map((c) => (
                              <RecommendedCard key={c.id} course={c} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : effectiveLoggedIn && !effectiveProfileComplete ? (
                /* ── Logged in but no profile → Blurred + CTA ── */
                <div className="px-4 py-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <StatCard
                      icon={Sparkles}
                      label="Match"
                      value={null}
                      blurred
                      iconColor="#A51C30"
                    />
                    <StatCard
                      icon={TrendingUp}
                      label="Fit Score"
                      value={null}
                      blurred
                      iconColor="#10b981"
                    />
                    <StatCard
                      icon={BarChart3}
                      label="Budget"
                      value={null}
                      blurred
                      iconColor="#3b82f6"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-[10px] text-gray-600 font-medium">
                      Complete your profile to unlock personalized match
                      analysis
                    </p>
                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-[9px] uppercase tracking-widest shrink-0 text-white"
                      style={{ backgroundColor: "#A51C30" }}
                    >
                      Complete Profile
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* ── Not logged in → CTA to login ── */
                <div className="px-4 py-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <StatCard
                      icon={Sparkles}
                      label="Match"
                      value={null}
                      blurred
                      iconColor="#A51C30"
                    />
                    <StatCard
                      icon={TrendingUp}
                      label="Fit Score"
                      value={null}
                      blurred
                      iconColor="#10b981"
                    />
                    <StatCard
                      icon={BarChart3}
                      label="Budget"
                      value={null}
                      blurred
                      iconColor="#3b82f6"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-[10px] text-gray-600 font-medium">
                      Login and complete your profile to see personalized
                      recommendations
                    </p>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-[9px] uppercase tracking-widest shrink-0 text-white"
                      style={{ backgroundColor: "#A51C30" }}
                    >
                      <LogIn className="w-3 h-3" />
                      Login
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}