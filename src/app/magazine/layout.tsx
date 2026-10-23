import { Bricolage_Grotesque, Inter } from "next/font/google";
import Link from "next/link";
import "./magazine.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700", "800"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const NAV = [
  { href: "/magazine", label: "Magazine" },
  { href: "/course-finder", label: "Course Finder" },
  { href: "/scholarship-finder", label: "Scholarships" },
  { href: "/ielts-online-test-kit", label: "IELTS Kit" },
];

// Public shell for the magazine: no login gate, so the article HTML is rendered on the
// server and readable by Google. Logged-in users reach their dashboard from the header.
export default function MagazineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`mag ${display.variable} ${body.variable} min-h-screen bg-[#FAF8F4] text-[#0E0E10]`}>
      <header className="sticky top-0 z-40 border-b border-[#0E0E10]/10 bg-[#FAF8F4]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/magazine" className="flex items-center gap-2.5" aria-label="EduAbroad Magazine home">
            <img src="/edulogo-clean.png" alt="EduAbroad" className="h-8 w-auto" />
            <span className="font-display hidden rounded-full bg-[#0E0E10] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#D9F99D] sm:inline">
              Mag
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-[#0E0E10]/70 transition-colors hover:bg-[#0E0E10]/5 hover:text-[#0E0E10]"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/sam-ai"
              className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-[#0E0E10]/70 hover:text-[#0E0E10] sm:inline"
            >
              Dashboard
            </Link>
            <a
              href="#lead-form"
              className="rounded-full bg-[#A51C30] px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              Free roadmap
            </a>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-20 bg-[#0E0E10] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl font-bold leading-tight">
              Study abroad,
              <br />
              <span className="text-[#D9F99D]">minus the noise.</span>
            </p>
            <p className="mt-3 max-w-sm text-sm text-white/50">
              EduAbroad Magazine is written by Harvard-Cambridge and IIM alumni counsellors for Indian students planning to study abroad.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">Explore</p>
            <ul className="space-y-2 text-sm text-white/70">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-white">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">Talk to us</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="tel:+919044442989" className="hover:text-white">
                  +91 90444 42989
                </a>
              </li>
              <li>
                <a href="https://wa.me/919044442989" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WhatsApp us
                </a>
              </li>
              <li>Lucknow · Delhi · Kanpur · Indore</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-white/30">
          © {new Date().getFullYear()} EduAbroad. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
