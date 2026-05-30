
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";

// Route-level code splitting: keep the landing page (Index) in the initial
// bundle for a fast first paint, and lazy-load the heavier tester / docs /
// status / console / card pages (and their large dependencies, e.g. recharts)
// on demand.
const StyleAPI = lazy(() => import("./pages/StyleAPI"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const ApiStatus = lazy(() => import("./pages/ApiStatus"));
const ApiConsole = lazy(() => import("./pages/ApiConsole"));
const StyleCard = lazy(() => import("./pages/StyleCard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div
    className="min-h-screen flex items-center justify-center bg-gray-50"
    role="status"
    aria-live="polite"
  >
    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" aria-hidden="true" />
    <span className="sr-only">Loading page…</span>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/style-api" element={<StyleAPI />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/api-status" element={<ApiStatus />} />
            <Route path="/api-console" element={<ApiConsole />} />
            <Route path="/style-card" element={<StyleCard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
