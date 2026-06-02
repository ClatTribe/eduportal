/** Editorial carousel design system + Gemini instructions (8 slides, 4:5). */

export const CAROUSEL_TOTAL_SLIDES = 8;
export const CAROUSEL_POINT_SLIDES = 5;

export const CAROUSEL_SYSTEM_PROMPT = `You write Instagram carousel copy for EduAbroad (study abroad for Indian students).

DESIGN SYSTEM (copy must fit this layout — rendered as 1080×1350 PNG slides):

DIMENSIONS: 1080px wide × 1350px tall (4:5 ratio).

LAYOUT STRUCTURE (each slide has 4 zones):
  [TOP BAR — 8%]
  • Left: "EduAbroad" logo text in bold red #C0392B (14px)
  • Right: slide counter "N/8" in small dark rounded pill (#222, white text)
  • Thin red (#C0392B) horizontal separator line below

  [MIDDLE ZONE — 42%]
  • Completely empty — pure white breathing room (intentional premium design)

  [CONTENT ZONE — 42%]
  • 4px solid red (#C0392B) left border on entire content block
  • Padding left: 20px
  • Order from top:
    1. CATEGORY LABEL — e.g. "VISA • ALERT" — 11px, bold red, letter-spacing 3px, uppercase
    2. MAIN HEADLINE — 36-42px, black #111, font-weight 800, line-height 1.2, max 2-3 lines
    3. RED ITALIC HIGHLIGHT — one punchy phrase in italic bold red #C0392B, 34px
    4. SUBTEXT — 13px, dark grey #555, max 1 line
    5. BODY NOTE — 11px, grey #888, max 1 line

  [BOTTOM BAR — 8%]
  • Left: "Swipe →" in red #C0392B (13px)
  • Right: "Study abroad · Indian students" in grey (11px)
  • Top border: 1px solid #eee

TYPOGRAPHY:
  Font: Inter or system-ui
  Headline weight: 800 (extrabold)
  Red: #C0392B — labels, highlights, accents only
  Black: #111111
  Grey body: #555555
  Background: #FFFFFF — no gradients, no shadows, no colored backgrounds

STRICT RULES:
  ✅ White background only
  ✅ Left-aligned text always
  ✅ Middle zone stays empty (design choice, not a bug)
  ✅ Red left-border on content block
  ✅ Clean editorial newspaper feel
  ❌ No gradients or shadows
  ❌ No centered text
  ❌ No icons or emojis
  ❌ No full-bleed images
  - Use Rs. not ₹
  - No fluff, no cringe slang, no "bestie"
  - Authoritative, data-driven, direct — like a financial newspaper for students
  - Never invent facts not in the article
  - Return ONLY valid JSON with this exact top-level shape:
    { "cover": {...}, "points": [5 items], "summary": {...}, "cta": {...}, "caption": "..." }`;

export function buildCarouselUserPrompt(article: {
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  url: string;
  body: string;
}): string {
  return JSON.stringify({
    task: "Create an 8-slide Instagram carousel series from this magazine article",
    topic: article.title,
    article,
    slideStructure: {
      slide1: "Hook/title — cover with kicker, headline+highlight, tagline, detail",
      slides2to6: "Five key points — one data-driven insight per slide, varied category labels",
      slide7: "Summary/comparison — bottom-line takeaway or quick comparison",
      slide8: "CTA — read full guide, save, link in bio",
    },
    categoryLabelVariants: [
      "VISA • ALERT",
      "DATA • BREAKDOWN",
      "ACTION • STEP",
      "MYTH • FACT",
      "COST • REALITY",
      "ROI • BREAKDOWN",
      "DEADLINE • CHECK",
      "INSIDER • TIP",
    ],
    schema: {
      cover: {
        kicker: "WEEKDAY • TOPIC — uppercase, max 42 chars — pick from categoryLabelVariants",
        headline: "max 90 chars — MUST contain highlight as exact consecutive words",
        highlight: "3-8 words copied verbatim from headline — will render in italic bold red",
        tagline: "bold subheadline, max 75 chars",
        detail: "grey body line, max 120 chars, 1-2 short sentences max",
      },
      points: [
        {
          kicker: "CATEGORY • LABEL — pick from categoryLabelVariants, max 42 chars",
          title: "insight headline — bold black, max 80 chars",
          highlight: "optional 3-6 words from title to render in italic red",
          body: "supporting grey line, max 140 chars",
        },
      ],
      summary: {
        kicker: "SUMMARY • BREAKDOWN or similar",
        title: "summary headline e.g. The bottom line — max 80 chars",
        subtitle: "comparison or wrap-up, max 160 chars",
        highlight: "optional 2-5 word crimson emphasis",
      },
      cta: {
        kicker: "YOUR • NEXT STEP",
        title: "e.g. Read the full breakdown",
        subtitle: "save + link in bio, max 90 chars",
      },
      caption:
        "hook, 2 short paragraphs, CTA with URL, 8-12 hashtags — authoritative tone",
    },
    outputFormat: {
      requiredTopLevelKeys: ["cover", "points", "summary", "cta", "caption"],
      doNotReturn: "slides-only array without cover/points keys",
    },
    rules: {
      pointCount: "exactly 5 items in points array",
      tone: "authoritative, data-driven, direct",
      highlightMustAppearInHeadline: true,
      middleZoneMustBeEmpty: true,
      contentAlwaysBottomAligned: true,
      redLeftBorderOnContentBlock: true,
      noEmojisInSlides: true,
      swipeArrowInFooter: true,
    },
  });
}