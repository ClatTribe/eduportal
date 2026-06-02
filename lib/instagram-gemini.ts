import { generateGeminiJson } from "./gemini";
import {
  CAROUSEL_POINT_SLIDES,
  CAROUSEL_SYSTEM_PROMPT,
  CAROUSEL_TOTAL_SLIDES,
  buildCarouselUserPrompt,
} from "./carousel-prompt";
import {
  describeCarouselGeminiShape,
  normalizeCarouselGeminiOutput,
  type NormalizedCarouselCopy,
} from "./carousel-gemini-normalize";
import {
  buildCarouselSlides,
  buildInstagramCaption,
  stripArticleText,
  type CarouselSlide,
  type MagazinePostForInstagram,
} from "./carousel-generator";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function buildKicker(category: string): string {
  const day = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();
  const topic = (category || "STUDY ABROAD").toUpperCase().slice(0, 24);
  return `${day} • ${topic}`;
}

function padPoints(
  points: NormalizedCarouselCopy["points"],
): NormalizedCarouselCopy["points"] {
  const out = points.slice(0, CAROUSEL_POINT_SLIDES);
  while (out.length < CAROUSEL_POINT_SLIDES) {
    out.push({
      title: "See the full breakdown in our magazine guide",
      body: "",
    });
  }
  return out;
}

function slidesFromGemini(
  output: NormalizedCarouselCopy,
  slug: string,
  category: string,
): CarouselSlide[] {
  const points = padPoints(output.points);

  let headline = truncate(output.cover.headline, 120);
  let highlight = truncate(output.cover.highlight, 48);
  if (highlight && !headline.toLowerCase().includes(highlight.toLowerCase())) {
    headline = truncate(`${headline.replace(/[.!?]\s*$/, "")}: ${highlight}`, 120);
  }

  const slides: CarouselSlide[] = [
    {
      type: "cover",
      kicker: truncate(output.cover.kicker || buildKicker(category), 48),
      title: headline,
      highlight,
      tagline: truncate(output.cover.tagline, 80),
      subtitle: truncate(output.cover.detail, 140),
      slideNumber: 1,
      totalSlides: CAROUSEL_TOTAL_SLIDES,
    },
  ];

  points.forEach((point, index) => {
    slides.push({
      type: "point",
      kicker: point.kicker ? truncate(point.kicker, 48) : undefined,
      title: truncate(point.title, 100),
      highlight: point.highlight ? truncate(point.highlight, 48) : undefined,
      subtitle: point.body ? truncate(point.body, 180) : undefined,
      slideNumber: index + 2,
      totalSlides: CAROUSEL_TOTAL_SLIDES,
    });
  });

  slides.push({
    type: "summary",
    kicker: output.summary.kicker
      ? truncate(output.summary.kicker, 48)
      : undefined,
    title: truncate(output.summary.title, 100),
    subtitle: truncate(output.summary.subtitle, 180),
    highlight: output.summary.highlight
      ? truncate(output.summary.highlight, 48)
      : undefined,
    slideNumber: 7,
    totalSlides: CAROUSEL_TOTAL_SLIDES,
  });

  slides.push({
    type: "cta",
    kicker: output.cta.kicker ? truncate(output.cta.kicker, 48) : undefined,
    title: truncate(output.cta.title, 80),
    subtitle: truncate(
      output.cta.subtitle || `app.goeduabroad.com/magazine/${slug}`,
      120,
    ),
    slideNumber: CAROUSEL_TOTAL_SLIDES,
    totalSlides: CAROUSEL_TOTAL_SLIDES,
  });

  return slides;
}

function isUsableCarouselCopy(
  output: NormalizedCarouselCopy | null,
): output is NormalizedCarouselCopy {
  return Boolean(
    output?.cover?.headline &&
      output.points.length >= 1 &&
      (output.caption || output.summary?.title),
  );
}

export async function buildCarouselContent(
  post: MagazinePostForInstagram,
): Promise<{ slides: CarouselSlide[]; caption: string; source: "gemini" | "fallback" }> {
  const articleText = stripArticleText(post.content, 7000);
  const url = `https://app.goeduabroad.com/magazine/${post.slug}`;
  const category = post.category || "Study Abroad";

  const userPrompt = buildCarouselUserPrompt({
    title: post.title,
    excerpt: post.excerpt,
    category,
    tags: post.tags,
    url,
    body: articleText,
  });

  const raw = await generateGeminiJson<unknown>(
    CAROUSEL_SYSTEM_PROMPT,
    userPrompt,
    { maxOutputTokens: 8192 },
  );

  const geminiOutput = normalizeCarouselGeminiOutput(raw);

  if (isUsableCarouselCopy(geminiOutput)) {
    const caption =
      geminiOutput.caption.trim() || buildInstagramCaption(post);
    return {
      slides: slidesFromGemini(geminiOutput, post.slug, category),
      caption: truncate(caption, 2200),
      source: "gemini",
    };
  }

  if (!raw) {
    console.warn(
      "Gemini carousel: no response (check GEMINI_API_KEY, quota, or network)",
    );
  } else {
    console.warn(
      `Gemini carousel: could not parse copy (${describeCarouselGeminiShape(raw)}) — using HTML fallback`,
    );
  }

  const fallbackSlides = buildCarouselSlides(post);
  if (fallbackSlides[0]?.type === "cover") {
    fallbackSlides[0].kicker = buildKicker(category);
    fallbackSlides[0].highlight = truncate(
      post.title.split(" ").slice(0, 3).join(" "),
      40,
    );
    fallbackSlides[0].tagline = truncate(post.excerpt || "", 80);
  }
  return {
    slides: fallbackSlides,
    caption: buildInstagramCaption(post),
    source: "fallback",
  };
}
