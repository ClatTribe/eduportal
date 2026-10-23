// Shared helpers for the magazine. Safe to import from server and client code.

export interface MagazinePost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  cover_image_url: string | null;
  category: string;
  tags: string[] | null;
  read_time: number;
  author: string;
  published_at: string;
  updated_at?: string | null;
  is_featured: boolean;
  status?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
}

export const SITE_URL = "https://app.goeduabroad.com";

export const LIST_COLUMNS =
  "id, title, slug, excerpt, cover_image_url, category, tags, read_time, author, published_at, is_featured";

export const CATEGORIES: { name: string; emoji: string }[] = [
  { name: "All", emoji: "✨" },
  { name: "Country Guide", emoji: "🌍" },
  { name: "Visa Tips", emoji: "🛂" },
  { name: "Scholarships", emoji: "💸" },
  { name: "IELTS/TOEFL", emoji: "📝" },
  { name: "Student Life", emoji: "🎒" },
  { name: "Rankings", emoji: "🏆" },
  { name: "Career After", emoji: "💼" },
  { name: "Admit Stories", emoji: "🎉" },
  { name: "News", emoji: "📰" },
];

// One brand style for every category, matching app.goeduabroad.com (brand red #A51C30 + rose tints).
const BRAND_STYLE = {
  sticker: "bg-[#FEF2F3] text-[#A51C30] border border-[#FECDD3]",
  cover: "from-[#7A1524] via-[#A51C30] to-[#E0314B]",
};

export function categoryStyle(_category: string) {
  return BRAND_STYLE;
}

export function categoryEmoji(category: string) {
  return CATEGORIES.find((c) => c.name === category)?.emoji || "✨";
}

export function relativeDate(dateString: string): string {
  const date = new Date(dateString);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function longDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripTags(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cleans CMS HTML, adds ids to h2/h3, demotes stray h1s (the page owns the only h1),
 * makes external links safe and images lazy, and wraps tables for mobile scrolling.
 */
export function processContent(raw: string, title = ""): { html: string; toc: TOCItem[] } {
  const toc: TOCItem[] = [];
  const used = new Set<string>();

  let html = (raw || "").trim();
  // Many CMS bodies repeat the title as their first heading; the page already renders it as the h1.
  const lead = html.match(/^(?:<p>\s*<\/p>\s*)*<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
  if (lead && title && stripTags(lead[1]).toLowerCase() === title.trim().toLowerCase()) {
    html = html.slice(lead[0].length);
  }

  html = html
    .replace(/\s*style="[^"]*"/gi, "")
    .replace(/\s*(cellpadding|cellspacing|border)="[^"]*"/gi, "")
    .replace(/<h1(\s[^>]*)?>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>");

  html = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_m, level, attrs: string, inner: string) => {
    const text = stripTags(inner);
    const existing = attrs.match(/id="([^"]+)"/)?.[1];
    let id = existing || slugify(text) || `section-${toc.length + 1}`;
    while (used.has(id)) id = `${id}-2`;
    used.add(id);
    toc.push({ id, text, level: Number(level) });
    const cleanAttrs = attrs.replace(/\s*id="[^"]*"/, "");
    return `<h${level} id="${id}"${cleanAttrs}>${inner}</h${level}>`;
  });

  html = html
    .replace(/<a\s+([^>]*href="https?:\/\/(?!app\.goeduabroad\.com|www\.goeduabroad\.com|goeduabroad\.com)[^"]*"[^>]*)>/gi, (m, attrs: string) =>
      attrs.includes("target=") ? m : `<a ${attrs} target="_blank" rel="noopener">`,
    )
    .replace(/<img(?![^>]*loading=)/gi, '<img loading="lazy" decoding="async"')
    .replace(/<table/gi, '<div class="table-wrap"><table')
    .replace(/<\/table>/gi, "</table></div>");

  return { html, toc };
}

/**
 * Splits the article so an inline lead card can sit mid-article:
 * just before the 3rd h2 (or the 2nd if the article is short). Returns [html] when there is no good split.
 */
export function splitForInlineCta(html: string): [string, string] | [string] {
  const positions: number[] = [];
  const re = /<h2[\s>]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) positions.push(m.index);
  const at = positions.length >= 4 ? positions[2] : positions.length >= 2 ? positions[1] : -1;
  if (at <= 0) return [html];
  return [html.slice(0, at), html.slice(at)];
}

/** Pulls Q&A pairs from an FAQ section (h2 containing "FAQ"/"Frequently asked", then h3 question + following text). */
export function extractFaqs(html: string): { q: string; a: string }[] {
  const start = html.search(/<h2[^>]*>[^<]*(faq|frequently asked)/i);
  if (start < 0) return [];
  const rest = html.slice(start);
  const nextH2 = rest.slice(5).search(/<h2[\s>]/i);
  const section = nextH2 >= 0 ? rest.slice(0, nextH2 + 5) : rest;

  const faqs: { q: string; a: string }[] = [];
  const parts = section.split(/<h3[^>]*>/i).slice(1);
  for (const part of parts) {
    const [qHtml, aHtml = ""] = part.split(/<\/h3>/i);
    const q = stripTags(qHtml);
    const a = stripTags(aHtml);
    if (q && a) faqs.push({ q, a: a.slice(0, 1000) });
  }
  return faqs.slice(0, 10);
}

export function wordCount(html: string) {
  return stripTags(html).split(" ").filter(Boolean).length;
}
