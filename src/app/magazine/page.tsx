import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import MagazineClient from "./MagazineClient";
import { LIST_COLUMNS, MagazinePost, SITE_URL } from "./magazine-utils";

// Rebuild the listing at most every 10 minutes so new articles appear without a deploy.
export const revalidate = 600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://inxxmyjxizswmtxumrop.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
);

const TITLE = "EduAbroad Magazine | Study Abroad News, Visa Tips & Scholarships for Indian Students";
const DESCRIPTION =
  "Daily study abroad news for Indian students: visa rule changes, scholarship deadlines, IELTS tips, country guides and real admit stories, from Harvard-Cambridge alumni counsellors.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "study abroad for Indian students",
    "study abroad news",
    "student visa updates",
    "scholarships for Indian students",
    "IELTS tips",
    "study in UK",
    "study in USA",
    "study in Canada",
    "study in Australia",
    "study in Germany",
  ],
  openGraph: {
    title: "EduAbroad Magazine | Study abroad, minus the noise",
    description: DESCRIPTION,
    type: "website",
    url: `${SITE_URL}/magazine`,
    siteName: "EduAbroad Magazine",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduAbroad Magazine",
    description: DESCRIPTION,
  },
  alternates: { canonical: `${SITE_URL}/magazine` },
  robots: { index: true, follow: true, "max-image-preview": "large" },
};

export default async function MagazinePage() {
  const { data } = await supabase
    .from("magazine_posts")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(120);

  const posts = (data as MagazinePost[] | null) || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "EduAbroad Magazine",
    description: DESCRIPTION,
    url: `${SITE_URL}/magazine`,
    publisher: {
      "@type": "Organization",
      name: "EduAbroad",
      url: "https://www.goeduabroad.com",
      logo: `${SITE_URL}/edulogo.png`,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.slice(0, 30).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/magazine/${p.slug}`,
        name: p.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <MagazineClient posts={posts} />
    </>
  );
}
