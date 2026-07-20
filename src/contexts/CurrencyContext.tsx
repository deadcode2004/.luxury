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

export type CurrencyCode = "EGP" | "SAR" | "USD";

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

const STORAGE_KEY = "paradise_currency";
const MANUAL_KEY = "paradise_currency_manual";

/**
 * Product catalog prices are stored in EGP (single source of truth).
 * Rates are multipliers: display = amountEgp * RATES[currency].
 *
 * Derived from prior SAR-based ratios (1 SAR ≈ 13.3 EGP, 1 SAR ≈ 0.2667 USD)
 * so relative SAR/USD values stay consistent after the base switch.
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

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("EGP");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const manual = readStorage<boolean>(MANUAL_KEY, false);
    const saved = readStorage<CurrencyCode | null>(STORAGE_KEY, null);
    if (manual && saved && (saved === "EGP" || saved === "SAR" || saved === "USD")) {
      setCurrencyState(saved);
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
          writeStorage(STORAGE_KEY, detected);
        }
      } catch {
        if (!cancelled) {
          setCurrencyState(
            saved && ["EGP", "SAR", "USD"].includes(saved) ? (saved as CurrencyCode) : "EGP"
          );
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    writeStorage(STORAGE_KEY, code);
    writeStorage(MANUAL_KEY, true);
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
