import { getSupabaseAdmin } from "../lib/supabase-admin";
import type { MagazinePostForInstagram } from "../lib/carousel-generator";
import { buildCarouselContent } from "../lib/instagram-gemini";
import { renderCarouselSlidePng } from "../lib/carousel-images";
import {
  publishCarousel,
  validateInstagramConfig,
} from "../lib/instagram";

const STORAGE_BUCKET = "instagram-carousel";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://app.goeduabroad.com";

export interface InstagramPostResult {
  postId: number;
  slug: string;
  instagramMediaId: string;
  slideCount: number;
  imageUrls: string[];
  copySource: "gemini" | "fallback";
}

export interface InstagramRunResult {
  skipped?: boolean;
  reason?: string;
  posted?: InstagramPostResult;
}

async function uploadSlideImage(
  postId: number,
  slideIndex: number,
  pngBuffer: ArrayBuffer,
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const path = `${postId}/slide-${slideIndex}.png`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, pngBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload slide ${slideIndex}: ${error.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function getLatestUnpostedPost(): Promise<MagazinePostForInstagram | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("magazine_posts")
    .select("id, title, slug, excerpt, content, category, tags")
    .eq("status", "published")
    .is("instagram_posted_at", null)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch magazine post: ${error.message}`);
  }

  return data as MagazinePostForInstagram | null;
}

async function markPostAsPosted(
  postId: number,
  instagramMediaId: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("magazine_posts")
    .update({
      instagram_posted_at: new Date().toISOString(),
      instagram_media_id: instagramMediaId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (error) {
    throw new Error(`Failed to update magazine post: ${error.message}`);
  }
}

export async function runInstagramPost(options?: {
  forcePostId?: number;
}): Promise<InstagramRunResult> {
  // On/off toggle for the Instagram carousel. Set INSTAGRAM_CAROUSEL_ENABLED to
  // false/0/off/no to stop posting carousels (cron + manual both respect it).
  const raw = process.env.INSTAGRAM_CAROUSEL_ENABLED;
  const flag = (raw ?? "").trim().toLowerCase();
  const carouselDisabled = ["false", "0", "off", "no"].includes(flag);
  console.log(
    `[ig] carousel enabled=${!carouselDisabled} (INSTAGRAM_CAROUSEL_ENABLED=${raw ?? "unset"})`,
  );
  if (carouselDisabled) {
    return {
      skipped: true,
      reason: `Instagram carousel disabled (INSTAGRAM_CAROUSEL_ENABLED=${raw})`,
    };
  }

  const missing = validateInstagramConfig();
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }

  let post: MagazinePostForInstagram | null;

  if (options?.forcePostId) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("magazine_posts")
      .select("id, title, slug, excerpt, content, category, tags")
      .eq("id", options.forcePostId)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) {
      throw new Error(`Post ${options.forcePostId} not found or not published`);
    }
    post = data as MagazinePostForInstagram;
  } else {
    post = await getLatestUnpostedPost();
  }

  if (!post) {
    return {
      skipped: true,
      reason: "No new published magazine posts waiting for Instagram",
    };
  }

  const { slides, caption, source } = await buildCarouselContent(post);
  const imageUrls: string[] = [];

  for (let i = 0; i < slides.length; i++) {
    const png = await renderCarouselSlidePng(slides[i], post.category);
    const publicUrl = await uploadSlideImage(post.id, i + 1, png);
    imageUrls.push(publicUrl);
  }

  // Give Supabase CDN a moment so Meta can fetch the images reliably.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const instagramMediaId = await publishCarousel(imageUrls, caption);
  await markPostAsPosted(post.id, instagramMediaId);

  return {
    posted: {
      postId: post.id,
      slug: post.slug,
      instagramMediaId,
      slideCount: slides.length,
      imageUrls,
      copySource: source,
    },
  };
}

export function getMagazineArticleUrl(slug: string): string {
  return `${SITE_URL}/magazine/${slug}`;
}
