"use client";

import { useEffect } from "react";

const SESSION_BUILD_KEY = "paradise:build-id";
const SW_PURGED_KEY = "paradise:sw-purged";

async function purgeControlledCaches(): Promise<boolean> {
  let hadController = false;

  if ("serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    hadController = regs.length > 0 || Boolean(navigator.serviceWorker.controller);
    await Promise.all(regs.map((reg) => reg.unregister()));
  }

  if ("caches" in window) {
    const keys = await caches.keys();
    if (keys.length > 0) hadController = true;
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  return hadController;
}

/**
 * Chrome-specific staleness often comes from an orphaned Service Worker / Cache Storage
 * (or bfcache) that Firefox never had. This guard:
 * 1) Unregisters any SW and deletes Cache API entries
 * 2) Hard-reloads once after purging a controlling SW
 * 3) Compares the embedded build id against `/api/build` on focus/bfcache restore
 */
export default function ClientCacheGuard({ buildId }: { buildId: string }) {
  useEffect(() => {
    let cancelled = false;

    const hardReload = () => {
      // Full navigation (not router.refresh) so Chrome drops bfcache / memory shell.
      window.location.reload();
    };

    const checkLiveBuild = async () => {
      try {
        const res = await fetch(`/api/build?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { buildId?: string };
        if (!data.buildId || data.buildId === buildId) return;
        sessionStorage.setItem(SESSION_BUILD_KEY, data.buildId);
        await purgeControlledCaches();
        hardReload();
      } catch {
        // Network blips should not force reloads.
      }
    };

    const boot = async () => {
      const hadStaleController = await purgeControlledCaches();
      if (cancelled) return;

      if (hadStaleController && !sessionStorage.getItem(SW_PURGED_KEY)) {
        sessionStorage.setItem(SW_PURGED_KEY, "1");
        sessionStorage.setItem(SESSION_BUILD_KEY, buildId);
        hardReload();
        return;
      }

      const previous = sessionStorage.getItem(SESSION_BUILD_KEY);
      if (previous && previous !== buildId) {
        sessionStorage.setItem(SESSION_BUILD_KEY, buildId);
        hardReload();
        return;
      }
      sessionStorage.setItem(SESSION_BUILD_KEY, buildId);

      await checkLiveBuild();
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void checkLiveBuild();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void checkLiveBuild();
    };

    void boot();
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", checkLiveBuild);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", checkLiveBuild);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [buildId]);

  return null;
}
