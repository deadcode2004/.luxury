export type AppLanguage = "ar" | "en";
export type CurrencyCode = "EGP" | "SAR" | "USD";

const LABELS: Record<CurrencyCode, { ar: string; en: string }> = {
  EGP: { ar: "ج.م", en: "EGP" },
  SAR: { ar: "ر.س", en: "SAR" },
  USD: { ar: "دولار", en: "USD" },
};

export function formatMoney(
  amount: number | string,
  language: AppLanguage,
  options?: {
    decimals?: number;
    showCode?: boolean;
    currency?: CurrencyCode;
    /** When true, `amount` is already in the target currency. Default assumes EGP catalog prices. */
    converted?: boolean;
    convertFromEgp?: (egp: number) => number;
  }
): string {
  const decimals = options?.decimals ?? 0;
  const showCode = options?.showCode ?? true;
  const currency = options?.currency ?? "EGP";
  const numeric = typeof amount === "string" ? Number(amount.replace(/,/g, "")) : amount;
  let value = Number.isFinite(numeric) ? numeric : 0;
  if (!options?.converted && options?.convertFromEgp) {
    value = options.convertFromEgp(value);
  }

  const formatted = value.toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (!showCode) return formatted;
  return `${formatted} ${LABELS[currency][language]}`;
}

export function formatMoneyFixed(
  amount: number,
  language: AppLanguage,
  decimals = 2,
  options?: {
    currency?: CurrencyCode;
    convertFromEgp?: (egp: number) => number;
  }
): string {
  return formatMoney(amount, language, {
    decimals,
    currency: options?.currency,
    convertFromEgp: options?.convertFromEgp,
  });
}
