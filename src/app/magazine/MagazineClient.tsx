"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Search, X } from "lucide-react";
import { EnquiryForm } from "./EnquiryForm";
import {
  CATEGORIES,
  MagazinePost,
  categoryEmoji,
  categoryStyle,
  relativeDate,
} from "./magazine-utils";

const PAGE_SIZE = 12;

const TICKER = [
  "UK visa rules 2026",
  "Fully funded scholarships",
  "IELTS band 7 hacks",
  "Germany: study for free?",
  "US OPT fee update",
  "Canada PR pathways",
  "Australia student visa",
  "Real admit stories",
];

function Cover({ post, className = "", big = false }: { post: MagazinePost; className?: string; big?: boolean }) {
  const style = categoryStyle(post.category);
  const [broken, setBroken] = useState(false);
  if (post.cover_image_url && !broken) {
    return (
      <img
        src={post.cover_image_url}
        alt={post.title}
        onError={() => setBroken(true)}
        loading={big ? "eager" : "lazy"}
        className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${className}`}
      />
    );
  }
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${style.cover} ${className}`}
      aria-hidden
    >
      <span className={`${big ? "text-8xl" : "text-6xl"} drop-shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
        {categoryEmoji(post.category)}
      </span>
      <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
    </div>
  );
}

function Sticker({ category }: { category: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 border-[#0E0E10] px-2.5 py-0.5 text-[11px] font-bold ${categoryStyle(category).sticker}`}
    >
      <span aria-hidden>{categoryEmoji(category)}</span>
      {category}
    </span>
  );
}

function PostCard({ post }: { post: MagazinePost }) {
  return (
    <Link href={`/magazine/${post.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[28px] border-2 border-[#0E0E10] bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_#0E0E10]">
        <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-[#0E0E10]">
          <Cover post={post} />
          <div className="absolute left-3 top-3">
            <Sticker category={post.category} />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-[19px] font-bold leading-snug text-[#0E0E10] line-clamp-3">
            {post.title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-[#0E0E10]/55 line-clamp-2">{post.excerpt}</p>
          <div className="mt-4 flex items-center justify-between text-xs font-medium text-[#0E0E10]/45">
            <span className="flex items-center gap-3">
              <span>{relativeDate(post.published_at)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.read_time} min
              </span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0E0E10] text-white transition-transform group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" />
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
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, activeCategory, query]);

  const browsing = activeCategory === "All" && !query.trim();
  const featured = browsing ? posts.find((p) => p.is_featured) || posts[0] : undefined;
  const sideStack = browsing ? posts.filter((p) => p.id !== featured?.id).slice(0, 2) : [];
  const heroIds = new Set([featured?.id, ...sideStack.map((p) => p.id)]);
  const gridPosts = filtered.filter((p) => !heroIds.has(p.id));
  const shown = gridPosts.slice(0, visible);
  const firstBatch = shown.slice(0, 6);
  const restBatch = shown.slice(6);

  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#FFB4C2] opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-40 h-72 w-72 rounded-full bg-[#D9F99D] opacity-70 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pt-16">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#0E0E10]/60">
              Fresh drops daily · {posts.length} articles
            </span>
          </div>

          <h1 className="font-display mt-5 max-w-4xl text-[44px] font-extrabold leading-[0.95] text-[#0E0E10] sm:text-7xl">
            Study abroad,{" "}
            <span className="relative inline-block">
              <span className="relative z-10">minus the noise</span>
              <span className="absolute -bottom-1 left-0 z-0 h-4 w-full -rotate-1 rounded-full bg-[#D9F99D] sm:h-6" />
            </span>
            <span className="text-[#A51C30]">.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-[#0E0E10]/60 sm:text-lg">
            Visa updates, scholarship deadlines and no-BS country guides for Indian students. Written by Harvard-Cambridge and IIM alumni counsellors.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-2xl">
            <label className="group relative block">
              <span className="sr-only">Search articles</span>
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0E0E10]/40" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search: 'UK visa', 'scholarships Germany', 'IELTS'..."
                className="h-14 w-full rounded-full border-2 border-[#0E0E10] bg-white pl-13 pr-12 text-[15px] text-[#0E0E10] shadow-[4px_4px_0_#0E0E10] placeholder:text-[#0E0E10]/35 focus:outline-none focus:shadow-[6px_6px_0_#A51C30]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#0E0E10]/10"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
          </div>
        </div>

        {/* Ticker */}
        <div className="relative -rotate-1 overflow-hidden border-y-2 border-[#0E0E10] bg-[#0E0E10] py-3">
          <div className="marquee flex w-max gap-8 whitespace-nowrap">
            {[...TICKER, ...TICKER].map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setQuery(t.split(/[:?]/)[0].replace(/\d{4}/, "").trim());
                }}
                className="font-display flex items-center gap-8 text-lg font-bold text-white hover:text-[#D9F99D]"
              >
                {t}
                <span className="text-[#D9F99D]" aria-hidden>
                  ✦
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Category stickers */}
        <div className="no-scrollbar -mx-4 mt-8 overflow-x-auto px-4">
          <div className="flex w-max gap-2 pb-2">
            {CATEGORIES.filter((c) => c.name === "All" || counts[c.name]).map((c) => {
              const active = activeCategory === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setActiveCategory(c.name)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-[#0E0E10] px-4 py-2 text-sm font-semibold transition-all ${
                    active
                      ? "bg-[#0E0E10] text-white shadow-[3px_3px_0_#A51C30]"
                      : "bg-white text-[#0E0E10] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#0E0E10]"
                  }`}
                >
                  <span aria-hidden>{c.emoji}</span>
                  {c.name}
                  <span className={`text-xs ${active ? "text-white/50" : "text-[#0E0E10]/35"}`}>{counts[c.name] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl font-bold">First articles dropping soon ✨</p>
          </div>
        ) : (
          <>
            {/* ===== BENTO: featured + 2 ===== */}
            {featured && (
              <section className="mt-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]" aria-label="Featured">
                <Link href={`/magazine/${featured.slug}`} className="group block">
                  <article className="relative h-full min-h-[420px] overflow-hidden rounded-[32px] border-2 border-[#0E0E10] bg-[#0E0E10] transition-shadow hover:shadow-[8px_8px_0_#A51C30]">
                    <div className="absolute inset-0 opacity-90">
                      <Cover post={featured} big />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10] via-[#0E0E10]/50 to-transparent" />
                    <div className="absolute left-5 top-5 flex gap-2">
                      <span className="rounded-full bg-[#D9F99D] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#0E0E10]">
                        🔥 Must read
                      </span>
                      <Sticker category={featured.category} />
                    </div>
                    <div className="relative flex h-full min-h-[420px] flex-col justify-end p-6 sm:p-9">
                      <h2 className="font-display text-3xl font-extrabold leading-[1.05] text-white sm:text-[44px]">
                        {featured.title}
                      </h2>
                      <p className="mt-3 max-w-xl text-white/65 line-clamp-2">{featured.excerpt}</p>
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-sm text-white/55">
                          {featured.author || "EduAbroad Team"} · {relativeDate(featured.published_at)} · {featured.read_time} min
                        </span>
                        <span className="hidden items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0E0E10] sm:flex">
                          Read it <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>

                <div className="grid gap-5">
                  {sideStack.map((p) => (
                    <Link key={p.id} href={`/magazine/${p.slug}`} className="group block">
                      <article className="flex h-full gap-4 overflow-hidden rounded-[28px] border-2 border-[#0E0E10] bg-white p-3 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_#0E0E10]">
                        <div className="relative h-auto w-32 shrink-0 overflow-hidden rounded-[20px] sm:w-36">
                          <Cover post={p} />
                        </div>
                        <div className="flex flex-col justify-center py-2 pr-2">
                          <Sticker category={p.category} />
                          <h3 className="font-display mt-2 text-lg font-bold leading-snug line-clamp-3">{p.title}</h3>
                          <span className="mt-2 text-xs text-[#0E0E10]/45">
                            {relativeDate(p.published_at)} · {p.read_time} min
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
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
                {query ? `Results for "${query}"` : activeCategory === "All" ? "Latest drops" : activeCategory}
              </h2>
              <span className="text-sm font-medium text-[#0E0E10]/45">{filtered.length} articles</span>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-[28px] border-2 border-dashed border-[#0E0E10]/25 py-16 text-center">
                <p className="font-display text-xl font-bold">Nothing on that yet 👀</p>
                <p className="mt-1 text-sm text-[#0E0E10]/55">Ask a counsellor below and we&apos;ll answer you directly.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {firstBatch.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            )}

            {/* Lead block sits after the first 6 cards, where scroll intent is highest */}
            <section className="my-14 grid items-center gap-8 rounded-[36px] bg-[#0E0E10] p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr]">
              <div className="text-white">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D9F99D]">Stuck between options?</p>
                <h2 className="font-display mt-3 text-4xl font-extrabold leading-[1.02] sm:text-5xl">
                  Get a roadmap built for <span className="text-[#D9F99D]">your</span> profile.
                </h2>
                <ul className="mt-6 space-y-3 text-white/70">
                  <li>✦ University shortlist in your budget</li>
                  <li>✦ Scholarships you actually qualify for</li>
                  <li>✦ Visa and IELTS plan with real timelines</li>
                </ul>
                <p className="mt-6 text-sm text-white/40">10,000+ students guided · Lucknow, Delhi, Kanpur, Indore</p>
              </div>
              <EnquiryForm variant="dark" placement="listing-mid" id="lead-form" />
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
                  className="rounded-full border-2 border-[#0E0E10] bg-white px-7 py-3 font-bold transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#0E0E10]"
                >
                  Load more ({gridPosts.length - visible} left)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
