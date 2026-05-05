import { Metadata } from "next";
import MagazineClient from "./MagazineClient";

export const metadata: Metadata = {
  title: "EduAbroad Magazine | Study Abroad News, Visa Tips & Scholarships",
  description:
    "Daily study abroad insights for Indian students. Get the latest visa updates, scholarship deadlines, IELTS tips, country guides, and student stories from EduAbroad.",
  keywords:
    "study abroad, Indian students, visa tips, scholarships, IELTS, TOEFL, Canada, USA, UK, Australia, Germany, university rankings, student life",
  openGraph: {
    title: "EduAbroad Magazine | Study Abroad News & Guides",
    description:
      "Daily study abroad insights for Indian students. Visa updates, scholarship deadlines, IELTS tips, and more.",
    type: "website",
    url: "https://app.goeduabroad.com/magazine",
    siteName: "EduAbroad Magazine",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduAbroad Magazine",
    description:
      "Daily study abroad insights for Indian students. Visa updates, scholarships, IELTS tips & more.",
  },
  alternates: {
    canonical: "https://app.goeduabroad.com/magazine",
  },
};

export default function MagazinePage() {
  return <MagazineClient />;
}
