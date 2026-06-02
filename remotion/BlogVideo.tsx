import React from "react";
import {
  AbsoluteFill,
  Audio,
  Html5Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND } from "../lib/brand-theme";
import type { VideoSlide } from "../lib/video-script-gemini";
import type { BlogVideoProps } from "./types";
import { VideoCharts } from "./VideoCharts";
import { BLOG_VIDEO_FPS } from "./types";

const RED = BRAND.crimson;
const RED_DARK = BRAND.crimsonDark;
const INK = "#0a0a0a";

// ─── Global progress bar ──────────────────────────────────────────────────────
function GlobalProgressBar({ pct }: { pct: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 5,
        background: "rgba(255,255,255,0.1)",
        zIndex: 200,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${RED}, #ff4060)`,
          boxShadow: `0 0 14px ${RED}`,
        }}
      />
    </div>
  );
}

// ─── Slide progress ring around counter ──────────────────────────────────────
function SlideProgressRing({
  frame,
  durationFrames,
}: {
  frame: number;
  durationFrames: number;
}) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(frame / durationFrames, 1);
  const dash = circ * pct;
  return (
    <svg
      width={72}
      height={72}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {/* Track */}
      <circle
        cx={36}
        cy={36}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={3}
      />
      {/* Fill */}
      <circle
        cx={36}
        cy={36}
        r={r}
        fill="none"
        stroke={RED}
        strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ filter: `drop-shadow(0 0 4px ${RED})` }}
      />
    </svg>
  );
}

// ─── Floating ambient orbs — always moving ────────────────────────────────────
function AmbientOrbs({ frame }: { frame: number }) {
  const orbs = [
    { x: 80, y: 300, size: 220, speed: 0.4, opacity: 0.07 },
    { x: 900, y: 800, size: 280, speed: 0.3, opacity: 0.06 },
    { x: 500, y: 1600, size: 200, speed: 0.5, opacity: 0.08 },
    { x: 100, y: 1200, size: 180, speed: 0.35, opacity: 0.05 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {orbs.map((orb, i) => {
        const drift = Math.sin(frame * orb.speed * 0.04 + i * 1.2) * 40;
        const drift2 = Math.cos(frame * orb.speed * 0.03 + i * 0.8) * 30;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: orb.x + drift - orb.size / 2,
              top: orb.y + drift2 - orb.size / 2,
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              background: RED,
              opacity: orb.opacity,
              filter: `blur(${orb.size * 0.4}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

// ─── Particle stream — dots floating upward ────────────────────────────────────
function ParticleStream({ frame }: { frame: number }) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 80 + ((i * 97) % 920), // spread across width
    period: 60 + ((i * 13) % 40), // different speeds
    offset: (i * 17) % 60, // phase offset
    size: 3 + (i % 3) * 2,
    opacity: 0.15 + (i % 4) * 0.06,
  }));

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {particles.map((p) => {
        const t = ((frame + p.offset) % p.period) / p.period;
        const y = 1920 - t * 2200; // start below screen, float up
        const x = p.x + Math.sin(frame * 0.05 + p.id) * 20;
        const opacity =
          t < 0.1
            ? interpolate(t, [0, 0.1], [0, p.opacity])
            : t > 0.85
              ? interpolate(t, [0.85, 1], [p.opacity, 0])
              : p.opacity;
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: RED,
              opacity,
              boxShadow: `0 0 ${p.size * 2}px ${RED}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

// ─── Audio waveform visualizer ─────────────────────────────────────────────────
// Fake but responsive-looking bars that animate continuously
function AudioWaveform({
  frame,
  isActive,
}: {
  frame: number;
  isActive: boolean;
}) {
  const bars = 28;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        height: 36,
        opacity: isActive ? 0.7 : 0.2,
      }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        // Fake audio wave using multiple sin waves
        const h =
          8 +
          Math.abs(
            Math.sin(frame * 0.18 + i * 0.6) * 14 +
              Math.sin(frame * 0.11 + i * 1.1) * 8 +
              Math.sin(frame * 0.24 + i * 0.3) * 6,
          );
        return (
          <div
            key={i}
            style={{
              width: 4,
              height: h,
              borderRadius: 999,
              background: `linear-gradient(to top, ${RED}, #ff6080)`,
              boxShadow: `0 0 6px ${RED}88`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Cut flash on slide entry ─────────────────────────────────────────────────
function CutFlash() {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 4], [0.5, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: "#ffffff",
        opacity,
        pointerEvents: "none",
        zIndex: 90,
      }}
    />
  );
}

// ─── Screen shake on stat slides ──────────────────────────────────────────────
function useScreenShake(active: boolean) {
  const frame = useCurrentFrame();
  if (!active) return "translate(0,0)";
  const x = interpolate(frame, [0, 1, 2, 3, 4, 5], [0, -7, 5, -3, 2, 0], {
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [0, 1, 2, 3, 4, 5], [0, 4, -3, 2, -1, 0], {
    extrapolateRight: "clamp",
  });
  return `translate(${x}px,${y}px)`;
}

// ─── Photo background ─────────────────────────────────────────────────────────
function PhotoBackground({
  src,
  overlayOpacity = 0.52,
  animateKenBurns = false,
  durationFrames = 150,
}: {
  src: string;
  overlayOpacity?: number;
  animateKenBurns?: boolean;
  durationFrames?: number;
}) {
  const frame = useCurrentFrame();
  const scale = animateKenBurns
    ? interpolate(frame, [0, durationFrames], [1.08, 1.22], {
        extrapolateRight: "clamp",
      })
    : interpolate(frame, [0, durationFrames], [1.1, 1.04], {
        extrapolateRight: "clamp",
      });
  const tx = !animateKenBurns
    ? interpolate(frame, [0, durationFrames], [0, -28], {
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translateX(${tx}px)`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            filter: "blur(20px)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${overlayOpacity})` }} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(165,28,48,0.45) 0%, transparent 50%)",
        }}
      />
    </AbsoluteFill>
  );
}

// ─── Dark background ──────────────────────────────────────────────────────────
function DarkBackground({ type }: { type: VideoSlide["type"] }) {
  const isHook = type === "hook";
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isHook
            ? "linear-gradient(160deg,#0f0305 0%,#1a0508 40%,#0a0a0a 100%)"
            : "linear-gradient(160deg,#0a0a0a 0%,#110305 50%,#0f0a0a 100%)",
        }}
      />
    </AbsoluteFill>
  );
}

// ─── Hook photo reveal ────────────────────────────────────────────────────────
function HookPhotoReveal({
  photoSrc,
  durationFrames,
}: {
  photoSrc: string;
  durationFrames: number;
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity }}>
      <PhotoBackground
        src={photoSrc}
        overlayOpacity={0.5}
        animateKenBurns
        durationFrames={durationFrames}
      />
    </AbsoluteFill>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function EduAbroadLogo() {
  return (
    <Img
      src={staticFile("edulogo.png")}
      style={{
        width: 220,
        height: 54,
        objectFit: "contain",
        objectPosition: "left center",
        filter: "brightness(0) invert(1)",
      }}
    />
  );
}

// ─── Slide dot strip ──────────────────────────────────────────────────────────
function SlideDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current - 1 ? 22 : 6,
            height: 6,
            borderRadius: 999,
            background: i === current - 1 ? "#fff" : "rgba(255,255,255,0.28)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function SlideHeader({
  slide,
  slideNum,
  totalSlides,
  frame,
  durationFrames,
  enterY,
}: {
  slide: VideoSlide;
  slideNum: number;
  totalSlides: number;
  frame: number;
  durationFrames: number;
  enterY: number;
}) {
  const typeLabel =
    slide.type === "hook"
      ? "🔥 MUST WATCH"
      : slide.type === "stat"
        ? "📊 DATA DROP"
        : slide.type === "cta"
          ? "👉 YOUR MOVE"
          : "💡 INSIGHT";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
        transform: `translateY(${enterY}px)`,
      }}
    >
      <EduAbroadLogo />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        {/* Slide counter with progress ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: 800,
              fontFamily: BRAND.font,
            }}
          >
            {slideNum}/{totalSlides}
          </span>

          <span
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 16,
              fontWeight: 900,
              fontFamily: BRAND.font,
            }}
          >
            {Math.ceil((durationFrames - frame) / BLOG_VIDEO_FPS)}s
          </span>
        </div>
        {/* Type pill */}
        <div
          style={{
            display: "flex",
            background: RED,
            borderRadius: 999,
            padding: "7px 16px",
            boxShadow: `0 0 18px ${RED}88`,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 1,
              fontFamily: BRAND.font,
            }}
          >
            {typeLabel}
          </span>
        </div>
        <SlideDots current={slideNum} total={totalSlides} />
      </div>
    </div>
  );
}

// ─── Breathing headline — pulses slowly while displayed ──────────────────────
function BreathingHeadline({
  text,
  frame,
  fps,
  fontSize,
  accentColor,
  accentWords = 2,
}: {
  text: string;
  frame: number;
  fps: number;
  fontSize: number;
  accentColor: string;
  accentWords?: number;
}) {
  const words = text.split(" ");
  // Slow pulse after slide settles (from frame 20 onward)
  const breath =
    1 + 0.018 * Math.sin((Math.max(0, frame - 20) / fps) * Math.PI * 1.6);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "0 10px",
        transform: `scale(${breath})`,
        transformOrigin: "left center",
      }}
    >
      {words.map((word, i) => {
        // Staggered fly-in from left
        const delay = i * 3;
        const s = spring({
          frame: frame - delay,
          fps,
          config: { damping: 14, stiffness: 220, mass: 0.7 },
          durationInFrames: 12,
        });
        const x = interpolate(s, [0, 1], [-60, 0]);
        const op = interpolate(s, [0, 0.3], [0, 1], {
          extrapolateRight: "clamp",
        });
        const isAccent = i < accentWords;
        return (
          <span
            key={i}
            style={{
              fontSize,
              fontWeight: 800,
              fontStyle: "italic",
              fontFamily: BRAND.font,
              letterSpacing: -2,
              lineHeight: 1.05,
              color: isAccent ? accentColor : "#ffffff",
              transform: `translateX(${x}px)`,
              opacity: op,
              display: "inline-block",
              textShadow: isAccent
                ? `0 0 30px ${accentColor}99`
                : "0 2px 12px rgba(0,0,0,0.7)",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

// ─── Live counting number — counts up on stat slides ─────────────────────────
function CountUpNumber({
  value,
  unit,
  frame,
  durationFrames,
  color,
}: {
  value: number;
  unit?: string;
  frame: number;
  durationFrames: number;
  color: string;
}) {
  const progress = spring({
    frame,
    fps: BLOG_VIDEO_FPS,
    config: { damping: 20, stiffness: 60, mass: 1.2 },
    durationInFrames: Math.round(durationFrames * 0.7),
  });
  const displayed = Math.round(value * progress);
  const glow = 0.4 + 0.3 * Math.sin(frame * 0.15);
  return (
    <span
      style={{
        fontSize: 110,
        fontWeight: 900,
        color: "#ffffff",
        letterSpacing: -4,
        lineHeight: 1,
        fontFamily: BRAND.font,
        textShadow: `0 0 ${40 + glow * 20}px ${color}`,
      }}
    >
      {displayed}
      {unit ?? ""}
    </span>
  );
}

// ─── Kicker label bounces in ──────────────────────────────────────────────────
function KickerBadge({
  text,
  frame,
  fps,
  brandColor,
}: {
  text: string;
  frame: number;
  fps: number;
  brandColor: string;
}) {
  const s = spring({
    frame: frame - 3,
    fps,
    config: { damping: 10, stiffness: 300, mass: 0.5 },
    durationInFrames: 10,
  });
  const scale = interpolate(s, [0, 1], [0.3, 1]);
  const op = interpolate(s, [0, 0.15], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        display: "flex",
        alignSelf: "flex-start",
        background: `${brandColor}22`,
        border: `1.5px solid ${brandColor}77`,
        borderRadius: 999,
        padding: "6px 18px",
        transform: `scale(${scale})`,
        opacity: op,
        transformOrigin: "left center",
      }}
    >
      <span
        style={{
          color: brandColor,
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: 2.5,
          fontFamily: BRAND.font,
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Subtext slides up ────────────────────────────────────────────────────────
function SubtextLine({
  text,
  frame,
  fps,
  fontSize,
}: {
  text: string;
  frame: number;
  fps: number;
  fontSize: number;
}) {
  const s = spring({
    frame: frame - 14,
    fps,
    config: { damping: 18, stiffness: 180, mass: 0.8 },
    durationInFrames: 14,
  });
  const y = interpolate(s, [0, 1], [32, 0]);
  const op = interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
  return (
    <p
      style={{
        color: "rgba(255,255,255,0.68)",
        fontSize,
        lineHeight: 1.4,
        margin: 0,
        fontWeight: 500,
        fontFamily: BRAND.font,
        transform: `translateY(${y}px)`,
        opacity: op,
      }}
    >
      {text}
    </p>
  );
}

// ─── CTA button pulses ────────────────────────────────────────────────────────
function PulsingCtaButton({
  frame,
  fps,
  brandColor,
}: {
  frame: number;
  fps: number;
  brandColor: string;
}) {
  const s = spring({
    frame: frame - 16,
    fps,
    config: { damping: 10, stiffness: 260, mass: 0.7 },
    durationInFrames: 14,
  });
  const enter = interpolate(s, [0, 1], [0.6, 1]);
  const pulse = 1 + 0.04 * Math.sin((frame / BLOG_VIDEO_FPS) * Math.PI * 2.2);
  return (
    <div
      style={{
        display: "flex",
        marginTop: 8,
        transform: `scale(${enter * pulse})`,
        transformOrigin: "left center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: `linear-gradient(135deg,${brandColor},${RED_DARK})`,
          borderRadius: 999,
          padding: "22px 48px",
          boxShadow: `0 0 44px ${brandColor}88`,
        }}
      >
        <span
          style={{
            color: "#fff",
            fontSize: 28,
            fontWeight: 800,
            fontFamily: BRAND.font,
          }}
        >
          Read full article →
        </span>
      </div>
    </div>
  );
}

// ─── Content card ─────────────────────────────────────────────────────────────
function ContentCard({
  slide,
  brandColor,
  enterY,
  hasPhoto,
  frame,
  fps,
  durationFrames,
}: {
  slide: VideoSlide;
  brandColor: string;
  enterY: number;
  hasPhoto: boolean;
  frame: number;
  fps: number;
  durationFrames: number;
}) {
  const isHook = slide.type === "hook";
  const isStat = slide.type === "stat";
  const isCta = slide.type === "cta";

  // Stat card slams up
  const statSlam = isStat
    ? spring({
        frame,
        fps,
        config: { damping: 9, stiffness: 320, mass: 0.7 },
        durationInFrames: 12,
      })
    : 1;
  const statY = isStat ? interpolate(statSlam, [0, 1], [130, 0]) : 0;

  const cardBg = hasPhoto
    ? "linear-gradient(135deg,rgba(8,2,4,0.80) 0%,rgba(20,5,8,0.74) 100%)"
    : "linear-gradient(135deg,rgba(255,255,255,0.11) 0%,rgba(255,255,255,0.04) 100%)";

  // Card breathes very subtly after settling
  const cardBreath =
    1 + 0.006 * Math.sin((Math.max(0, frame - 24) / fps) * Math.PI * 1.2);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        width: "100%",
        alignItems: isStat ? "flex-start" : "center",
        justifyContent: "center",
        transform: `translateY(${enterY + statY}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          width: "100%",
          borderRadius: 32,
          background: cardBg,
          border: "1.5px solid rgba(255,255,255,0.15)",
          boxShadow:
            "0 8px 52px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.12)",
          backdropFilter: "blur(32px)",
          padding: isStat ? "32px 38px" : "48px 42px",
          position: "relative",
          overflow: "hidden",
          transform: `scale(${cardBreath})`,
          transformOrigin: "center center",
        }}
      >
        {/* Accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 40,
            right: 40,
            height: 2,
            borderRadius: 999,
            background: `linear-gradient(90deg,transparent,${brandColor},transparent)`,
            opacity: 0.9,
          }}
        />

        {/* Animated corner glow — moves slowly */}
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: brandColor,
            opacity: 0.06 + 0.03 * Math.sin(frame * 0.07),
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        {/* Kicker */}
        {!isStat && (
          <KickerBadge
            text={
              isHook ? "BREAKING" : isCta ? "YOUR NEXT STEP" : "KEY INSIGHT"
            }
            frame={frame}
            fps={fps}
            brandColor={brandColor}
          />
        )}

        {/* Headline with breathing */}
        <BreathingHeadline
          text={slide.heading}
          frame={frame}
          fps={fps}
          fontSize={isHook ? 70 : isStat ? 50 : 58}
          accentColor={brandColor}
          accentWords={isHook ? 2 : 1}
        />

        {/* Subtext */}
        {slide.subtext ? (
          <SubtextLine
            text={slide.subtext?.slice(0, 80)}
            frame={frame}
            fps={fps}
            fontSize={isStat ? 24 : 28}
          />
        ) : null}

        {/* Stat: live count-up + chart */}
        {isStat &&
        slide.chart?.kind === "hero" &&
        slide.chart.heroValue != null ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
            }}
          >
            <CountUpNumber
              value={slide.chart.heroValue}
              unit={slide.chart.unit}
              frame={frame}
              durationFrames={durationFrames}
              color={brandColor}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 24,
                fontFamily: BRAND.font,
                fontWeight: 600,
              }}
            >
              {slide.chart.heroLabel ?? ""}
            </span>
          </div>
        ) : isStat && slide.chart ? (
          (() => {
            const chartScale = spring({
              frame: frame - 10,
              fps,
              config: {
                damping: 12,
                stiffness: 180,
              },
              durationInFrames: 18,
            });

            return (
              <div
                style={{
                  transform: `scale(${chartScale})`,
                  opacity: chartScale,
                  transformOrigin: "center center",
                }}
              >
                <VideoCharts
                  chart={slide.chart}
                  brandColor={brandColor}
                  durationFrames={durationFrames}
                />
              </div>
            );
          })()
        ) : null}

        {/* CTA */}
        {isCta ? (
          <PulsingCtaButton frame={frame} fps={fps} brandColor={brandColor} />
        ) : null}
      </div>
    </div>
  );
}

// ─── Footer with live waveform ─────────────────────────────────────────────────
function SlideFooter({
  opacity,
  frame,
  hasVoice,
}: {
  opacity: number;
  frame: number;
  hasVoice: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity }}>
      {/* Audio waveform — visible when voiceover is active */}
      {hasVoice && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              fontFamily: BRAND.font,
              fontWeight: 600,
            }}
          >
            LIVE
          </span>
          <div
            style={{
              display: "flex",
              gap: 3,
              alignItems: "center",
              height: 28,
            }}
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const h =
                5 +
                Math.abs(
                  Math.sin(frame * 0.2 + i * 0.7) * 12 +
                    Math.sin(frame * 0.13 + i * 1.2) * 7,
                );
              return (
                <div
                  key={i}
                  style={{
                    width: 3.5,
                    height: h,
                    borderRadius: 999,
                    background: `linear-gradient(to top,${RED},#ff5070)`,
                    boxShadow: `0 0 5px ${RED}66`,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 14,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: 18,
            fontWeight: 500,
            fontFamily: BRAND.font,
          }}
        >
          app.goeduabroad.com
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="4" fill="#8B0000" />
            <path
              fill="#fff"
              d="M16 6l-8 4v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11v-6l-8-4z"
            />
            <path
              fill="#D4AF37"
              d="M16 8l-6 3v5c0 4 2.5 7.5 6 9 3.5-1.5 6-5 6-9v-5l-6-3z"
            />
          </svg>
          <span
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 16,
              fontWeight: 600,
              fontFamily: BRAND.font,
            }}
          >
            Cambridge Partner
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Word-by-word TikTok caption ──────────────────────────────────────────────
function WordByWordCaption({
  text,
  durationFrames,
  startFrame = 6,
}: {
  text: string;
  durationFrames: number;
  startFrame?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return null;

  const available = durationFrames - startFrame - 8;
  const fpw = Math.max(2, available / words.length);
  const elapsed = frame - startFrame;
  const activeIdx =
    elapsed < 0 ? -1 : Math.min(Math.floor(elapsed / fpw), words.length - 1);

  const LINE = 3;
  const lines: string[][] = [];
  for (let i = 0; i < words.length; i += LINE)
    lines.push(words.slice(i, i + LINE));

  const activeLine = Math.max(0, Math.floor(activeIdx / LINE));
  const visibleLines = lines.slice(activeLine, activeLine + 2);
  const lineOffset = activeLine;

  const containerOpacity = interpolate(
    frame,
    [startFrame, startFrame + 5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 250, // was 120
        left: 0,
        right: 0,

        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        gap: 8,
        padding: "0 20px", // less side padding

        opacity: containerOpacity,
        zIndex: 50,
      }}
    >
      {visibleLines.map((lineWords, lineIdx) => {
        const globalLine = lineOffset + lineIdx;
        return (
          <div
            key={globalLine}
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 6,
              opacity: lineIdx === 0 ? 1 : 0.28,
            }}
          >
            {lineWords.map((word, wi) => {
              const gIdx = globalLine * LINE + wi;
              const isActive = gIdx === activeIdx;
              const isPast = gIdx < activeIdx;
              const ws = isActive
                ? spring({
                    frame: frame - (startFrame + Math.round(gIdx * fpw)),
                    fps,
                    config: { damping: 11, stiffness: 300, mass: 0.5 },
                    durationInFrames: 7,
                  })
                : isPast
                  ? 1
                  : 0;
              const scale = isActive ? interpolate(ws, [0, 1], [0.6, 1]) : 1;
              const wOp = isActive ? 1 : isPast ? 0.65 : 0.25;
              return (
                <span
                  key={wi}
                  style={{
                    fontSize: isActive ? 84 : 68, // increased from 38/32
                    fontWeight: isActive ? 900 : 800,
                    fontFamily: BRAND.font,
                    letterSpacing: -1,
                    lineHeight: 1.15,

                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.7)",
                    opacity: wOp,

                    transform: `scale(${scale})`,
                    display: "inline-block",

                    textShadow: isActive
                      ? "0 0 40px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,1)"
                      : "0 2px 12px rgba(0,0,0,0.9)",

                    WebkitTextStroke: "2px rgba(0,0,0,0.8)",

                    background: isActive ? `${RED}55` : "transparent",
                    borderRadius: isActive ? 12 : 0,

                    padding: isActive ? "6px 14px" : "4px 0",
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── "WAIT FOR IT" badge (hook only) ─────────────────────────────────────────
function WaitForItBadge({ frame }: { frame: number }) {
  const s = spring({
    frame: frame - 10,
    fps: BLOG_VIDEO_FPS,
    config: { damping: 10, stiffness: 240, mass: 0.6 },
    durationInFrames: 12,
  });
  const y = interpolate(s, [0, 1], [-44, 0]);
  const op = interpolate(s, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });
  const pulse = 1 + 0.04 * Math.sin((frame / BLOG_VIDEO_FPS) * Math.PI * 2.4);
  return (
    <div
      style={{
        position: "absolute",
        top: 230,
        right: 52,
        transform: `translateY(${y}px) scale(${pulse})`,
        opacity: op,
        zIndex: 60,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 14,
          padding: "10px 22px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
        }}
      >
        <span
          style={{
            color: RED,
            fontSize: 18,
            fontWeight: 900,
            fontFamily: BRAND.font,
            letterSpacing: 1,
          }}
        >
          WAIT FOR IT →
        </span>
      </div>
    </div>
  );
}

// ─── Single slide ─────────────────────────────────────────────────────────────
function SlideContent({
  slide,
  brandColor,
  slideNum,
  totalSlides,
  photoSrc,
  globalFrame,
  totalFrames,
}: {
  slide: VideoSlide;
  brandColor: string;
  slideNum: number;
  totalSlides: number;
  photoSrc: string;
  globalFrame: number;
  totalFrames: number;
}) {
  const frame = useCurrentFrame();
  const actualGlobalFrame = globalFrame + frame;
  const { fps } = useVideoConfig();
  const durationFrames = Math.round(slide.duration * BLOG_VIDEO_FPS);

  const isHook = slide.type === "hook";
  const isStat = slide.type === "stat";
  const hasPhoto = Boolean(photoSrc) && !isStat;

  const shake = useScreenShake(isStat);
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const headerS = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 200, mass: 0.8 },
    durationInFrames: 16,
  });
  const headerY = interpolate(headerS, [0, 1], [-50, 0]);

  const cardS = spring({
    frame: frame - 4,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.9 },
    durationInFrames: 18,
  });
  const cardY = interpolate(cardS, [0, 1], [70, 0]);

  const footerOp = interpolate(frame, [14, 26], [0, 1], {
    extrapolateRight: "clamp",
  });
  const hookOp = isHook
    ? interpolate(frame, [8, 22], [0, 1], { extrapolateRight: "clamp" })
    : 1;

  const globalPct = (actualGlobalFrame / totalFrames) * 100;

  return (
    <AbsoluteFill
      style={{
        fontFamily: BRAND.font,
        padding: "56px 52px 44px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 22,
        opacity: fadeIn,
        transform: shake,
      }}
    >
      {/* Background */}
      {hasPhoto ? (
        isHook ? (
          <HookPhotoReveal
            photoSrc={photoSrc}
            durationFrames={durationFrames}
          />
        ) : (
          <PhotoBackground
            src={photoSrc}
            overlayOpacity={0.56}
            durationFrames={durationFrames}
          />
        )
      ) : (
        <DarkBackground type={slide.type} />
      )}

      {/* Always-on ambient animations */}
      <AmbientOrbs frame={frame} />
      <ParticleStream frame={frame} />

      {/* Cut flash */}
      <CutFlash />

      {/* Global progress bar */}
      <GlobalProgressBar pct={globalPct} />

      {/* Hook badge */}
      {isHook && <WaitForItBadge frame={frame} />}

      {/* Header */}
      <div style={{ opacity: hookOp }}>
        <SlideHeader
          slide={slide}
          slideNum={slideNum}
          totalSlides={totalSlides}
          frame={frame}
          durationFrames={durationFrames}
          enterY={headerY}
        />
      </div>

      {/* Content card */}
      <div style={{ display: "flex", flex: 1, opacity: hookOp }}>
        <ContentCard
          slide={slide}
          brandColor={brandColor}
          enterY={cardY}
          hasPhoto={hasPhoto}
          frame={frame}
          fps={fps}
          durationFrames={durationFrames}
        />
      </div>

      {/* Footer */}
      <div style={{ opacity: footerOp * hookOp }}>
        <SlideFooter
          opacity={1}
          frame={frame}
          hasVoice={Boolean(slide.voiceover)}
        />
      </div>

      {/* Word-by-word captions */}
      {slide.voiceover && (
        <WordByWordCaption
          text={slide.voiceover}
          durationFrames={durationFrames}
          startFrame={isHook ? 22 : 8}
        />
      )}
    </AbsoluteFill>
  );
}

// ─── Root composition ─────────────────────────────────────────────────────────
export const BlogVideo: React.FC<BlogVideoProps> = ({
  script,
  brandColor,
  slideAudioUrls = [],
  slideImageUrls = [],
  backgroundMusicPath,
  backgroundMusicVolume = 0.14,
}) => {
  const brand = brandColor || BRAND.crimson;
  const totalSlides = script.slides.length;

  const TARGET_SECONDS = 40;

  const perSlideDuration = TARGET_SECONDS / script.slides.length;
  const frameOffsets: number[] = [];

  let acc = 0;

  for (const slide of script.slides) {
    frameOffsets.push(acc);

    const slideFrames = Math.round(slide.duration * BLOG_VIDEO_FPS);

    acc += slideFrames;
  }

  const totalFrames = acc;
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {backgroundMusicPath && (
        <Audio
          src={staticFile(backgroundMusicPath)}
          volume={backgroundMusicVolume}
          endAt={totalFrames}
        />
      )}
      {script.slides.map((slide, index) => {
        const durationInFrames = Math.round(slide.duration * BLOG_VIDEO_FPS);
        const from = frameOffsets[index];
        const audioSrc = slideAudioUrls[index] ?? "";
        const photoSrc = slideImageUrls[index] ?? "";
        return (
          <Sequence
            key={`${slide.type}-${index}`}
            from={Math.max(0, from - 8)}
            durationInFrames={durationInFrames + 8}
          >
            {audioSrc && (
              <Html5Audio
                src={staticFile(audioSrc)}
                volume={1}
                trimAfter={durationInFrames}
              />
            )}
            <SlideContent
              slide={slide}
              brandColor={brand}
              slideNum={index + 1}
              totalSlides={totalSlides}
              photoSrc={photoSrc}
              globalFrame={from + useCurrentFrame()}
              totalFrames={totalFrames}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
