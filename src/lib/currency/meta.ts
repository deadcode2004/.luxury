import type { CurrencyCode } from "@/contexts/CurrencyContext";

export type CurrencyMeta = {
  code: CurrencyCode;
  symbol: string;
  /** Regional flag emoji for compact header trigger. */
  flag: string;
  name: { ar: string; en: string };
};

export const CURRENCY_OPTIONS: CurrencyMeta[] = [
  {
    code: "EGP",
    symbol: "E£",
    flag: "🇪🇬",
    name: { ar: "الجنيه المصري", en: "Egyptian Pound" },
  },
  {
    code: "SAR",
    symbol: "ر.س",
    flag: "🇸🇦",
    name: { ar: "الريال السعودي", en: "Saudi Riyal" },
  },
  {
    code: "USD",
    symbol: "$",
    flag: "🇺🇸",
    name: { ar: "الدولار الأمريكي", en: "US Dollar" },
  },
];

export function getCurrencyMeta(code: CurrencyCode): CurrencyMeta {
  return CURRENCY_OPTIONS.find((c) => c.code === code) ?? CURRENCY_OPTIONS[1];
}
