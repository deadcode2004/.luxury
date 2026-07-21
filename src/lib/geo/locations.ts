import { City, Country, State } from "country-state-city";
import type { AppLanguage } from "@/lib/i18n/language";
import {
  bilingualAdminName,
  bilingualCityName,
  bilingualSearchText,
  cleanLatinName,
  hasArabicScript,
  resolveAdminBilingual,
  resolveCityBilingual,
  resolveCountryBilingual,
  type BilingualName,
} from "@/lib/geo/bilingual-places";

export type GeoOption = {
  value: string;
  label: string;
  searchText: string;
  flag?: string;
  dialCode?: string;
  meta?: string;
};

const regionNamesCache = new Map<string, Intl.DisplayNames>();

function regionNames(language: AppLanguage) {
  const key = language === "ar" ? "ar" : "en";
  let cached = regionNamesCache.get(key);
  if (!cached) {
    cached = new Intl.DisplayNames([key], { type: "region" });
    regionNamesCache.set(key, cached);
  }
  return cached;
}

/**
 * Build a monolingual option list for the active site language.
 * Never mixes Arabic and English labels in the same list.
 */
function toMonolingualOptions(
  rows: Array<{ value: string; names: BilingualName; extraSearch?: string }>,
  language: AppLanguage
): GeoOption[] {
  if (rows.length === 0) return [];

  if (language === "en") {
    return rows.map((row) => {
      const label = hasArabicScript(row.names.en)
        ? cleanLatinName(row.value) || row.names.en
        : row.names.en;
      return {
        value: row.value,
        label,
        searchText: bilingualSearchText(row.names.en, row.names.ar, row.extraSearch),
      };
    });
  }

  const translated = rows.filter((row) => row.names.ar && hasArabicScript(row.names.ar));

  // No Arabic in dataset → monolingual English fallback (still no mixing).
  if (translated.length === 0) {
    return rows.map((row) => ({
      value: row.value,
      label: row.names.en,
      searchText: bilingualSearchText(row.names.en, row.names.ar, row.extraSearch),
    }));
  }

  // Full or partial Arabic: expose only rows that have Arabic labels.
  return translated.map((row) => ({
    value: row.value,
    label: row.names.ar,
    searchText: bilingualSearchText(row.names.en, row.names.ar, row.extraSearch),
  }));
}

/** Localized country display name (AR/EN) from static bilingual data + Intl fallback. */
export function countryDisplayName(isoCode: string, language: AppLanguage, fallback?: string) {
  const code = isoCode.toUpperCase();
  const pair = resolveCountryBilingual(code, fallback);

  if (language === "ar") {
    if (pair.ar && hasArabicScript(pair.ar)) return pair.ar;
    try {
      const intlAr = regionNames("ar").of(code);
      if (intlAr && hasArabicScript(intlAr)) return intlAr;
    } catch {
      // ignore
    }
    return pair.en || fallback || code;
  }

  if (pair.en) return pair.en;
  try {
    const intlEn = regionNames("en").of(code);
    if (intlEn) return intlEn;
  } catch {
    // ignore
  }
  return fallback || code;
}

/**
 * Localized state/city label from static bilingual indexes.
 * Stored values stay English / ISO; only the display label changes with language.
 */
export function placeDisplayName(
  englishName: string,
  countryCode: string,
  language: AppLanguage,
  kind: "state" | "city" = "city"
): string {
  if (kind === "state") return bilingualAdminName(countryCode, englishName, language);
  return bilingualCityName(countryCode, englishName, language);
}

export function normalizeDialCode(raw: string | null | undefined): string {
  return String(raw || "").replace(/[^\d]/g, "");
}

export function formatDialCode(raw: string | null | undefined): string {
  const digits = normalizeDialCode(raw);
  return digits ? `+${digits}` : "";
}

export function composePhone(dialCode: string, nationalNumber: string): string {
  const dial = normalizeDialCode(dialCode);
  const national = String(nationalNumber || "").replace(/[^\d]/g, "");
  if (!dial || !national) return national || "";
  return `+${dial}${national}`;
}

export function splitPhone(
  phone: string | null | undefined,
  preferredCountry?: string | null
): { countryCode: string; dialCode: string; nationalNumber: string } {
  const raw = String(phone || "").trim();
  const digits = raw.replace(/[^\d]/g, "");
  const countries = Country.getAllCountries();

  if (preferredCountry) {
    const preferred = Country.getCountryByCode(preferredCountry.toUpperCase());
    if (preferred) {
      const dial = normalizeDialCode(preferred.phonecode);
      if (digits.startsWith(dial) && dial) {
        return {
          countryCode: preferred.isoCode,
          dialCode: dial,
          nationalNumber: digits.slice(dial.length),
        };
      }
      return {
        countryCode: preferred.isoCode,
        dialCode: dial,
        nationalNumber: digits,
      };
    }
  }

  let best: { isoCode: string; dial: string } | null = null;
  for (const c of countries) {
    const dial = normalizeDialCode(c.phonecode);
    if (!dial || !digits.startsWith(dial)) continue;
    if (!best || dial.length > best.dial.length) {
      best = { isoCode: c.isoCode, dial };
    }
  }

  if (best) {
    return {
      countryCode: best.isoCode,
      dialCode: best.dial,
      nationalNumber: digits.slice(best.dial.length),
    };
  }

  return { countryCode: "SA", dialCode: "966", nationalNumber: digits };
}

let countriesCache: ReturnType<typeof Country.getAllCountries> | null = null;

export function getAllCountries() {
  if (!countriesCache) countriesCache = Country.getAllCountries();
  return countriesCache;
}

export function getCountryOptions(language: AppLanguage): GeoOption[] {
  const rows = getAllCountries().map((c) => {
    const names = resolveCountryBilingual(c.isoCode, c.name);
    try {
      const intlAr = regionNames("ar").of(c.isoCode);
      if (intlAr && hasArabicScript(intlAr)) {
        // Prefer real Arabic (Intl) over Latin mistakenly stored as nameAr.
        if (!names.ar || !hasArabicScript(names.ar)) names.ar = intlAr;
      }
    } catch {
      // ignore
    }
    try {
      const intlEn = regionNames("en").of(c.isoCode);
      if (intlEn) names.en = names.en || intlEn;
    } catch {
      // ignore
    }
    return {
      value: c.isoCode,
      names: { en: names.en || c.name, ar: names.ar },
      extraSearch: `${c.isoCode} ${formatDialCode(c.phonecode)}`,
      flag: c.flag,
      dialCode: normalizeDialCode(c.phonecode),
      meta: formatDialCode(c.phonecode),
    };
  });

  const options = toMonolingualOptions(
    rows.map((r) => ({ value: r.value, names: r.names, extraSearch: r.extraSearch })),
    language
  );

  return options.map((opt) => {
    const src = rows.find((r) => r.value === opt.value)!;
    return {
      ...opt,
      flag: src.flag,
      dialCode: src.dialCode,
      meta: src.meta,
    };
  });
}

/** Dial-code picker options with localized country names. */
export function getDialOptions(language: AppLanguage): GeoOption[] {
  return getCountryOptions(language);
}

export function getStateOptions(countryCode: string, language: AppLanguage = "en"): GeoOption[] {
  if (!countryCode) return [];
  const rows = State.getStatesOfCountry(countryCode).map((s) => {
    const names = resolveAdminBilingual(countryCode, s.name);
    return {
      value: s.isoCode,
      names: {
        en: names.en || cleanLatinName(s.name),
        ar: names.ar,
      },
      extraSearch: s.isoCode,
    };
  });
  return toMonolingualOptions(rows, language);
}

export function getCityOptions(
  countryCode: string,
  stateCode: string,
  language: AppLanguage = "en"
): GeoOption[] {
  if (!countryCode) return [];
  const cities = stateCode
    ? City.getCitiesOfState(countryCode, stateCode) || []
    : City.getCitiesOfCountry(countryCode) || [];

  const rows = cities.map((city) => {
    const names = resolveCityBilingual(countryCode, city.name);
    return {
      value: city.name,
      names: {
        en: names.en || cleanLatinName(city.name),
        ar: names.ar,
      },
    };
  });

  if (language === "ar") {
    const translated = rows.filter((row) => row.names.ar && hasArabicScript(row.names.ar));
    // Never show an English city list while the site language is Arabic.
    if (translated.length === 0) return [];
    return translated.map((row) => ({
      value: row.value,
      label: row.names.ar,
      searchText: bilingualSearchText(row.names.en, row.names.ar),
    }));
  }

  return toMonolingualOptions(rows, "en");
}

export function getCountryByCode(code: string) {
  return Country.getCountryByCode(code.toUpperCase()) || null;
}

export function getStateByCode(countryCode: string, stateCode: string) {
  return State.getStateByCodeAndCountry(stateCode, countryCode) || null;
}

export { hasArabicScript };
