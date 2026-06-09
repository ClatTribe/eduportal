import type { VideoScript } from "../lib/video-script-gemini";

/** A Tavus presenter clip (talking-head avatar) shown full-screen or as PIP. */
export type TavusSegmentProps = {
  /** remotion/public path for staticFile() - the avatar MP4 */
  videoPath: string;
  /** The spoken words - drives the synced subtitle captions */
  script: string;
  /** Measured MP4 duration in seconds */
  durationSeconds: number;
};

export type BlogVideoProps = {
  script: VideoScript;
  coverUrl: string;
  brandColor: string;
  category?: string;
  /** remotion/public paths for staticFile() - slide voiceover audio */
  slideAudioUrls: string[];
  /** remotion/public paths for staticFile() - slide background photos */
  slideImageUrls?: string[];
  /** e.g. _music/energetic.mp3 - low volume under voice */
  backgroundMusicPath?: string | null;
  /** 0.08-0.22, from Gemini music plan */
  backgroundMusicVolume?: number;
  /** Tavus talking-head intro shown before the slides */
  tavusIntro?: TavusSegmentProps | null;
  /** Tavus talking-head outro shown after the slides */
  tavusOutro?: TavusSegmentProps | null;
  /** Tavus presenter overlaid (picture-in-picture) across the whole video */
  tavusNarrator?: TavusSegmentProps | null;
};

export const BLOG_VIDEO_FPS = 30;
export const BLOG_VIDEO_WIDTH = 1080;
export const BLOG_VIDEO_HEIGHT = 1920;
