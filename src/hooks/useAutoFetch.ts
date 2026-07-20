"use client";

import { useEffect, useRef } from "react";

type LoadFn = (options?: { silent?: boolean }) => void | Promise<void>;

/**
 * Keeps dashboard data in sync without a manual Refresh button:
 * - runs `load` whenever its identity changes (mount / search deps)
 * - silently re-fetches when the tab/window becomes visible again
 */
export function useAutoFetch(load: LoadFn) {
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const refresh = () => {
      void loadRef.current({ silent: true });
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}
