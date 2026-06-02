/**
 * Publish Instagram carousel + Reel (+ YouTube Short) for one magazine article.
 *
 * Usage (Windows-friendly):
 *   npm run publish-social --id=36
 *   npm run publish-social -- 36
 *   npx tsx script/publish-social.ts --id=36
 */

import dotenv from "dotenv";
import { parseCliPostId } from "../lib/parse-cli-post-id";
import { runMagazineSocialPublish } from "../services/magazineSocialPublishService";

dotenv.config({ path: ".env.local" });

async function main() {
  const postId = parseCliPostId();
  const skipYouTube = process.argv.includes("--skip-youtube");

  if (!postId) {
    console.error("Usage:");
    console.error("  npm run publish-social --id=POST_ID");
    console.error("  npm run publish-social -- POST_ID");
    console.error("  npx tsx script/publish-social.ts --id=POST_ID");
    process.exit(1);
  }

  console.log(`Publishing social content for magazine post ${postId}…\n`);

  try {
    const result = await runMagazineSocialPublish(postId, { skipYouTube });

    console.log("\nDone.");
    console.log("  Slug:", result.slug);
    console.log(
      "  Carousel:",
      result.carousel.skipped
        ? `skipped (${result.carousel.reason})`
        : `posted (${result.carousel.posted?.instagramMediaId})`,
    );
    console.log(
      "  Video:",
      result.video.skipped
        ? `skipped (${result.video.reason})`
        : `IG ${result.video.posted?.instagramReelMediaId ?? "—"} · YT ${result.video.posted?.youtubeShortId ?? "—"}`,
    );
  } catch (error) {
    console.error(
      "Failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

main();
