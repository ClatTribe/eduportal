import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { VideoChart } from "../lib/video-script-gemini";
import { BRAND } from "../lib/brand-theme";

const RED = BRAND.crimson;       // #A51C30
const RED_DARK = BRAND.crimsonDark; // #7f1424
const INK = BRAND.ink;           // #0a0a0a
const SLATE = BRAND.slate;       // #2d3748

// ─── Shared glass card wrapper ───────────────────────────────────────────────
function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 32,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)",
        border: "1.5px solid rgba(255,255,255,0.32)",
        boxShadow:
          "0 8px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.25)",
        backdropFilter: "blur(24px)",
        padding: "32px 36px",
        width: "100%",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Hero chart ──────────────────────────────────────────────────────────────
function HeroChart({
  chart,
  brandColor,
  progress,
}: {
  chart: VideoChart;
  brandColor: string;
  progress: number;
}) {
  const trend = chart.trend ?? "flat";
  const arrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const trendColor =
    trend === "up" ? "#22c55e" : trend === "down" ? brandColor : "#94a3b8";
  const displayed = Math.round((chart.heroValue ?? 0) * progress);

  const glowOpacity = interpolate(progress, [0, 1], [0, 0.55]);

  return (
    <GlassCard style={{ alignItems: "center", gap: 16 }}>
      {/* Glow blob behind number */}
      <div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: 999,
          background: brandColor,
          opacity: glowOpacity,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Big animated number */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          position: "relative",
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: -4,
            lineHeight: 1,
            textShadow: `0 0 40px ${brandColor}`,
          }}
        >
          {displayed}
        </span>
        {chart.unit ? (
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: brandColor,
              marginBottom: 12,
            }}
          >
            {chart.unit}
          </span>
        ) : null}
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
          letterSpacing: 0.5,
        }}
      >
        {chart.heroLabel ?? chart.items[0]?.label ?? ""}
      </span>

      {/* Trend pill */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          background: "rgba(255,255,255,0.1)",
          border: `1.5px solid ${trendColor}44`,
          borderRadius: 999,
          padding: "10px 24px",
          marginTop: 8,
        }}
      >
        <span style={{ fontSize: 28, color: trendColor }}>{arrow}</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: trendColor }}>
          {trend === "up"
            ? "Trending Up"
            : trend === "down"
              ? "Watch Out"
              : "Key Stat"}
        </span>
      </div>
    </GlassCard>
  );
}

// ─── Bar chart ───────────────────────────────────────────────────────────────
function BarChart({
  chart,
  brandColor,
  progress,
}: {
  chart: VideoChart;
  brandColor: string;
  progress: number;
}) {
  const max =
    chart.maxValue ?? Math.max(...chart.items.map((i) => i.value), 1);
  const items = chart.items.slice(0, 4);

  return (
    <GlassCard style={{ gap: 20 }}>
      {items.map((item, index) => {
        // Staggered reveal per bar
        const barProgress = interpolate(
          progress,
          [index * 0.12, index * 0.12 + 0.6],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const fillWidth = (item.value / max) * 100 * barProgress;
        const valOpacity = interpolate(barProgress, [0.4, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={`${item.label}-${index}`}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {/* Label row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  color: "#ffffff",
                  fontSize: 26,
                  fontWeight: 800,
                  opacity: valOpacity,
                }}
              >
                {item.value}
                {chart.unit ?? ""}
              </span>
            </div>

            {/* Track */}
            <div
              style={{
                display: "flex",
                height: 20,
                borderRadius: 999,
                background: "rgba(255,255,255,0.1)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {/* Fill */}
              <div
                style={{
                  display: "flex",
                  width: `${fillWidth}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${brandColor}, ${RED_DARK})`,
                  boxShadow: `0 0 16px ${brandColor}99`,
                }}
              />
            </div>
          </div>
        );
      })}
    </GlassCard>
  );
}

// ─── Comparison chart ─────────────────────────────────────────────────────────
function ComparisonChart({
  chart,
  brandColor,
  progress,
}: {
  chart: VideoChart;
  brandColor: string;
  progress: number;
}) {
  const max =
    chart.maxValue ?? Math.max(...chart.items.map((i) => i.value), 1);
  const [a, b] = chart.items;
  const maxBarH = 180;

  const aH = Math.max(24, (a.value / max) * maxBarH * progress);
  const bH = Math.max(24, (b.value / max) * maxBarH * progress);
  const aOpacity = interpolate(progress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });
  const bOpacity = interpolate(progress, [0.2, 0.7], [0, 1], {
    extrapolateRight: "clamp",
  });

  const winner = a.value > b.value ? "a" : b.value > a.value ? "b" : "none";

  return (
    <GlassCard style={{ alignItems: "center", gap: 24 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 40,
          width: "100%",
          justifyContent: "center",
          alignItems: "flex-end",
        }}
      >
        {[
          { item: a, h: aH, opacity: aOpacity, side: "a" as const },
          { item: b, h: bH, opacity: bOpacity, side: "b" as const },
        ].map(({ item, h, opacity, side }) => {
          const isWinner = winner === side;
          return (
            <div
              key={side}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                flex: 1,
                opacity,
              }}
            >
              {/* Winner crown */}
              {isWinner ? (
                <span style={{ fontSize: 32 }}>👑</span>
              ) : (
                <div style={{ height: 40 }} />
              )}

              {/* Value above bar */}
              <span
                style={{
                  fontSize: 38,
                  fontWeight: 800,
                  color: isWinner ? "#ffffff" : "rgba(255,255,255,0.6)",
                  letterSpacing: -1,
                }}
              >
                {item.value}
                {chart.unit ?? ""}
              </span>

              {/* Bar */}
              <div
                style={{
                  display: "flex",
                  width: 90,
                  height: maxBarH,
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: h,
                    borderRadius: "20px 20px 6px 6px",
                    background: isWinner
                      ? `linear-gradient(180deg, ${brandColor} 0%, ${RED_DARK} 100%)`
                      : "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
                    boxShadow: isWinner
                      ? `0 0 32px ${brandColor}88, 0 0 64px ${brandColor}44`
                      : "none",
                    border: isWinner
                      ? `1.5px solid ${brandColor}`
                      : "1.5px solid rgba(255,255,255,0.2)",
                  }}
                />
              </div>

              {/* Label below bar */}
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: isWinner ? "#ffffff" : "rgba(255,255,255,0.6)",
                  textAlign: "center",
                  maxWidth: 140,
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export const VideoCharts: React.FC<{
  chart: VideoChart;
  brandColor: string;
  durationFrames: number;
}> = ({ chart, brandColor, durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring-based progress for smooth animated entry
  const progress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80, mass: 1 },
    durationInFrames: Math.round(durationFrames * 0.85),
  });

  if (chart.kind === "hero" && chart.heroValue != null) {
    return (
      <HeroChart chart={chart} brandColor={brandColor} progress={progress} />
    );
  }

  if (chart.kind === "comparison" && chart.items.length >= 2) {
    return (
      <ComparisonChart
        chart={chart}
        brandColor={brandColor}
        progress={progress}
      />
    );
  }

  return (
    <BarChart chart={chart} brandColor={brandColor} progress={progress} />
  );
};