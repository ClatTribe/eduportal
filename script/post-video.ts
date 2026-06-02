/**
 * Manually render a blog Reel with Remotion and publish to Instagram + YouTube Shorts.
 *
 * Usage:
 *   npm run post-video
 *   npm run post-video --id=35
 *   npm run post-video -- 35 --skip-youtube
 */

import dotenv from "dotenv";
import { parseCliPostId } from "../lib/parse-cli-post-id";
import { runVideoPost } from "../services/videoPostService";

dotenv.config({ path: ".env.local" });

async function main() {
  const forcePostId = parseCliPostId() ?? undefined;
  const skipYouTube = process.argv.includes("--skip-youtube");
  const skipInstagram = process.argv.includes("--skip-instagram");

  console.log("Starting blog video post (Remotion → IG Reel + YT Shorts)...\n");

  try {
    const result = await runVideoPost({
      forcePostId,
      skipYouTube,
      skipInstagram,
    });

    if (result.skipped) {
      console.log(`Skipped: ${result.reason}`);
      return;
    }

    console.log("Posted successfully!");
    console.log(`  Post ID:       ${result.posted?.postId}`);
    console.log(`  Slug:          ${result.posted?.slug}`);
    console.log(`  Video URL:     ${result.posted?.videoUrl}`);
    console.log(`  IG Reel ID:    ${result.posted?.instagramReelMediaId ?? "skipped"}`);
    console.log(`  YouTube ID:    ${result.posted?.youtubeShortId ?? "skipped"}`);
    console.log(`  Script source: ${result.posted?.scriptSource}`);
    console.log(`  Slides:        ${result.posted?.slideCount}`);
  } catch (error) {
    console.error(
      "Failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

main();
