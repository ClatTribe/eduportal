import type { VideoScript } from "../lib/video-script-gemini";

export type BlogVideoProps = {
  script: VideoScript;
  coverUrl: string;
  brandColor: string;
  category?: string;
  /** remotion/public paths for staticFile() — slide voiceover audio */
  slideAudioUrls: string[];
  /** remotion/public paths for staticFile() — slide background photos */
  slideImageUrls?: string[];
  /** e.g. _music/energetic.mp3 — low volume under voice */
  backgroundMusicPath?: string | null;
  /** 0.08–0.22, from Gemini music plan */
  backgroundMusicVolume?: number;
};

export const BLOG_VIDEO_FPS = 30;
export const BLOG_VIDEO_WIDTH = 1080;
export const BLOG_VIDEO_HEIGHT = 1920;