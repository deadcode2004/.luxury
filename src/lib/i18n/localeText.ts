import type { AppLanguage } from "@/lib/i18n/language";
import type { LocaleText } from "@/lib/api/owner";

/** Accept full LocaleText or partial API payloads where one locale may be missing. */
export type LocaleTextLike = Partial<LocaleText> | null | undefined;

/** Pick the localized string for the active UI language, with safe fallbacks. */
export function pickLocale(
  text: LocaleTextLike,
  language: AppLanguage,
  fallback = ""
): string {
  if (!text) return fallback;
  const preferred = (text[language] || "").trim();
  if (preferred) return preferred;
  const ar = (text.ar || "").trim();
  if (ar) return ar;
  const en = (text.en || "").trim();
  return en || fallback;
}

/** True when an English auto-translation is available to show in the dashboard. */
export function hasEnglishTranslation(text: LocaleTextLike): boolean {
  return Boolean(text?.en?.trim());
}
