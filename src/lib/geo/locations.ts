import { City, Country, State } from "country-state-city";
import type { AppLanguage } from "@/lib/i18n/language";

export type GeoOption = {
  value: string;
  label: string;
  searchText: string;
  flag?: string;
  dialCode?: string;
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

/** Localized country display name (falls back to English dataset name). */
export function countryDisplayName(isoCode: string, language: AppLanguage, fallback?: string) {
  try {
    const name = regionNames(language).of(isoCode.toUpperCase());
    if (name) return name;
  } catch {
    // ignore
  }
  return fallback || isoCode;
}

export function normalizeDialCode(raw: string | null | undefined): string {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits;
}

export function formatDialCode(raw: string | null | undefined): string {
  const digits = normalizeDialCode(raw);
  return digits ? `+${digits}` : "";
}

/** Build E.164-ish phone string for storage (max ~20 digits + plus). */
export function composePhone(dialCode: string, nationalNumber: string): string {
  const dial = normalizeDialCode(dialCode);
  const national = String(nationalNumber || "").replace(/[^\d]/g, "");
  if (!dial || !national) return national || "";
  return `+${dial}${national}`;
}

/** Split a stored phone into dial code + national using known country phonecodes. */
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

  // Longest matching dial code wins.
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
      searchText: `${label} ${c.name} ${c.isoCode} ${dial}`.toLowerCase(),
    };
  });
}

export function getDialOptions(language: AppLanguage): GeoOption[] {
  // Deduplicate by iso (US/CA share +1 but keep both entries for flags).
  return getCountryOptions(language).map((c) => ({
    ...c,
    label: `${c.flag ? `${c.flag} ` : ""}${formatDialCode(c.dialCode)} ${c.label}`,
    searchText: `${c.searchText} ${formatDialCode(c.dialCode)}`.toLowerCase(),
  }));
}

export function getStateOptions(countryCode: string): GeoOption[] {
  if (!countryCode) return [];
  return State.getStatesOfCountry(countryCode).map((s) => ({
    value: s.isoCode,
    label: s.name,
    searchText: `${s.name} ${s.isoCode}`.toLowerCase(),
  }));
}

export function getCityOptions(countryCode: string, stateCode: string): GeoOption[] {
  if (!countryCode) return [];
  const cities = stateCode
    ? City.getCitiesOfState(countryCode, stateCode) || []
    : City.getCitiesOfCountry(countryCode) || [];
  return cities.map((city) => ({
    value: city.name,
    label: city.name,
    searchText: city.name.toLowerCase(),
  }));
}

export function getCountryByCode(code: string) {
  return Country.getCountryByCode(code.toUpperCase()) || null;
}

export function getStateByCode(countryCode: string, stateCode: string) {
  return State.getStateByCodeAndCountry(stateCode, countryCode) || null;
}
