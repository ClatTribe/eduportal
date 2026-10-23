"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Clock, Link2, X } from "lucide-react";
import { EnquiryForm } from "../EnquiryForm";
import JumbleWords from "../JumbleWords";
import { ArticleAuthors } from "../ArticleAuthors";
import {
  MagazinePost,
  TOCItem,
  categoryEmoji,
  categoryStyle,
  longDate,
  relativeDate,
} from "../magazine-utils";

interface Props {
  post: MagazinePost;
  parts: [string, string] | [string];
  toc: TOCItem[];
  related: MagazinePost[];
}

function Sticker({ category }: { category: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 border-[#0E0E10] px-3 py-1 text-xs font-bold ${categoryStyle(category).sticker}`}
    >
      <span aria-hidden>{categoryEmoji(category)}</span>
      {category}
    </span>
  );
}

export default function ArticleClient({ post, parts, toc, related }: Props) {
  const [progress, setProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState("");
  const [copied, setCopied] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [barDismissed, setBarDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY / max) * 100 : 0;
      setProgress(Math.min(100, p));

      let current = "";
      document.querySelectorAll<HTMLElement>(".article-body h2[id], .article-body h3[id]").forEach((h) => {
        if (h.getBoundingClientRect().top <= 140) current = h.id;
      });
      setActiveHeading(current);

      // Mobile sticky CTA: show after 25% scroll, hide while the main form is on screen.
      const form = document.getElementById("lead-form");
      const formOnScreen = form ? form.getBoundingClientRect().top < window.innerHeight && form.getBoundingClientRect().bottom > 0 : false;
      setShowBar(p > 25 && !formOnScreen);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const share = async (platform: "whatsapp" | "linkedin" | "x" | "copy") => {
    const url = window.location.href;
    const text = `${post.title} via EduAbroad Magazine`;
    if (platform === "copy") {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    const links = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    };
    window.open(links[platform], "_blank", "noopener");
  };

  const author = post.author || "EduAbroad Team";
  const initials = author
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const tocNav = (
    <nav aria-label="In this article" className="space-y-0.5">
      {toc
        .filter((t) => t.level === 2)
        .map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block rounded-xl px-3 py-2 text-[13px] leading-snug transition-colors ${
              activeHeading === item.id
                ? "bg-[#0E0E10] font-semibold text-white"
                : "text-[#0E0E10]/60 hover:bg-[#0E0E10]/5 hover:text-[#0E0E10]"
            }`}
          >
            {item.text}
          </a>
        ))}
    </nav>
  );

  return (
    <>
      {/* Reading progress */}
      <div className="fixed inset-x-0 top-0 z-50 h-1">
        <div className="h-full bg-[#A51C30] transition-[width] duration-100" style={{ width: `${progress}%` }} />
      </div>

      <article className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#0E0E10]/50">
          <Link href="/magazine" className="flex items-center gap-1 font-semibold hover:text-[#0E0E10]">
            <ArrowLeft className="h-4 w-4" /> Magazine
          </Link>
          <span>/</span>
          <Link href={`/magazine?search=${encodeURIComponent(post.category)}`} className="hover:text-[#0E0E10]">
            {post.category}
          </Link>
        </nav>

        {/* Header */}
        <header className="mt-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <Sticker category={post.category} />
            <span className="flex items-center gap-1 text-sm font-medium text-[#0E0E10]/50">
              <Clock className="h-4 w-4" /> {post.read_time} min read
            </span>
          </div>
          <h1 className="font-display mt-5 text-[36px] font-extrabold leading-[1.02] text-[#0E0E10] sm:text-6xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#0E0E10]/60 sm:text-xl">{post.excerpt}</p>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y-2 border-[#0E0E10]/10 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0E0E10] bg-[#D9F99D] text-sm font-extrabold">
                {initials}
              </div>
              <div>
                <p className="text-sm font-bold">{author}</p>
                <p className="text-xs text-[#0E0E10]/50">
                  <time dateTime={post.published_at}>{longDate(post.published_at)}</time>
                  {post.updated_at && post.updated_at.slice(0, 10) !== post.published_at.slice(0, 10) && (
                    <> · Updated {longDate(post.updated_at)}</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => share("whatsapp")}
                className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white"
              >
                Share on WhatsApp
              </button>
              <button
                onClick={() => share("linkedin")}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0E0E10] text-xs font-extrabold hover:bg-[#0E0E10] hover:text-white"
                aria-label="Share on LinkedIn"
              >
                in
              </button>
              <button
                onClick={() => share("x")}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0E0E10] text-xs font-extrabold hover:bg-[#0E0E10] hover:text-white"
                aria-label="Share on X"
              >
                X
              </button>
              <button
                onClick={() => share("copy")}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0E0E10] hover:bg-[#0E0E10] hover:text-white"
                aria-label="Copy link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </header>

        {post.cover_image_url && (
          <figure className="mt-8 overflow-hidden rounded-[32px] border-2 border-[#0E0E10]">
            <img src={post.cover_image_url} alt={post.title} className="aspect-[2/1] w-full object-cover" />
          </figure>
        )}

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 max-w-[720px]">
            {/* Mobile TOC */}
            {toc.filter((t) => t.level === 2).length > 2 && (
              <details className="group mb-8 rounded-[24px] border-2 border-[#0E0E10] bg-white p-4 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between font-display font-bold">
                  In this article
                  <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3">{tocNav}</div>
              </details>
            )}

            <div className="article-body" dangerouslySetInnerHTML={{ __html: parts[0] }} />

            {parts.length === 2 && (
              <>
                <div className="my-12">
                  <EnquiryForm variant="inline" placement="article-mid" context={post.slug} />
                </div>
                <div className="article-body" dangerouslySetInnerHTML={{ __html: parts[1] }} />
              </>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/magazine?search=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-[#0E0E10]/5 px-3.5 py-1.5 text-sm font-semibold text-[#0E0E10]/70 hover:bg-[#0E0E10] hover:text-white"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* End-of-article lead form: the header "Free roadmap" button and the sticky bar point here */}
            <div className="mt-12">
              <EnquiryForm variant="dark" placement="article-end" context={post.slug} id="lead-form" />
            </div>
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="no-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] space-y-6 overflow-y-auto pb-4 pr-2">
              {toc.filter((t) => t.level === 2).length > 2 && (
                <div className="rounded-[24px] border-2 border-[#0E0E10]/10 bg-white p-4">
                  <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-[#0E0E10]/40">In this article</p>
                  <div className="max-h-[38vh] overflow-y-auto pr-1">{tocNav}</div>
                </div>
              )}
              <EnquiryForm variant="card" placement="article-sidebar" context={post.slug} />
            </div>
          </aside>
        </div>

        <ArticleAuthors />

        <section className="mt-14 hidden sm:block" aria-label="Brain break">
          <JumbleWords />
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16" aria-label="Keep reading">
            <h2 className="font-display mb-6 text-3xl font-extrabold">Keep reading 👇</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.id} href={`/magazine/${r.slug}`} className="group block">
                  <div className="flex h-full flex-col overflow-hidden rounded-[28px] border-2 border-[#0E0E10] bg-white transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_#0E0E10]">
                    <div className={`relative flex aspect-[16/9] items-center justify-center overflow-hidden border-b-2 border-[#0E0E10] bg-gradient-to-br ${categoryStyle(r.category).cover}`}>
                      {r.cover_image_url ? (
                        <img src={r.cover_image_url} alt={r.title} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-5xl" aria-hidden>
                          {categoryEmoji(r.category)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-lg font-bold leading-snug line-clamp-3">{r.title}</h3>
                      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-[#0E0E10]/45">
                        <span>
                          {relativeDate(r.published_at)} · {r.read_time} min
                        </span>
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Mobile sticky CTA */}
      {showBar && !barDismissed && (
        <div className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-2 rounded-full border-2 border-[#0E0E10] bg-[#D9F99D] p-1.5 pl-5 shadow-[4px_4px_0_#0E0E10] lg:hidden">
          <p className="flex-1 text-sm font-bold leading-tight">Free study abroad roadmap in 24h</p>
          <a
            href="#lead-form"
            className="flex items-center gap-1 rounded-full bg-[#0E0E10] px-4 py-2.5 text-sm font-bold text-white"
          >
            Get it <ArrowRight className="h-4 w-4" />
          </a>
          <button
            onClick={() => setBarDismissed(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
