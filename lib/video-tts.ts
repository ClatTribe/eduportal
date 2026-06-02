import fs from "fs";
import path from "path";
import { parseFile } from "music-metadata";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import type { VideoScript, VideoSlide } from "./video-script-gemini";

/** Indian English neural voice (free via Edge TTS — no extra API key). */
const DEFAULT_VOICE = "en-IN-NeerjaNeural";

export function isVideoVoiceEnabled(): boolean {
  return process.env.VIDEO_VOICE_ENABLED !== "false";
}

function getVoiceName(): string {
  return process.env.VIDEO_TTS_VOICE?.trim() || DEFAULT_VOICE;
}

function clampDuration(seconds: number): number {
  return Math.min(Math.max(seconds, 3), 14);
}

function slideNarrationText(slide: VideoSlide): string {
  const spoken = slide.voiceover?.trim();
  if (spoken) return spoken.replace(/₹/g, "rupees ");
  const parts = [slide.heading, slide.subtext].filter(Boolean);
  return parts.join(". ").replace(/₹/g, "rupees ");
}

async function synthesizeToFile(text: string, outPath: string): Promise<void> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(
    getVoiceName(),
    OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
  );

  const { audioStream } = await tts.toStream(text);
  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  fs.writeFileSync(outPath, Buffer.concat(chunks));
}

async function getAudioDurationSeconds(filePath: string): Promise<number> {
  const meta = await parseFile(filePath);
  return meta.format.duration ?? 4;
}

const REMOTION_PUBLIC = path.join(process.cwd(), "remotion", "public");

export interface VoiceoverResult {
  script: VideoScript;
  /** Paths under remotion/public for Remotion staticFile() — empty if no audio */
  slideAudioUrls: string[];
  tempDir: string;
}

/** Generates MP3 per slide and lengthens slides so voice is not cut off. */
export async function applyVoiceoverToScript(
  script: VideoScript,
  postId: number,
): Promise<VoiceoverResult> {
  const sessionId = `${postId}-${Date.now()}`;
  const tempDir = path.join(REMOTION_PUBLIC, "_voice", sessionId);
  fs.mkdirSync(tempDir, { recursive: true });

  const slideAudioUrls: string[] = [];
  const updatedSlides: VideoSlide[] = [];

  console.log(`Generating voiceover (${getVoiceName()})…`);

  for (let i = 0; i < script.slides.length; i++) {
    const slide = script.slides[i];
    const text = slideNarrationText(slide);
    const audioPath = path.join(tempDir, `slide-${i}.mp3`);

    try {
      await synthesizeToFile(text, audioPath);
      const audioSeconds = await getAudioDurationSeconds(audioPath);
      const duration = clampDuration(Math.max(slide.duration, audioSeconds + 0.35));

      slideAudioUrls.push(`_voice/${sessionId}/slide-${i}.mp3`);
      updatedSlides.push({ ...slide, duration });
      console.log(`  Slide ${i + 1}: ${duration.toFixed(1)}s audio`);
    } catch (error) {
      console.warn(
        `  Slide ${i + 1} TTS failed:`,
        error instanceof Error ? error.message : error,
      );
      slideAudioUrls.push("");
      updatedSlides.push(slide);
    }
  }

  const totalDuration = updatedSlides.reduce((sum, s) => sum + s.duration, 0);

  return {
    script: { ...script, slides: updatedSlides, totalDuration },
    slideAudioUrls,
    tempDir,
  };
}

export function cleanupVoiceTempDir(tempDir: string): void {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}
