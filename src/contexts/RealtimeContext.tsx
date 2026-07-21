"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchRealtimeVersions } from "@/lib/realtime/client";
import {
  EMPTY_VERSIONS,
  type DomainVersions,
  type RealtimeDomain,
} from "@/lib/realtime/types";

type Listener = (changed: RealtimeDomain[]) => void;

type RealtimeContextValue = {
  versions: DomainVersions;
  cursor: number;
  /** Subscribe to domain bumps. Returns unsubscribe. */
  subscribe: (domains: RealtimeDomain[], listener: Listener) => () => void;
  /** Instant same-browser sync after a local mutation (other tabs). */
  signalLocal: (domains: RealtimeDomain[]) => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const CHANNEL_NAME = "paradise-realtime";
/** Visible-tab poll. Mutations also signal via BroadcastChannel for same-browser tabs. */
const POLL_MS = 4000;
const HIDDEN_POLL_MS = 15000;

function changedDomains(prev: DomainVersions, next: DomainVersions): RealtimeDomain[] {
  return (Object.keys(next) as RealtimeDomain[]).filter(
    (d) => (prev[d] ?? 0) !== (next[d] ?? 0)
  );
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [versions, setVersions] = useState<DomainVersions>(EMPTY_VERSIONS);
  const [cursor, setCursor] = useState(0);
  const versionsRef = useRef(versions);
  const cursorRef = useRef(0);
  const primedRef = useRef(false);
  const listenersRef = useRef(
    new Set<{ domains: RealtimeDomain[]; listener: Listener }>()
  );
  const channelRef = useRef<BroadcastChannel | null>(null);

  versionsRef.current = versions;

  const notify = useCallback((changed: RealtimeDomain[]) => {
    if (!changed.length) return;
    listenersRef.current.forEach(({ domains, listener }) => {
      const hit = changed.filter((d) => domains.includes(d));
      if (hit.length) listener(hit);
    });
  }, []);

  const applyVersions = useCallback(
    (next: DomainVersions, nextCursor: number) => {
      const prev = versionsRef.current;
      const changed = changedDomains(prev, next);
      if (!changed.length && nextCursor === cursorRef.current) return;
      versionsRef.current = next;
      cursorRef.current = nextCursor;
      setVersions(next);
      setCursor(nextCursor);
      // First snapshot only seeds versions — avoid a refetch storm on mount.
      if (!primedRef.current) {
        primedRef.current = true;
        return;
      }
      if (changed.length) notify(changed);
    },
    [notify]
  );

  const subscribe = useCallback((domains: RealtimeDomain[], listener: Listener) => {
    const entry = { domains, listener };
    listenersRef.current.add(entry);
    return () => {
      listenersRef.current.delete(entry);
    };
  }, []);

  const signalLocal = useCallback(
    (domains: RealtimeDomain[]) => {
      if (!domains.length) return;
      notify(domains);
      if (channelRef.current) {
        try {
          channelRef.current.postMessage({ type: "signal", domains });
        } catch {
          /* ignore */
        }
      }
    },
    [notify]
  );

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let inFlight = false;
    const abort = new AbortController();

    const poll = async () => {
      if (cancelled || inFlight) {
        if (!cancelled && !inFlight) timer = setTimeout(poll, POLL_MS);
        return;
      }
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        timer = setTimeout(poll, HIDDEN_POLL_MS);
        return;
      }
      inFlight = true;
      try {
        const snap = await fetchRealtimeVersions(abort.signal);
        if (!cancelled) applyVersions(snap.versions, snap.cursor);
      } catch {
        /* network blip — retry next tick */
      } finally {
        inFlight = false;
        if (!cancelled) timer = setTimeout(poll, POLL_MS);
      }
    };

    void poll();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        if (timer) clearTimeout(timer);
        void poll();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      abort.abort();
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [applyVersions]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;
    channel.onmessage = (event) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "signal" && Array.isArray(data.domains)) {
        notify(data.domains as RealtimeDomain[]);
        return;
      }
      if (data.type === "versions" && data.versions) {
        applyVersions(data.versions as DomainVersions, Number(data.cursor ?? 0));
      }
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [applyVersions, notify]);

  const value = useMemo(
    () => ({ versions, cursor, subscribe, signalLocal }),
    [versions, cursor, subscribe, signalLocal]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return ctx;
}

/**
 * Re-run `onChange` whenever any of the given domains bump (other clients / tabs).
 * Does not run on mount — pair with useAutoFetch / useEffect for initial load.
 */
export function useRealtimeDomains(
  domains: RealtimeDomain[],
  onChange: (changed: RealtimeDomain[]) => void
) {
  const { subscribe } = useRealtime();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const key = domains.slice().sort().join(",");

  useEffect(() => {
    const list = key.split(",").filter(Boolean) as RealtimeDomain[];
    if (!list.length) return;
    return subscribe(list, (changed) => {
      onChangeRef.current(changed);
    });
  }, [key, subscribe]);
}
