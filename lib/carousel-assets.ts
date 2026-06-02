import { access, readFile } from "fs/promises";
import path from "path";

let carouselLogoDataUrl: string | null = null;

/** Transparent / white-bg horizontal logo only (never the black marketing banner). */
export async function getCarouselLogoImage(): Promise<string | null> {
  const filePath = path.join(process.cwd(), "public", "edulogo.png");
  try {
    await access(filePath);
  } catch {
    return null;
  }

  if (!carouselLogoDataUrl) {
    const buf = await readFile(filePath);
    carouselLogoDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  }
  return carouselLogoDataUrl;
}

/** Simple Cambridge shield for partner row (Satori-safe inline SVG). */
export const CAMBRIDGE_SHIELD_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="4" fill="#8B0000"/>
      <path fill="#fff" d="M16 6l-8 4v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11v-6l-8-4z"/>
      <path fill="#D4AF37" d="M16 8l-6 3v5c0 4 2.5 7.5 6 9 3.5-1.5 6-5 6-9v-5l-6-3z"/>
    </svg>`,
  );
