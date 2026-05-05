"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Calendar,
  ArrowLeft,
  BookOpen,
  Tag,
  ChevronUp,
  Link2,
  ArrowUpRight,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DefaultLayout from "../../defaultLayout";
import { supabase } from "../../../../lib/supabase";

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
  seo_title: string | null;
  seo_description: string | null;
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Country Guide": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  "Visa Tips": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Scholarships: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "IELTS/TOEFL": { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  "Student Life": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Rankings: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  "Career After": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  "Admit Stories": { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  News: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
};

function getCatStyle(category: string) {
  return CATEGORY_STYLES[category] || { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
}

const COVER_GRADIENTS: Record<string, string> = {
  "Country Guide": "linear-gradient(145deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
  "Visa Tips": "linear-gradient(145deg, #0a1628 0%, #172a45 40%, #1b4965 100%)",
  Scholarships: "linear-gradient(145deg, #132a13 0%, #1a472a 40%, #2d6a4f 100%)",
  "IELTS/TOEFL": "linear-gradient(145deg, #1a1423 0%, #2d1b69 40%, #5a189a 100%)",
  "Student Life": "linear-gradient(145deg, #2d1b00 0%, #5c3a00 40%, #8a6914 100%)",
  Rankings: "linear-gradient(145deg, #2d0008 0%, #5c0011 40%, #9b2335 100%)",
  "Career After": "linear-gradient(145deg, #0a2329 0%, #134e5e 40%, #1b6b7a 100%)",
  "Admit Stories": "linear-gradient(145deg, #2d0036 0%, #5c1a72 40%, #9b2335 100%)",
  News: "linear-gradient(145deg, #0c0c1d 0%, #1b1464 40%, #3a0ca3 100%)",
};

function getCoverGradient(category: string): string {
  return COVER_GRADIENTS[category] || "linear-gradient(145deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)";
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function extractHeadings(html: string): TOCItem[] {
  const headingRegex = /<h([2-3])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[2-3]>/gi;
  const headings: TOCItem[] = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const existingId = match[2];
    const text = match[3].replace(/<[^>]*>/g, "").trim();
    const id = existingId || text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    headings.push({ id, text, level });
  }
  return headings;
}

function addHeadingIds(html: string): string {
  return html.replace(
    /<h([2-3])([^>]*)>(.*?)<\/h([2-3])>/gi,
    (match, level, attrs, content, closeLevel) => {
      const text = content.replace(/<[^>]*>/g, "").trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (attrs.includes("id=")) return match;
      return `<h${level} id="${id}"${attrs}>${content}</h${closeLevel}>`;
    }
  );
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<MagazinePost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<MagazinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setReadProgress(Math.min(progress, 100));
      setShowScrollTop(scrollTop > 500);

      // Active heading tracking
      const headings = document.querySelectorAll("h2[id], h3[id]");
      let current = "";
      headings.forEach((h) => {
        const rect = h.getBoundingClientRect();
        if (rect.top <= 120) current = h.id;
      });
      if (current) setActiveHeading(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("magazine_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error) throw error;
      setPost(data as MagazinePost);
      if (data) {
        const { data: related } = await supabase
          .from("magazine_posts")
          .select("*")
          .eq("status", "published")
          .eq("category", data.category)
          .neq("slug", slug)
          .order("published_at", { ascending: false })
          .limit(3);
        setRelatedPosts((related as MagazinePost[]) || []);
      }
    } catch (err) {
      console.error("Error fetching article:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || "";
    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "copy":
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#A51C30]/10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#A51C30] border-t-transparent"></div>
            </div>
            <span className="text-sm text-gray-400">Loading article...</span>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!post) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <BookOpen className="w-7 h-7 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Article not found</h2>
          <p className="text-sm text-gray-400 mb-6">This article may have been removed.</p>
          <Link
            href="/magazine"
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Magazine
          </Link>
        </div>
      </DefaultLayout>
    );
  }

  // Strip all inline styles from the HTML content so our CSS takes over
  const cleanContent = (post.content || "")
    .replace(/\s*style="[^"]*"/gi, "")
    .replace(/\s*cellpadding="[^"]*"/gi, "")
    .replace(/\s*cellspacing="[^"]*"/gi, "")
    .replace(/\s*border="[^"]*"/gi, "");
  const processedContent = addHeadingIds(cleanContent);
  const tocItems = extractHeadings(post.content || "");
  const catStyle = getCatStyle(post.category);

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-white">
        {/* Reading Progress */}
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-[#A51C30] via-[#d4243e] to-[#A51C30] transition-all duration-150 ease-out"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        {/* === HERO COVER === */}
        <div className="relative overflow-hidden" style={{ minHeight: "320px" }}>
          <div
            className="absolute inset-0"
            style={{
              background: post.cover_image_url
                ? `url(${post.cover_image_url}) center/cover`
                : getCoverGradient(post.category),
            }}
          />
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

          {/* Back button */}
          <div className="absolute top-5 left-5 z-10">
            <Link
              href="/magazine"
              className="flex items-center gap-2 px-3.5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-sm font-medium text-white hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Magazine
            </Link>
          </div>

          {/* Share button — top right */}
          <div className="absolute top-5 right-5 z-10">
            <button
              onClick={() => handleShare("copy")}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-sm font-medium text-white hover:bg-white/20 transition-all"
            >
              {copied ? (
                <span className="text-emerald-300">Copied!</span>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share
                </>
              )}
            </button>
          </div>
        </div>

        {/* === ARTICLE CONTENT === */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 sm:p-8 mb-8">
            {/* Meta row */}
            <div className="flex items-center gap-2.5 mb-5 flex-wrap">
              <span className={`px-3 py-1 rounded-lg text-[11px] font-semibold ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
                {post.category}
              </span>
              <span className="text-gray-300 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.read_time} min read
              </span>
              <span className="text-gray-300 text-[11px] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(post.published_at)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-[2.1rem] font-bold text-gray-900 mb-4 leading-tight tracking-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-base text-gray-500 mb-6 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author & Share */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A51C30] to-[#d4243e] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">EA</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{post.author}</p>
                  <p className="text-xs text-gray-400">EduAbroad Magazine</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare("twitter")}
                  className="w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:border-gray-200 transition-all group"
                  title="Share on X"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:border-gray-200 transition-all group"
                  title="Share on LinkedIn"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0077B5]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:border-gray-200 transition-all group"
                  title="Copy link"
                >
                  <Link2 className={`w-3.5 h-3.5 ${copied ? "text-emerald-500" : "text-gray-400 group-hover:text-gray-600"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Scoped article styles */}
          <style dangerouslySetInnerHTML={{ __html: `
            .article-body h2 {
              font-size: 1.4rem;
              font-weight: 700;
              color: #111827;
              margin-top: 2.5rem;
              margin-bottom: 1rem;
              padding-bottom: 0.75rem;
              border-bottom: 2px solid #f3f4f6;
              line-height: 1.3;
              letter-spacing: -0.01em;
            }
            .article-body h3 {
              font-size: 1.15rem;
              font-weight: 600;
              color: #1f2937;
              margin-top: 2rem;
              margin-bottom: 0.75rem;
              line-height: 1.4;
            }
            .article-body p {
              font-size: 15px;
              line-height: 1.85;
              color: #4b5563;
              margin-bottom: 1.25rem;
            }
            .article-body a {
              color: #A51C30;
              text-decoration: none;
              font-weight: 500;
            }
            .article-body a:hover {
              text-decoration: underline;
            }
            .article-body strong {
              color: #1f2937;
              font-weight: 600;
            }
            .article-body ul, .article-body ol {
              margin: 1.25rem 0;
              padding-left: 1.5rem;
            }
            .article-body ul {
              list-style: none;
            }
            .article-body ul li {
              position: relative;
              padding-left: 1.25rem;
              margin-bottom: 0.75rem;
              font-size: 15px;
              line-height: 1.75;
              color: #4b5563;
            }
            .article-body ul li::before {
              content: "";
              position: absolute;
              left: 0;
              top: 0.6em;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #A51C30;
            }
            .article-body ol li {
              margin-bottom: 0.75rem;
              font-size: 15px;
              line-height: 1.75;
              color: #4b5563;
            }
            .article-body blockquote {
              margin: 1.75rem 0;
              padding: 1.25rem 1.5rem;
              background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%);
              border-left: 4px solid #A51C30;
              border-radius: 0 12px 12px 0;
              font-size: 15px;
              line-height: 1.7;
              color: #374151;
            }
            .article-body blockquote p {
              margin-bottom: 0.5rem;
              color: #374151;
            }
            .article-body blockquote p:last-child {
              margin-bottom: 0;
            }
            .article-body table {
              width: 100%;
              margin: 1.75rem 0;
              border-collapse: separate;
              border-spacing: 0;
              border-radius: 12px;
              overflow: hidden;
              border: 1px solid #e5e7eb;
              font-size: 14px;
            }
            .article-body thead tr {
              background: #f9fafb;
            }
            .article-body th {
              padding: 12px 16px;
              text-align: left;
              font-weight: 600;
              color: #374151;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.03em;
              border-bottom: 2px solid #e5e7eb;
            }
            .article-body td {
              padding: 12px 16px;
              color: #4b5563;
              border-bottom: 1px solid #f3f4f6;
              line-height: 1.6;
            }
            .article-body tbody tr:last-child td {
              border-bottom: none;
            }
            .article-body tbody tr:hover {
              background: #fafafa;
            }
            .article-body img {
              border-radius: 12px;
              margin: 1.5rem 0;
              max-width: 100%;
            }
            .article-body hr {
              border: none;
              border-top: 1px solid #f3f4f6;
              margin: 2rem 0;
            }
            .article-body code {
              background: #fef2f2;
              color: #A51C30;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 13px;
            }
            .article-body h2:first-child {
              margin-top: 0;
            }
          `}} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-10">
            {/* Article Body */}
            <div
              ref={contentRef}
              className="article-body max-w-none"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* Sidebar TOC (Desktop) */}
            {tocItems.length > 2 && (
              <aside className="hidden lg:block">
                <div className="sticky top-20">
                  <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest mb-4">
                    On this page
                  </p>
                  <nav className="space-y-1">
                    {tocItems.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-[12px] py-1.5 transition-all duration-200 rounded-md px-2 ${
                          item.level === 3 ? "pl-5" : ""
                        } ${
                          activeHeading === item.id
                            ? "text-[#A51C30] font-semibold bg-rose-50/50"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-gray-300" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/magazine?search=${encodeURIComponent(tag)}`}
                    className="px-3 py-1.5 bg-gray-50 text-gray-500 text-[12px] font-medium rounded-lg hover:bg-rose-50 hover:text-[#A51C30] transition-all"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100 pb-16">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-[15px] font-semibold text-gray-800">Related articles</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map((related) => {
                  const relCatStyle = getCatStyle(related.category);
                  return (
                    <Link key={related.id} href={`/magazine/${related.slug}`} className="group">
                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-0.5">
                        <div
                          className="h-32 w-full relative overflow-hidden"
                          style={{
                            background: related.cover_image_url
                              ? `url(${related.cover_image_url}) center/cover`
                              : getCoverGradient(related.category),
                          }}
                        >
                          <div className="absolute top-2.5 left-2.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${relCatStyle.bg} ${relCatStyle.text}`}>
                              {related.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-[#A51C30] transition-colors leading-snug">
                            {related.title}
                          </h4>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[11px] text-gray-300">{related.read_time} min read</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#A51C30] transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Scroll to Top */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-40 w-10 h-10 bg-gray-900 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-800 transition-all hover:scale-105"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </DefaultLayout>
  );
}
