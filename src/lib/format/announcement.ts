import type { CurrencyCode } from "@/contexts/CurrencyContext";
import type { AppLanguage } from "@/lib/format/currency";
import { formatMoney } from "@/lib/format/currency";

/**
 * Matches catalog amounts written in EGP (Arabic or English markers).
 * Owner always authors prices in EGP; visitors see converted display currency.
 */
const EGP_AMOUNT_RE =
  /(\d+(?:[.,]\d+)?)\s*(ج\.?\s*م\.?|جنيه(?:\s*مصري)?|EGP|egp|Egyptian\s+Pounds?)/giu;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatConvertedEgp(
  egp: number,
  options: {
    language: AppLanguage;
    currency: CurrencyCode;
    convertFromEgp: (egp: number) => number;
  }
): string {
  const converted = options.convertFromEgp(egp);
  const decimals = Number.isInteger(converted) ? 0 : 2;
  return formatMoney(converted, options.language, {
    currency: options.currency,
    converted: true,
    decimals,
  });
}

/**
 * Rewrites EGP amounts in announcement copy to the visitor's display currency.
 * Prefer `sourceAr` (authoritative CMS Arabic) so EN translations that drop
 * currency markers still convert correctly.
 */
export function localizeAnnouncementAmounts(
  text: string,
  options: {
    language: AppLanguage;
    currency: CurrencyCode;
    convertFromEgp: (egp: number) => number;
    sourceAr?: string;
  }
): string {
  if (!text) return text;

  const withMarkers = text.replace(EGP_AMOUNT_RE, (_match, rawAmount: string) => {
    const egp = Number(String(rawAmount).replace(/,/g, ""));
    if (!Number.isFinite(egp)) return _match;
    return formatConvertedEgp(egp, options);
  });

  if (withMarkers !== text) return withMarkers;

  const source = options.sourceAr?.trim();
  if (!source) return text;

  let result = text;
  const matches = source.matchAll(new RegExp(EGP_AMOUNT_RE.source, "giu"));
  for (const match of matches) {
    const rawAmount = match[1];
    const egp = Number(String(rawAmount).replace(/,/g, ""));
    if (!Number.isFinite(egp)) continue;

    const formatted = formatConvertedEgp(egp, options);
    const bareNumber = new RegExp(`(?<!\\d)${escapeRegExp(rawAmount)}(?!\\d)`);
    result = result.replace(bareNumber, formatted);
  }

  return result;
}
