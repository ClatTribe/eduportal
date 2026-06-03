import type { ReactNode } from "react";
import { ImageResponse } from "@vercel/og";
import {
  CAMBRIDGE_SHIELD_SVG,
  getCambridgeShieldImage,
  getCarouselLogoImage,
} from "./carousel-assets";
import type { CarouselSlide } from "./carousel-generator";
import { BRAND } from "./brand-theme";
import { FONT_INTER, getCarouselFonts } from "./og-fonts";

const WIDTH = 1080;
const HEIGHT = 1350;
const PAD_X = 52;
const FOOTER_H = 80;

// Use BRAND.crimson (#A51C30) to match Image 2 — deeper red
const RED = BRAND.crimson;       // #A51C30
const INK = "#0a0a0a";
const GREY = "#444444";
const GREY_LIGHT = "#666666";

const TYPE = {
  logoName: 34,
  logoTag: 13,
  partner: 15,
  pill: 15,
  kicker: 20,
  // All slides use the same large italic bold headline — consistent magazine feel
  coverHeadline: 88,
  tagline: 30,
  body: 22,
  pointTitle: 82,   // same scale as cover
  summaryTitle: 78,
  ctaTitle: 78,
  footer: 17,
} as const;

function sanitizeText(text: string): string {
  return text
    .replace(/₹/g, "Rs.")
    .replace(/[{}]/g, "")
    .replace(/[\n\r\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Fallback logo mark — only used when no logo image file is found */
function EduAbroadLogoMark() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          width: 56,
          height: 56,
          borderRadius: 12,
          background: RED,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 28 }}>🎓</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              color: INK,
              fontSize: TYPE.logoName,
              fontWeight: 800,
              fontFamily: FONT_INTER,
              letterSpacing: -0.8,
            }}
          >
            Edu
          </span>
          <span
            style={{
              color: RED,
              fontSize: TYPE.logoName,
              fontWeight: 800,
              fontStyle: "italic",
              fontFamily: FONT_INTER,
              letterSpacing: -0.8,
            }}
          >
            Abroad
          </span>
        </div>
        <span
          style={{
            color: GREY_LIGHT,
            fontSize: TYPE.logoTag,
            fontWeight: 500,
            fontFamily: FONT_INTER,
          }}
        >
          Run by Harvard-Cambridge Alumni
        </span>
      </div>
    </div>
  );
}

/**
 * Header — matches Image 2 exactly:
 * LEFT:  real logo image (or fallback mark)
 * RIGHT: "Official Cambridge" text (small), "Learning Partner" (bold) — then Cambridge shield beside it
 * No slide counter pill in Image 2 header area (pill removed or optional)
 */
function BrandHeader({
  logoImage,
  shieldImage,
}: {
  logoImage: string | null;
  shieldImage: string | null;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* LEFT: Logo */}
      {logoImage ? (
        <img
          src={logoImage}
          width={326}
          height={82}
          style={{ objectFit: "contain", objectPosition: "left center" }}
        />
      ) : (
        <EduAbroadLogoMark />
      )}

      {/* RIGHT: Cambridge partner block — text left of the real shield */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 1,
          }}
        >
          <span
            style={{
              color: GREY_LIGHT,
              fontSize: 14,
              fontWeight: 400,
              fontFamily: FONT_INTER,
              lineHeight: 1.2,
            }}
          >
            Official Cambridge
          </span>
          <span
            style={{
              color: INK,
              fontSize: 17,
              fontWeight: 700,
              fontFamily: FONT_INTER,
              lineHeight: 1.2,
            }}
          >
            Learning Partner
          </span>
        </div>
        <img
          src={shieldImage ?? CAMBRIDGE_SHIELD_SVG}
          width={48}
          height={52}
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
}

function HeaderRule() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: 3,
        background: RED,
        marginTop: 20,
        marginBottom: 0,
      }}
    />
  );
}

/**
 * Content block — Image 2 has NO red left border, content sits flush left.
 * Content is TOP-aligned directly below the header rule (no large spacer).
 */
function ContentBlock({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}

function BlackFooter({
  showSwipe,
  shieldImage,
}: {
  showSwipe?: boolean;
  shieldImage: string | null;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: WIDTH,
        height: FOOTER_H,
        background: INK,
        padding: `0 ${PAD_X}px`,
        marginLeft: -PAD_X,
        marginTop: "auto",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <img
          src={shieldImage ?? CAMBRIDGE_SHIELD_SVG}
          width={37}
          height={40}
          style={{ objectFit: "contain" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 13,
              fontWeight: 400,
              fontFamily: FONT_INTER,
            }}
          >
            In association with
          </span>
          <span
            style={{
              color: "#ffffff",
              fontSize: TYPE.footer,
              fontWeight: 800,
              fontFamily: FONT_INTER,
              letterSpacing: 1,
            }}
          >
            CAMBRIDGE
          </span>
        </div>
      </div>
      {showSwipe ? (
        <span
          style={{
            color: "#ffffff",
            fontSize: TYPE.footer + 1,
            fontWeight: 600,
            fontFamily: FONT_INTER,
          }}
        >
          Swipe →
        </span>
      ) : (
        <span
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 15,
            fontWeight: 400,
            fontFamily: FONT_INTER,
          }}
        >
          app.goeduabroad.com
        </span>
      )}
    </div>
  );
}

function PageShell({
  children,
  logoImage,
  shieldImage,
  showSwipe,
}: {
  children: ReactNode;
  logoImage: string | null;
  shieldImage: string | null;
  showSwipe?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        padding: `44px ${PAD_X}px 0`,
        fontFamily: FONT_INTER,
      }}
    >
      <BrandHeader logoImage={logoImage} shieldImage={shieldImage} />
      <HeaderRule />
      {/* Flex-1 wrapper centers content vertically in remaining space */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          paddingBottom: 40,
        }}
      >
        {children}
      </div>
      <BlackFooter showSwipe={showSwipe} shieldImage={shieldImage} />
    </div>
  );
}

function TopicLabel({ children }: { children: string }) {
  return (
    <span
      style={{
        color: RED,
        fontSize: TYPE.kicker,
        fontWeight: 800,
        fontFamily: FONT_INTER,
        letterSpacing: 3,
        textTransform: "uppercase",
      }}
    >
      {/* Image 2 uses · (middle dot) not • (bullet) */}
      {children.replace(/•/g, "·")}
    </span>
  );
}

/**
 * Cover headline — Image 2 style:
 * ALL text is italic bold. The "highlight" phrase renders in RED italic bold,
 * before/after parts render in BLACK italic bold. Same weight/style, just color differs.
 */
function splitCoverHeadline(title: string, highlight: string) {
  if (!highlight) return { before: title, highlight: "", after: "" };
  const idx = title.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx >= 0) {
    return {
      before: title.slice(0, idx).replace(/\s*[,;:]\s*$/, "").trim(),
      highlight,
      after: title.slice(idx + highlight.length).replace(/^[,;:\s]+/, "").trim(),
    };
  }
  return { before: title, highlight, after: "" };
}

function CoverHeadline({
  title,
  highlight,
}: {
  title: string;
  highlight: string;
}) {
  const { before, highlight: red, after } = splitCoverHeadline(title, highlight);

  // Shared style for all headline parts — all italic extrabold, only color differs
  const baseStyle = {
    fontWeight: 800 as const,
    fontStyle: "italic" as const,
    fontFamily: FONT_INTER,
    lineHeight: 1.05,
    letterSpacing: -2.5,
    fontSize: TYPE.coverHeadline,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        width: "100%",
      }}
    >
      {before ? (
        <span style={{ ...baseStyle, color: INK }}>{before}:</span>
      ) : null}
      {red ? (
        <span style={{ ...baseStyle, color: RED }}>{red}</span>
      ) : null}
      {after ? (
        <span style={{ ...baseStyle, color: INK }}>{after}</span>
      ) : null}
    </div>
  );
}

function CoverSlide({
  slide,
  logoImage,
  shieldImage,
}: {
  slide: CarouselSlide;
  logoImage: string | null;
  shieldImage: string | null;
  category: string;
}) {
  const kicker = sanitizeText(slide.kicker ?? "SATURDAY · MASTERS FOCUS");
  const highlight = slide.highlight ? sanitizeText(slide.highlight) : "";
  const title = sanitizeText(slide.title);
  const tagline = slide.tagline ? sanitizeText(slide.tagline) : "";
  const detail = slide.subtitle ? sanitizeText(slide.subtitle) : "";

  return (
    <PageShell logoImage={logoImage} shieldImage={shieldImage} showSwipe>
      <ContentBlock>
        <TopicLabel>{kicker}</TopicLabel>
        <CoverHeadline title={title} highlight={highlight} />
        {tagline ? (
          <span
            style={{
              color: INK,
              fontSize: TYPE.tagline,
              fontWeight: 700,
              fontFamily: FONT_INTER,
              lineHeight: 1.3,
            }}
          >
            {tagline}
          </span>
        ) : null}
        {detail ? (
          <span
            style={{
              color: GREY,
              fontSize: TYPE.body,
              fontWeight: 400,
              fontFamily: FONT_INTER,
              lineHeight: 1.45,
            }}
          >
            {detail}
          </span>
        ) : null}
      </ContentBlock>
    </PageShell>
  );
}

/**
 * Insight headline for point/summary slides — italic bold, color split on highlight
 */
function InsightHeadline({
  title,
  highlight,
  size,
}: {
  title: string;
  highlight?: string;
  size: number;
}) {
  const h = highlight ? sanitizeText(highlight) : "";

  const baseStyle = {
    fontWeight: 800 as const,
    fontStyle: "italic" as const,
    fontFamily: FONT_INTER,
    lineHeight: 1.1,
    letterSpacing: -1.5,
    fontSize: size,
  };

  if (!h) {
    return <span style={{ ...baseStyle, color: INK }}>{title}</span>;
  }

  const { before, highlight: red, after } = splitCoverHeadline(title, h);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {before ? <span style={{ ...baseStyle, color: INK }}>{before}</span> : null}
      {red ? <span style={{ ...baseStyle, color: RED }}>{red}</span> : null}
      {after ? <span style={{ ...baseStyle, color: INK }}>{after}</span> : null}
    </div>
  );
}

/**
 * LargeHeadline — same scale/style as cover for ALL inner slides.
 * Italic bold, black text with optional red highlight phrase.
 */
function LargeHeadline({
  title,
  highlight,
  size,
}: {
  title: string;
  highlight: string;
  size: number;
}) {
  const baseStyle = {
    fontWeight: 800 as const,
    fontStyle: "italic" as const,
    fontFamily: FONT_INTER,
    lineHeight: 1.05,
    letterSpacing: -2,
  };

  if (!highlight) {
    return (
      <span style={{ ...baseStyle, fontSize: size, color: INK }}>{title}</span>
    );
  }

  const { before, highlight: red, after } = splitCoverHeadline(title, highlight);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {before ? (
        <span style={{ ...baseStyle, fontSize: size, color: INK }}>{before}</span>
      ) : null}
      {red ? (
        <span style={{ ...baseStyle, fontSize: size + 4, color: RED }}>{red}</span>
      ) : null}
      {after ? (
        <span style={{ ...baseStyle, fontSize: size, color: INK }}>{after}</span>
      ) : null}
    </div>
  );
}

function PointSlide({
  slide,
  logoImage,
  shieldImage,
}: {
  slide: CarouselSlide;
  logoImage: string | null;
  shieldImage: string | null;
  category: string;
}) {
  const kicker = sanitizeText(slide.kicker ?? "KEY · INSIGHT");
  const title = sanitizeText(slide.title);
  const highlight = slide.highlight ? sanitizeText(slide.highlight) : "";
  const body = slide.subtitle ? sanitizeText(slide.subtitle) : "";

  return (
    <PageShell logoImage={logoImage} shieldImage={shieldImage}>
      <ContentBlock>
        <TopicLabel>{kicker}</TopicLabel>
        <LargeHeadline title={title} highlight={highlight} size={TYPE.pointTitle} />
        {body ? (
          <span
            style={{
              color: GREY,
              fontSize: TYPE.body,
              fontWeight: 500,
              fontFamily: FONT_INTER,
              lineHeight: 1.45,
            }}
          >
            {body}
          </span>
        ) : null}
      </ContentBlock>
    </PageShell>
  );
}

function SummarySlide({
  slide,
  logoImage,
  shieldImage,
}: {
  slide: CarouselSlide;
  logoImage: string | null;
  shieldImage: string | null;
  category: string;
}) {
  const kicker = sanitizeText(slide.kicker ?? "SUMMARY · BREAKDOWN");
  const title = sanitizeText(slide.title);
  const highlight = slide.highlight ? sanitizeText(slide.highlight) : "";
  const subtitle = slide.subtitle ? sanitizeText(slide.subtitle) : "";

  return (
    <PageShell logoImage={logoImage} shieldImage={shieldImage}>
      <ContentBlock>
        <TopicLabel>{kicker}</TopicLabel>
        <LargeHeadline title={title} highlight={highlight} size={TYPE.summaryTitle} />
        {subtitle ? (
          <span
            style={{
              color: GREY,
              fontSize: TYPE.body,
              fontWeight: 500,
              fontFamily: FONT_INTER,
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </span>
        ) : null}
      </ContentBlock>
    </PageShell>
  );
}

function CtaSlide({
  slide,
  logoImage,
  shieldImage,
}: {
  slide: CarouselSlide;
  logoImage: string | null;
  shieldImage: string | null;
  category: string;
}) {
  const kicker = sanitizeText(slide.kicker ?? "YOUR · NEXT STEP");
  const title = sanitizeText(slide.title);
  const subtitle = slide.subtitle ? sanitizeText(slide.subtitle) : "";

  return (
    <PageShell logoImage={logoImage} shieldImage={shieldImage}>
      <ContentBlock>
        <TopicLabel>{kicker}</TopicLabel>
        <LargeHeadline title={title} highlight="" size={TYPE.ctaTitle} />
        {subtitle ? (
          <span
            style={{
              color: GREY,
              fontSize: TYPE.body,
              fontWeight: 500,
              fontFamily: FONT_INTER,
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </span>
        ) : null}
      </ContentBlock>
    </PageShell>
  );
}

function SlideLayout({
  slide,
  category,
  logoImage,
  shieldImage,
}: {
  slide: CarouselSlide;
  category: string;
  logoImage: string | null;
  shieldImage: string | null;
}) {
  if (slide.type === "cover") {
    return (
      <CoverSlide
        slide={slide}
        category={category}
        logoImage={logoImage}
        shieldImage={shieldImage}
      />
    );
  }
  if (slide.type === "summary") {
    return (
      <SummarySlide
        slide={slide}
        category={category}
        logoImage={logoImage}
        shieldImage={shieldImage}
      />
    );
  }
  if (slide.type === "cta") {
    return (
      <CtaSlide
        slide={slide}
        category={category}
        logoImage={logoImage}
        shieldImage={shieldImage}
      />
    );
  }
  return (
    <PointSlide
      slide={slide}
      category={category}
      logoImage={logoImage}
      shieldImage={shieldImage}
    />
  );
}

export async function renderCarouselSlidePng(
  slide: CarouselSlide,
  category: string,
): Promise<ArrayBuffer> {
  const [fonts, logoImage, shieldImage] = await Promise.all([
    getCarouselFonts(),
    getCarouselLogoImage(),
    getCambridgeShieldImage(),
  ]);

  const response = new ImageResponse(
    <SlideLayout
      slide={slide}
      category={category}
      logoImage={logoImage}
      shieldImage={shieldImage}
    />,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    },
  );

  return response.arrayBuffer();
}