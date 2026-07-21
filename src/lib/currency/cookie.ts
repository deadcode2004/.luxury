export type CurrencyCode = "EGP" | "SAR" | "USD";

export const CURRENCY_STORAGE_KEY = "paradise_currency";
export const CURRENCY_MANUAL_KEY = "paradise_currency_manual";
export const CURRENCY_COOKIE = "paradise_currency";
export const CURRENCY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === "EGP" || value === "SAR" || value === "USD";
}

export function readCurrencyCookie(raw?: string | null): CurrencyCode | null {
  return isCurrencyCode(raw) ? raw : null;
}

/** Client-side cookie write (readable by SSR on next request). */
export function writeCurrencyCookie(currency: CurrencyCode) {
  if (typeof document === "undefined") return;
  document.cookie = `${CURRENCY_COOKIE}=${currency}; Path=/; Max-Age=${CURRENCY_COOKIE_MAX_AGE}; SameSite=Lax`;
}
