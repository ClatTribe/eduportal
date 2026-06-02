/** Cached fonts for @vercel/og (Satori ignores fontWeight without embedded fonts). */

import { readFile } from "fs/promises";
import path from "path";

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style: "normal" | "italic";
};

let cache: OgFont[] | null = null;

const FONT_DIR = path.join(
  process.cwd(),
  "node_modules",
  "@fontsource",
  "inter",
  "files",
);

/** Satori/@vercel/og supports TTF/WOFF, not WOFF2 (signature wOF2). */
const INTER_FILES = {
  bold: "inter-latin-700-normal.woff",
  extraBold: "inter-latin-800-normal.woff",
  extraBoldItalic: "inter-latin-800-italic.woff",
} as const;

async function loadLocalFont(
  filename: string,
  weight: OgFont["weight"],
  style: OgFont["style"],
): Promise<OgFont> {
  const filePath = path.join(FONT_DIR, filename);
  let buf: Buffer;
  try {
    buf = await readFile(filePath);
  } catch {
    throw new Error(
      `Font file missing: ${filePath}. Run npm install @fontsource/inter`,
    );
  }
  const data = buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;
  return { name: "Inter", data, weight, style };
}

export async function getCarouselFonts(): Promise<OgFont[]> {
  if (cache) return cache;
  const [bold, extraBold, extraBoldItalic] = await Promise.all([
    loadLocalFont(INTER_FILES.bold, 700, "normal"),
    loadLocalFont(INTER_FILES.extraBold, 800, "normal"),
    loadLocalFont(INTER_FILES.extraBoldItalic, 800, "italic"),
  ]);
  cache = [bold, extraBold, extraBoldItalic];
  return cache;
}

export const FONT_INTER = "Inter";
