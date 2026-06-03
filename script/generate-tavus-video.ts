/**
 * Render a magazine Reel with a Tavus talking-head presenter (intro + outro),
 * the EduAbroad logo, synced subtitles, and animated photo slides.
 *
 * Renders to a local MP4 — it does NOT publish to Instagram/YouTube — so you
 * can preview the Tavus integration safely.
 *
 * Usage:
 *   npm run generate-tavus-video              # latest published article
 *   npm run generate-tavus-video -- --id=35   # a specific post id
 *
 * Requires TAVUS_API_KEY in .env.local (https://platform.tavus.io/dev/api-keys).
 * Set TAVUS_REPLICA_ID to choose the avatar (a stock replica is used otherwise).
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getSupabaseAdmin } from "../lib/supabase-admin";
import { isTavusEnabled } from "../lib/video-tavus";
import { parseCliPostId } from "../lib/parse-cli-post-id";
import { renderBlogVideo } from "../services/videoRenderService";

dotenv.config({ path: ".env.local" });

const POST_FIELDS =
  "id, title, slug, excerpt, content, category, tags, cover_image_url";

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

  // Latest published magazine article
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
      "⚠  TAVUS_API_KEY is not set (or TAVUS_ENABLED=false). The video will\n" +
        "   render with the photo intro fallback instead of the Tavus presenter.\n" +
        "   Add TAVUS_API_KEY to .env.local to enable the talking-head avatar.\n",
    );
  }

  const forcePostId = parseCliPostId() ?? undefined;

  console.log("Fetching magazine article…");
  const post = await fetchPost(forcePostId);
  console.log(`→ #${post.id} "${post.title}"\n`);

  console.log("Rendering video (Tavus intro/outro + slides)…");
  const { videoUrl, videoBuffer, source, script } = await renderBlogVideo(post);

  const outDir = path.join(process.cwd(), "out");
  fs.mkdirSync(outDir, { recursive: true });
  const localPath = path.join(outDir, `magazine-${post.id}-${Date.now()}.mp4`);
  fs.writeFileSync(localPath, videoBuffer);

  console.log("\n✓ Done");
  console.log(`  Script source: ${source}`);
  console.log(`  Slides:        ${script.slides.length}`);
  console.log(`  Local file:    ${localPath}`);
  console.log(`  Uploaded URL:  ${videoUrl}`);
}

main().catch((error) => {
  console.error("Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
