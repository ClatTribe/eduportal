import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ArticleClient from "./ArticleClient";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://inxxmyjxizswmtxumrop.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: post } = await supabase
    .from("magazine_posts")
    .select("title, excerpt, seo_title, seo_description, seo_keywords, cover_image_url, category, author")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) {
    return {
      title: "Article Not Found | EduAbroad Magazine",
      description: "This article could not be found.",
    };
  }

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  const keywords = post.seo_keywords || [];

  return {
    title: `${title} | EduAbroad Magazine`,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: post.author || "EduAbroad Team" }],
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://app.goeduabroad.com/magazine/${slug}`,
      siteName: "EduAbroad Magazine",
      images: post.cover_image_url
        ? [{ url: post.cover_image_url, width: 1200, height: 600, alt: title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
    alternates: {
      canonical: `https://app.goeduabroad.com/magazine/${slug}`,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  return <ArticleClient slug={slug} />;
}
