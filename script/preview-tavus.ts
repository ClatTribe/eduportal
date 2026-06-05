/**
 * Prepare a LOCAL, scrubbable preview of the Tavus magazine Reel in Remotion
 * Studio - without rendering a full MP4.
 *
 * It runs the real pipeline (Gemini script -> voiceover -> photos -> Tavus
 * narrator), keeps every generated asset under remotion/public, and writes the
 * assembled input props to remotion/preview-props.json.
 *
 * Then open the live preview at http://localhost:3000 with:
 *   npm run studio:preview
 * (equivalent to: npx remotion studio remotion/index.ts --props=remotion/preview-props.json --public-dir=remotion/public)
 *
 * Usage:
 *   npm run preview-tavus              # latest published article
 *   npm run preview-tavus -- --id=35   # a specific post id
 *
 * Requires TAVUS_API_KEY in .env.local (https://platform.tavus.io/dev/api-keys).
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getSupabaseAdmin } from "../lib/supabase-admin";
import { parseCliPostId } from "../lib/parse-cli-post-id";
import { generateVideoScript } from "../lib/video-script-gemini";
import {
  applyVoiceoverToScript,
  isVideoVoiceEnabled,
} from "../lib/video-tts";
import { fetchSlideImages } from "../lib/video-images";
import { resolveBackgroundMusicForPost } from "../lib/video-music";
import {
  generateTavusNarrator,
  isTavusEnabled,
} from "../lib/video-tavus";
import { BLOG_VIDEO_FPS } from "../remotion/types";

dotenv.config({ path: ".env.local" });

const POST_FIELDS =
  "id, title, slug, excerpt, content, category, tags, cover_image_url";

const PROPS_PATH = path.join(process.cwd(), "remotion", "preview-props.json");

async function fetchPost(forcePostId?: number) {
  const supabase = getSupabaseAdmin();

  if (forcePostId) {
    const { data, error } = await supabase
      .from("magazine_posts")
      .select(POST_FIELDS)
      .eq("id", forcePostId)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) {
      throw new Error(`Post ${forcePostId} not found or not published`);
    }
    return data;
  }

  const { data, error } = await supabase
    .from("magazine_posts")
    .select(POST_FIELDS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch latest post: ${error.message}`);
  if (!data) throw new Error("No published magazine articles found");
  return data;
}

async function main() {
  if (!isTavusEnabled()) {
    console.warn(
      "WARNING: TAVUS_API_KEY is not set (or TAVUS_ENABLED=false).\n" +
        "The preview will use the photo intro fallback (no talking-head avatar).\n" +
        "Add TAVUS_API_KEY to .env.local to preview the Tavus presenter.\n",
    );
  }

  const forcePostId = parseCliPostId() ?? undefined;

  console.log("Fetching magazine article...");
  const post = await fetchPost(forcePostId);
  console.log(`-> #${post.id} "${post.title}"\n`);

  console.log("Generating script (Gemini)...");
  let { script } = await generateVideoScript({
    title: post.title,
    content: post.content,
    excerpt: post.excerpt ?? undefined,
    category: post.category ?? undefined,
    tags: post.tags ?? undefined,
    slug: post.slug,
  });

  let slideAudioUrls: string[] = [];
  if (isVideoVoiceEnabled()) {
    try {
      console.log("Generating voiceover...");
      const voice = await applyVoiceoverToScript(script, post.id);
      script = voice.script;
      slideAudioUrls = voice.slideAudioUrls;
    } catch (error) {
      console.warn(
        "Voiceover failed - continuing silent:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  let slideImageUrls: string[] = [];
  try {
    console.log("Fetching slide photos...");
    const countryMatch = post.title.match(
      /\b(Ireland|UK|Canada|Germany|Australia|USA|Netherlands|France|Italy|Singapore|New Zealand)\b/i,
    );
    const images = await fetchSlideImages(script, post.id, {
      title: post.title,
      category: post.category ?? undefined,
      excerpt: post.excerpt ?? undefined,
      coverUrl: post.cover_image_url ?? undefined,
      country: countryMatch?.[1] ?? undefined,
    });
    slideImageUrls = images.urls;
  } catch (error) {
    console.warn(
      "Photo fetch failed - continuing without photos:",
      error instanceof Error ? error.message : error,
    );
  }

  // Default previews the avatar; pass --template to preview a template day.
  const wantTavus = !process.argv.includes("--template");
  let tavusNarrator = null;
  if (wantTavus && isTavusEnabled()) {
    try {
      console.log("Generating Tavus narrator (this can take a few minutes)...");
      const result = await generateTavusNarrator(script, {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt ?? undefined,
        category: post.category ?? undefined,
      });
      tavusNarrator = result.narrator;
    } catch (error) {
      console.warn(
        "Tavus narrator failed - continuing without avatar:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  // Stretch/shrink slides to fill the avatar's spoken length (no dead air).
  if (tavusNarrator) {
    const cur = script.slides.reduce((s, x) => s + x.duration, 0);
    if (cur > 0) {
      const f = tavusNarrator.durationSeconds / cur;
      script = {
        ...script,
        slides: script.slides.map((s) => ({
          ...s,
          duration: Math.max(2.5, s.duration * f),
        })),
      };
    }
  }

  const music = await resolveBackgroundMusicForPost();

  // Audio source: the avatar clip carries the voice when it rendered; if Tavus
  // failed/timed out, fall back to the per-slide voiceover so it's never silent.
  const effectiveSlideAudioUrls = tavusNarrator ? [] : slideAudioUrls;
  if (!tavusNarrator) {
    const hasVoice = effectiveSlideAudioUrls.some(Boolean);
    console.log(
      hasVoice
        ? "No Tavus avatar — using per-slide voiceover so the video isn't silent."
        : "WARNING: no Tavus avatar AND no per-slide voiceover — video would be silent.",
    );
  }

  const inputProps = {
    script,
    coverUrl: post.cover_image_url ?? "",
    brandColor: "#A51C30",
    category: post.category ?? "Study Abroad",
    slideAudioUrls: effectiveSlideAudioUrls,
    slideImageUrls,
    backgroundMusicPath: music.path,
    backgroundMusicVolume: music.volume,
    tavusNarrator,
  };

  fs.writeFileSync(PROPS_PATH, JSON.stringify(inputProps, null, 2));

  const narratorS = tavusNarrator ? tavusNarrator.durationSeconds : 0;
  const slidesS = script.slides.reduce((s, sl) => s + sl.duration, 0);
  const totalS = tavusNarrator ? Math.max(slidesS, narratorS) : slidesS + 2;

  console.log("\nPreview ready.");
  console.log(`  Props written: ${PROPS_PATH}`);
  console.log(
    `  Tavus narrator: ${tavusNarrator ? narratorS.toFixed(1) + "s (PIP overlay)" : "none (photo intro fallback)"}`,
  );
  console.log(`  Slides:         ${script.slides.length} (${slidesS.toFixed(1)}s)`);
  console.log(`  Total length:   ~${totalS.toFixed(1)}s @ ${BLOG_VIDEO_FPS}fps`);
  console.log("\nOpen the live preview at http://localhost:3000 :");
  console.log("  npm run studio:preview\n");
}

main().catch((error) => {
  console.error("Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
