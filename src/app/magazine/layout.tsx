import Link from "next/link";
import "./magazine.css";

const NAV = [
  { href: "/magazine", label: "Magazine" },
  { href: "/course-finder", label: "Course Finder" },
  { href: "/scholarship-finder", label: "Scholarships" },
  { href: "/ielts-online-test-kit", label: "IELTS Online Test Kit" },
];

// Public shell for the magazine: no login gate, so article HTML is rendered on the server
// and readable by Google. Header and colours mirror the app.goeduabroad.com homepage.
export default function MagazineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mag min-h-screen bg-white text-[#0F172A]">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="EduAbroad home">
            <img src="/edulogo-clean.png" alt="EduAbroad" className="h-9 w-auto" />
            <span className="hidden rounded-full bg-gradient-to-r from-[#A51C30] to-[#E0314B] px-3 py-1 text-xs font-bold text-white sm:inline-block">
              BETA
            </span>
          </Link>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-[15px] text-slate-600 transition-colors hover:text-[#A51C30]">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/sam-ai"
              className="hidden rounded-full bg-blue-50 px-4 py-2 text-[15px] text-[#A51C30] transition-colors hover:bg-blue-100 sm:inline-block"
            >
              Dashboard
            </Link>
            <a
              href="#lead-form"
              className="whitespace-nowrap rounded-full bg-[#0F172A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 sm:text-[15px]"
            >
              <span className="sm:hidden">Free Call</span>
              <span className="hidden sm:inline">Free Counselling</span>
            </a>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t border-gray-100 bg-[#FEF2F3]/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <img src="/edulogo-clean.png" alt="EduAbroad" className="h-9 w-auto" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              EduAbroad Magazine is written by Harvard-Cambridge and IIM alumni counsellors for Indian students planning to study abroad.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Explore</p>
            <ul className="space-y-2 text-sm text-slate-600">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-[#A51C30]">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Talk to us</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="tel:+919044442989" className="hover:text-[#A51C30]">
                  +91 90444 42989
                </a>
              </li>
              <li>
                <a href="https://wa.me/919044442989" target="_blank" rel="noopener noreferrer" className="hover:text-[#A51C30]">
                  WhatsApp us
                </a>
              </li>
              <li>Lucknow · Delhi · Kanpur · Indore</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 py-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} EduAbroad. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
