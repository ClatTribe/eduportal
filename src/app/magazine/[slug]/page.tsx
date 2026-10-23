import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ArticleClient from "./ArticleClient";
import {
  LIST_COLUMNS,
  MagazinePost,
  SITE_URL,
  extractFaqs,
  processContent,
  splitForInlineCta,
  wordCount,
} from "../magazine-utils";

// Articles are rendered on the server and cached for 10 minutes (ISR), so Google
// receives the full article text, headings and structured data in the first response.
export const revalidate = 600;

// No articles are built at deploy time; each one is rendered on its first visit and then cached.
export async function generateStaticParams() {
  return [];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://inxxmyjxizswmtxumrop.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
);

interface Props {
  params: Promise<{ slug: string }>;
}

const getPost = cache(async (slug: string) => {
  const { data } = await supabase
    .from("magazine_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as MagazinePost | null) ?? null;
});

async function getRelated(post: MagazinePost) {
  const { data: sameCat } = await supabase
    .from("magazine_posts")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .eq("category", post.category)
    .neq("slug", post.slug)
    .order("published_at", { ascending: false })
    .limit(3);
  let related = (sameCat as MagazinePost[] | null) || [];
  if (related.length < 3) {
    const { data: latest } = await supabase
      .from("magazine_posts")
      .select(LIST_COLUMNS)
      .eq("status", "published")
      .neq("slug", post.slug)
      .order("published_at", { ascending: false })
      .limit(6);
    const ids = new Set(related.map((r) => r.id));
    related = [...related, ...((latest as MagazinePost[] | null) || []).filter((p) => !ids.has(p.id))].slice(0, 3);
  }
  return related;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return { title: "Article not found | EduAbroad Magazine", robots: { index: false } };
  }

  const title = post.seo_title || post.title;
  const description = (post.seo_description || post.excerpt || "").slice(0, 160);
  const url = `${SITE_URL}/magazine/${slug}`;
  const images = post.cover_image_url ? [{ url: post.cover_image_url, width: 1200, height: 630, alt: post.title }] : [];

  return {
    title: `${title} | EduAbroad Magazine`,
    description,
    keywords: post.seo_keywords || post.tags || [],
    authors: [{ name: post.author || "EduAbroad Team" }],
    alternates: { canonical: url },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      siteName: "EduAbroad Magazine",
      locale: "en_IN",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      section: post.category,
      tags: post.tags || [],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelated(post);
  const { html, toc } = processContent(post.content || "", post.title);
  const parts = splitForInlineCta(html);
  const faqs = extractFaqs(html);
  const url = `${SITE_URL}/magazine/${slug}`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: (post.seo_title || post.title).slice(0, 110),
      description: post.seo_description || post.excerpt,
      image: post.cover_image_url ? [post.cover_image_url] : [`${SITE_URL}/edulogo.png`],
      datePublished: post.published_at,
      dateModified: post.updated_at || post.published_at,
      articleSection: post.category,
      keywords: (post.tags || []).join(", "),
      wordCount: wordCount(html),
      inLanguage: "en-IN",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: {
        "@type": post.author && post.author !== "EduAbroad Team" ? "Person" : "Organization",
        name: post.author || "EduAbroad Team",
        url: "https://www.goeduabroad.com",
      },
      publisher: {
        "@type": "Organization",
        name: "EduAbroad",
        url: "https://www.goeduabroad.com",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/edulogo.png` },
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Magazine", item: `${SITE_URL}/magazine` },
        { "@type": "ListItem", position: 2, name: post.category, item: `${SITE_URL}/magazine?search=${encodeURIComponent(post.category)}` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];
  if (faqs.length >= 2) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c"),
        }}
      />
      <ArticleClient post={{ ...post, content: undefined }} parts={parts} toc={toc} related={related} />
    </>
  );
}
