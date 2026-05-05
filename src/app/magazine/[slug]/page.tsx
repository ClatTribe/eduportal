"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Calendar,
  ArrowLeft,
  Share2,
  BookOpen,
  Tag,
  ChevronUp,
  Link2,
  Twitter,
  Linkedin,
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
    month: "long",
    year: "numeric",
  });
}

function getCoverGradient(category: string): string {
  const gradients: Record<string, string> = {
    "Country Guide":
      "linear-gradient(135deg, #A51C30 0%, #d4243e 50%, #f87171 100%)",
    "Visa Tips":
      "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #60a5fa 100%)",
    Scholarships:
      "linear-gradient(135deg, #065f46 0%, #059669 50%, #34d399 100%)",
    "IELTS/TOEFL":
      "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)",
    "Student Life":
      "linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)",
    Rankings:
      "linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #f87171 100%)",
    "Career After":
      "linear-gradient(135deg, #164e63 0%, #0891b2 50%, #22d3ee 100%)",
    "Admit Stories":
      "linear-gradient(135deg, #831843 0%, #be185d 50%, #f472b6 100%)",
    News: "linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #818cf8 100%)",
  };
  return (
    gradients[category] ||
    "linear-gradient(135deg, #A51C30 0%, #d4243e 50%, #f87171 100%)"
  );
}

// Extract headings from HTML content for TOC
function extractHeadings(html: string): TOCItem[] {
  const headingRegex = /<h([2-3])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[2-3]>/gi;
  const headings: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const existingId = match[2];
    const text = match[3].replace(/<[^>]*>/g, "").trim();
    const id =
      existingId ||
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    headings.push({ id, text, level });
  }
  return headings;
}

// Add IDs to headings in HTML content
function addHeadingIds(html: string): string {
  return html.replace(
    /<h([2-3])([^>]*)>(.*?)<\/h([2-3])>/gi,
    (match, level, attrs, content, closeLevel) => {
      const text = content.replace(/<[^>]*>/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
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
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setReadProgress(Math.min(progress, 100));
      setShowScrollTop(scrollTop > 400);
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

      // Fetch related posts
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
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "copy":
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-[#A51C30] flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A51C30]"></div>
            <span className="text-sm font-medium">Loading article...</span>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!post) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Article Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            This article may have been removed or the URL is incorrect.
          </p>
          <Link
            href="/magazine"
            className="px-6 py-3 bg-[#A51C30] text-white rounded-lg font-semibold hover:bg-[#8a1728] transition-colors"
          >
            Back to Magazine
          </Link>
        </div>
      </DefaultLayout>
    );
  }

  const processedContent = addHeadingIds(post.content || "");
  const tocItems = extractHeadings(post.content || "");

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-white">
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-[#A51C30] to-[#d4243e] transition-all duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        {/* Hero Cover */}
        <div
          className="w-full h-48 sm:h-64 md:h-80 relative"
          style={{
            background: post.cover_image_url
              ? `url(${post.cover_image_url}) center/cover`
              : getCoverGradient(post.category),
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 left-4">
            <Link
              href="/magazine"
              className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Magazine
            </Link>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
          {/* Article Header Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: getCategoryColor(post.category) }}
              >
                {post.category}
              </span>
              <span className="text-gray-400 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.read_time} min read
              </span>
              <span className="text-gray-400 text-xs flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.published_at)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 mb-5 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author & Share */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A51C30] to-[#d4243e] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {post.author}
                  </p>
                  <p className="text-xs text-gray-400">EduAbroad Magazine</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare("twitter")}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-[#1DA1F2] transition-all group"
                  title="Share on Twitter"
                >
                  <Twitter className="w-4 h-4 text-gray-400 group-hover:text-[#1DA1F2]" />
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-[#0077B5] transition-all group"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-gray-400 group-hover:text-[#0077B5]" />
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-[#A51C30] transition-all group"
                  title="Copy link"
                >
                  <Link2
                    className={`w-4 h-4 ${copied ? "text-green-500" : "text-gray-400 group-hover:text-[#A51C30]"}`}
                  />
                </button>
                {copied && (
                  <span className="text-xs text-green-500 font-medium">
                    Copied!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8">
            {/* Article Body */}
            <div
              ref={contentRef}
              className="prose prose-lg max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-[#A51C30] prose-h2:pl-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5
                prose-a:text-[#A51C30] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-800
                prose-ul:my-4 prose-li:text-gray-700
                prose-blockquote:border-l-[#A51C30] prose-blockquote:bg-[#FEF2F3] prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                prose-img:rounded-xl prose-img:shadow-md
                prose-table:border-collapse prose-th:bg-[#FEF2F3] prose-th:text-[#A51C30]"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* Sidebar TOC (Desktop) */}
            {tocItems.length > 2 && (
              <aside className="hidden lg:block">
                <div className="sticky top-16">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    On this page
                  </h4>
                  <nav className="space-y-2">
                    {tocItems.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-sm text-gray-500 hover:text-[#A51C30] transition-colors ${
                          item.level === 3 ? "pl-3" : ""
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
            <div className="mt-10 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-gray-400" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/magazine?search=${encodeURIComponent(tag)}`}
                    className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-100 hover:bg-[#FEF2F3] hover:border-[#FECDD3] hover:text-[#A51C30] transition-all"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100 pb-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    href={`/magazine/${related.slug}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                      <div
                        className="h-32 w-full"
                        style={{
                          background: related.cover_image_url
                            ? `url(${related.cover_image_url}) center/cover`
                            : getCoverGradient(related.category),
                        }}
                      />
                      <div className="p-4">
                        <span
                          className="text-[10px] font-bold uppercase"
                          style={{ color: getCategoryColor(related.category) }}
                        >
                          {related.category}
                        </span>
                        <h4 className="text-sm font-bold text-gray-800 mt-1 line-clamp-2 group-hover:text-[#A51C30] transition-colors">
                          {related.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-2">
                          {related.read_time} min read
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scroll to Top */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 w-10 h-10 bg-[#A51C30] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#8a1728] transition-all hover:scale-110"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </DefaultLayout>
  );
}
