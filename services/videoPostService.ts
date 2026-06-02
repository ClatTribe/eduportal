import { getSupabaseAdmin } from "../lib/supabase-admin";
import { publishReel, validateInstagramConfig } from "../lib/instagram";
import {
  isYouTubeConfigured,
  uploadYouTubeShort,
  validateYouTubeConfig,
} from "../lib/youtube";
import { renderBlogVideo } from "./videoRenderService";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://app.goeduabroad.com";

export interface MagazinePostForVideo {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  tags: string[] | null;
  cover_image_url: string | null;
}

export interface VideoPostResult {
  postId: number;
  slug: string;
  videoUrl: string;
  instagramReelMediaId: string | null;
  youtubeShortId: string | null;
  scriptSource: "gemini" | "fallback";
  slideCount: number;
}

export interface VideoRunResult {
  skipped?: boolean;
  reason?: string;
  posted?: VideoPostResult;
}

async function getNextPostForVideo(): Promise<MagazinePostForVideo | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("magazine_posts")
    .select(
      "id, title, slug, excerpt, content, category, tags, cover_image_url",
    )
    .eq("status", "published")
    .not("instagram_posted_at", "is", null)
    .is("video_posted_at", null)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch magazine post: ${error.message}`);
  }

  return data as MagazinePostForVideo | null;
}

async function markVideoPosted(
  postId: number,
  updates: {
    instagramReelMediaId?: string | null;
    youtubeShortId?: string | null;
  },
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("magazine_posts")
    .update({
      video_posted_at: new Date().toISOString(),
      instagram_reel_media_id: updates.instagramReelMediaId ?? null,
      youtube_short_id: updates.youtubeShortId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (error) {
    throw new Error(`Failed to update magazine post: ${error.message}`);
  }
}

function buildYouTubeMetadata(
  post: MagazinePostForVideo,
  caption: string,
): { title: string; description: string; tags: string[] } {
  const articleUrl = `${SITE_URL}/magazine/${post.slug}`;
  const tags = [
    "Shorts",
    "StudyAbroad",
    "EduAbroad",
    ...(post.tags ?? []).slice(0, 8),
  ];

  return {
    title: `${post.title} #Shorts`.slice(0, 100),
    description: `${caption}\n\nFull article: ${articleUrl}\n\n#Shorts #StudyAbroad`,
    tags,
  };
}

export async function runVideoPost(options?: {
  forcePostId?: number;
  skipInstagram?: boolean;
  skipYouTube?: boolean;
}): Promise<VideoRunResult> {
  const igMissing = validateInstagramConfig();
  const ytConfigured = isYouTubeConfigured();

  if (!options?.skipInstagram && igMissing.length > 0) {
    throw new Error(`Missing env vars: ${igMissing.join(", ")}`);
  }

  if (!options?.skipYouTube && !ytConfigured) {
    console.warn(
      "YouTube not configured — will skip Shorts upload. Set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN.",
    );
  }

  let post: MagazinePostForVideo | null;

  if (options?.forcePostId) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("magazine_posts")
      .select(
        "id, title, slug, excerpt, content, category, tags, cover_image_url",
      )
      .eq("id", options.forcePostId)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) {
      throw new Error(`Post ${options.forcePostId} not found or not published`);
    }
    post = data as MagazinePostForVideo;
  } else {
    post = await getNextPostForVideo();
  }

  if (!post) {
    return {
      skipped: true,
      reason:
        "No published articles with carousel posted and video not yet published",
    };
  }

  const { videoUrl, videoBuffer, script, source } = await renderBlogVideo(post);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  let instagramReelMediaId: string | null = null;
  let youtubeShortId: string | null = null;

  if (!options?.skipInstagram) {
    instagramReelMediaId = await publishReel(videoUrl, script.caption);
  }

  if (!options?.skipYouTube && ytConfigured) {
    const ytMeta = buildYouTubeMetadata(post, script.caption);
    youtubeShortId = await uploadYouTubeShort(videoBuffer, ytMeta);
  } else if (!options?.skipYouTube) {
    const ytMissing = validateYouTubeConfig();
    console.warn(`Skipping YouTube: missing ${ytMissing.join(", ")}`);
  }

  await markVideoPosted(post.id, {
    instagramReelMediaId,
    youtubeShortId,
  });

  return {
    posted: {
      postId: post.id,
      slug: post.slug,
      videoUrl,
      instagramReelMediaId,
      youtubeShortId,
      scriptSource: source,
      slideCount: script.slides.length,
    },
  };
}
