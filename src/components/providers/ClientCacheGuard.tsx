"use client";

import { useEffect } from "react";

const SESSION_BUILD_KEY = "paradise:build-id";
const SW_PURGED_KEY = "paradise:sw-purged";
/** Avoid hammering `/api/build` on every focus flicker. */
const CHECK_THROTTLE_MS = 60_000;

async function unregisterOrphanServiceWorkers(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;

  const regs = await navigator.serviceWorker.getRegistrations();
  const controlled = regs.length > 0 || Boolean(navigator.serviceWorker.controller);
  if (!controlled) return false;

  await Promise.all(regs.map((reg) => reg.unregister()));

  // Only clear Cache Storage when a SW was actually controlling this origin.
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  return true;
}

/**
 * Deploy / dev-server boot safety net (not a cache killer):
 * - One-time cleanup if a legacy Service Worker still controls the origin
 * - Hard-reload when the server boot/build id changes (new deploy OR new `next dev`)
 * - In development, checks are more frequent so a restarted Next process wakes Chrome
 *
 * HTTP caching for HTML/assets is production-only (`next.config.ts`).
 */
export default function ClientCacheGuard({ buildId }: { buildId: string }) {
  useEffect(() => {
    let cancelled = false;
    let lastCheckAt = 0;
    const isDev = process.env.NODE_ENV === "development";
    const throttleMs = isDev ? 5_000 : CHECK_THROTTLE_MS;

    const hardReload = () => {
      window.location.reload();
    };

    const checkLiveBuild = async (force = false) => {
      const now = Date.now();
      if (!force && now - lastCheckAt < throttleMs) return;
      lastCheckAt = now;

      try {
        const res = await fetch(`/api/build?t=${now}`, { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { buildId?: string };
        if (!data.buildId || data.buildId === buildId) return;
        sessionStorage.setItem(SESSION_BUILD_KEY, data.buildId);
        hardReload();
      } catch {
        // Ignore transient network errors.
      }
    };

    const boot = async () => {
      const hadSw = await unregisterOrphanServiceWorkers();
      if (cancelled) return;

      if (hadSw && !sessionStorage.getItem(SW_PURGED_KEY)) {
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

      await checkLiveBuild(true);
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void checkLiveBuild(true);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void checkLiveBuild(false);
    };

    void boot();
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [buildId]);

  return null;
}
