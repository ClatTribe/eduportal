/**
 * Decides whether a given day produces a Tavus (talking-head avatar) video or a
 * template (animated slides only) video.
 *
 * Default pattern: a repeating 3-day cycle of template, template, Tavus — i.e.
 * 2 template days, then 1 Tavus day.
 *
 * Override with VIDEO_MODE in .env.local:
 *   VIDEO_MODE=auto      (default) follow the 2:1 cycle
 *   VIDEO_MODE=tavus     always make the avatar video
 *   VIDEO_MODE=template  always make the animated template video
 */

export type VideoMode = "auto" | "tavus" | "template";

export function getVideoMode(): VideoMode {
  const m = (process.env.VIDEO_MODE || "auto").toLowerCase();
  return m === "tavus" || m === "template" ? m : "auto";
}

/**
 * Key-based rotation: every 3rd article is a Tavus video, the other two are
 * templates — i.e. 2 template : 1 Tavus, keyed off the post id so it's
 * deterministic regardless of dates (post 3, 6, 9, … are Tavus).
 */
export function isTavusVideo(
  key: number,
  mode: VideoMode = getVideoMode(),
): boolean {
  if (mode === "tavus") return true;
  if (mode === "template") return false;
  return Number.isFinite(key) && Math.trunc(key) % 3 === 0;
}

/** Human-readable label for logging. */
export function describeMode(useTavus: boolean): string {
  return useTavus ? "Tavus avatar video" : "template (animated) video";
}
