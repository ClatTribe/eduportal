import { getSupabaseAdmin } from "../lib/supabase-admin";
import { runInstagramPost } from "./instagramPostService";
import { runVideoPost } from "./videoPostService";
import { isYouTubeConfigured } from "../lib/youtube";

export interface MagazineSocialStatus {
  id: number;
  slug: string;
  status: string;
  instagram_posted_at: string | null;
  video_posted_at: string | null;
}

export interface MagazineSocialPublishResult {
  postId: number;
  slug: string;
  carousel: Awaited<ReturnType<typeof runInstagramPost>>;
  video: Awaited<ReturnType<typeof runVideoPost>>;
}

async function getPostSocialStatus(
  postId: number,
): Promise<MagazineSocialStatus | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("magazine_posts")
    .select("id, slug, status, instagram_posted_at, video_posted_at")
    .eq("id", postId)
    .maybeSingle();

  if (error || !data) return null;
  return data as MagazineSocialStatus;
}

/**
 * Runs Instagram carousel, then Reel (+ YouTube Short if configured) for one article.
 */
export async function runMagazineSocialPublish(
  postId: number,
  options?: { skipYouTube?: boolean },
): Promise<MagazineSocialPublishResult> {
  const post = await getPostSocialStatus(postId);

  if (!post) {
    throw new Error(`Magazine post ${postId} not found`);
  }

  if (post.status !== "published") {
    throw new Error(`Magazine post ${postId} is not published (status=${post.status})`);
  }

  console.log(`[social] Publishing post ${postId} (${post.slug})…`);

  let carousel: Awaited<ReturnType<typeof runInstagramPost>>;
  if (post.instagram_posted_at) {
    console.log("[social] Carousel already posted — skipping");
    carousel = {
      skipped: true,
      reason: "Instagram carousel already posted for this article",
    };
  } else {
    console.log("[social] Step 1/2: Instagram carousel…");
    carousel = await runInstagramPost({ forcePostId: postId });
    if (carousel.skipped) {
      console.warn("[social] Carousel skipped:", carousel.reason);
    } else {
      console.log("[social] Carousel done:", carousel.posted?.instagramMediaId);
    }
  }

  // When the carousel is intentionally disabled, still publish the Reel/Short
  // (don't gate the video on a carousel that we deliberately skipped).
  const carouselFlag = (process.env.INSTAGRAM_CAROUSEL_ENABLED ?? "")
    .trim()
    .toLowerCase();
  const carouselDisabled = ["false", "0", "off", "no"].includes(carouselFlag);
  const refreshed = await getPostSocialStatus(postId);
  let video: Awaited<ReturnType<typeof runVideoPost>>;

  if (refreshed?.video_posted_at) {
    console.log("[social] Video already posted — skipping");
    video = {
      skipped: true,
      reason: "Reel / Short already posted for this article",
    };
  } else if (
    !refreshed?.instagram_posted_at &&
    carousel.skipped &&
    !carouselDisabled
  ) {
    video = {
      skipped: true,
      reason: "Carousel not posted — cannot publish Reel yet",
    };
  } else {
    console.log("[social] Step 2/2: Reel" + (isYouTubeConfigured() ? " + YouTube Short…" : "…"));
    video = await runVideoPost({
      forcePostId: postId,
      skipYouTube: options?.skipYouTube,
    });
    if (video.skipped) {
      console.warn("[social] Video skipped:", video.reason);
    } else {
      console.log(
        "[social] Video done — IG:",
        video.posted?.instagramReelMediaId ?? "n/a",
        "YT:",
        video.posted?.youtubeShortId ?? "n/a",
      );
    }
  }

  return { postId, slug: post.slug, carousel, video };
}
