"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRealtimeDomains } from "@/contexts/RealtimeContext";
import type { RealtimeDomain } from "@/lib/realtime/types";

type LoadFn = (options?: { silent?: boolean }) => void | Promise<void>;

type Options = {
  /** Domains that should silently re-fetch this loader when they change. */
  domains?: RealtimeDomain[];
};

/**
 * Keeps live data in sync without Refresh buttons:
 * - runs `load` on mount / when identity changes
 * - silently re-fetches when subscribed realtime domains bump
 * - silently re-fetches when the tab becomes visible again (catch-up)
 */
export function useAutoFetch(load: LoadFn, options: Options = {}) {
  const loadRef = useRef(load);
  loadRef.current = load;
  const domains = options.domains ?? [];

  useEffect(() => {
    void load();
  }, [load]);

  const silentReload = useCallback(() => {
    void loadRef.current({ silent: true });
  }, []);

  useRealtimeDomains(domains, () => {
    silentReload();
  });

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") silentReload();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [silentReload]);
}
