/**
 * Fully automatic social publisher.
 *
 * Finds the latest published-but-unposted magazine article and runs the full
 * pipeline — Instagram carousel → Instagram Reel → YouTube Short — with no
 * post id required. Designed to be run on a schedule by GitHub Actions, where
 * Remotion can actually render video (unlike Vercel serverless).
 *
 * Local usage:
 *   npm run auto-publish
 *   npx tsx script/auto-publish.ts
 */

import dotenv from "dotenv";
import { runInstagramPost } from "../services/instagramPostService";
import { runVideoPost } from "../services/videoPostService";

// Load .env.local for local runs; on GitHub Actions the env comes from secrets.
dotenv.config({ path: ".env.local" });

async function main() {
  const skipYouTube = process.argv.includes("--skip-youtube");

  console.log("[auto] Starting automatic social publish run…");

  // ── Step 1: Instagram carousel (auto-picks latest unposted article) ────────
  console.log("\n[auto] Step 1/2: Instagram carousel…");
  const carousel = await runInstagramPost();

  if (carousel.skipped) {
    console.log(`[auto] Carousel skipped: ${carousel.reason}`);
  } else {
    console.log(
      `[auto] Carousel posted for post ${carousel.posted?.postId} ` +
        `(media ${carousel.posted?.instagramMediaId})`,
    );
  }

  // ── Step 2: Reel + YouTube Short (auto-picks article with carousel done) ───
  console.log("\n[auto] Step 2/2: Reel + YouTube Short…");
  const video = await runVideoPost({ skipYouTube });

  if (video.skipped) {
    console.log(`[auto] Video skipped: ${video.reason}`);
  } else {
    console.log(
      `[auto] Video posted for post ${video.posted?.postId} — ` +
        `IG Reel ${video.posted?.instagramReelMediaId ?? "—"} · ` +
        `YT Short ${video.posted?.youtubeShortId ?? "—"}`,
    );
  }

  console.log("\n[auto] Run complete.");

  // If both steps had nothing to do, that's fine (no new article) — exit 0.
  // A thrown error inside a step will reject and exit non-zero automatically.
}

main().catch((error) => {
  console.error(
    "[auto] Run failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
