import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

// Regenerate the sitemap at most once an hour so new magazine_posts appear
// in the sitemap without waiting for the next Vercel build.
export const revalidate = 3600;

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://inxxmyjxizswmtxumrop.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: "https://app.goeduabroad.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://app.goeduabroad.com/magazine",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://app.goeduabroad.com/course-finder",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://app.goeduabroad.com/scholarship-finder",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const { data: posts } = await supabase
    .from("magazine_posts")
    .select("slug, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const articlePages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `https://app.goeduabroad.com/magazine/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...articlePages];
}
