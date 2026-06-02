/**
 * Manually post the latest unpublished magazine article to Instagram.
 *
 * Usage:
 *   npm run post-instagram
 *   npm run post-instagram --id=35
 *   npm run post-instagram -- 35
 */

import dotenv from "dotenv";
import { parseCliPostId } from "../lib/parse-cli-post-id";
import { runInstagramPost } from "../services/instagramPostService";

dotenv.config({ path: ".env.local" });

async function main() {
  const forcePostId = parseCliPostId() ?? undefined;

  console.log("Starting Instagram carousel post...\n");

  try {
    const result = await runInstagramPost(
      forcePostId ? { forcePostId } : undefined,
    );

    if (result.skipped) {
      console.log(`Skipped: ${result.reason}`);
      return;
    }

    console.log("Posted successfully!");
    console.log(`  Post ID:      ${result.posted?.postId}`);
    console.log(`  Slug:         ${result.posted?.slug}`);
    console.log(`  IG Media ID:  ${result.posted?.instagramMediaId}`);
    console.log(`  Slides:       ${result.posted?.slideCount}`);
    console.log(`  Copy source:  ${result.posted?.copySource}`);
  } catch (error) {
    console.error(
      "Failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

main();
