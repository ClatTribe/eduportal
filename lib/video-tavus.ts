import fs from "fs";
import path from "path";
import { parseFile } from "music-metadata";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import type { VideoScript } from "./video-script-gemini";
import { getSupabaseAdmin } from "./supabase-admin";

/**
 * Tavus integration - generates a talking-head "presenter" for the magazine
 * Reel. Two modes are available:
 *   - generateTavusNarrator: ONE full-length clip that narrates the whole
 *     article, overlaid as a picture-in-picture bubble (current default).
 *   - generateTavusPresenter: a short full-screen intro + outro pair (legacy).
 *
 * The resulting MP4s are downloaded into remotion/public/_tavus so Remotion can
 * play them with staticFile().
 *
 * Docs: https://docs.tavus.io/api-reference/video-request/create-video
 */

const TAVUS_API_BASE =
  process.env.TAVUS_API_BASE?.trim().replace(/\/$/, "") ||
  "https://tavusapi.com";

/**
 * Default Tavus *stock* replica. Override with TAVUS_REPLICA_ID in .env.local
 * using any replica from https://platform.tavus.io (or your own trained one).
 */
const DEFAULT_REPLICA_ID = "r79e1c033f";

const POLL_INTERVAL_MS = 8_000;
// Tavus render time varies with their queue/demand. Default 20 min; override
// with TAVUS_POLL_TIMEOUT_MIN in .env.local if renders are taking longer.
const POLL_TIMEOUT_MS =
  (Number(process.env.TAVUS_POLL_TIMEOUT_MIN) || 20) * 60 * 1000;

const REMOTION_PUBLIC = path.join(process.cwd(), "remotion", "public");

export interface TavusSegment {
  /** Path under remotion/public for Remotion staticFile() */
  videoPath: string;
  /** The exact words spoken - used to drive the synced subtitle captions */
  script: string;
  /** Measured MP4 duration in seconds */
  durationSeconds: number;
}

export interface TavusPresenterResult {
  intro: TavusSegment | null;
  outro: TavusSegment | null;
  /** remotion/public/_tavus/<session> - delete after render */
  tempDir: string;
}

export function isTavusEnabled(): boolean {
  return (
    process.env.TAVUS_ENABLED !== "false" &&
    Boolean(process.env.TAVUS_API_KEY?.trim())
  );
}

function getApiKey(): string {
  const key = process.env.TAVUS_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "TAVUS_API_KEY is not set. Add it to .env.local (get one at https://platform.tavus.io/dev/api-keys).",
    );
  }
  return key;
}

function getReplicaId(): string {
  return process.env.TAVUS_REPLICA_ID?.trim() || DEFAULT_REPLICA_ID;
}

type TavusStatus = "queued" | "generating" | "ready" | "deleted" | "error";

interface TavusVideoResponse {
  video_id: string;
  status: TavusStatus;
  download_url?: string | null;
  hosted_url?: string | null;
  stream_url?: string | null;
  status_details?: string | null;
}

async function tavusFetch<T>(
  endpoint: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${TAVUS_API_BASE}${endpoint}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Tavus API ${res.status} ${res.statusText} on ${endpoint}: ${body.slice(0, 300)}`,
    );
  }

  return (await res.json()) as T;
}

/** POST /v2/videos - kicks off a render from a text script, returns the video_id. */
async function createTavusVideo(
  script: string,
  videoName: string,
): Promise<string> {
  const data = await tavusFetch<TavusVideoResponse>("/v2/videos", {
    method: "POST",
    body: JSON.stringify({
      replica_id: getReplicaId(),
      script,
      video_name: videoName,
    }),
  });

  if (!data.video_id) {
    throw new Error("Tavus did not return a video_id");
  }
  return data.video_id;
}

/** GET /v2/videos/:id - polls until the render is `ready`. */
async function pollUntilReady(videoId: string): Promise<string> {
  const started = Date.now();

  while (Date.now() - started < POLL_TIMEOUT_MS) {
    const data = await tavusFetch<TavusVideoResponse>(`/v2/videos/${videoId}`);

    if (data.status === "ready") {
      const url = data.download_url || data.hosted_url || data.stream_url;
      if (!url) {
        throw new Error(`Tavus video ${videoId} is ready but has no URL`);
      }
      return url;
    }

    if (data.status === "error" || data.status === "deleted") {
      throw new Error(
        `Tavus video ${videoId} failed: ${data.status_details ?? data.status}`,
      );
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(
    `Tavus video ${videoId} timed out after ${POLL_TIMEOUT_MS / 1000}s`,
  );
}

async function downloadToFile(url: string, outPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download Tavus video: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(outPath, Buffer.from(arrayBuffer));
}

async function getMp4DurationSeconds(filePath: string): Promise<number> {
  try {
    const meta = await parseFile(filePath);
    return meta.format.duration ?? 6;
  } catch {
    return 6;
  }
}

/** Trim/clean a narration line so the avatar speaks it cleanly. */
function clean(text: string): string {
  return text
    .replace(/₹/g, "rupees ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Builds the spoken intro + outro from the article. Kept short (one or two
 * sentences each) so the presenter clips stay punchy and render quickly.
 */
function buildPresenterScripts(
  script: VideoScript,
  post: { title: string; excerpt?: string | null; category?: string | null },
): { intro: string; outro: string } {
  const category = post.category?.trim() || "study abroad";
  const headline = script.title || post.title;
  const teaser =
    script.slides.find((s) => s.type === "hook")?.heading ||
    post.excerpt ||
    "Here is everything you need to know.";

  const intro = clean(
    `Hi, welcome to the EduAbroad magazine. Today we are talking about ${headline}. ${teaser} Let's dive in.`,
  );

  const outro = clean(
    `That's your quick ${category} brief from EduAbroad. Read the full article on our website, and follow us for more. See you next time.`,
  );

  return { intro, outro };
}

/**
 * Generates the Tavus intro + outro presenter clips and downloads them into
 * remotion/public/_tavus/<session>. Returns null segments individually if a
 * clip fails - the render still proceeds with whatever succeeded.
 */
export async function generateTavusPresenter(
  script: VideoScript,
  post: {
    id: number;
    title: string;
    excerpt?: string | null;
    category?: string | null;
  },
): Promise<TavusPresenterResult> {
  const sessionId = `${post.id}-${Date.now()}`;
  const tempDir = path.join(REMOTION_PUBLIC, "_tavus", sessionId);
  fs.mkdirSync(tempDir, { recursive: true });

  const { intro: introText, outro: outroText } = buildPresenterScripts(
    script,
    post,
  );

  async function renderSegment(
    label: "intro" | "outro",
    text: string,
  ): Promise<TavusSegment | null> {
    try {
      console.log(`[tavus] Generating ${label} (replica ${getReplicaId()})…`);
      const videoId = await createTavusVideo(
        text,
        `eduabroad-${label}-${sessionId}`,
      );
      console.log(`[tavus] ${label} video_id=${videoId} - polling…`);
      const url = await pollUntilReady(videoId);

      const outPath = path.join(tempDir, `${label}.mp4`);
      await downloadToFile(url, outPath);
      const durationSeconds = await getMp4DurationSeconds(outPath);

      console.log(`[tavus] ${label} ready: ${durationSeconds.toFixed(1)}s`);
      return {
        videoPath: `_tavus/${sessionId}/${label}.mp4`,
        script: text,
        durationSeconds,
      };
    } catch (error) {
      console.warn(
        `[tavus] ${label} failed:`,
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  // Render sequentially to stay well under Tavus concurrency limits.
  const intro = await renderSegment("intro", introText);
  const outro = await renderSegment("outro", outroText);

  return { intro, outro, tempDir };
}

export function cleanupTavusTempDir(tempDir: string): void {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

// ─── Narrator (picture-in-picture presenter for the whole video) ──────────────

/** Indian English neural voice - gives the avatar an Indian accent. */
const NARRATION_VOICE =
  process.env.TAVUS_TTS_VOICE?.trim() ||
  process.env.VIDEO_TTS_VOICE?.trim() ||
  "en-IN-NeerjaNeural";

const AUDIO_BUCKET = "instagram-videos";

/** Target video length in seconds. Override with VIDEO_TARGET_SECONDS. */
export const TARGET_SECONDS = Number(process.env.VIDEO_TARGET_SECONDS) || 30;
/** Spoken words per second (en-IN at the configured rate) — used for budgeting. */
const WORDS_PER_SECOND = 3;

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Builds the narration the avatar speaks, capped to a ~TARGET_SECONDS word
 * budget. Keeps a short intro, then as many slide voiceovers as fit (whole
 * sentences only, so it never cuts off mid-thought), then a short CTA. Trimming
 * the spoken text is what keeps the final video close to the target length.
 */
function buildFullNarration(
  script: VideoScript,
  post: { title: string; category?: string | null },
): string {
  const headline = script.title || post.title;
  const intro = `Welcome to the EduAbroad magazine. Today, ${headline}.`;
  const outro = `Read the full article on EduAbroad, and follow us for more.`;

  const totalBudget = Math.round(TARGET_SECONDS * WORDS_PER_SECOND);
  const bodyBudget = Math.max(
    16,
    totalBudget - wordCount(intro) - wordCount(outro),
  );

  const body: string[] = [];
  let used = 0;
  for (const slide of script.slides) {
    const spoken = (
      slide.voiceover?.trim() ||
      [slide.heading, slide.subtext].filter(Boolean).join(". ")
    ).trim();
    if (!spoken) continue;
    const w = wordCount(spoken);
    // Keep at least one slide, then stop once the budget is reached.
    if (body.length > 0 && used + w > bodyBudget) break;
    body.push(spoken);
    used += w;
  }

  return [intro, ...body, outro]
    .join(" ")
    .replace(/₹/g, "rupees ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Speaking rate for the avatar narration. Override with TAVUS_TTS_RATE. */
const NARRATION_RATE = process.env.TAVUS_TTS_RATE?.trim() || "+22%";

/** Synthesizes the narration as an MP3 using the Indian English voice. */
async function synthesizeNarration(
  text: string,
  outPath: string,
): Promise<void> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(
    NARRATION_VOICE,
    OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
  );
  const { audioStream } = await tts.toStream(text, { rate: NARRATION_RATE });
  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  fs.writeFileSync(outPath, Buffer.concat(chunks));
}

/** Uploads narration audio to Supabase Storage and returns a public URL. */
async function uploadAudio(buffer: Buffer, name: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const fileName = `tavus-audio/${name}.mp3`;
  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(fileName, buffer, { contentType: "audio/mpeg", upsert: true });
  if (error) throw new Error(`Tavus audio upload failed: ${error.message}`);
  const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

/** POST /v2/videos using a lip-synced audio file (controls the accent). */
async function createTavusVideoFromAudio(
  audioUrl: string,
  videoName: string,
): Promise<string> {
  const data = await tavusFetch<TavusVideoResponse>("/v2/videos", {
    method: "POST",
    body: JSON.stringify({
      replica_id: getReplicaId(),
      audio_url: audioUrl,
      video_name: videoName,
    }),
  });
  if (!data.video_id) throw new Error("Tavus did not return a video_id");
  return data.video_id;
}

export interface TavusNarratorResult {
  narrator: TavusSegment | null;
  /** remotion/public/_tavus/<session> - delete after render */
  tempDir: string;
}

/**
 * Generates ONE full-length presenter clip that narrates the whole article,
 * to be overlaid as a picture-in-picture bubble over the slides.
 *
 * Accent: by default the avatar is lip-synced to Indian-English TTS audio
 * (en-IN). Set TAVUS_VOICE_MODE=script to use the replica's own voice instead.
 */
export async function generateTavusNarrator(
  script: VideoScript,
  post: {
    id: number;
    title: string;
    excerpt?: string | null;
    category?: string | null;
  },
): Promise<TavusNarratorResult> {
  const sessionId = `${post.id}-${Date.now()}`;
  const tempDir = path.join(REMOTION_PUBLIC, "_tavus", sessionId);
  fs.mkdirSync(tempDir, { recursive: true });

  const fullText = buildFullNarration(script, post);
  const useScriptVoice = process.env.TAVUS_VOICE_MODE === "script";

  try {
    let videoId: string;

    if (useScriptVoice) {
      console.log(`[tavus] Narrator via replica voice (replica ${getReplicaId()})…`);
      videoId = await createTavusVideo(fullText, `eduabroad-narrator-${sessionId}`);
    } else {
      console.log(`[tavus] Narrator via Indian audio (${NARRATION_VOICE})…`);
      const audioPath = path.join(tempDir, "narration.mp3");
      await synthesizeNarration(fullText, audioPath);
      const audioUrl = await uploadAudio(
        fs.readFileSync(audioPath),
        `narration-${sessionId}`,
      );
      videoId = await createTavusVideoFromAudio(
        audioUrl,
        `eduabroad-narrator-${sessionId}`,
      );
    }

    console.log(`[tavus] narrator video_id=${videoId} - polling…`);
    const url = await pollUntilReady(videoId);

    const outPath = path.join(tempDir, "narrator.mp4");
    await downloadToFile(url, outPath);
    const durationSeconds = await getMp4DurationSeconds(outPath);

    console.log(`[tavus] narrator ready: ${durationSeconds.toFixed(1)}s`);
    return {
      narrator: {
        videoPath: `_tavus/${sessionId}/narrator.mp4`,
        script: fullText,
        durationSeconds,
      },
      tempDir,
    };
  } catch (error) {
    console.warn(
      "[tavus] narrator failed:",
      error instanceof Error ? error.message : error,
    );
    return { narrator: null, tempDir };
  }
}
