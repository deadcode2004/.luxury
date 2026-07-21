import { City, Country, State } from "country-state-city";
import {
  getCitiesByCountryCode,
  getCountryByCode as getArCountryByCode,
} from "countries-cities-ar";
import citiesI18n from "i18n-iso-cities";
import arCities from "i18n-iso-cities/langs/ar.json";
import enCities from "i18n-iso-cities/langs/en.json";
import type { AppLanguage } from "@/lib/i18n/language";

citiesI18n.registerLocale(arCities);
citiesI18n.registerLocale(enCities);

export type GeoOption = {
  value: string;
  label: string;
  searchText: string;
  flag?: string;
  dialCode?: string;
  meta?: string;
};

const regionNamesCache = new Map<string, Intl.DisplayNames>();
const arPlaceCache = new Map<string, string>();

function regionNames(language: AppLanguage) {
  const key = language === "ar" ? "ar" : "en";
  let cached = regionNamesCache.get(key);
  if (!cached) {
    cached = new Intl.DisplayNames([key], { type: "region" });
    regionNamesCache.set(key, cached);
  }
  return cached;
}

function normalizeKey(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Localized country display name (AR/EN). */
export function countryDisplayName(isoCode: string, language: AppLanguage, fallback?: string) {
  const code = isoCode.toUpperCase();
  const fromPackage = getArCountryByCode(code);
  if (language === "ar" && fromPackage?.nameAr) return fromPackage.nameAr;
  if (language === "en" && fromPackage?.name) return fromPackage.name;

  try {
    const name = regionNames(language).of(code);
    if (name) return name;
  } catch {
    // ignore
  }
  return fallback || fromPackage?.name || code;
}

/** Best-effort place name localization (state / city). Value stays English for stability. */
export function placeDisplayName(
  englishName: string,
  countryCode: string,
  language: AppLanguage
): string {
  const name = englishName.trim();
  if (!name) return name;
  if (language === "en") return name;

  const cacheKey = `${countryCode}:${normalizeKey(name)}`;
  const cached = arPlaceCache.get(cacheKey);
  if (cached) return cached;

  const fromCities = citiesI18n.getName(countryCode, name, "ar");
  if (fromCities) {
    arPlaceCache.set(cacheKey, fromCities);
    return fromCities;
  }

  const translated = citiesI18n.translate(name, "ar");
  if (translated && translated !== name) {
    arPlaceCache.set(cacheKey, translated);
    return translated;
  }

  const localList = getCitiesByCountryCode(countryCode) || [];
  const needle = normalizeKey(name);
  const exact = localList.find((c) => normalizeKey(c.name) === needle);
  if (exact?.nameAr) {
    arPlaceCache.set(cacheKey, exact.nameAr);
    return exact.nameAr;
  }

  const fuzzy = localList.find((c) => {
    const n = normalizeKey(c.name);
    return n.includes(needle) || needle.includes(n);
  });
  if (fuzzy?.nameAr) {
    arPlaceCache.set(cacheKey, fuzzy.nameAr);
    return fuzzy.nameAr;
  }

  arPlaceCache.set(cacheKey, name);
  return name;
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
      searchText: `${label} ${c.name} ${c.isoCode} ${dial}`.toLowerCase(),
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
      searchText: `${label} ${c.name} ${c.isoCode} ${dial} ${normalizeDialCode(c.phonecode)}`.toLowerCase(),
    };
  });
}

export function getStateOptions(countryCode: string, language: AppLanguage = "en"): GeoOption[] {
  if (!countryCode) return [];
  return State.getStatesOfCountry(countryCode).map((s) => {
    const label = placeDisplayName(s.name, countryCode, language);
    return {
      value: s.isoCode,
      label,
      searchText: `${label} ${s.name} ${s.isoCode}`.toLowerCase(),
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
    const label = placeDisplayName(city.name, countryCode, language);
    return {
      value: city.name,
      label,
      searchText: `${label} ${city.name}`.toLowerCase(),
    };
  });
}

export function getCountryByCode(code: string) {
  return Country.getCountryByCode(code.toUpperCase()) || null;
}

export function getStateByCode(countryCode: string, stateCode: string) {
  return State.getStateByCodeAndCountry(stateCode, countryCode) || null;
}
