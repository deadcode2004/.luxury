import type { CurrencyCode } from "@/contexts/CurrencyContext";

export type CurrencyMeta = {
  code: CurrencyCode;
  symbol: string;
  /** ISO country code used for SVG flag assets. */
  country: "eg" | "sa" | "us";
  name: { ar: string; en: string };
};

export const CURRENCY_OPTIONS: CurrencyMeta[] = [
  {
    code: "EGP",
    symbol: "E£",
    country: "eg",
    name: { ar: "الجنيه المصري", en: "Egyptian Pound" },
  },
  {
    code: "SAR",
    symbol: "ر.س",
    country: "sa",
    name: { ar: "الريال السعودي", en: "Saudi Riyal" },
  },
  {
    code: "USD",
    symbol: "$",
    country: "us",
    name: { ar: "الدولار الأمريكي", en: "US Dollar" },
  },
];

export function getCurrencyMeta(code: CurrencyCode): CurrencyMeta {
  return CURRENCY_OPTIONS.find((c) => c.code === code) ?? CURRENCY_OPTIONS[0];
}
