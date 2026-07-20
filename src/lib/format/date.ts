import type { AppLanguage } from "./currency";

/** Formats ISO-like date strings (YYYY-MM-DD) for display. */
export function formatDate(value: string, language: AppLanguage): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
