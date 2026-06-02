import fs from "fs";
import path from "path";

const MUSIC_DIR = path.join(process.cwd(), "remotion", "public", "_music");

/** One track for every Reel/Short — set in .env or use universal.mp3 */
const UNIVERSAL_TRACK =
  process.env.REEL_BACKGROUND_MUSIC?.trim() || "_music/universal.mp3";

const DEFAULT_VOLUME = Number(process.env.REEL_MUSIC_VOLUME ?? "0.14");

export function isVideoMusicEnabled(): boolean {
  return process.env.VIDEO_MUSIC_ENABLED !== "false";
}

/**
 * Same background music on all videos (brand sound).
 * Place file at: remotion/public/_music/universal.mp3
 */
export function resolveUniversalBackgroundMusic(): {
  path: string | null;
  volume: number;
} {
  if (!isVideoMusicEnabled()) {
    return { path: null, volume: 0 };
  }

  const relative = UNIVERSAL_TRACK.replace(/^\//, "");
  const absolute = path.join(process.cwd(), "remotion", "public", relative);

  if (!fs.existsSync(absolute)) {
    const fallback = path.join(MUSIC_DIR, "default.mp3");
    if (fs.existsSync(fallback)) {
      console.log("[music] Using _music/default.mp3 (add universal.mp3 for brand track)");
      return { path: "_music/default.mp3", volume: DEFAULT_VOLUME };
    }
    console.warn(
      `[music] Add remotion/public/${relative} (or default.mp3) — see _music/README.md`,
    );
    return { path: null, volume: 0 };
  }

  return {
    path: relative,
    volume: Math.min(Math.max(DEFAULT_VOLUME, 0.08), 0.22),
  };
}

/** @deprecated Use resolveUniversalBackgroundMusic — kept for API compat */
export async function resolveBackgroundMusicForPost(): Promise<{
  path: string | null;
  volume: number;
  source: string;
}> {
  const { path: musicPath, volume } = resolveUniversalBackgroundMusic();
  if (musicPath) {
    console.log(`[music] Universal track: ${musicPath} (volume ${volume})`);
  }
  return { path: musicPath, volume, source: "universal" };
}
