import fs from "fs";
import os from "os";
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { generateVideoScript } from "../lib/video-script-gemini";
import type { VideoScript } from "../lib/video-script-gemini";
import { getSupabaseAdmin } from "../lib/supabase-admin";
import {
  applyVoiceoverToScript,
  cleanupVoiceTempDir,
  isVideoVoiceEnabled,
} from "../lib/video-tts";
import { resolveBackgroundMusicForPost } from "../lib/video-music";
import { fetchSlideImages, cleanupOldPhotos } from "../lib/video-images";
import { BLOG_VIDEO_FPS } from "../remotion/types";

const STORAGE_BUCKET = "instagram-videos";

export interface RenderBlogVideoResult {
  videoUrl: string;
  videoBuffer: Buffer;
  script: VideoScript;
  source: "gemini" | "fallback";
}

export async function renderBlogVideo(post: {
  id: number;
  title: string;
  content: string;
  excerpt?: string | null;
  category?: string | null;
  tags?: string[] | null;
  slug: string;
  cover_image_url?: string | null;
}): Promise<RenderBlogVideoResult> {
  // ── Step 1: Generate video script with Gemini ────────────────────────────
  console.log("[video] Generating script…");
  let { script, source } = await generateVideoScript({
    title: post.title,
    content: post.content,
    excerpt: post.excerpt ?? undefined,
    category: post.category ?? undefined,
    tags: post.tags ?? undefined,
    slug: post.slug,
  });

  // ── Step 2: Generate voiceover audio per slide ───────────────────────────
  let slideAudioUrls: string[] = [];
  let voiceTempDir: string | undefined;

  if (isVideoVoiceEnabled()) {
    try {
      console.log("[video] Generating voiceover…");
      const voice = await applyVoiceoverToScript(script, post.id);
      script = voice.script;
      slideAudioUrls = voice.slideAudioUrls;
      voiceTempDir = voice.tempDir;
    } catch (error) {
      console.warn(
        "[video] Voiceover failed — rendering silent:",
        error instanceof Error ? error.message : error,
      );
    }
  } else {
    console.log("[video] Voice disabled (VIDEO_VOICE_ENABLED=false)");
  }

  // ── Step 3: Fetch slide background photos via Gemini + Unsplash ──────────
  // Gemini picks the best search query per slide based on article context.
  // Hook slide uses cover_image_url; point slides get Unsplash photos.
  // Stat slides are skipped (dark bg needed for chart contrast).
  let slideImageUrls: string[] = [];

  try {
    console.log("[video] Fetching slide images…");

    // Extract country hint from title/category for better Gemini queries
    // e.g. "Masters in Ireland" → country: "Ireland"
    const countryMatch = post.title.match(
      /\b(Ireland|UK|Canada|Germany|Australia|USA|Netherlands|France|Italy|Singapore|New Zealand)\b/i,
    );
    const country = countryMatch?.[1] ?? undefined;

    const images = await fetchSlideImages(script, post.id, {
      title: post.title,
      category: post.category ?? undefined,
      excerpt: post.excerpt ?? undefined,
      coverUrl: post.cover_image_url ?? undefined,
      country,
    });

    slideImageUrls = images.urls;
    console.log(
      `[video] Photos ready: ${slideImageUrls.filter(Boolean).length}/${script.slides.length} slides`,
    );
  } catch (error) {
    console.warn(
      "[video] Image fetch failed — rendering without photos:",
      error instanceof Error ? error.message : error,
    );
    // Non-fatal: video renders fine with just dark backgrounds
  }

  // ── Step 4: Bundle Remotion ──────────────────────────────────────────────
  const totalFrames = script.slides.reduce(
    (sum, slide) => sum + Math.round(slide.duration * BLOG_VIDEO_FPS),
    0,
  );

  const entryPoint = path.join(process.cwd(), "remotion", "index.ts");
  const publicDir = path.join(process.cwd(), "remotion", "public");

  console.log("[video] Bundling Remotion…");
  const bundled = await bundle({ entryPoint, publicDir });

  const music = await resolveBackgroundMusicForPost();

  const inputProps = {
    script,
    coverUrl: post.cover_image_url ?? "",
    brandColor: "#A51C30",
    category: post.category ?? "Study Abroad",
    slideAudioUrls,
    slideImageUrls,          // ← photos passed to BlogVideo
    backgroundMusicPath: music.path,
    backgroundMusicVolume: music.volume,
  };

  // ── Step 5: Select composition + set exact duration ──────────────────────
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "BlogVideo",
    inputProps,
  });

  composition.durationInFrames = totalFrames;

  // ── Step 6: Render to MP4 ────────────────────────────────────────────────
  const outPath = path.join(
    os.tmpdir(),
    `blog-video-${post.id}-${Date.now()}.mp4`,
  );

  console.log(`[video] Rendering ${totalFrames} frames…`);

  try {
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outPath,
      inputProps,
    });
  } finally {
    // Always clean up voice temp files, even if render fails
    if (voiceTempDir) cleanupVoiceTempDir(voiceTempDir);
    // Clean up downloaded photos after render (saves disk space)
    cleanupOldPhotos(post.id);
  }

  // ── Step 7: Upload to Supabase Storage ───────────────────────────────────
  const videoBuffer = fs.readFileSync(outPath);
  fs.unlinkSync(outPath);

  const fileName = `videos/post-${post.id}-${Date.now()}.mp4`;
  const supabase = getSupabaseAdmin();

  console.log("[video] Uploading to Supabase…");

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, videoBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload video: ${error.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);

  console.log(`[video] Done → ${data.publicUrl}`);

  return {
    videoUrl: data.publicUrl,
    videoBuffer,
    script,
    source,
  };
}