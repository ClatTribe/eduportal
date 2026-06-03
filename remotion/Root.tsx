import React from "react";
import { Composition } from "remotion";
import { BlogVideo } from "./BlogVideo";
import type { BlogVideoProps } from "./types";
import { BLOG_VIDEO_FPS, BLOG_VIDEO_HEIGHT, BLOG_VIDEO_WIDTH } from "./types";

const defaultScript: BlogVideoProps["script"] = {
  title: "Preview",
  caption: "",
  totalDuration: 40,
  slides: [
    {
      type: "hook",
      heading: "Study abroad tip",
      subtext: "Save this reel",
      duration: 4,
      voiceover: "",
    },
    {
      type: "point",
      heading: "One idea per slide",
      subtext: "From your magazine article",
      duration: 5,
      voiceover: "",
    },
    {
      type: "cta",
      heading: "Read the full guide",
      subtext: "Link in bio",
      duration: 4,
      voiceover: "",
    },
  ],
};

export const RemotionRoot: React.FC = () => {
  const defaultProps: BlogVideoProps = {
    script: defaultScript,
    coverUrl: "",
    brandColor: "#A51C30",
    category: "Study Abroad",
    slideAudioUrls: [],
    backgroundMusicPath: null,
    backgroundMusicVolume: 0.14,
    tavusIntro: null,
    tavusOutro: null,
  };

  return (
    <Composition
      id="BlogVideo"
      component={BlogVideo}
      durationInFrames={BLOG_VIDEO_FPS * 40}
      fps={BLOG_VIDEO_FPS}
      width={BLOG_VIDEO_WIDTH}
      height={BLOG_VIDEO_HEIGHT}
      defaultProps={defaultProps}
    />
  );
};
