import fs from "fs";
import path from "path";
import { generateGeminiJson } from "./gemini";
import type { VideoScript, VideoSlide } from "./video-script-gemini";

const PHOTOS_DIR = path.join(process.cwd(), "remotion", "public", "_photos");
const PEXELS_BASE = "https://api.pexels.com/v1";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SlideImagePlan {
  slideIndex: number;
  slideType: VideoSlide["type"];
  searchQuery: string;
  orientation: "portrait" | "landscape";
}

export interface SlideImages {
  urls: string[];
  attributions: string[];
}

// ─── Pexels API types ─────────────────────────────────────────────────────────

interface PexelsPhoto {
  id: number;
  url: string;
  photographer: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    portrait: string; // 800×1200 — perfect for 9:16 Reels
  };
}

interface PexelsSearchResult {
  photos: PexelsPhoto[];
  total_results: number;
}

// ─── Gemini: smart search queries per slide ───────────────────────────────────

const GEMINI_IMAGE_SYSTEM = `You pick Pexels photo search queries for Instagram Reel slides about study abroad for Indian students.

Rules:
- Pick vivid, photogenic, SPECIFIC queries that match the slide content
- Hook slide: cinematic establishing shot of the country/city/university
- Point slides: relevant concept photo (e.g. "student visa passport", "university campus aerial", "indian student laptop cafe")
- Stat slides: NO photo needed (charts need clean dark background) — return empty string ""
- CTA slides: motivational study/travel photo
- Queries: 2-4 words, English only, no quotes
- Prefer: real locations, people studying, campus buildings, city skylines
- Avoid: generic clichés like "success handshake", "team meeting", "business people"
- Return ONLY valid JSON`;

interface GeminiImagePlanOutput {
  slides: Array<{ slideIndex: number; searchQuery: string }>;
}

export async function generateImageQueriesWithGemini(
  script: VideoScript,
  article: { title: string; category?: string; excerpt?: string; country?: string },
): Promise<SlideImagePlan[]> {
  const slideSummaries = script.slides.map((s, i) => ({
    index: i,
    type: s.type,
    heading: s.heading,
    subtext: s.subtext ?? "",
  }));

  const userPrompt = JSON.stringify({
    article: {
      title: article.title,
      category: article.category ?? "",
      excerpt: article.excerpt ?? "",
      country: article.country ?? "",
    },
    slides: slideSummaries,
    task: "For each slide, give the best Pexels search query. Return '' for stat slides (they show charts). Make hook slide query cinematic and country-specific.",
    schema: { slides: [{ slideIndex: "number", searchQuery: "string or empty string" }] },
  });

  let geminiPlan: GeminiImagePlanOutput | null = null;
  try {
    geminiPlan = await generateGeminiJson<GeminiImagePlanOutput>(GEMINI_IMAGE_SYSTEM, userPrompt);
  } catch {
    console.warn("[video-images] Gemini query generation failed — using fallback queries");
  }

  return script.slides.map((slide, i) => {
    const geminiEntry = geminiPlan?.slides?.find((s) => s.slideIndex === i);
    let query = geminiEntry?.searchQuery?.trim() ?? "";
    if (!query && slide.type !== "stat") {
      query = buildFallbackQuery(slide, article);
    }
    return {
      slideIndex: i,
      slideType: slide.type,
      searchQuery: slide.type === "stat" ? "" : query,
      orientation: "portrait" as const,
    };
  });
}

function buildFallbackQuery(
  slide: VideoSlide,
  article: { title: string; category?: string; country?: string },
): string {
  const country = article.country ?? "";
  const cat = (article.category ?? "").toLowerCase();
  const heading = slide.heading.toLowerCase();

  if (slide.type === "hook") return country ? `${country} university campus` : "student studying abroad";
  if (slide.type === "cta")  return country ? `${country} student city` : "student travel motivation";

  if (heading.includes("visa"))       return "student visa passport";
  if (heading.includes("tuition") || heading.includes("fee")) return "university scholarship";
  if (heading.includes("scholarship")) return "scholarship student award";
  if (heading.includes("work") || heading.includes("job")) return "student working laptop";
  if (heading.includes("ireland"))    return "dublin ireland campus";
  if (heading.includes("canada"))     return "canada university campus";
  if (heading.includes("uk"))         return "london university campus";
  if (heading.includes("germany"))    return "berlin university campus";
  if (heading.includes("australia"))  return "sydney university campus";
  if (heading.includes("usa") || heading.includes("america")) return "usa university campus";

  return country ? `${country} student university` : `${cat || "student"} university`;
}

// ─── Pexels search ────────────────────────────────────────────────────────────

async function searchPexels(
  query: string,
  orientation: "portrait" | "landscape" = "portrait",
): Promise<PexelsPhoto | null> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    console.warn("[video-images] PEXELS_API_KEY not set — skipping photo fetch");
    return null;
  }

  const params = new URLSearchParams({
    query,
    orientation,
    per_page: "8",
    size: "large",
    locale: "en-US",
  });

  try {
    const res = await fetch(`${PEXELS_BASE}/search?${params}`, {
      headers: { Authorization: key },
    });

    if (!res.ok) {
      console.warn(`[video-images] Pexels ${res.status} for: "${query}"`);
      return null;
    }

    const data = (await res.json()) as PexelsSearchResult;
    if (!data.photos?.length) {
      console.warn(`[video-images] No results for: "${query}"`);
      return null;
    }

    const idx = Math.floor(Math.random() * Math.min(5, data.photos.length));
    return data.photos[idx];
  } catch (err) {
    console.warn("[video-images] Pexels fetch failed:", err);
    return null;
  }
}

// ─── Download using fetch — works on Windows, handles redirects ───────────────

async function downloadFile(url: string, dest: string): Promise<void> {
  // Ensure directory exists (fixes ENOENT on Windows)
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; EduAbroad/1.0)" },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Download failed: HTTP ${res.status} for ${url}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
}

// ─── Safe extension from URL ──────────────────────────────────────────────────
// Handles URLs like: https://images.unsplash.com/photo-abc (no ext → "jpg")
//                    https://cdn.example.com/cover.webp?w=800 → "webp"

function safeExtFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop() ?? "";
    const dotIdx = filename.lastIndexOf(".");
    if (dotIdx === -1) return "jpg";
    const ext = filename.slice(dotIdx + 1).toLowerCase();
    return ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  } catch {
    return "jpg";
  }
}

// ─── Main: fetch all slide images ─────────────────────────────────────────────

export async function fetchSlideImages(
  script: VideoScript,
  postId: number,
  article: {
    title: string;
    category?: string;
    excerpt?: string;
    coverUrl?: string;
    country?: string;
  },
): Promise<SlideImages> {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });

  const plans = await generateImageQueriesWithGemini(script, article);
  const urls: string[] = new Array(script.slides.length).fill("");
  const attributions: string[] = new Array(script.slides.length).fill("");

  console.log(`[video-images] Fetching photos for ${script.slides.length} slides…`);

  await Promise.all(
    plans.map(async (plan) => {
      const { slideIndex, slideType, searchQuery } = plan;

      // ── Hook: use article cover image first ──────────────────────────────
      if (slideType === "hook" && article.coverUrl) {
        const ext = safeExtFromUrl(article.coverUrl);
        const dest = path.join(PHOTOS_DIR, `${postId}-${slideIndex}.${ext}`);

        if (!fs.existsSync(dest)) {
          try {
            await downloadFile(article.coverUrl, dest);
            console.log(`  [hook] Cover image downloaded`);
          } catch {
            console.warn(`  [hook] Cover download failed — trying Pexels`);
          }
        }

        if (fs.existsSync(dest)) {
          urls[slideIndex] = `_photos/${postId}-${slideIndex}.${ext}`;
          attributions[slideIndex] = article.coverUrl;
          return;
        }
        // Fall through to Pexels
      }

      // ── Stat slides: skip (charts need dark background) ──────────────────
      if (!searchQuery) return;

      const dest = path.join(PHOTOS_DIR, `${postId}-${slideIndex}.jpg`);

      // Use cached photo if exists
      if (fs.existsSync(dest)) {
        urls[slideIndex] = `_photos/${postId}-${slideIndex}.jpg`;
        console.log(`  [slide ${slideIndex + 1}] Cached ✓`);
        return;
      }

      // ── Fetch from Pexels ────────────────────────────────────────────────
      const photo = await searchPexels(searchQuery, plan.orientation);
      if (!photo) return;

      try {
        // portrait src = 800×1200 — perfect for 9:16 video
        const photoUrl = photo.src.portrait || photo.src.large2x || photo.src.large;
        await downloadFile(photoUrl, dest);

        urls[slideIndex] = `_photos/${postId}-${slideIndex}.jpg`;
        attributions[slideIndex] = photo.url;
        console.log(`  [slide ${slideIndex + 1}] "${searchQuery}" → ${photo.photographer}`);
      } catch (err) {
        console.warn(`  [slide ${slideIndex + 1}] Download failed:`, err);
      }
    }),
  );

  console.log(`[video-images] Done: ${urls.filter(Boolean).length}/${script.slides.length} photos`);
  return { urls, attributions };
}

// ─── Cleanup old photos after render ─────────────────────────────────────────

export function cleanupOldPhotos(postId: number): void {
  try {
    const files = fs.readdirSync(PHOTOS_DIR);
    for (const file of files) {
      if (file.startsWith(`${postId}-`)) {
        fs.unlinkSync(path.join(PHOTOS_DIR, file));
      }
    }
  } catch { /* ignore */ }
}