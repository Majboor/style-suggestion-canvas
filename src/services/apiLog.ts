/**
 * apiLog — a tiny in-memory request/response recorder for the Style API tester.
 *
 * Every call routed through `loggedFetch` is captured (method, URL, request
 * body, status, latency and response body) and pushed into a bounded ring
 * buffer. UI can subscribe to render a live API console — think of it as a
 * purpose-built network inspector for the one API this app talks to, so
 * integrators can watch exactly what goes over the wire without opening
 * browser devtools.
 */

export interface ApiLogEntry {
  id: string;
  method: string;
  url: string;
  /** Pathname portion of the URL, for compact display. */
  path: string;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  /** HTTP status, or 0 when the request never completed (network error). */
  status: number;
  statusText: string;
  ok: boolean;
  responseBody?: string;
  /** Populated when the fetch itself threw (network / CORS failure). */
  error?: string;
  /** Epoch milliseconds when the request started. */
  startedAt: number;
  durationMs: number;
}

const MAX_ENTRIES = 200;

let entries: ApiLogEntry[] = [];
const listeners = new Set<(entries: ApiLogEntry[]) => void>();
let counter = 0;

function emit() {
  // Hand out a shallow copy so consumers can safely hold onto references.
  const snapshot = entries.slice();
  listeners.forEach((fn) => fn(snapshot));
}

export function subscribe(fn: (entries: ApiLogEntry[]) => void): () => void {
  listeners.add(fn);
  fn(entries.slice());
  return () => {
    listeners.delete(fn);
  };
}

export function getEntries(): ApiLogEntry[] {
  return entries.slice();
}

export function clearLog() {
  entries = [];
  emit();
}

function addEntry(entry: ApiLogEntry) {
  entries = [entry, ...entries].slice(0, MAX_ENTRIES);
  emit();
}

function headersToObject(headers: HeadersInit | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!headers) return out;
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      out[key] = value;
    });
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      out[key] = value;
    });
  } else {
    Object.entries(headers).forEach(([key, value]) => {
      out[key] = String(value);
    });
  }
  return out;
}

function bodyToString(body: BodyInit | null | undefined): string | undefined {
  if (body == null) return undefined;
  if (typeof body === "string") return body;
  try {
    return String(body);
  } catch {
    return undefined;
  }
}

/**
 * A drop-in replacement for `fetch` that records the exchange into the log.
 * On success or HTTP error it resolves exactly like `fetch`; the response body
 * is read from a clone so the caller still gets an untouched, unread Response.
 */
export async function loggedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || "GET").toUpperCase();
  const url = typeof input === "string" ? input : input.toString();
  let path = url;
  try {
    path = new URL(url).pathname;
  } catch {
    /* relative or malformed URL — keep the raw string */
  }

  const startedAt = Date.now();
  const startPerf =
    typeof performance !== "undefined" ? performance.now() : startedAt;
  const id = `req_${startedAt}_${counter++}`;

  const base: ApiLogEntry = {
    id,
    method,
    url,
    path,
    requestHeaders: headersToObject(init?.headers),
    requestBody: bodyToString(init?.body),
    status: 0,
    statusText: "",
    ok: false,
    startedAt,
    durationMs: 0,
  };

  try {
    const response = await fetch(input, init);
    const durationMs = Math.round(
      (typeof performance !== "undefined" ? performance.now() : Date.now()) -
        startPerf
    );

    let responseBody: string | undefined;
    try {
      responseBody = await response.clone().text();
    } catch {
      responseBody = undefined;
    }

    addEntry({
      ...base,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      responseBody,
      durationMs,
    });

    return response;
  } catch (error) {
    const durationMs = Math.round(
      (typeof performance !== "undefined" ? performance.now() : Date.now()) -
        startPerf
    );
    addEntry({
      ...base,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });
    throw error;
  }
}

/** Build a copy-pasteable cURL command for a logged request. */
export function toCurl(entry: ApiLogEntry): string {
  const parts = [`curl -X ${entry.method} '${entry.url}'`];
  Object.entries(entry.requestHeaders).forEach(([key, value]) => {
    parts.push(`  -H '${key}: ${value}'`);
  });
  if (entry.requestBody) {
    const oneLine = entry.requestBody.replace(/\n/g, "");
    parts.push(`  -d '${oneLine.replace(/'/g, "'\\''")}'`);
  }
  return parts.join(" \\\n");
}
