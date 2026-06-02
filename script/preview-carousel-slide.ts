/**
 * Preview one carousel slide PNG (cover) locally.
 * Usage: npx tsx script/preview-carousel-slide.ts
 */
import { writeFileSync } from "fs";
import { buildCarouselSlides } from "../lib/carousel-generator";
import { renderCarouselSlidePng } from "../lib/carousel-images";

async function main() {
  const slide = buildCarouselSlides({
    id: 0,
    title: "Masters in Ireland: Stay 2 years after you graduate",
    slug: "preview",
    excerpt: "Europe's English-speaking tech hub",
    content: "<p>Tuition, stay-back and work rights — explained</p>",
    category: "Masters Focus",
    tags: [],
  })[0];

  if (slide.type === "cover") {
    slide.kicker = "SATURDAY • MASTERS FOCUS";
    slide.title = "Masters in Ireland: Stay 2 years after you graduate";
    slide.highlight = "Stay 2 years";
    slide.tagline = "Europe's English-speaking tech hub";
    slide.subtitle = "Tuition, stay-back and work rights — explained";
  }

  const png = await renderCarouselSlidePng(slide, "Masters Focus");
  writeFileSync("carousel-preview-cover.png", Buffer.from(png));
  console.log("Wrote carousel-preview-cover.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
