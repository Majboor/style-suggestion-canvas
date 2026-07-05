import { useEffect, useState } from "react";

/**
 * Landing-page A/B variant toggle.
 *
 * Resolution order:
 *   1. `?variant=` query param (values "a" or "b") — wins and is persisted.
 *   2. Previously persisted choice in localStorage.
 *   3. Default: "a".
 *
 * Usage: append `?variant=b` to the landing URL to preview the alternate
 * hero, or `?variant=a` to force the original. The choice sticks across
 * navigations within the session via localStorage.
 */
export type LandingVariant = "a" | "b";

const STORAGE_KEY = "ssc:landing-variant";

function normalize(value: string | null): LandingVariant | null {
  if (value === "a" || value === "b") return value;
  return null;
}

function readInitial(): LandingVariant {
  if (typeof window === "undefined") return "a";

  const fromQuery = normalize(
    new URLSearchParams(window.location.search).get("variant")
  );
  if (fromQuery) {
    try {
      window.localStorage.setItem(STORAGE_KEY, fromQuery);
    } catch {
      // storage may be unavailable (private mode); query value still applies
    }
    return fromQuery;
  }

  try {
    const stored = normalize(window.localStorage.getItem(STORAGE_KEY));
    if (stored) return stored;
  } catch {
    // ignore
  }

  return "a";
}

export function useVariant(): LandingVariant {
  const [variant, setVariant] = useState<LandingVariant>(readInitial);

  // Keep in sync if the query string changes (e.g. back/forward navigation).
  useEffect(() => {
    const onChange = () => setVariant(readInitial());
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  }, []);

  return variant;
}

/** Build a URL to the current page forcing the given variant. */
export function variantHref(target: LandingVariant): string {
  if (typeof window === "undefined") return `?variant=${target}`;
  const url = new URL(window.location.href);
  url.searchParams.set("variant", target);
  return url.pathname + url.search;
}
