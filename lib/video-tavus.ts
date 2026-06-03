import fs from "fs";
import path from "path";
import { parseFile } from "music-metadata";
import type { VideoScript } from "./video-script-gemini";

/**
 * Tavus integration — generates a talking-head "presenter" who introduces and
 * closes the magazine Reel. The avatar (a Tavus stock replica by default) speaks
 * a short intro about the article and a closing call-to-action. The resulting
 * MP4s are downloaded into remotion/public/_tavus so Remotion can play them
 * full-screen with the EduAbroad logo + animated subtitles overlaid on top.
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
const POLL_TIMEOUT_MS = 8 * 60 * 1000; // Tavus renders can take a few minutes

const REMOTION_PUBLIC = path.join(process.cwd(), "remotion", "public");

export interface TavusSegment {
  /** Path under remotion/public for Remotion staticFile() */
  videoPath: string;
  /** The exact words spoken — used to drive the synced subtitle captions */
  script: string;
  /** Measured MP4 duration in seconds */
  durationSeconds: number;
}

export interface TavusPresenterResult {
  intro: TavusSegment | null;
  outro: TavusSegment | null;
  /** remotion/public/_tavus/<session> — delete after render */
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

/** POST /v2/videos — kicks off a render, returns the video_id. */
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

/** GET /v2/videos/:id — polls until the render is `ready`. */
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
 * clip fails — the render still proceeds with whatever succeeded.
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
      console.log(`[tavus] ${label} video_id=${videoId} — polling…`);
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
