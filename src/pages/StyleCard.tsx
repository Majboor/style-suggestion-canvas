import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  Copy,
  Sparkles,
  Loader2,
  RefreshCw,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import styleApiClient from "@/services/StyleApiClient";

/**
 * Style Card
 * ----------
 * A small piece of delight: turn the profile the Style API has learned about you
 * into a shareable "trading card" — a persona title, your top style vibes, and a
 * one-line summary — that you can download as a PNG or copy as text.
 *
 * It renders live data when a session exists, and falls back to a sample deck so
 * the card can be explored (and shared as a screenshot) even before you rate a
 * single outfit.
 */

interface StyleEntry {
  style: string;
  score: number;
}

// A tiny, tongue-in-cheek persona lexicon keyed by the dominant style. Anything
// not in the table falls back to a generic-but-flattering persona.
const PERSONAS: Record<string, { title: string; tagline: string; emoji: string }> = {
  casual: { title: "The Effortless Icon", tagline: "Makes 'I just threw this on' look intentional.", emoji: "🧢" },
  formal: { title: "The Boardroom Royalty", tagline: "Tailored, composed, quietly unstoppable.", emoji: "🎩" },
  streetwear: { title: "The Sidewalk Legend", tagline: "The street is the runway, and it's yours.", emoji: "🛹" },
  vintage: { title: "The Timeless Curator", tagline: "Old soul, unmatched eye, zero fast fashion.", emoji: "📻" },
  bohemian: { title: "The Free Spirit", tagline: "Layers, textures, and a soundtrack of wind chimes.", emoji: "🌿" },
  minimalist: { title: "The Clean Slate", tagline: "Less, but every piece earns its place.", emoji: "◻️" },
  sporty: { title: "The Motion Maven", tagline: "Comfort-first, always ready to sprint or slay.", emoji: "🏃" },
  elegant: { title: "The Quiet Luxury", tagline: "Understated on purpose. Expensive by accident.", emoji: "🥂" },
  edgy: { title: "The Bold Statement", tagline: "Rules are more of a starting suggestion.", emoji: "⚡" },
  classic: { title: "The Evergreen", tagline: "Trends come and go; you simply endure.", emoji: "🕰️" },
  chic: { title: "The Polished Muse", tagline: "Camera-ready without appearing to try.", emoji: "💫" },
  glamorous: { title: "The Spotlight Seeker", tagline: "If it doesn't sparkle, is it even an outfit?", emoji: "✨" },
};

const SAMPLE_STYLES: StyleEntry[] = [
  { style: "streetwear", score: 8.4 },
  { style: "minimalist", score: 6.1 },
  { style: "vintage", score: 4.7 },
  { style: "casual", score: 3.2 },
  { style: "edgy", score: 1.9 },
];

// Card canvas dimensions (portrait "trading card" ratio).
const CARD_W = 720;
const CARD_H = 1040;

function personaFor(style: string) {
  const key = (style || "").toLowerCase().trim();
  return (
    PERSONAS[key] || {
      title: "The Original",
      tagline: "One of a kind — the algorithm is still catching up.",
      emoji: "🎨",
    }
  );
}

// Normalize the API's flexible top_styles shape (number | [name, score] | {name: score})
// into a clean, sorted list. Mirrors the logic used by PreferenceChart.
function normalizeTopStyles(rawResponse: any): StyleEntry[] {
  if (!rawResponse || !rawResponse.top_styles) return [];
  const entries: StyleEntry[] = Object.entries(rawResponse.top_styles).map(
    ([key, value]: [string, any]) => {
      let style: string = key;
      let score: number = 0;
      if (Array.isArray(value)) {
        style = String(value[0]);
        score = Number(value[1]);
      } else if (value !== null && typeof value === "object") {
        const inner = Object.keys(value)[0];
        style = inner;
        score = Number(value[inner]);
      } else {
        score = Number(value);
      }
      return { style: String(style), score: Number.isFinite(score) ? score : 0 };
    }
  );
  return entries.sort((a, b) => b.score - a.score);
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const StyleCard = () => {
  const [styles, setStyles] = useState<StyleEntry[]>([]);
  const [isSample, setIsSample] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const loadLiveProfile = async () => {
    if (!styleApiClient.isAuthenticated) {
      toast.info("No active session — showing sample card. Rate some outfits first for your real card.");
      setStyles(SAMPLE_STYLES);
      setIsSample(true);
      return;
    }
    setIsLoading(true);
    try {
      const profile = await styleApiClient.getProfile();
      const normalized = normalizeTopStyles(profile);
      if (normalized.length === 0) {
        toast.info("Your profile is still empty — showing a sample card for now.");
        setStyles(SAMPLE_STYLES);
        setIsSample(true);
      } else {
        setStyles(normalized);
        setIsSample(false);
        toast.success("Style Card generated from your live profile!");
      }
    } catch (e) {
      toast.error("Couldn't reach the API — showing a sample card instead.");
      setStyles(SAMPLE_STYLES);
      setIsSample(true);
    } finally {
      setIsLoading(false);
    }
  };

  // On mount: try live profile, otherwise sample.
  useEffect(() => {
    if (styleApiClient.isAuthenticated) {
      loadLiveProfile();
    } else {
      setStyles(SAMPLE_STYLES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const top = styles[0];
  const persona = useMemo(() => personaFor(top?.style || ""), [top]);
  const maxScore = useMemo(
    () => Math.max(1, ...styles.map((s) => Math.abs(s.score))),
    [styles]
  );
  const topFive = styles.slice(0, 5);

  const summaryText = useMemo(() => {
    if (!top) return "";
    const list = topFive
      .map((s, i) => `${i + 1}. ${titleCase(s.style)} (${s.score.toFixed(1)})`)
      .join("  ");
    return `My Style Persona: ${persona.title} ${persona.emoji}\n"${persona.tagline}"\nTop vibes → ${list}\n— via Style Suggestion Canvas`;
  }, [top, topFive, persona]);

  // Draw the card onto the canvas so it can be exported as a PNG with no
  // external dependencies (no html2canvas, no CDN).
  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !top) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CARD_W;
    canvas.height = CARD_H;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    grad.addColorStop(0, "#0b1220");
    grad.addColorStop(0.55, "#152449");
    grad.addColorStop(1, "#1e3a8a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // Subtle glow orb
    const orb = ctx.createRadialGradient(CARD_W - 140, 160, 20, CARD_W - 140, 160, 320);
    orb.addColorStop(0, "rgba(96,165,250,0.35)");
    orb.addColorStop(1, "rgba(96,165,250,0)");
    ctx.fillStyle = orb;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // Border frame
    ctx.strokeStyle = "rgba(147,197,253,0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(28, 28, CARD_W - 56, CARD_H - 56);

    const pad = 64;

    // Eyebrow
    ctx.fillStyle = "rgba(191,219,254,0.85)";
    ctx.font = "600 22px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("STYLE PERSONA CARD", pad, 110);

    // Big emoji
    ctx.font = "96px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(persona.emoji, pad, 230);

    // Persona title (wrap up to 2 lines)
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 58px system-ui, -apple-system, Segoe UI, sans-serif";
    const titleLines = wrapText(ctx, persona.title, CARD_W - pad * 2, 58);
    let ty = 320;
    titleLines.slice(0, 2).forEach((line) => {
      ctx.fillText(line, pad, ty);
      ty += 66;
    });

    // Tagline
    ctx.fillStyle = "rgba(226,232,240,0.85)";
    ctx.font = "italic 26px system-ui, -apple-system, Segoe UI, sans-serif";
    const tagLines = wrapText(ctx, `"${persona.tagline}"`, CARD_W - pad * 2, 26);
    ty += 6;
    tagLines.slice(0, 3).forEach((line) => {
      ctx.fillText(line, pad, ty);
      ty += 36;
    });

    // Divider
    ty += 22;
    ctx.strokeStyle = "rgba(148,163,184,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, ty);
    ctx.lineTo(CARD_W - pad, ty);
    ctx.stroke();

    // Top vibes header
    ty += 46;
    ctx.fillStyle = "rgba(191,219,254,0.85)";
    ctx.font = "600 22px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText("TOP VIBES", pad, ty);

    // Bars
    ty += 20;
    const barMax = CARD_W - pad * 2;
    topFive.forEach((s) => {
      ty += 52;
      // label
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "600 26px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.fillText(titleCase(s.style), pad, ty - 12);
      // score
      ctx.fillStyle = "rgba(148,163,184,0.9)";
      ctx.font = "500 22px system-ui, -apple-system, Segoe UI, sans-serif";
      const scoreLabel = s.score.toFixed(1);
      const sw = ctx.measureText(scoreLabel).width;
      ctx.fillText(scoreLabel, CARD_W - pad - sw, ty - 12);
      // track
      const barY = ty;
      ctx.fillStyle = "rgba(148,163,184,0.18)";
      roundRect(ctx, pad, barY, barMax, 12, 6);
      ctx.fill();
      // fill
      const w = Math.max(12, (Math.abs(s.score) / maxScore) * barMax);
      const bg = ctx.createLinearGradient(pad, 0, pad + w, 0);
      bg.addColorStop(0, "#38bdf8");
      bg.addColorStop(1, "#818cf8");
      ctx.fillStyle = bg;
      roundRect(ctx, pad, barY, w, 12, 6);
      ctx.fill();
    });

    // Footer
    ctx.fillStyle = "rgba(148,163,184,0.85)";
    ctx.font = "500 20px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText("Style Suggestion Canvas", pad, CARD_H - 70);
    const dateStr = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const dw = ctx.measureText(dateStr).width;
    ctx.fillText(dateStr, CARD_W - pad - dw, CARD_H - 70);
  };

  useEffect(() => {
    drawCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styles]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !top) {
      toast.error("No card to download yet.");
      return;
    }
    drawCard();
    try {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `style-card-${(top.style || "profile").toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Style Card downloaded!");
    } catch (e) {
      toast.error("Couldn't export the image in this browser.");
    }
  };

  const handleCopy = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      toast.success("Summary copied to clipboard!");
    } catch {
      toast.error("Clipboard unavailable — select and copy manually.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Style Card</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link to="/style-api">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Tester
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          {/* Live preview (HTML mirror of the canvas) */}
          <div className="order-1">
            <div
              data-testid="style-card-preview"
              className="relative overflow-hidden rounded-2xl border border-blue-300/40 shadow-2xl text-white p-8"
              style={{
                aspectRatio: `${CARD_W} / ${CARD_H}`,
                background:
                  "linear-gradient(135deg, #0b1220 0%, #152449 55%, #1e3a8a 100%)",
              }}
            >
              <div
                className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(96,165,250,0.35), rgba(96,165,250,0) 70%)" }}
              />
              <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-blue-200/80">
                STYLE PERSONA CARD
              </p>
              <div className="text-5xl sm:text-6xl mt-4" aria-hidden>
                {persona.emoji}
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight">
                {persona.title}
              </h2>
              <p className="mt-3 italic text-slate-200/85 text-sm sm:text-base">
                "{persona.tagline}"
              </p>

              <div className="my-5 h-px bg-slate-400/30" />

              <p className="text-xs font-semibold tracking-[0.2em] text-blue-200/80">
                TOP VIBES
              </p>
              <div className="mt-3 space-y-3">
                {topFive.map((s) => (
                  <div key={s.style} data-testid="vibe-row">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold capitalize">{s.style}</span>
                      <span className="text-slate-400">{s.score.toFixed(1)}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-400/20 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(6, (Math.abs(s.score) / maxScore) * 100)}%`,
                          background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-6 left-8 right-8 flex justify-between text-xs text-slate-400">
                <span>Style Suggestion Canvas</span>
                <span>
                  {new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            {/* Hidden canvas used purely for PNG export */}
            <canvas ref={canvasRef} className="hidden" aria-hidden />
          </div>

          {/* Controls */}
          <div className="order-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-blue-600" />
                  Your Style, as a Card
                </CardTitle>
                <CardDescription>
                  {isSample
                    ? "You're viewing a sample card. Rate outfits in the Tester to unlock your real persona."
                    : "Generated from the profile the Style API has learned about you."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleDownload}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="download-card"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button variant="outline" onClick={handleCopy} data-testid="copy-summary">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Summary
                  </Button>
                  <Button
                    variant="outline"
                    onClick={loadLiveProfile}
                    disabled={isLoading}
                    data-testid="refresh-live"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Use My Live Profile
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStyles(SAMPLE_STYLES);
                      setIsSample(true);
                      toast.info("Loaded a sample card.");
                    }}
                    data-testid="load-sample"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Sample
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Text summary</h3>
                  <pre className="text-xs bg-slate-50 border rounded-md p-3 whitespace-pre-wrap font-mono text-slate-700">
                    {summaryText || "No data yet."}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">How the persona is picked</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Your <span className="font-medium text-foreground">top-scoring style</span> decides
                  your persona title and tagline. The bars show your five strongest vibes,
                  scaled to your highest score.
                </p>
                <p>
                  Everything is generated in your browser — the card never leaves your device
                  until you choose to share it.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- small canvas helpers ---

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [text];
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export default StyleCard;
