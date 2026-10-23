"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, Clock, Search, X } from "lucide-react";
import { EnquiryForm } from "./EnquiryForm";
import { CATEGORIES, MagazinePost, categoryStyle, relativeDate } from "./magazine-utils";

const PAGE_SIZE = 12;

const TRENDING = ["UK visa", "Scholarships", "IELTS", "Germany", "OPT", "Canada", "Australia", "Admit"];

// Dates depend on the viewer's clock and timezone, so they are allowed to differ from the server render.
function When({ date }: { date: string }) {
  return (
    <time dateTime={date} suppressHydrationWarning>
      {relativeDate(date)}
    </time>
  );
}

function Cover({ post, big = false }: { post: MagazinePost; big?: boolean }) {
  const [broken, setBroken] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // An image can fail before React hydrates, so onError never fires; check once on mount too.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, []);
  if (post.cover_image_url && !broken) {
    return (
      <img
        ref={imgRef}
        src={post.cover_image_url}
        alt={post.title}
        onError={() => setBroken(true)}
        loading={big ? "eager" : "lazy"}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${categoryStyle(post.category).cover}`} aria-hidden>
      <BookOpen className={`${big ? "h-16 w-16" : "h-10 w-10"} text-white/70`} />
    </div>
  );
}

function CategoryPill({ category, onDark = false }: { category: string; onDark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        onDark ? "bg-white/15 text-white backdrop-blur-md border border-white/25" : categoryStyle(category).sticker
      }`}
    >
      {category}
    </span>
  );
}

function PostCard({ post }: { post: MagazinePost }) {
  return (
    <Link href={`/magazine/${post.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Cover post={post} />
          <div className="absolute left-3 top-3">
            <CategoryPill category={post.category} />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-[17px] font-bold leading-snug text-[#0F172A] line-clamp-3 transition-colors group-hover:text-[#A51C30]">
            {post.title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 line-clamp-2">{post.excerpt}</p>
          <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-slate-400">
            <span className="flex items-center gap-3">
              <When date={post.published_at} />
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.read_time} min read
              </span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-[#A51C30]">
              Read <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function MagazineClient({ posts }: { posts: MagazinePost[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Tag links on articles point to /magazine?search=<tag>
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("search");
    if (s) setQuery(s);
  }, []);

  useEffect(() => setVisible(PAGE_SIZE), [activeCategory, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: posts.length };
    posts.forEach((p) => (c[p.category] = (c[p.category] || 0) + 1));
    return c;
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, activeCategory, query]);

  const browsing = activeCategory === "All" && !query.trim();
  const featured = browsing ? posts.find((p) => p.is_featured) || posts[0] : undefined;
  const sideStack = browsing ? posts.filter((p) => p.id !== featured?.id).slice(0, 3) : [];
  const heroIds = new Set([featured?.id, ...sideStack.map((p) => p.id)]);
  const gridPosts = filtered.filter((p) => !heroIds.has(p.id));
  const shown = gridPosts.slice(0, visible);
  const firstBatch = shown.slice(0, 6);
  const restBatch = shown.slice(6);

  return (
    <div>
      {/* ===== HERO (same look as the app homepage) ===== */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 text-center sm:px-6 sm:pt-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#A51C30]" />
            Updated daily · {posts.length} articles
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-[1.05] text-[#0F172A] sm:text-6xl">
            EduAbroad Magazine
            <span className="mt-2 block bg-gradient-to-r from-[#A51C30] to-[#E0314B] bg-clip-text text-3xl text-transparent sm:text-5xl">
              Study Abroad, Without the Noise
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Visa updates, scholarship deadlines, IELTS tips and honest country guides for Indian students, from Harvard-Cambridge and IIM alumni counsellors.
          </p>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-2xl">
            <label className="relative block">
              <span className="sr-only">Search articles</span>
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, countries, exams..."
                className="h-14 w-full rounded-full border border-gray-200 bg-white pl-14 pr-12 text-[15px] text-[#0F172A] shadow-lg shadow-gray-200/50 placeholder:text-slate-400 focus:border-[#A51C30] focus:outline-none focus:ring-4 focus:ring-[#A51C30]/10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-slate-400">Trending:</span>
              {TRENDING.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setActiveCategory("All");
                    setQuery(t);
                  }}
                  className="rounded-full bg-[#FEF2F3] px-3 py-1 font-medium text-[#A51C30] transition-colors hover:bg-[#FECDD3]"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Category tabs */}
        <div className="no-scrollbar -mx-4 overflow-x-auto border-b border-gray-100 px-4">
          <div className="flex w-max gap-2 pb-4">
            {CATEGORIES.filter((c) => c.name === "All" || counts[c.name]).map((c) => {
              const active = activeCategory === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setActiveCategory(c.name)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? "bg-[#A51C30] text-white shadow-md shadow-[#A51C30]/20"
                      : "border border-gray-200 bg-white text-slate-600 hover:border-[#FECDD3] hover:text-[#A51C30]"
                  }`}
                >
                  {c.name}
                  <span className={`ml-1.5 text-xs ${active ? "text-white/70" : "text-slate-400"}`}>{counts[c.name] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="py-24 text-center text-slate-500">New articles are on their way.</div>
        ) : (
          <>
            {/* ===== FEATURED + 3 ===== */}
            {featured && (
              <section className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]" aria-label="Featured">
                <Link href={`/magazine/${featured.slug}`} className="group block">
                  <article className="relative h-full min-h-[420px] overflow-hidden rounded-3xl bg-[#0F172A] shadow-lg">
                    <div className="absolute inset-0">
                      <Cover post={featured} big />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    <div className="absolute left-5 top-5 flex gap-2">
                      <span className="rounded-full bg-[#A51C30] px-3 py-1 text-xs font-semibold text-white">Featured</span>
                      <CategoryPill category={featured.category} onDark />
                    </div>
                    <div className="relative flex h-full min-h-[420px] flex-col justify-end p-6 sm:p-9">
                      <h2 className="text-2xl font-bold leading-tight text-white sm:text-4xl">{featured.title}</h2>
                      <p className="mt-3 max-w-xl text-white/70 line-clamp-2">{featured.excerpt}</p>
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-sm text-white/60">
                          {featured.author || "EduAbroad Team"} · <When date={featured.published_at} /> · {featured.read_time} min read
                        </span>
                        <span className="hidden items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0F172A] sm:flex">
                          Read article <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>

                <div className="flex flex-col gap-4">
                  <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Latest</p>
                  {sideStack.map((p) => (
                    <Link key={p.id} href={`/magazine/${p.slug}`} className="group block">
                      <article className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:shadow-lg hover:shadow-gray-200/60">
                        <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl">
                          <Cover post={p} />
                        </div>
                        <div className="flex min-w-0 flex-col justify-center">
                          <span className="text-xs font-semibold text-[#A51C30]">{p.category}</span>
                          <h3 className="mt-1 text-[15px] font-bold leading-snug text-[#0F172A] line-clamp-2 group-hover:text-[#A51C30]">
                            {p.title}
                          </h3>
                          <span className="mt-1 text-xs text-slate-400">
                            <When date={p.published_at} /> · {p.read_time} min
                          </span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ===== GRID ===== */}
            <div className="mb-6 mt-14 flex items-end justify-between">
              <h2 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
                {query ? `Results for "${query}"` : activeCategory === "All" ? "All Articles" : activeCategory}
              </h2>
              <span className="text-sm text-slate-400">{filtered.length} articles</span>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
                <p className="text-lg font-bold text-[#0F172A]">No articles on that yet</p>
                <p className="mt-1 text-sm text-slate-500">Ask a counsellor below and we&apos;ll answer you directly.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {firstBatch.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            )}

            {/* Lead block after the first 6 cards */}
            <section className="my-14 grid items-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#7A1524] via-[#A51C30] to-[#C02340] p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr]">
              <div className="text-white">
                <p className="text-sm font-semibold uppercase tracking-widest text-white/70">Free 1-on-1 Counselling</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Get a study abroad roadmap built for your profile</h2>
                <ul className="mt-6 space-y-3 text-white/85">
                  {["University shortlist within your budget", "Scholarships you actually qualify for", "Visa and IELTS plan with real timelines"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-white" /> {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-white/60">10K+ students placed · Lucknow, Delhi, Kanpur, Indore</p>
              </div>
              <EnquiryForm variant="card" placement="listing-mid" id="lead-form" />
            </section>

            {restBatch.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {restBatch.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            )}

            {gridPosts.length > visible && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="rounded-full bg-[#0F172A] px-7 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Load more articles ({gridPosts.length - visible} left)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
