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

/** Total frame count for the composition (matches BlogVideo's own math). */
function computeDurationInFrames(props: BlogVideoProps): number {
  const slidesFrames = props.script.slides.reduce(
    (sum, slide) => sum + Math.round(slide.duration * BLOG_VIDEO_FPS),
    0,
  );

  // Narrator mode: avatar PIP overlays the whole video; cover the longer side.
  if (props.tavusNarrator) {
    const narratorFrames = Math.round(
      props.tavusNarrator.durationSeconds * BLOG_VIDEO_FPS,
    );
    return Math.max(1, slidesFrames, narratorFrames);
  }

  const introFrames = props.tavusIntro
    ? Math.round(props.tavusIntro.durationSeconds * BLOG_VIDEO_FPS)
    : Math.round(2 * BLOG_VIDEO_FPS);
  const outroFrames = props.tavusOutro
    ? Math.round(props.tavusOutro.durationSeconds * BLOG_VIDEO_FPS)
    : 0;
  return Math.max(1, introFrames + slidesFrames + outroFrames);
}

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BlogVideo"
      component={BlogVideo}
      durationInFrames={BLOG_VIDEO_FPS * 40}
      fps={BLOG_VIDEO_FPS}
      width={BLOG_VIDEO_WIDTH}
      height={BLOG_VIDEO_HEIGHT}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => ({
        durationInFrames: computeDurationInFrames(props),
      })}
    />
  );
};
