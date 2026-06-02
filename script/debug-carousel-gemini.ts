import dotenv from "dotenv";
import { getSupabaseAdmin } from "../lib/supabase-admin";
import { buildCarouselUserPrompt } from "../lib/carousel-prompt";
import { CAROUSEL_SYSTEM_PROMPT } from "../lib/carousel-prompt";
import { stripArticleText } from "../lib/carousel-generator";
import { generateGeminiJson, hasGeminiApiKey } from "../lib/gemini";
import {
  describeCarouselGeminiShape,
  normalizeCarouselGeminiOutput,
} from "../lib/carousel-gemini-normalize";

dotenv.config({ path: ".env.local" });

async function main() {
  const id = Number(process.argv[2] || process.env.npm_config_id || 36);
  console.log("GEMINI_API_KEY set:", hasGeminiApiKey());

  const supabase = getSupabaseAdmin();
  const { data: post, error } = await supabase
    .from("magazine_posts")
    .select("id, title, slug, excerpt, content, category, tags")
    .eq("id", id)
    .single();

  if (error || !post) {
    console.error("Post fetch failed:", error?.message);
    process.exit(1);
  }

  const userPrompt = buildCarouselUserPrompt({
    title: post.title,
    excerpt: post.excerpt,
    category: post.category || "Study Abroad",
    tags: post.tags || [],
    url: `https://app.goeduabroad.com/magazine/${post.slug}`,
    body: stripArticleText(post.content, 7000),
  });

  const raw = await generateGeminiJson<Record<string, unknown>>(
    CAROUSEL_SYSTEM_PROMPT,
    userPrompt,
  );

  if (!raw) {
    console.log("Result: null (API or JSON parse failed)");
    return;
  }

  console.log("Raw shape:", describeCarouselGeminiShape(raw));
  const normalized = normalizeCarouselGeminiOutput(raw);
  if (!normalized) {
    console.log("Normalize: FAILED");
    return;
  }
  console.log("Normalize: OK");
  console.log("  headline:", normalized.cover.headline.slice(0, 60));
  console.log("  points:", normalized.points.length);
  console.log("  summary:", normalized.summary.title);
  console.log("  caption:", normalized.caption.slice(0, 80) + "…");
}

main().catch(console.error);
