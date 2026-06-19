import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Activity,
  ArrowLeft,
  BookText,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Download,
  Terminal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApiLog } from "@/hooks/useApiLog";
import { clearLog, toCurl, type ApiLogEntry } from "@/services/apiLog";

type FilterKind = "all" | "success" | "error";

const methodColors: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700 border-blue-200",
  POST: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PUT: "bg-amber-100 text-amber-700 border-amber-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
  PATCH: "bg-purple-100 text-purple-700 border-purple-200",
};

function prettyJson(text?: string): string {
  if (text === undefined || text === "") return "";
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

function statusLabel(entry: ApiLogEntry): string {
  if (entry.error) return "ERR";
  return String(entry.status);
}

function statusClass(entry: ApiLogEntry): string {
  if (entry.error || entry.status === 0)
    return "bg-red-100 text-red-700 border-red-200";
  if (entry.status >= 500) return "bg-red-100 text-red-700 border-red-200";
  if (entry.status >= 400)
    return "bg-orange-100 text-orange-700 border-orange-200";
  if (entry.status >= 200 && entry.status < 300)
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

const copy = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
};

const CodeBlock = ({ text }: { text: string }) => (
  <ScrollArea className="max-h-56 rounded-md border bg-gray-50">
    <pre className="p-3 text-xs font-mono whitespace-pre-wrap break-all">
      {text}
    </pre>
  </ScrollArea>
);

const LogRow = ({ entry }: { entry: ApiLogEntry }) => {
  const [open, setOpen] = useState(false);
  const reqHeaders = Object.entries(entry.requestHeaders);

  return (
    <div className="border rounded-lg bg-white overflow-hidden transition-all-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span
          className={`text-xs font-semibold font-mono px-2 py-0.5 rounded border shrink-0 ${
            methodColors[entry.method] || "bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          {entry.method}
        </span>
        <span className="font-mono text-sm truncate flex-1 min-w-0">
          {entry.path}
        </span>
        <span
          className={`text-xs font-semibold font-mono px-2 py-0.5 rounded border shrink-0 ${statusClass(
            entry
          )}`}
          title={entry.statusText || entry.error}
        >
          {statusLabel(entry)}
        </span>
        <span className="text-xs text-muted-foreground font-mono shrink-0 w-14 text-right">
          {entry.durationMs}ms
        </span>
        <span className="hidden sm:inline text-xs text-muted-foreground font-mono shrink-0">
          {new Date(entry.startedAt).toLocaleTimeString()}
        </span>
      </button>

      {open && (
        <div className="border-t px-4 py-4 space-y-4 bg-slate-50/60">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copy(toCurl(entry), "cURL command")}
            >
              <Terminal className="h-3.5 w-3.5 mr-1.5" />
              Copy as cURL
            </Button>
            {entry.responseBody && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => copy(entry.responseBody!, "Response body")}
              >
                <Clipboard className="h-3.5 w-3.5 mr-1.5" />
                Copy response
              </Button>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Full URL
            </p>
            <p className="font-mono text-xs break-all">{entry.url}</p>
          </div>

          {reqHeaders.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Request headers
              </p>
              <div className="space-y-0.5">
                {reqHeaders.map(([k, v]) => (
                  <p key={k} className="font-mono text-xs break-all">
                    <span className="text-gray-500">{k}:</span> {v}
                  </p>
                ))}
              </div>
            </div>
          )}

          {entry.requestBody && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Request body
              </p>
              <CodeBlock text={prettyJson(entry.requestBody)} />
            </div>
          )}

          {entry.error ? (
            <div>
              <p className="text-xs font-semibold text-red-600 mb-1">
                Request failed
              </p>
              <p className="font-mono text-xs text-red-600 break-all">
                {entry.error}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Response body{" "}
                <span className="font-normal">
                  ({entry.status} {entry.statusText})
                </span>
              </p>
              {entry.responseBody ? (
                <CodeBlock text={prettyJson(entry.responseBody)} />
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  (empty response body)
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) => (
  <Card>
    <CardContent className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${accent || ""}`}>{value}</p>
    </CardContent>
  </Card>
);

const ApiConsole = () => {
  const entries = useApiLog();
  const [filter, setFilter] = useState<FilterKind>("all");

  const stats = useMemo(() => {
    const total = entries.length;
    const errors = entries.filter((e) => e.error || e.status >= 400).length;
    const success = total - errors;
    const avg =
      total > 0
        ? Math.round(
            entries.reduce((sum, e) => sum + e.durationMs, 0) / total
          )
        : 0;
    return { total, errors, success, avg };
  }, [entries]);

  const filtered = useMemo(() => {
    if (filter === "success")
      return entries.filter((e) => !e.error && e.status < 400);
    if (filter === "error")
      return entries.filter((e) => e.error || e.status >= 400);
    return entries;
  }, [entries, filter]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `style-api-log-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Request log exported");
  };

  const filterButton = (kind: FilterKind, label: string, count: number) => (
    <button
      type="button"
      onClick={() => setFilter(kind)}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all-200 ${
        filter === kind
          ? "bg-apple-blue text-white"
          : "bg-white text-gray-600 border hover:bg-gray-50"
      }`}
    >
      {label}{" "}
      <span className={filter === kind ? "opacity-90" : "text-muted-foreground"}>
        ({count})
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-apple-gray">
      <header className="bg-white bg-opacity-90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Terminal className="h-6 w-6 text-apple-blue" />
            <h1 className="text-2xl font-medium text-apple-black">
              API Console
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/style-api">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Tester</span>
              </Button>
            </Link>
            <Link to="/api-status">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Status</span>
              </Button>
            </Link>
            <Link to="/api-docs">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <BookText className="h-4 w-4" />
                <span className="hidden sm:inline">Docs</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-medium">API Request Console</h2>
          <p className="text-muted-foreground mt-1">
            A live inspector for every call the tester makes to the Style API —
            method, status, latency, and full request/response bodies. Great for
            debugging integrations without leaving the app.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total requests" value={stats.total} />
          <StatCard
            label="Successful"
            value={stats.success}
            accent="text-emerald-600"
          />
          <StatCard
            label="Errors"
            value={stats.errors}
            accent={stats.errors > 0 ? "text-red-600" : ""}
          />
          <StatCard label="Avg latency" value={`${stats.avg}ms`} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex flex-wrap gap-2">
            {filterButton("all", "All", stats.total)}
            {filterButton("success", "Success", stats.success)}
            {filterButton("error", "Errors", stats.errors)}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={entries.length === 0}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                clearLog();
                toast.info("Request log cleared");
              }}
              disabled={entries.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Clear
            </Button>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((entry) => (
              <LogRow key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">
                {entries.length === 0
                  ? "No requests recorded yet"
                  : "No requests match this filter"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm space-y-2">
              {entries.length === 0 ? (
                <>
                  <p>
                    Head over to the{" "}
                    <Link
                      to="/style-api"
                      className="text-apple-blue underline underline-offset-2"
                    >
                      Style API Tester
                    </Link>{" "}
                    and authenticate or rate a few suggestions. Every call the
                    app makes will show up here in real time.
                  </p>
                  <p>
                    You can then expand any request to inspect its headers and
                    bodies, copy it as a ready-to-run <code>curl</code> command,
                    or export the whole session as JSON.
                  </p>
                </>
              ) : (
                <p>Try switching the filter back to “All”.</p>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            Style Suggestion Canvas • Built by Waleed Ajmal •{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ApiConsole;
