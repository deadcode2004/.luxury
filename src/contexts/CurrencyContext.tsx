"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { readStorage, writeStorage } from "@/lib/storage";
import {
  CURRENCY_MANUAL_KEY,
  CURRENCY_STORAGE_KEY,
  isCurrencyCode,
  writeCurrencyCookie,
  type CurrencyCode,
} from "@/lib/currency/cookie";

type CurrencyContextValue = {
  currency: CurrencyCode;
  /** Catalog / DB prices are always stored in this currency. */
  baseCurrency: "EGP";
  ready: boolean;
  setCurrency: (code: CurrencyCode) => void;
  /** Convert an EGP catalog amount into the active display currency. */
  convertFromEgp: (amountEgp: number) => number;
  rates: Record<CurrencyCode, number>;
};

/**
 * Product catalog prices are stored in EGP (single source of truth).
 * Rates are multipliers: display = amountEgp * RATES[currency].
 */
export const EGP_RATES: Record<CurrencyCode, number> = {
  EGP: 1,
  SAR: Number((1 / 13.3).toFixed(6)), // ≈ 0.075188
  USD: Number((0.2667 / 13.3).toFixed(6)), // ≈ 0.020053
};

const ARAB_COUNTRIES = new Set([
  "SA",
  "AE",
  "EG",
  "QA",
  "KW",
  "BH",
  "OM",
  "JO",
  "LB",
  "IQ",
  "SY",
  "YE",
  "PS",
  "MA",
  "DZ",
  "TN",
  "LY",
  "SD",
  "MR",
]);

const EUROPE = new Set([
  "DE",
  "FR",
  "IT",
  "ES",
  "PT",
  "NL",
  "BE",
  "AT",
  "CH",
  "SE",
  "NO",
  "DK",
  "FI",
  "IE",
  "PL",
  "CZ",
  "GR",
  "HU",
  "RO",
  "BG",
  "HR",
  "SK",
  "SI",
  "LT",
  "LV",
  "EE",
  "LU",
  "MT",
  "CY",
  "GB",
  "UK",
]);

function currencyFromCountry(country?: string | null): CurrencyCode {
  const code = (country || "").toUpperCase();
  if (code === "EG") return "EGP";
  if (code === "SA") return "SAR";
  if (code === "US") return "USD";
  if (EUROPE.has(code)) return "USD";
  if (ARAB_COUNTRIES.has(code)) return "USD";
  return "USD";
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  children,
  initialCurrency = null,
}: {
  children: React.ReactNode;
  /** From SSR cookie — avoids EGP→geo flash on return visits. */
  initialCurrency?: CurrencyCode | null;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency ?? "EGP");
  // Ready immediately when SSR already knows the currency.
  const [ready, setReady] = useState(() => initialCurrency != null);

  useEffect(() => {
    const manual = readStorage<boolean>(CURRENCY_MANUAL_KEY, false);
    const saved = readStorage<CurrencyCode | null>(CURRENCY_STORAGE_KEY, null);

    if (manual && isCurrencyCode(saved)) {
      setCurrencyState(saved);
      writeCurrencyCookie(saved);
      setReady(true);
      return;
    }

    // Prefer SSR cookie / already-saved geo currency for instant correct paint.
    if (isCurrencyCode(initialCurrency)) {
      writeStorage(CURRENCY_STORAGE_KEY, initialCurrency);
      writeCurrencyCookie(initialCurrency);
      setReady(true);
      // Still refresh geo in background only if not manually chosen — skip to avoid flicker.
      return;
    }

    if (isCurrencyCode(saved)) {
      setCurrencyState(saved);
      writeCurrencyCookie(saved);
      setReady(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const cachedCountry =
          typeof sessionStorage !== "undefined"
            ? sessionStorage.getItem("paradise_geo_country")
            : null;
        let country = cachedCountry;
        if (!country) {
          const res = await fetch("/api/geo", { cache: "force-cache" });
          const data = (await res.json().catch(() => ({}))) as { country?: string };
          country = data.country || null;
          if (country && typeof sessionStorage !== "undefined") {
            sessionStorage.setItem("paradise_geo_country", country);
          }
        }
        if (!cancelled) {
          const detected = currencyFromCountry(country);
          setCurrencyState(detected);
          writeStorage(CURRENCY_STORAGE_KEY, detected);
          writeCurrencyCookie(detected);
        }
      } catch {
        if (!cancelled) {
          const fallback = isCurrencyCode(saved) ? saved : "EGP";
          setCurrencyState(fallback);
          writeCurrencyCookie(fallback);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialCurrency]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    writeStorage(CURRENCY_STORAGE_KEY, code);
    writeStorage(CURRENCY_MANUAL_KEY, true);
    writeCurrencyCookie(code);
    setReady(true);
  }, []);

  const convertFromEgp = useCallback(
    (amountEgp: number) => Number((amountEgp * EGP_RATES[currency]).toFixed(2)),
    [currency]
  );

  const value = useMemo(
    () => ({
      currency,
      baseCurrency: "EGP" as const,
      ready,
      setCurrency,
      convertFromEgp,
      rates: EGP_RATES,
    }),
    [currency, ready, setCurrency, convertFromEgp]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

export type { CurrencyCode };
