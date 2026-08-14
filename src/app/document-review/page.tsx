"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  FileText,
  ExternalLink,
  Info,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";
import DefaultLayout from "../defaultLayout";

type Category = "sop" | "lor" | "resume";

interface DocFile {
  name: string;
  size: number;
  uploadDate: string;
  url: string;
}

interface Issue {
  title: string;
  severity: "high" | "medium" | "low";
  why: string;
  fix: string;
}

interface CheckItem {
  item: string;
  ok: boolean;
  note?: string;
}

interface Review {
  score: number;
  verdict: string;
  summary: string;
  strengths: string[];
  issues: Issue[];
  checklist: CheckItem[];
  model?: string;
  created_at?: string;
}

const TABS: { key: Category; label: string }[] = [
  { key: "sop", label: "SOP" },
  { key: "lor", label: "LOR" },
  { key: "resume", label: "Resume" },
];

const DAILY_LIMIT = 6;

const severityStyle = (s: string) =>
  s === "high"
    ? "bg-red-50 text-red-700 border-red-200"
    : s === "medium"
    ? "bg-amber-50 text-amber-800 border-amber-200"
    : "bg-gray-50 text-gray-700 border-gray-200";

const prettyDate = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const DocumentReviewInner = () => {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const initial = (params.get("doc") as Category) || "sop";
  const [tab, setTab] = useState<Category>(
    TABS.some((t) => t.key === initial) ? initial : "sop"
  );

  const [files, setFiles] = useState<Record<Category, DocFile[]>>({
    sop: [],
    lor: [],
    resume: [],
  });
  const [selected, setSelected] = useState<Record<Category, number>>({
    sop: 0,
    lor: 0,
    resume: 0,
  });
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedToday, setUsedToday] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) router.push("/register");
  }, [authLoading, user, router]);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      const [{ data: docs }, { data: prof }, { data: past, error: pastErr }] =
        await Promise.all([
          supabase
            .from("student_documents")
            .select("sop_docs, lor_docs, resume_docs")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("admit_profiles")
            .select("degree, program, target_countries")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("document_reviews")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

      if (pastErr) console.error("Could not load saved reviews:", pastErr);

      setFiles({
        sop: docs?.sop_docs || [],
        lor: docs?.lor_docs || [],
        resume: docs?.resume_docs || [],
      });
      setProfile(prof || null);

      const latest: Record<string, Review> = {};
      let today = 0;
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);

      (past || []).forEach((r: any) => {
        const key = `${r.category}:${r.file_url}`;
        if (!latest[key]) latest[key] = r as Review;
        if (new Date(r.created_at) >= midnight) today += 1;
      });
      setReviews(latest);
      setUsedToday(today);
    } catch (e: any) {
      console.error("Review page load error:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const current = files[tab] || [];
  const activeFile = current[selected[tab]] || null;
  const reviewKey = activeFile ? `${tab}:${activeFile.url}` : "";
  const activeReview = reviewKey ? reviews[reviewKey] : null;

  const runReview = async () => {
    if (!activeFile || !user) return;
    if (usedToday >= DAILY_LIMIT) {
      setError(
        `You have used all ${DAILY_LIMIT} checks for today. Come back tomorrow.`
      );
      return;
    }
    try {
      setRunning(true);
      setError(null);

      const res = await fetch("/api/document-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: tab,
          fileUrl: activeFile.url,
          fileName: activeFile.name,
          profile: profile
            ? {
                degree: profile.degree,
                program: profile.program,
                countries: profile.target_countries,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not check this document.");
        return;
      }

      const { data: saved, error: saveErr } = await supabase
        .from("document_reviews")
        .insert([
          {
            user_id: user.id,
            category: tab,
            file_name: activeFile.name,
            file_url: activeFile.url,
            score: data.score,
            verdict: data.verdict,
            summary: data.summary,
            strengths: data.strengths,
            issues: data.issues,
            checklist: data.checklist,
            model: data.model,
          },
        ])
        .select()
        .single();

      if (saveErr) console.error("Could not save review:", saveErr);

      setReviews((prev) => ({
        ...prev,
        [`${tab}:${activeFile.url}`]: {
          ...data,
          created_at: saved?.created_at || new Date().toISOString(),
        },
      }));
      setUsedToday((n) => n + 1);
    } catch {
      setError("Network problem. Try again.");
    } finally {
      setRunning(false);
    }
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
  if (!user) return null;

  const ext = activeFile
    ? (activeFile.url.split("?")[0].split(".").pop() || "").toLowerCase()
    : "";
  const isImage = ["png", "jpg", "jpeg", "webp"].includes(ext);
  const isPdf = ext === "pdf";

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-[#FAFAFA] p-4 pt-24 sm:p-6 sm:pt-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push("/document")}
            className="text-sm text-gray-600 hover:text-red-600 flex items-center gap-1.5 mb-3"
          >
            <ArrowLeft size={15} /> Back to my documents
          </button>

          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Document feedback
              </h1>
              <span className="text-xs text-gray-400">
                {DAILY_LIMIT - usedToday} left today
              </span>
            </div>

            <div className="flex gap-1.5 bg-white border border-red-200 rounded-lg p-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    setError(null);
                  }}
                  className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                    tab === t.key
                      ? "bg-[#af0100] text-white"
                      : "text-gray-600 hover:bg-red-50"
                  }`}
                >
                  {t.label}
                  <span className="ml-1.5 text-xs opacity-70">
                    {files[t.key].length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {current.length > 1 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {current.map((f, i) => (
                <button
                  key={f.url}
                  onClick={() => {
                    setSelected((p) => ({ ...p, [tab]: i }));
                    setError(null);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selected[tab] === i
                      ? "bg-red-50 text-red-700 border-red-300"
                      : "bg-white text-gray-600 border-gray-200 hover:border-red-200"
                  }`}
                >
                  {f.name.length > 28 ? f.name.slice(0, 28) + "..." : f.name}
                  {reviews[`${tab}:${f.url}`] && (
                    <Check size={11} className="inline ml-1 text-green-600" />
                  )}
                </button>
              ))}
            </div>
          )}

          {!activeFile ? (
            <div className="bg-white border border-red-200 rounded-xl p-10 text-center">
              <FileText className="text-gray-300 mx-auto mb-3" size={32} />
              <p className="text-gray-800 font-medium mb-1">
                No {tab.toUpperCase()} uploaded yet
              </p>
              <p className="text-sm text-gray-600 mb-5">
                Upload it first, then come back for feedback.
              </p>
              <button
                onClick={() => router.push("/document")}
                className="bg-[#af0100] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90"
              >
                Go to documents
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="bg-white border border-red-200 rounded-xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm text-gray-700 truncate">
                    {activeFile.name}
                  </p>
                  <a
                    href={activeFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 shrink-0"
                  >
                    Open <ExternalLink size={12} />
                  </a>
                </div>

                {isImage ? (
                  <img
                    src={activeFile.url}
                    alt={activeFile.name}
                    className="w-full h-[70vh] object-contain bg-gray-50"
                  />
                ) : isPdf ? (
                  <iframe
                    src={activeFile.url}
                    title={activeFile.name}
                    className="w-full h-[70vh] bg-gray-50"
                  />
                ) : (
                  <div className="h-[70vh] bg-gray-50 flex flex-col items-center justify-center text-center p-6">
                    <FileText className="text-gray-300 mb-3" size={32} />
                    <p className="text-sm text-gray-700 font-medium mb-1">
                      Word files can&apos;t be previewed here
                    </p>
                    <p className="text-xs text-gray-500 mb-4 max-w-xs leading-relaxed">
                      The feedback on the right still reads your full document.
                      Upload a PDF if you want to see it side by side.
                    </p>
                    <a
                      href={activeFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#af0100] hover:underline"
                    >
                      Open the file
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {tab === "lor" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                    <Info size={15} className="text-amber-700 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-900 leading-relaxed">
                      We only check whether your letter is complete and credible
                      as a document. A recommendation must be written by your
                      recommender, so we will not suggest wording changes.
                    </p>
                  </div>
                )}

                {!activeReview && (
                  <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
                    <Sparkles className="text-[#af0100] mx-auto mb-3" size={26} />
                    <p className="font-medium text-gray-900 mb-1">
                      Get instant feedback
                    </p>
                    <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                      A first-pass check on structure, specificity and language.
                      Your counsellor still reviews everything afterwards.
                    </p>
                    <button
                      onClick={runReview}
                      disabled={running || usedToday >= DAILY_LIMIT}
                      className="bg-[#af0100] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {running ? (
                        <>
                          <RefreshCw className="animate-spin" size={15} />
                          Reading your document...
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} /> Check this document
                        </>
                      )}
                    </button>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                    {error}
                  </div>
                )}

                {activeReview && (
                  <>
                    <div className="bg-white border border-red-200 rounded-xl p-5">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-full border-2 border-[#af0100] flex items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-[#af0100]">
                            {activeReview.score}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">
                            {activeReview.verdict}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activeReview.created_at
                              ? `Checked ${prettyDate(activeReview.created_at)}`
                              : "Out of 100"}
                          </p>
                        </div>
                        <button
                          onClick={runReview}
                          disabled={running || usedToday >= DAILY_LIMIT}
                          className="ml-auto text-xs text-gray-500 hover:text-red-600 disabled:opacity-40 flex items-center gap-1 shrink-0"
                        >
                          <RefreshCw
                            size={13}
                            className={running ? "animate-spin" : ""}
                          />
                          {running ? "Checking..." : "Check again"}
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {activeReview.summary}
                      </p>
                    </div>

                    {activeReview.strengths?.length > 0 && (
                      <div className="bg-white border border-red-200 rounded-xl p-5">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          What is working
                        </p>
                        <ul className="space-y-2">
                          {activeReview.strengths.map((s, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-700 flex gap-2 leading-relaxed"
                            >
                              <Check
                                size={15}
                                className="text-green-600 mt-0.5 shrink-0"
                              />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeReview.issues?.length > 0 && (
                      <div className="bg-white border border-red-200 rounded-xl p-5">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          What to fix
                        </p>
                        <div className="space-y-3">
                          {activeReview.issues.map((it, i) => (
                            <div
                              key={i}
                              className={`border rounded-lg p-3 ${severityStyle(
                                it.severity
                              )}`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle size={14} className="shrink-0" />
                                <p className="text-sm font-medium">{it.title}</p>
                              </div>
                              <p className="text-xs opacity-90 mb-1.5 leading-relaxed">
                                {it.why}
                              </p>
                              <p className="text-xs font-medium leading-relaxed">
                                Do this: {it.fix}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeReview.checklist?.length > 0 && (
                      <div className="bg-white border border-red-200 rounded-xl p-5">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          Checklist
                        </p>
                        <ul className="space-y-2">
                          {activeReview.checklist.map((c, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              {c.ok ? (
                                <Check
                                  size={15}
                                  className="text-green-600 mt-0.5 shrink-0"
                                />
                              ) : (
                                <X
                                  size={15}
                                  className="text-red-500 mt-0.5 shrink-0"
                                />
                              )}
                              <span
                                className={
                                  c.ok ? "text-gray-700" : "text-gray-900"
                                }
                              >
                                {c.item}
                                {c.note && (
                                  <span className="text-gray-500">
                                    {" "}
                                    — {c.note}
                                  </span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 leading-relaxed px-1">
                      This is an automated first pass, not an admission
                      decision. Your counsellor&apos;s review on the documents
                      page is the one that counts.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

const DocumentReviewPage = () => (
  <Suspense
    fallback={
      <DefaultLayout>
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <RefreshCw className="animate-spin text-red-600" size={22} />
        </div>
      </DefaultLayout>
    }
  >
    <DocumentReviewInner />
  </Suspense>
);

export default DocumentReviewPage;