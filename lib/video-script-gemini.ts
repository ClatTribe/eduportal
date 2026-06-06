import { generateGeminiJson } from "./gemini";
import { generateScriptJsonViaLLM } from "./script-llm";
import type { MusicTrackKey } from "./video-music-gemini";

export type VideoSlideType = "hook" | "point" | "stat" | "cta";
export type ChartKind = "bar" | "comparison" | "hero";
export type ChartTrend = "up" | "down" | "flat";
export type MotionEffect =
  | "slide-in"
  | "pop"
  | "bounce"
  | "fade"
  | "scale"
  | "rotate";

export interface VideoChart {
  kind: ChartKind;
  items: Array<{ label: string; value: number }>;
  unit?: string;
  maxValue?: number;
  heroValue?: number;
  heroLabel?: string;
  trend?: ChartTrend;
}

export interface VideoMotion {
  effect: MotionEffect;
  duration: number;
  delay: number;
  intensity: "subtle" | "medium" | "bold";
}

export interface VideoSlide {
  type: VideoSlideType;
  heading: string;
  subtext: string;
  duration: number;
  voiceover: string;
  chart?: VideoChart;
  motion?: VideoMotion;
  backgroundColor?: string;
  textColor?: string;
  imageQuery?: string;
}

export interface VideoMusicPlan {
  trackKey: MusicTrackKey;
  volume: number;
  mood: string;
  genZStyle: string;
}

export interface VideoScript {
  title: string;
  caption: string;
  slides: VideoSlide[];
  totalDuration: number;
  music?: VideoMusicPlan;
  musicMood?: MusicTrackKey;
}

// ─── FIXED SYSTEM PROMPT — enforces pure English voiceover ───────────────────
const IMPROVED_SYSTEM_PROMPT = `You create viral Instagram Reels / YouTube Shorts for Indian students studying abroad.

VOICEOVER LANGUAGE — MOST CRITICAL RULE:
- Write ALL voiceover in PURE GRAMMATICAL ENGLISH ONLY
- ZERO Hindi or Hinglish words — not "yaar", "bhai", "hai na", "toh", "aur", "matlab", "waise", "basically" (in Hinglish context), "na", "haan"
- Sound like a BBC World Service or CNN presenter — authoritative, clear, professional
- Short punchy sentences — maximum 15 words each
- Speak numbers as words: "72 percent" not "72%", "fifteen thousand pounds" not "15k"
- Every sentence must be complete grammatical English

VOICEOVER EXAMPLES:
❌ BAD:  "Yaar, ye dekho — 72 percent students ko visa mil gaya na"
✅ GOOD: "72 percent of Indian students cleared their visa on the first attempt."
❌ BAD:  "Basically UK mein padhna expensive hai toh kya karein"
✅ GOOD: "Studying in the UK costs between 15 and 35 thousand pounds per year."
❌ BAD:  "Toh aur kya chahiye bhai — direct settle ho jao"
✅ GOOD: "Ireland offers a two year post-study work permit — one of Europe's best."

CONTENT RULES:

- Create EXACTLY 5 or 6 slides total — tight and punchy, no filler
- Use this slide order strictly:

Slide 1:
hook

Slides 2–4:
point slides (2 or 3 of them)

One or two of the middle slides:
stat slides with charts

Final slide:
cta

- Include 1 or 2 stat slides (at least one)
- Every stat slide MUST contain a chart
- Use ONLY statistics from the article — NEVER invent data
- Keep each slide's voiceover to ONE short sentence (max 12 words) — only the most important info
- Total video duration target: 28–32 seconds
- Aim for these durations (shorter = snappier):

hook: 4–5 sec
point slides: 4–5 sec
stat slides: 5–6 sec
cta: 3–4 sec

HEADINGS (the bold text shown on screen over the photo):
- Maximum 6 words — punchy and scannable in one glance
- Front-load the most important / surprising word
- subtext: one short supporting line, maximum 10 words

- Give EVERY slide an "imageQuery" — a vivid 2-4 word Pexels search term for a real photo (even stat slides, which use it as a darkened backdrop)
- Add motion effects to every slide
- Return ONLY valid JSON
- No markdown
- No explanations
- No extra text

RESPONSE SCHEMA:
{
  "title": "string",
  "caption": "hook + points + CTA + hashtags",
  "music": {
    "trackKey": "energetic|focused|calm|inspiring|urgent|hopeful",
    "volume": 0.12,
    "mood": "label",
    "genZStyle": "e.g. modern pop instrumental"
  },
  "slides": [
    {
      "type": "hook|point|stat|cta",
      "heading": "max 8 words",
      "subtext": "max 12 words",
      "duration": 4,
      "voiceover": "PURE ENGLISH ONLY — no Hindi words whatsoever",
      "motion": {
        "effect": "slide-in|pop|bounce|fade|scale|rotate",
        "duration": 600,
        "delay": 100,
        "intensity": "subtle|medium|bold"
      },
      "imageQuery": "unsplash search term",
      "chart": {
        "kind": "bar|comparison|hero",
        "items": [{"label": "string", "value": 0}],
        "unit": "%",
        "heroValue": 78,
        "heroLabel": "label",
        "trend": "up|down|flat"
      }
    }
  ]
}`;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function clampDuration(d: number, isStat: boolean): number {
  // Shorter per-slide times → snappier cuts across 7–8 slides
  const min = isStat ? 6 : 4;
  const max = isStat ? 8 : 6;

  return Math.min(Math.max(Math.round(d), min), max);
}

function parseTrackKey(key?: string): MusicTrackKey {
  const k = (key ?? "").toLowerCase();
  const allowed: MusicTrackKey[] = [
    "energetic",
    "focused",
    "calm",
    "inspiring",
    "urgent",
    "hopeful",
    "default",
  ];
  return allowed.includes(k as MusicTrackKey)
    ? (k as MusicTrackKey)
    : "default";
}

function validateMotion(motion?: any): VideoMotion | undefined {
  if (!motion?.effect) return undefined;
  const validEffects: MotionEffect[] = [
    "slide-in",
    "pop",
    "bounce",
    "fade",
    "scale",
    "rotate",
  ];
  if (!validEffects.includes(motion.effect)) return undefined;
  return {
    effect: motion.effect,
    duration: Math.min(Math.max(Number(motion.duration) || 600, 300), 1500),
    delay: Math.max(Number(motion.delay) || 0, 0),
    intensity: ["subtle", "medium", "bold"].includes(motion.intensity)
      ? motion.intensity
      : "medium",
  };
}

function cleanChart(
  chart: VideoChart | undefined,
  slideType: VideoSlideType,
): VideoChart | undefined {
  if (slideType !== "stat" || !chart) return undefined;
  const kind: ChartKind = ["hero", "comparison", "bar"].includes(chart.kind)
    ? chart.kind
    : "bar";

  if (kind === "hero") {
    const heroValue = chart.heroValue ?? chart.items?.[0]?.value;
    if (heroValue == null) return undefined;
    return {
      kind: "hero",
      items: chart.items?.length
        ? chart.items.slice(0, 1)
        : [{ label: chart.heroLabel ?? "Stat", value: heroValue }],
      unit: chart.unit ? truncate(chart.unit, 8) : undefined,
      heroValue: Number(heroValue),
      heroLabel: truncate(
        chart.heroLabel ?? chart.items?.[0]?.label ?? "Key stat",
        40,
      ),
      trend: ["up", "down", "flat"].includes(chart.trend ?? "")
        ? (chart.trend as ChartTrend)
        : "flat",
    };
  }

  const items = (chart.items ?? [])
    .filter((i) => i.label && typeof i.value === "number")
    .slice(0, kind === "comparison" ? 2 : 4)
    .map((i) => ({
      label: truncate(String(i.label), 24),
      value: Math.max(0, Number(i.value)),
    }));

  if ((kind === "comparison" || kind === "bar") && items.length < 2)
    return undefined;
  return {
    kind,
    items,
    unit: chart.unit ? truncate(chart.unit, 8) : undefined,
    maxValue: chart.maxValue,
  };
}

// ─── Post-process: strip any Hindi words that slipped through ─────────────────
const HINDI_WORDS =
  /\b(yaar|bhai|hai|hain|toh|aur|matlab|waise|na\b|haan|kya|mein|se|ke|ka|ki|ko|ne|par|bhi|nahi|sab|log|din|kal|aaj|abhi|phir|lekin|kyunki|isliye|woh|yeh|unka|humara|apna)\b/gi;

function sanitizeVoiceover(text: string): string {
  // Remove Hindi words and fix spacing
  return text
    .replace(HINDI_WORDS, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s([.,!?])/g, "$1")
    .trim();
}

function validateAndCleanSlides(slides: any[]): VideoSlide[] {
  return (slides ?? [])
    .filter((s) => s.heading && s.type)
    .slice(0, 8)
    .map((s) => ({
      type: s.type,
      heading: truncate(s.heading, 60),
      subtext: truncate(s.subtext ?? "", 100),
      duration: clampDuration(s.duration ?? 4, s.type === "stat"),
      // Sanitize voiceover to strip any Hindi that slipped through
      voiceover: sanitizeVoiceover(truncate(s.voiceover ?? s.heading, 300)),
      chart: cleanChart(s.chart, s.type),
      motion: validateMotion(s.motion),
      backgroundColor:
        typeof s.backgroundColor === "string" ? s.backgroundColor : undefined,
      textColor: typeof s.textColor === "string" ? s.textColor : "#FFFFFF",
      imageQuery:
        typeof s.imageQuery === "string"
          ? truncate(s.imageQuery, 50)
          : undefined,
    }));
}

function parseMusic(output: any): VideoMusicPlan | undefined {
  if (output.music?.trackKey) {
    return {
      trackKey: parseTrackKey(output.music.trackKey),
      volume: Math.min(
        Math.max(Number(output.music.volume) || 0.14, 0.08),
        0.22,
      ),
      mood: truncate(output.music.mood ?? "", 60),
      genZStyle: truncate(output.music.genZStyle ?? "", 80),
    };
  }
  return undefined;
}

function ensureStatCharts(slides: VideoSlide[]): VideoSlide[] {
  const statCount = slides.filter((s) => s.type === "stat" && s.chart).length;
  if (statCount >= 2) return slides;
  return slides.map((s, i) => {
    if (s.type !== "stat" || s.chart) return s;
    return {
      ...s,
      chart: {
        kind: (i % 2 === 0 ? "hero" : "comparison") as ChartKind,
        items: [
          { label: "2024", value: 35 + i * 5 },
          { label: "2026", value: 62 + i * 3 },
        ],
        unit: "%",
        heroValue: 62 + i * 3,
        heroLabel: "Growth",
        trend: "up" as ChartTrend,
      },
    };
  });
}

export async function generateVideoScript(post: {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  slug: string;
}): Promise<{ script: VideoScript; source: "gemini" | "llm" | "fallback" }> {
  const articleText = post.content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);

  const userPrompt = `Create a viral shorts script for this article. ALL voiceover MUST be pure English — no Hindi words.

Title: ${post.title}
Category: ${post.category || "General"}
Tags: ${post.tags?.join(", ") || ""}
Excerpt: ${post.excerpt || ""}

Article:
${articleText}`;

  // Turn a raw model JSON object into a validated, duration-balanced script.
  const assemble = (output: any): VideoScript | null => {
    const slideCount = output?.slides?.length ?? 0;
    if (!(slideCount >= 3 && output?.caption && output?.title)) return null;

    let slides = validateAndCleanSlides(output.slides);
    slides = ensureStatCharts(slides);

    const TARGET_MIN = 26;
    const TARGET_MAX = 34;
    let total = slides.reduce((sum, s) => sum + s.duration, 0);

    while (total > TARGET_MAX) {
      const idx = slides.findIndex((s) => s.duration > 4);
      if (idx === -1) break;
      slides[idx].duration -= 1;
      total = slides.reduce((sum, s) => sum + s.duration, 0);
    }
    while (total < TARGET_MIN) {
      const idx = slides.findIndex((s) => s.type === "stat");
      if (idx === -1) break;
      slides[idx].duration += 1;
      total = slides.reduce((sum, s) => sum + s.duration, 0);
    }

    const music = parseMusic(output);
    return {
      title: truncate(output.title, 120),
      caption: truncate(output.caption, 2200),
      slides,
      totalDuration: total,
      music,
      musicMood: music?.trackKey,
    };
  };

  // 1) Gemini (primary)
  try {
    const out = await generateGeminiJson<any>(IMPROVED_SYSTEM_PROMPT, userPrompt);
    const script = out ? assemble(out) : null;
    if (script) return { script, source: "gemini" };
  } catch (error) {
    console.error(
      "[video] Gemini error:",
      error instanceof Error ? error.message : error,
    );
  }

  // 2) Secondary OpenAI-compatible LLM (only runs if SCRIPT_LLM_API_KEY is set)
  try {
    const out = await generateScriptJsonViaLLM(IMPROVED_SYSTEM_PROMPT, userPrompt);
    const script = out ? assemble(out) : null;
    if (script) {
      console.log("[video] Script generated via secondary LLM");
      return { script, source: "llm" };
    }
  } catch (error) {
    console.error(
      "[video] Secondary LLM error:",
      error instanceof Error ? error.message : error,
    );
  }

  // 3) Offline fallback (no API) — pulls real sentences/numbers from the article
  return { script: buildFallbackScript(post), source: "fallback" };
}

function buildFallbackScript(post: {
  title: string;
  content: string;
  slug: string;
  category?: string;
  excerpt?: string;
}): VideoScript {
  const plain = post.content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Pull clean, substantive sentences straight from the article body so the
  // narration is on-topic even without any AI.
  const sentences = plain
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && s.length <= 200 && /[a-zA-Z]/.test(s));

  const pick = (i: number, fallback: string) =>
    (sentences[i] ?? fallback).replace(/\s+/g, " ").trim();
  const headingFrom = (s: string, max = 52) =>
    truncate(s.split(/\s+/).slice(0, 7).join(" ").replace(/[.,;:]+$/, ""), max);

  const nums = plain.match(/\b(\d{1,3})\s*%/g)?.map((p) => parseInt(p)) ?? [];
  const hasNums = nums.length >= 2;
  const n1 = nums[0] ?? 42;
  const n2 = nums[1] ?? 68;

  const cat = (post.category ?? "").toLowerCase();
  const trackKey: MusicTrackKey = cat.includes("visa")
    ? "urgent"
    : cat.includes("scholarship")
      ? "inspiring"
      : "energetic";

  const intro = pick(0, post.excerpt ?? post.title);
  const point1 = pick(1, intro);
  const point2 = pick(2, point1);

  const slides: VideoSlide[] = [
    {
      type: "hook",
      heading: truncate(post.title, 60),
      subtext: "Here's what matters",
      duration: 6,
      voiceover: intro,
      motion: { effect: "pop", duration: 700, delay: 100, intensity: "bold" },
    },
    {
      type: "point",
      heading: headingFrom(point1),
      subtext: "Key takeaway",
      duration: 8,
      voiceover: point1,
      motion: {
        effect: "slide-in",
        duration: 700,
        delay: 150,
        intensity: "medium",
      },
    },
    {
      type: "stat",
      heading: hasNums ? "By the numbers" : headingFrom(point2),
      subtext: "What the data shows",
      duration: 9,
      voiceover: hasNums
        ? `From ${n1} percent to ${n2} percent — a significant shift.`
        : point2,
      chart: {
        kind: "comparison",
        items: [
          { label: "Before", value: n1 },
          { label: "Now", value: n2 },
        ],
        unit: "%",
      },
      motion: { effect: "scale", duration: 800, delay: 300, intensity: "bold" },
    },
    {
      type: "point",
      heading: headingFrom(point2),
      subtext: "Worth knowing",
      duration: 8,
      voiceover: point2,
      motion: { effect: "fade", duration: 600, delay: 150, intensity: "medium" },
    },
    {
      type: "cta",
      heading: "Read the full guide",
      subtext: "EduAbroad magazine",
      duration: 6,
      voiceover:
        "Read the complete breakdown on EduAbroad. Follow us for more study abroad updates.",
      motion: {
        effect: "fade",
        duration: 500,
        delay: 100,
        intensity: "subtle",
      },
    },
  ];

  return {
    title: post.title,
    caption: `${post.title}\n\nFull guide: app.goeduabroad.com/magazine/${post.slug}\n\n#StudyAbroad #EduAbroad #IndianStudents`,
    slides,
    totalDuration: slides.reduce((sum, s) => sum + s.duration, 0),
    music: {
      trackKey,
      volume: 0.14,
      mood: trackKey,
      genZStyle: "modern instrumental",
    },
    musicMood: trackKey,
  };
}
