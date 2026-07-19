export type AppLanguage = "ar" | "en";

export function formatMoney(
  amount: number | string,
  language: AppLanguage,
  options?: { decimals?: number; showCode?: boolean }
): string {
  const decimals = options?.decimals ?? 0;
  const showCode = options?.showCode ?? true;
  const numeric = typeof amount === "string" ? Number(amount.replace(/,/g, "")) : amount;
  const value = Number.isFinite(numeric) ? numeric : 0;
  const formatted = value.toLocaleString(language === "ar" ? "ar-SA" : "en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (!showCode) return formatted;
  return `${formatted} ${language === "ar" ? "ر.س" : "SAR"}`;
}

export function formatMoneyFixed(
  amount: number,
  language: AppLanguage,
  decimals = 2
): string {
  return formatMoney(amount, language, { decimals });
}
