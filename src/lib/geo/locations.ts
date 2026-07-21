import { City, Country, State } from "country-state-city";
import type { AppLanguage } from "@/lib/i18n/language";
import {
  bilingualAdminName,
  bilingualCityName,
  bilingualCountryName,
  bilingualSearchText,
  cleanLatinName,
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

/** Localized country display name (AR/EN) from static bilingual data + Intl fallback. */
export function countryDisplayName(isoCode: string, language: AppLanguage, fallback?: string) {
  const code = isoCode.toUpperCase();
  const fromStatic = bilingualCountryName(code, language, fallback);
  if (fromStatic && fromStatic !== code) return fromStatic;

  try {
    const name = regionNames(language).of(code);
    if (name) return name;
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
  return getAllCountries().map((c) => {
    const label = countryDisplayName(c.isoCode, language, c.name);
    const dial = formatDialCode(c.phonecode);
    return {
      value: c.isoCode,
      label,
      flag: c.flag,
      dialCode: normalizeDialCode(c.phonecode),
      meta: dial,
      searchText: bilingualSearchText(c.name, label, `${c.isoCode} ${dial}`),
    };
  });
}

/** Dial-code picker options with localized country names. */
export function getDialOptions(language: AppLanguage): GeoOption[] {
  return getAllCountries().map((c) => {
    const label = countryDisplayName(c.isoCode, language, c.name);
    const dial = formatDialCode(c.phonecode);
    return {
      value: c.isoCode,
      label,
      flag: c.flag,
      dialCode: normalizeDialCode(c.phonecode),
      meta: dial,
      searchText: bilingualSearchText(
        c.name,
        label,
        `${c.isoCode} ${dial} ${normalizeDialCode(c.phonecode)}`
      ),
    };
  });
}

export function getStateOptions(countryCode: string, language: AppLanguage = "en"): GeoOption[] {
  if (!countryCode) return [];
  return State.getStatesOfCountry(countryCode).map((s) => {
    const label = placeDisplayName(s.name, countryCode, language, "state");
    const en = cleanLatinName(s.name);
    return {
      value: s.isoCode,
      label,
      searchText: bilingualSearchText(en, label, s.isoCode),
    };
  });
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

  return cities.map((city) => {
    const label = placeDisplayName(city.name, countryCode, language, "city");
    const en = cleanLatinName(city.name);
    return {
      // Stable English CSC name — language changes only update `label`.
      value: city.name,
      label,
      searchText: bilingualSearchText(en, label),
    };
  });
}

export function getCountryByCode(code: string) {
  return Country.getCountryByCode(code.toUpperCase()) || null;
}

export function getStateByCode(countryCode: string, stateCode: string) {
  return State.getStateByCodeAndCountry(stateCode, countryCode) || null;
}
