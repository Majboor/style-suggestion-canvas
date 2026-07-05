import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Code2 } from "lucide-react";

/**
 * Landing hero — Variant B.
 *
 * A distinctly different hero from the default (Variant A):
 *  - Headline: benefit-led ("Fashion that learns you") vs. the default's
 *    product-name-led "Style Preference API".
 *  - Layout: asymmetric two-column split on a dark gradient with a stat
 *    strip, vs. the default's centered single column on a light background.
 *  - CTA: action-first "Start rating styles" primary + a secondary docs
 *    link, vs. the default's "Try the Style API".
 *
 * Rendered by pages/Index.tsx when the landing variant resolves to "b"
 * (see hooks/use-variant.ts, toggled with `?variant=b`).
 */
const HeroVariantB = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
      />

      <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-blue-200">
            <Sparkles className="h-3.5 w-3.5" />
            Preference learning, one tap at a time
          </span>

          <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Fashion that
            <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              {" "}
              learns you
            </span>
          </h2>

          <p className="mt-4 max-w-xl text-lg text-slate-300">
            Rate a few looks and the Style API builds a living profile of what
            you love — no forms, no quizzes. Every tap sharpens the next
            suggestion.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/style-api" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full bg-white text-slate-900 hover:bg-slate-100 sm:w-auto"
              >
                Start rating styles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/api-docs" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <Code2 className="mr-2 h-4 w-4" />
                Read the docs
              </Button>
            </Link>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-4 lg:grid-cols-1">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
              <Zap className="h-3.5 w-3.5" /> Feedback
            </dt>
            <dd className="mt-1 text-2xl font-semibold">Iterative</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
              <Sparkles className="h-3.5 w-3.5" /> Profiles
            </dt>
            <dd className="mt-1 text-2xl font-semibold">Personal</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
              <Code2 className="h-3.5 w-3.5" /> Access
            </dt>
            <dd className="mt-1 text-2xl font-semibold">REST API</dd>
          </div>
        </dl>
      </div>
    </section>
  );
};

export default HeroVariantB;
