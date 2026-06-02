import {
  CAROUSEL_POINT_SLIDES,
  CAROUSEL_TOTAL_SLIDES,
} from "./carousel-prompt";

export interface CarouselSlide {
  type: "cover" | "point" | "summary" | "cta";
  title: string;
  subtitle?: string;
  /** Cover: e.g. "SATURDAY • VISA FOCUS" */
  kicker?: string;
  /** Cover / summary: phrase in italic red */
  highlight?: string;
  /** Cover: bold secondary line */
  tagline?: string;
  slideNumber?: number;
  totalSlides?: number;
}

export interface MagazinePostForInstagram {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
}

const MAX_POINT_SLIDES = CAROUSEL_POINT_SLIDES;

export function stripArticleText(html: string, maxLength = 7000): string {
  return truncate(stripHtml(html), maxLength);
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function extractSections(html: string): { heading: string; body: string }[] {
  const sections: { heading: string; body: string }[] = [];
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const matches: { heading: string; endOfTag: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = h2Regex.exec(html)) !== null) {
    matches.push({
      heading: stripHtml(match[1]),
      endOfTag: match.index + match[0].length,
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].endOfTag;
    const end =
      i + 1 < matches.length
        ? html.indexOf("<h2", start)
        : html.length;
    const chunk = html.slice(start, end === -1 ? html.length : end);
    const body = truncate(stripHtml(chunk), 220);
    if (matches[i].heading) {
      sections.push({ heading: matches[i].heading, body });
    }
  }

  return sections;
}

function extractBulletPoints(html: string): string[] {
  const bullets: string[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;

  while ((match = liRegex.exec(html)) !== null) {
    const text = truncate(stripHtml(match[1]), 180);
    if (text.length > 20) bullets.push(text);
  }

  return bullets;
}

export function buildCarouselSlides(
  post: MagazinePostForInstagram,
): CarouselSlide[] {
  const sections = extractSections(post.content);
  const bullets = extractBulletPoints(post.content);

  const day = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();
  const topic = (post.category || "STUDY ABROAD").toUpperCase().slice(0, 20);

  const slides: CarouselSlide[] = [
    {
      type: "cover",
      kicker: `${day} • ${topic}`,
      title: truncate(post.title, 80),
      highlight: truncate(post.title.split(" ").slice(0, 4).join(" "), 40),
      tagline: truncate(post.excerpt || "Study abroad insights", 80),
      subtitle: truncate(post.excerpt || stripHtml(post.content), 120),
      slideNumber: 1,
      totalSlides: CAROUSEL_TOTAL_SLIDES,
    },
  ];

  const pointSources: { title: string; subtitle?: string }[] = [];

  for (const section of sections) {
    if (pointSources.length >= MAX_POINT_SLIDES) break;
    pointSources.push({
      title: truncate(section.heading, 100),
      subtitle: section.body || undefined,
    });
  }

  if (pointSources.length < MAX_POINT_SLIDES) {
    for (const bullet of bullets) {
      if (pointSources.length >= MAX_POINT_SLIDES) break;
      if (!pointSources.some((p) => p.title === bullet)) {
        pointSources.push({ title: bullet });
      }
    }
  }

  if (pointSources.length === 0) {
    const plain = truncate(stripHtml(post.content), 600);
    const chunks = plain.match(/[^.!?]+[.!?]+/g) || [plain];
    for (const chunk of chunks.slice(0, MAX_POINT_SLIDES)) {
      pointSources.push({ title: truncate(chunk.trim(), 180) });
    }
  }

  while (pointSources.length < MAX_POINT_SLIDES) {
    const n = pointSources.length + 1;
    pointSources.push({
      title: truncate(post.excerpt || `Key insight ${n}`, 100),
      subtitle: undefined,
    });
  }

  const points = pointSources.slice(0, MAX_POINT_SLIDES);
  points.forEach((point, index) => {
    slides.push({
      type: "point",
      title: point.title,
      subtitle: point.subtitle,
      slideNumber: index + 2,
      totalSlides: CAROUSEL_TOTAL_SLIDES,
    });
  });

  slides.push({
    type: "summary",
    title: "The bottom line",
    subtitle: truncate(
      post.excerpt || points.map((p) => p.title).join(" · "),
      160,
    ),
    slideNumber: 7,
    totalSlides: CAROUSEL_TOTAL_SLIDES,
  });

  slides.push({
    type: "cta",
    title: "Read the full article",
    subtitle: `app.goeduabroad.com/magazine/${post.slug}`,
    slideNumber: CAROUSEL_TOTAL_SLIDES,
    totalSlides: CAROUSEL_TOTAL_SLIDES,
  });

  return slides;
}

export function buildInstagramCaption(post: MagazinePostForInstagram): string {
  const url = `https://app.goeduabroad.com/magazine/${post.slug}`;
  const hashtags = [
    "studyabroad",
    "indianstudents",
    "eduabroad",
    ...(post.tags || []).slice(0, 8).map((t) =>
      t
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 30),
    ),
  ]
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
    .join(" ");

  const lines = [
    post.title,
    "",
    post.excerpt || "",
    "",
    "Swipe for key takeaways 👉",
    "",
    `🔗 Full guide: ${url}`,
    "",
    hashtags,
  ];

  return truncate(lines.join("\n"), 2200);
}
