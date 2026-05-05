"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Clock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  ArrowRight,
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

const CATEGORY_COLORS: Record<string, string> = {
  "Country Guide": "#A51C30",
  "Visa Tips": "#2563eb",
  Scholarships: "#059669",
  "IELTS/TOEFL": "#7c3aed",
  "Student Life": "#d97706",
  Rankings: "#dc2626",
  "Career After": "#0891b2",
  "Admit Stories": "#be185d",
  News: "#4f46e5",
  "Study Abroad": "#A51C30",
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || "#A51C30";
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Generate a gradient cover based on category when no image is available
function getCoverGradient(category: string, index: number): string {
  const gradients = [
    "linear-gradient(135deg, #A51C30 0%, #d4243e 50%, #f87171 100%)",
    "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #60a5fa 100%)",
    "linear-gradient(135deg, #065f46 0%, #059669 50%, #34d399 100%)",
    "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)",
    "linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)",
    "linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #f87171 100%)",
  ];
  return gradients[index % gradients.length];
}

export default function MagazinePage() {
  const [posts, setPosts] = useState<MagazinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
      <div className="min-h-screen bg-white">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-[#FEF2F3] via-white to-[#FEF2F3] border-b border-[#FECDD3]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {/* Live Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A51C30] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A51C30]"></span>
              </span>
              <span className="text-xs font-bold text-[#A51C30] uppercase tracking-wider">
                Fresh content daily
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
              The EduAbroad{" "}
              <span className="text-[#A51C30]">Magazine</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
              Your daily dose of study abroad insights, visa hacks, scholarship
              alerts, and student stories. Built for the future global student.
            </p>

            {/* Search Bar */}
            <div className="mt-6 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Try "USA scholarships", "IELTS tips", "Canada PR"...'
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-[#FECDD3] rounded-xl focus:outline-none focus:border-[#A51C30] bg-white text-gray-800 placeholder:text-gray-400 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-[#A51C30] text-white shadow-md shadow-red-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-[#A51C30] hover:text-[#A51C30]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-[#A51C30] flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A51C30]"></div>
                <span className="text-sm font-medium">Loading articles...</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-12 h-12 text-[#A51C30] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Coming Soon
              </h3>
              <p className="text-gray-500">
                Our first articles are being crafted. Check back tomorrow!
              </p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && activeCategory === "All" && !searchQuery && (
                <Link href={`/magazine/${featuredPost.slug}`}>
                  <div className="group relative rounded-2xl overflow-hidden mb-10 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300">
                    <div
                      className="h-64 sm:h-80 md:h-96 w-full"
                      style={{
                        background: featuredPost.cover_image_url
                          ? `url(${featuredPost.cover_image_url}) center/cover`
                          : getCoverGradient(featuredPost.category, 0),
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold text-white"
                          style={{
                            backgroundColor: getCategoryColor(
                              featuredPost.category
                            ),
                          }}
                        >
                          {featuredPost.category}
                        </span>
                        <span className="text-white/80 text-xs flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {featuredPost.read_time} min read
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 group-hover:text-red-200 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-white/80 text-sm sm:text-base max-w-2xl line-clamp-2">
                        {featuredPost.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-white/70 text-xs">
                        <span>{featuredPost.author}</span>
                        <span>·</span>
                        <span>{formatDate(featuredPost.published_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Post Count */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#A51C30]" />
                  {activeCategory === "All" ? "Latest Articles" : activeCategory}
                  <span className="text-sm font-normal text-gray-400 ml-1">
                    ({filteredPosts.length})
                  </span>
                </h3>
              </div>

              {/* Blog Grid */}
              {regularPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post, index) => (
                    <Link key={post.id} href={`/magazine/${post.slug}`}>
                      <article className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col">
                        {/* Card Cover */}
                        <div
                          className="h-44 w-full relative overflow-hidden"
                          style={{
                            background: post.cover_image_url
                              ? `url(${post.cover_image_url}) center/cover`
                              : getCoverGradient(post.category, index + 1),
                          }}
                        >
                          <div className="absolute top-3 left-3">
                            <span
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wide"
                              style={{
                                backgroundColor: getCategoryColor(post.category),
                              }}
                            >
                              {post.category}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                            <span className="text-white text-[10px] font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.read_time} min
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#A51C30] transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
                            {post.excerpt}
                          </p>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-medium rounded-md border border-gray-100"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                            <span className="text-xs text-gray-400">
                              {formatDate(post.published_at)}
                            </span>
                            <span className="text-xs text-[#A51C30] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                              Read
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No articles found for this filter. Try a different category or
                    search term.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
