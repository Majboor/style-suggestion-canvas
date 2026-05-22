import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  BookText,
  ArrowUpRight,
  Github,
  Activity,
  Sparkles,
} from "lucide-react";
import HeroVariantB from "@/components/HeroVariantB";
import { useVariant, variantHref } from "@/hooks/use-variant";

const styleWords = [
  "Minimalist", "Streetwear", "Old Money", "Y2K", "Avant-garde",
  "Cottagecore", "Techwear", "Preppy", "Grunge", "Athleisure",
  "Boho", "Monochrome", "Vintage", "Coastal", "Editorial",
];

const features = [
  {
    index: "01",
    title: "Style API Tester",
    to: "/style-api",
    icon: ImageIcon,
    blurb:
      "The heart of it. Swipe a stream of outfits, hit like or dislike, and watch a personalized style profile take shape across 30 rounds.",
    tags: ["Session", "Iterate", "Profile"],
  },
  {
    index: "02",
    title: "API Documentation",
    to: "/api-docs",
    icon: BookText,
    blurb:
      "Every endpoint laid out with copy-paste curl, Python, and JavaScript. Integrators get from zero to first request in minutes.",
    tags: ["curl", "Python", "JS"],
  },
  {
    index: "03",
    title: "API Status Board",
    to: "/api-status",
    icon: Activity,
    blurb:
      "A quick health board that pings the core endpoints and shows, at a glance, exactly what's up and what's responding.",
    tags: ["Health", "Latency", "Live"],
  },
  {
    index: "04",
    title: "Style Card",
    to: "/style-card",
    icon: Sparkles,
    blurb:
      "Turn a finished profile into a shareable style card — a poster-worthy summary of someone's taste, ready to export and show off.",
    tags: ["Share", "Export", "Profile"],
  },
];

const Index = () => {
  const variant = useVariant();
  return (
    <div className="editorial editorial-grain min-h-screen flex flex-col overflow-x-hidden">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ---- Nav ---- */}
        <header className="border-b hairline">
          <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-baseline gap-2.5">
              <span className="font-mono-e text-[hsl(var(--flame))] text-sm">✦</span>
              <span className="font-display font-semibold text-lg tracking-tight">
                Style&nbsp;Canvas
              </span>
            </Link>
            <nav className="flex items-center gap-6 sm:gap-8 text-sm">
              <Link to="/style-api" className="link-draw hidden sm:inline text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))] transition-colors">Tester</Link>
              <Link to="/api-docs" className="link-draw hidden sm:inline text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))] transition-colors">Docs</Link>
              <Link to="/api-status" className="link-draw hidden sm:inline text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))] transition-colors">Status</Link>
              <Link to="/style-card" className="link-draw hidden sm:inline text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))] transition-colors">Card</Link>
              <a
                href="https://github.com/waleedsworld/style-suggestion-canvas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border hairline rounded-full px-3.5 py-1.5 text-[hsl(var(--ink))] hover:bg-[hsl(var(--ink))] hover:text-[hsl(var(--paper))] transition-colors"
              >
                <Github className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </nav>
          </div>
        </header>

        {/* ---- Hero (A/B tested — append ?variant=b to preview) ---- */}
        <main id="main-content" className="flex-1">
          {variant === "b" ? (
            <section className="max-w-6xl mx-auto w-full px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
              <HeroVariantB />
            </section>
          ) : (
          <section className="max-w-6xl mx-auto w-full px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
            <div className="rise" style={{ animationDelay: "0.05s" }}>
              <span className="eyebrow text-[hsl(var(--flame))]">
                Style Preference API — the tester
              </span>
            </div>

            <h1 className="font-display font-medium tracking-tight leading-[0.92] mt-6 text-[clamp(2.8rem,9vw,7rem)]">
              <span className="rise block" style={{ animationDelay: "0.12s" }}>
                Taste,
              </span>
              <span className="rise block" style={{ animationDelay: "0.2s" }}>
                turned into
              </span>
              <span className="rise block italic text-[hsl(var(--flame))]" style={{ animationDelay: "0.28s" }}>
                a profile.
              </span>
            </h1>

            <div className="mt-9 grid md:grid-cols-[1.15fr_1fr] gap-8 md:gap-16 items-end">
              <p
                className="rise text-lg sm:text-xl leading-relaxed text-[hsl(var(--ink-soft))] max-w-xl"
                style={{ animationDelay: "0.36s" }}
              >
                A hands-on playground for the little API that learns what you
                <em className="font-display italic text-[hsl(var(--ink))]"> actually </em>
                like — by watching you swipe through outfits. It's a REST client
                that happens to have great taste.
              </p>

              <div
                className="rise flex flex-col gap-4"
                style={{ animationDelay: "0.44s" }}
              >
                <div className="flex flex-wrap gap-3">
                  <Link to="/style-api">
                    <Button
                      size="lg"
                      className="rounded-full h-12 px-7 text-base bg-[hsl(var(--flame))] hover:bg-[hsl(var(--flame-deep))] text-[hsl(var(--paper))] shadow-none group"
                    >
                      Launch the tester
                      <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                  </Link>
                  <Link to="/api-docs">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full h-12 px-7 text-base border-[hsl(var(--ink))] bg-transparent text-[hsl(var(--ink))] hover:bg-[hsl(var(--ink))] hover:text-[hsl(var(--paper))]"
                    >
                      Read the docs
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm text-[hsl(var(--ink-faint))]">
                  <span className="relative flex h-2 w-2">
                    <span className="dot-ping absolute inline-flex h-full w-full" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--flame))]" />
                  </span>
                  <span className="font-mono-e text-xs">30 iterations · like / dislike · live profile</span>
                </div>
              </div>
            </div>
          </section>
          )}

          {/* ---- A/B variant toggle ---- */}
          <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 pb-6 -mt-6">
            <a
              href={variantHref(variant === "b" ? "a" : "b")}
              className="link-draw font-mono-e text-xs text-[hsl(var(--ink-faint))] hover:text-[hsl(var(--ink))] transition-colors"
            >
              {variant === "b"
                ? "← Back to the editorial hero (variant A)"
                : "Preview the alternate hero (variant B) →"}
            </a>
          </div>

          {/* ---- Marquee ---- */}
          <section
            className="rise border-y hairline py-4 bg-[hsl(var(--paper-deep))]"
            style={{ animationDelay: "0.5s" }}
            aria-hidden="true"
          >
            <div className="marquee-track">
              {[...styleWords, ...styleWords].map((w, i) => (
                <span key={i} className="mx-6 font-display text-2xl sm:text-3xl text-[hsl(var(--ink))] inline-flex items-center gap-6">
                  {w}
                  <span className="text-[hsl(var(--flame))] text-base">✦</span>
                </span>
              ))}
            </div>
          </section>

          {/* ---- Features ---- */}
          <section className="max-w-6xl mx-auto w-full px-5 sm:px-8 py-20 sm:py-28">
            <div className="flex items-end justify-between gap-6 mb-12">
              <div>
                <span className="eyebrow text-[hsl(var(--ink-faint))]">Three surfaces</span>
                <h2 className="font-display font-medium text-3xl sm:text-4xl tracking-tight mt-3">
                  Everything you need to<br className="hidden sm:block" /> drive the API.
                </h2>
              </div>
              <Sparkles className="h-8 w-8 text-[hsl(var(--flame))] hidden sm:block shrink-0" />
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <Link
                    key={f.index}
                    to={f.to}
                    className="feature-card group flex flex-col justify-between rounded-2xl border hairline bg-[hsl(var(--paper))] p-7 min-h-[19rem]"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono-e text-sm text-[hsl(var(--ink-faint))]">
                          {f.index}
                        </span>
                        <ArrowUpRight className="feature-arrow h-5 w-5 text-[hsl(var(--ink-faint))] group-hover:text-[hsl(var(--flame))]" />
                      </div>
                      <Icon className="h-8 w-8 text-[hsl(var(--flame))] mt-8" strokeWidth={1.5} />
                      <h3 className="font-display font-semibold text-2xl tracking-tight mt-5">
                        {f.title}
                      </h3>
                      <p className="text-[hsl(var(--ink-soft))] leading-relaxed mt-3 text-[0.95rem]">
                        {f.blurb}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-6">
                      {f.tags.map((t) => (
                        <span
                          key={t}
                          className="font-mono-e text-[0.68rem] uppercase tracking-wider px-2.5 py-1 rounded-full border hairline text-[hsl(var(--ink-soft))]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ---- How it works ---- */}
          <section className="border-t hairline bg-[hsl(var(--paper-deep))]">
            <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 py-20 sm:py-28">
              <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-12 md:gap-20">
                <div>
                  <span className="eyebrow text-[hsl(var(--ink-faint))]">The loop</span>
                  <h2 className="font-display font-medium text-3xl sm:text-4xl tracking-tight mt-3 leading-tight">
                    Rate. Learn.<br />
                    <span className="italic text-[hsl(var(--flame))]">Refine.</span>
                  </h2>
                  <p className="text-[hsl(var(--ink-soft))] leading-relaxed mt-5 max-w-sm">
                    Point it at any compatible Style API server, authenticate,
                    and start rating. Each choice quietly nudges your score.
                  </p>
                </div>

                <ol className="flex flex-col">
                  {[
                    { n: "01", t: "Authenticate", d: "Spin up a session with an access ID and a gender preset." },
                    { n: "02", t: "Rate a stream", d: "Get an outfit, hit like or dislike, the API serves the next." },
                    { n: "03", t: "Watch it learn", d: "A live chart of your top styles plus a full selection history." },
                  ].map((s, i, arr) => (
                    <li
                      key={s.n}
                      className={`flex gap-6 py-6 ${i !== arr.length - 1 ? "border-b hairline" : ""}`}
                    >
                      <span className="font-mono-e text-sm text-[hsl(var(--flame))] pt-1 w-8 shrink-0">{s.n}</span>
                      <div>
                        <h3 className="font-display font-semibold text-xl tracking-tight">{s.t}</h3>
                        <p className="text-[hsl(var(--ink-soft))] mt-1.5 leading-relaxed">{s.d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-16 flex flex-wrap items-center gap-4">
                <Link to="/style-api">
                  <Button
                    size="lg"
                    className="rounded-full h-12 px-7 text-base bg-[hsl(var(--ink))] hover:bg-[hsl(var(--flame))] text-[hsl(var(--paper))] group"
                  >
                    Start rating
                    <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </Link>
                <span className="font-mono-e text-xs text-[hsl(var(--ink-faint))]">
                  MIT licensed · React + Vite + Tailwind
                </span>
              </div>
            </div>
          </section>
        </main>

        {/* ---- Footer ---- */}
        <footer className="border-t hairline">
          <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-display text-lg tracking-tight">
              Style Canvas <span className="text-[hsl(var(--flame))]">✦</span>
            </span>
            <p className="font-mono-e text-xs text-[hsl(var(--ink-faint))] text-center">
              Built by Waleed Ajmal — {new Date().getFullYear()}
            </p>
            <div className="flex items-center gap-5 text-sm text-[hsl(var(--ink-soft))]">
              <Link to="/api-docs" className="link-draw">Docs</Link>
              <Link to="/api-status" className="link-draw">Status</Link>
              <a
                href="https://github.com/waleedsworld/style-suggestion-canvas"
                target="_blank"
                rel="noopener noreferrer"
                className="link-draw"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
