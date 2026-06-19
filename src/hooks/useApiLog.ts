import { useEffect, useState } from "react";
import { subscribe, getEntries, type ApiLogEntry } from "@/services/apiLog";

/**
 * Subscribe a component to the live API request log. Re-renders whenever a new
 * request is recorded or the log is cleared.
 */
export function useApiLog(): ApiLogEntry[] {
  const [entries, setEntries] = useState<ApiLogEntry[]>(() => getEntries());

  useEffect(() => {
    const unsubscribe = subscribe(setEntries);
    return unsubscribe;
  }, []);

  return entries;
}
