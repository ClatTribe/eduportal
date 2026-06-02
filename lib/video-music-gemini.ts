import { generateGeminiJson } from "./gemini";
import { hasGeminiApiKey } from "./gemini";

export type MusicTrackKey =
  | "energetic"
  | "focused"
  | "calm"
  | "inspiring"
  | "urgent"
  | "hopeful"
  | "default";

export interface GeminiMusicPlan {
  trackKey: MusicTrackKey;
  volume: number;
  mood: string;
  genZStyle: string;
  reason: string;
}

const SYSTEM_PROMPT = `You pick background music for EduAbroad Instagram Reels (Indian students, study abroad).

Pick instrumental mood that fits the article — Gen-Z friendly (modern, not childish):
- visa/refusal/rejection news → urgent or focused
- scholarships/wins/opportunities → inspiring or energetic
- guides/how-to → calm or focused
- country overview → hopeful or calm

Return ONLY valid JSON.`;

interface GeminiMusicOutput {
  trackKey: string;
  volume: number;
  mood: string;
  genZStyle: string;
  reason: string;
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
  if (allowed.includes(k as MusicTrackKey)) return k as MusicTrackKey;
  return "default";
}

export async function generateMusicPlanWithGemini(post: {
  title: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  content: string;
}): Promise<GeminiMusicPlan | null> {
  if (!hasGeminiApiKey()) return null;

  const body = post.content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 3000);

  const userPrompt = JSON.stringify({
    task: "Choose Reel background music bed (plays quietly under voiceover)",
    article: {
      title: post.title,
      excerpt: post.excerpt ?? "",
      category: post.category ?? "",
      tags: post.tags ?? [],
      body: body,
    },
    schema: {
      trackKey:
        "energetic | focused | calm | inspiring | urgent | hopeful | default",
      volume: "0.10 to 0.18 — lower for serious visa topics, slightly higher for hype",
      mood: "3-5 word mood label",
      genZStyle:
        "e.g. lo-fi focus, upbeat pop instrumental, cinematic tension",
      reason: "one sentence why this fits the article",
    },
  });

  const out = await generateGeminiJson<GeminiMusicOutput>(
    SYSTEM_PROMPT,
    userPrompt,
  );
  if (!out?.trackKey) return null;

  const volume = Math.min(Math.max(Number(out.volume) || 0.14, 0.08), 0.22);

  return {
    trackKey: parseTrackKey(out.trackKey),
    volume,
    mood: out.mood ?? "",
    genZStyle: out.genZStyle ?? "",
    reason: out.reason ?? "",
  };
}
