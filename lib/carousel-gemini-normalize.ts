/** Map varied Gemini JSON shapes into canonical carousel copy. */

export interface NormalizedCarouselCopy {
  cover: {
    kicker: string;
    headline: string;
    highlight: string;
    tagline: string;
    detail: string;
  };
  points: Array<{
    kicker?: string;
    title: string;
    highlight?: string;
    body?: string;
  }>;
  summary: {
    kicker?: string;
    title: string;
    subtitle: string;
    highlight?: string;
  };
  cta: { kicker?: string; title: string; subtitle: string };
  caption: string;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function pickString(
  obj: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback = "",
): string {
  if (!obj) return fallback;
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return fallback;
}

function stripInlineMarkup(text: string): string {
  return text
    .replace(/<\/?italicRed>/gi, "")
    .replace(/<\/?[^>]+>/g, "")
    .trim();
}

function normalizeCaption(raw: Record<string, unknown>): string {
  const direct = pickString(raw, [
    "caption",
    "instagram_caption",
    "instagramCaption",
  ]);
  if (direct) return direct;
  const nested = asRecord(raw.caption);
  return pickString(nested, ["text", "body", "content"]);
}

function fromSlidesArray(
  slides: unknown[],
  caption: string,
): NormalizedCarouselCopy | null {
  const records = slides.map(asRecord).filter(Boolean) as Record<
    string,
    unknown
  >[];
  if (!records.length) return null;

  const byType = (t: string) =>
    records.find((r) => String(r.type ?? "").toLowerCase() === t);

  const coverRec =
    byType("cover") ?? byType("hook") ?? byType("title") ?? records[0];

  const headline = stripInlineMarkup(
    pickString(coverRec, ["headline", "title", "heading"]),
  );
  if (!headline) return null;

  const cover = {
    kicker: pickString(coverRec, ["kicker", "topic_label", "label", "topic"]),
    headline,
    highlight: stripInlineMarkup(
      pickString(coverRec, ["highlight", "emphasis"]),
    ),
    tagline: pickString(coverRec, ["tagline", "subheadline", "subtitle"]),
    detail: pickString(coverRec, ["detail", "body", "description"]),
  };

  const points = records
    .filter((r) => {
      const t = String(r.type ?? "").toLowerCase();
      return t === "point" || t === "insight" || t === "key_point";
    })
    .map((r) => ({
      kicker: pickString(r, ["kicker", "topic_label", "label"]) || undefined,
      title: pickString(r, ["title", "headline", "heading"]),
      highlight: pickString(r, ["highlight", "emphasis"]) || undefined,
      body:
        pickString(r, ["body", "subtitle", "detail", "subtext"]) || undefined,
    }))
    .filter((p) => p.title);

  const summaryRec = byType("summary") ?? byType("comparison");
  const summary = {
    kicker: pickString(summaryRec, ["kicker", "topic_label"]) || undefined,
    title: pickString(summaryRec, ["title", "headline"]) || "The bottom line",
    subtitle: pickString(summaryRec, ["subtitle", "body", "detail"]),
    highlight: pickString(summaryRec, ["highlight"]) || undefined,
  };

  const ctaRec = byType("cta");
  const cta = {
    kicker: pickString(ctaRec, ["kicker", "topic_label"]) || undefined,
    title: pickString(ctaRec, ["title", "headline"]) || "Read the full guide",
    subtitle: pickString(ctaRec, ["subtitle", "body", "detail"]),
  };

  return { cover, points, summary, cta, caption };
}

function fromCanonicalObject(
  raw: Record<string, unknown>,
): NormalizedCarouselCopy | null {
  const coverRec = asRecord(raw.cover);
  if (!coverRec) return null;

  const headline = stripInlineMarkup(
    pickString(coverRec, ["headline", "title", "heading"]),
  );
  if (!headline) return null;

  const cover = {
    kicker: pickString(coverRec, ["kicker", "topic_label", "label"]),
    headline,
    highlight: stripInlineMarkup(
      pickString(coverRec, ["highlight", "emphasis"]),
    ),
    tagline: pickString(coverRec, ["tagline", "subheadline"]),
    detail: pickString(coverRec, ["detail", "body"]),
  };

  const pointsRaw = Array.isArray(raw.points) ? raw.points : [];
  const points: NormalizedCarouselCopy["points"] = pointsRaw.flatMap((p) => {
    const r = asRecord(p);
    if (!r) return [];

    const title = pickString(r, ["title", "headline", "heading"]);
    if (!title) return [];

    return [
      {
        kicker: pickString(r, ["kicker", "topic_label"]) || undefined,
        title,
        highlight: pickString(r, ["highlight", "emphasis"]) || undefined,
        body: pickString(r, ["body", "subtitle", "detail"]) || undefined,
      },
    ];
  });

  const summaryRec = asRecord(raw.summary);
  const summary = {
    kicker: pickString(summaryRec, ["kicker", "topic_label"]) || undefined,
    title: pickString(summaryRec, ["title", "headline"]) || "The bottom line",
    subtitle: pickString(summaryRec, ["subtitle", "body"]),
    highlight: pickString(summaryRec, ["highlight"]) || undefined,
  };

  const ctaRec = asRecord(raw.cta);
  const cta = {
    kicker: pickString(ctaRec, ["kicker", "topic_label"]) || undefined,
    title: pickString(ctaRec, ["title"]) || "Read the full guide",
    subtitle: pickString(ctaRec, ["subtitle", "body"]),
  };

  const caption = normalizeCaption(raw);
  return { cover, points, summary, cta, caption };
}

export function normalizeCarouselGeminiOutput(
  raw: unknown,
): NormalizedCarouselCopy | null {
  if (!raw) return null;

  if (Array.isArray(raw)) {
    return fromSlidesArray(raw, "");
  }

  const obj = asRecord(raw);
  if (!obj) return null;

  const caption = normalizeCaption(obj);

  if (Array.isArray(obj.slides)) {
    const fromSlides = fromSlidesArray(obj.slides, caption);
    if (fromSlides && !fromSlides.caption && caption) {
      fromSlides.caption = caption;
    }
    return fromSlides;
  }

  if (obj.cover) {
    const canonical = fromCanonicalObject(obj);
    if (canonical && !canonical.caption && caption) {
      canonical.caption = caption;
    }
    return canonical;
  }

  return null;
}

export function describeCarouselGeminiShape(raw: unknown): string {
  if (!raw) return "empty";
  if (Array.isArray(raw)) return `array[${raw.length}]`;
  const obj = asRecord(raw);
  if (!obj) return typeof raw;
  const keys = Object.keys(obj).join(",");
  const slides = Array.isArray(obj.slides) ? obj.slides.length : 0;
  const points = Array.isArray(obj.points) ? obj.points.length : 0;
  return `{${keys}} slides=${slides} points=${points}`;
}
