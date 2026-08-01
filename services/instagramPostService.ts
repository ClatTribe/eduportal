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

/**
 * Instagram carousel posting has been REMOVED — this is now a no-op that always
 * skips and never publishes a carousel. Reels/videos are published separately
 * via videoPostService.
 */
export async function runInstagramPost(_options?: {
  forcePostId?: number;
}): Promise<InstagramRunResult> {
  console.log("[ig] Instagram carousel posting is removed — skipping");
  return {
    skipped: true,
    reason: "Instagram carousel posting has been removed",
  };
}

export function getMagazineArticleUrl(slug: string): string {
  return `${SITE_URL}/magazine/${slug}`;
}
