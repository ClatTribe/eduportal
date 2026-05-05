"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Flame,
  Zap,
  Eye,
} from "lucide-react";
import Link from "next/link";
import DefaultLayout from "../defaultLayout";
import { supabase } from "../../../lib/supabase";

interface MagazinePost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  read_time: number;
  author: string;
  published_at: string;
  is_featured: boolean;
  status: string;
}

const CATEGORIES = [
  "All",
  "Country Guide",
  "Visa Tips",
  "Scholarships",
  "IELTS/TOEFL",
  "Student Life",
  "Rankings",
  "Career After",
  "Admit Stories",
  "News",
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "Country Guide": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" },
  "Visa Tips": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  Scholarships: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  "IELTS/TOEFL": { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" },
  "Student Life": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  Rankings: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
  "Career After": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", dot: "bg-cyan-500" },
  "Admit Stories": { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", dot: "bg-pink-500" },
  News: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
};

function getCatStyle(category: string) {
  return CATEGORY_STYLES[category] || { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" };
}

function formatDate(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getPatternSVG(index: number): string {
  const patterns = [
    `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.06' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
    `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.07' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
  ];
  return patterns[index % patterns.length];
}

const COVER_GRADIENTS = [
  "linear-gradient(145deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
  "linear-gradient(145deg, #0c0c1d 0%, #1b1464 40%, #3a0ca3 100%)",
  "linear-gradient(145deg, #132a13 0%, #1a472a 40%, #2d6a4f 100%)",
  "linear-gradient(145deg, #2d0036 0%, #5c1a72 40%, #9b2335 100%)",
  "linear-gradient(145deg, #1a1423 0%, #2d1b69 40%, #5a189a 100%)",
  "linear-gradient(145deg, #0a1628 0%, #172a45 40%, #1b4965 100%)",
];

export default function MagazinePage() {
  const [posts, setPosts] = useState<MagazinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("magazine_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setPosts((data as MagazinePost[]) || []);
    } catch (err) {
      console.error("Error fetching magazine posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (activeCategory !== "All") {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [posts, activeCategory, searchQuery]);

  const featuredPost = posts.find((p) => p.is_featured) || posts[0];
  const regularPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id);

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50/50">
        {/* === HERO SECTION === */}
        <div className="relative overflow-hidden">
          {/* Subtle animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-rose-50/40 to-white" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#A51C30]/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A51C30] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    Magazine
                  </h1>
                  <p className="text-xs text-gray-400 font-medium">by EduAbroad</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest">
                  Updated daily
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="max-w-2xl">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-[#A51C30] transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, countries..."
                  className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-[#A51C30] focus:ring-4 focus:ring-[#A51C30]/5 text-gray-800 placeholder:text-gray-300 transition-all"
                />
              </div>
            </div>

            {/* Category Pills — horizontal scroll on mobile */}
            <div className="mt-5 -mx-4 px-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-1 w-max">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-500 border border-gray-150 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* === CONTENT === */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#A51C30]/10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#A51C30] border-t-transparent"></div>
              </div>
              <span className="text-sm text-gray-400">Loading articles...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-[#A51C30]" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Coming soon</h3>
              <p className="text-sm text-gray-400">Our first articles are being crafted.</p>
            </div>
          ) : (
            <>
              {/* === FEATURED POST — Bento Hero === */}
              {featuredPost && activeCategory === "All" && !searchQuery && (
                <Link href={`/magazine/${featuredPost.slug}`} className="block mb-8">
                  <div
                    className="group relative rounded-3xl overflow-hidden cursor-pointer"
                    style={{ minHeight: "380px" }}
                  >
                    {/* Dark immersive background */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: featuredPost.cover_image_url
                          ? `url(${featuredPost.cover_image_url}) center/cover`
                          : COVER_GRADIENTS[0],
                      }}
                    />
                    {/* Subtle pattern overlay */}
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{ backgroundImage: getPatternSVG(0) }}
                    />
                    {/* Bottom gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end p-6 sm:p-10" style={{ minHeight: "380px" }}>
                      {/* Top badges */}
                      <div className="absolute top-5 left-5 sm:top-8 sm:left-10 flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
                          <Flame className="w-3 h-3" />
                          Featured
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
                          {featuredPost.category}
                        </span>
                      </div>

                      {/* Read time chip — top right */}
                      <div className="absolute top-5 right-5 sm:top-8 sm:right-10">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-medium">
                          <Clock className="w-3 h-3" />
                          {featuredPost.read_time} min read
                        </span>
                      </div>

                      {/* Title & excerpt */}
                      <div className="max-w-3xl">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight group-hover:translate-x-1 transition-transform duration-300">
                          {featuredPost.title}
                        </h2>
                        <p className="text-white/60 text-sm sm:text-base line-clamp-2 mb-5 max-w-xl">
                          {featuredPost.excerpt}
                        </p>

                        {/* Author row + CTA */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold">
                              EA
                            </div>
                            <div className="flex items-center gap-2 text-white/50 text-xs">
                              <span className="text-white/70 font-medium">{featuredPost.author}</span>
                              <span>·</span>
                              <span>{formatDate(featuredPost.published_at)}</span>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium group-hover:bg-white/20 transition-all">
                            Read article
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* === SECTION HEADER === */}
              <div className="flex items-center justify-between mb-5 mt-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-gray-800">
                    {activeCategory === "All" ? "Latest" : activeCategory}
                  </h3>
                  <span className="text-xs text-gray-300 font-medium">
                    {filteredPosts.length} articles
                  </span>
                </div>
              </div>

              {/* === BLOG GRID — Modern Cards === */}
              {regularPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {regularPosts.map((post, index) => {
                    const catStyle = getCatStyle(post.category);
                    const isHovered = hoveredCard === post.id;
                    return (
                      <Link key={post.id} href={`/magazine/${post.slug}`}>
                        <article
                          className="group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1"
                          onMouseEnter={() => setHoveredCard(post.id)}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
                          {/* Card Cover */}
                          <div className="relative h-48 overflow-hidden">
                            <div
                              className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                              style={{
                                background: post.cover_image_url
                                  ? `url(${post.cover_image_url}) center/cover`
                                  : COVER_GRADIENTS[(index + 1) % COVER_GRADIENTS.length],
                              }}
                            />
                            <div
                              className="absolute inset-0 opacity-30"
                              style={{ backgroundImage: getPatternSVG(index + 1) }}
                            />

                            {/* Floating chips */}
                            <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
                                {post.category}
                              </span>
                              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm text-white text-[11px] font-medium">
                                <Clock className="w-3 h-3" />
                                {post.read_time}m
                              </span>
                            </div>

                            {/* Bottom gradient */}
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                          </div>

                          {/* Card Body */}
                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-[15px] font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-[#A51C30] transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-[13px] text-gray-400 line-clamp-2 mb-4 flex-1 leading-relaxed">
                              {post.excerpt}
                            </p>

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {post.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[11px] font-medium rounded-md"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#A51C30] to-[#d4243e] flex items-center justify-center">
                                  <span className="text-white text-[8px] font-bold">EA</span>
                                </div>
                                <span className="text-[11px] text-gray-300 font-medium">
                                  {formatDate(post.published_at)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[12px] text-[#A51C30] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                Read
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">No articles match your search.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
