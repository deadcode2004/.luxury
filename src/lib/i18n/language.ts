export type AppLanguage = "ar" | "en";

export const LANGUAGE_STORAGE_KEY = "paradise_language";
export const LANGUAGE_COOKIE = "paradise_lang";
export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isAppLanguage(value: unknown): value is AppLanguage {
  return value === "ar" || value === "en";
}

export function languageDir(language: AppLanguage): "rtl" | "ltr" {
  return language === "ar" ? "rtl" : "ltr";
}

export function readLanguageCookie(raw?: string | null): AppLanguage | null {
  return isAppLanguage(raw) ? raw : null;
}

/** Client-side cookie write (readable by SSR on next request). */
export function writeLanguageCookie(language: AppLanguage) {
  if (typeof document === "undefined") return;
  document.cookie = `${LANGUAGE_COOKIE}=${language}; Path=/; Max-Age=${LANGUAGE_COOKIE_MAX_AGE}; SameSite=Lax`;
}
