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

type PersonNameSource = {
  name?: string | null;
  name_i18n?: LocaleTextLike;
  first_name_i18n?: LocaleTextLike;
  last_name_i18n?: LocaleTextLike;
  email?: string | null;
} | null | undefined;

/** Localized person display name for admin/customer UIs (falls back to legacy name/email). */
export function displayPersonName(
  person: PersonNameSource,
  language: AppLanguage,
  fallback = "—"
): string {
  if (!person) return fallback;

  const fromName = pickLocale(person.name_i18n, language);
  if (fromName) return fromName;

  const composed = [
    pickLocale(person.first_name_i18n, language),
    pickLocale(person.last_name_i18n, language),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (composed) return composed;

  const legacy = (person.name || "").trim();
  if (legacy) return legacy;

  const email = (person.email || "").trim();
  return email || fallback;
}
