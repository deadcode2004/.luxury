/**
 * Static bilingual place-name indexes (EN/AR).
 *
 * Built once at module load from:
 * - countries-cities-ar (countries + admin divisions)
 * - i18n-iso-cities locale JSON (major cities)
 *
 * No live / fuzzy translation when opening dropdowns.
 */

import {
  allCountries,
  getCitiesByCountryCode,
  getCountryByCode as getArCountryByCode,
} from "countries-cities-ar";
import arCitiesJson from "i18n-iso-cities/langs/ar.json";
import enCitiesJson from "i18n-iso-cities/langs/en.json";
import type { AppLanguage } from "@/lib/i18n/language";
import { CITY_AR_OVERRIDES } from "@/lib/geo/city-ar-overrides";

export type BilingualName = {
  en: string;
  ar: string;
};

/** Admin-division suffixes that differ between CSC and countries-cities-ar. */
const ADMIN_SUFFIX_RE =
  /\b(governorate|emirate|municipality|district|region|province|state|county|department|prefecture|parish|division|territory|oblast|krai|republic|city|wilaya|muhafazah|muhafaza)\b/g;

/**
 * Global bidirectional alias groups (normalized). First entry is canonical.
 * Safe across countries (no generic words like "capital" / "northern").
 */
const GLOBAL_ALIAS_GROUPS: string[][] = [
  ["asir", "aseer"],
  ["madinah", "al madinah", "al madinah al munawwarah", "medina"],
  ["qassim", "al qassim", "al qasim", "qasim"],
  ["hail", "ha il"],
  ["jazan", "jizan"],
  ["al bahah", "al baha", "bahah", "baha"],
  ["al jawf", "jawf"],
  ["abu dhabi", "abu zaby", "abu zabay"],
  ["sharjah", "ash shariqah"],
  ["dubai", "dubayy"],
  ["ras al khaimah", "raas al khaimah", "raas al khaymah"],
  ["fujairah", "al fujayrah", "fujayrah"],
  ["umm al quwain", "umm al qaywayn"],
  ["makkah", "mecca", "makkah al mukarramah"],
  ["riyadh", "ar riyad"],
  ["eastern province", "ash sharqiyah", "eastern"],
  ["northern borders", "al hudud ash shamaliyah", "northern border"],
  ["aden", "adan"],
  ["hodeidah", "al hudaydah", "hudaydah"],
  ["marib", "ma rib"],
];

/** Country-specific aliases: CSC name → package English name */
const COUNTRY_ALIASES: Record<string, Record<string, string>> = {
  BH: {
    capital: "al manamah",
    central: "al mintaqah al wusta",
    northern: "al mintaqah ash shamaliyah",
    muharraq: "al muharraq",
  },
  AE: {
    "abu dhabi": "abu dhabi",
    "ajman": "ajman",
    sharjah: "sharjah",
  },
  OM: {
    "al batinah": "al batinah north",
    "ash sharqiyah": "ash sharqiyah north",
  },
  YE: {
    adan: "aden",
    "al hudaydah": "hodeidah",
    "ma rib": "marib",
  },
};

const globalAliasCanonical = new Map<string, string>();
for (const group of GLOBAL_ALIAS_GROUPS) {
  const canon = normalizeKey(group[0]);
  for (const item of group) {
    globalAliasCanonical.set(normalizeKey(item), canon);
  }
}

export function normalizeKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Latin display cleanup (Ḩalwān → Halwan) without changing stored values. */
export function cleanLatinName(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim();
}

function stripAdminSuffix(value: string): string {
  return normalizeKey(value).replace(ADMIN_SUFFIX_RE, "").replace(/\s+/g, " ").trim();
}

function resolveCountryAlias(countryCode: string, key: string): string | undefined {
  const table = COUNTRY_ALIASES[countryCode.toUpperCase()];
  if (!table) return undefined;
  return table[key] ? normalizeKey(table[key]) : undefined;
}

function canonicalKey(countryCode: string, value: string): string {
  const stripped = stripAdminSuffix(value);
  const raw = normalizeKey(value);
  const countryAlias =
    resolveCountryAlias(countryCode, stripped) || resolveCountryAlias(countryCode, raw);
  if (countryAlias) return countryAlias;
  return globalAliasCanonical.get(stripped) || globalAliasCanonical.get(raw) || stripped || raw;
}

/** Lookup keys to try when indexing or resolving a place name. */
export function placeLookupKeys(value: string, countryCode = ""): string[] {
  const raw = normalizeKey(value);
  const stripped = stripAdminSuffix(value);
  const canon = countryCode ? canonicalKey(countryCode, value) : stripAdminSuffix(value);
  const keys = new Set<string>([raw, stripped, canon].filter(Boolean));
  if (stripped.startsWith("al ")) keys.add(stripped.slice(3));
  if (raw.startsWith("al ")) keys.add(raw.slice(3));
  if (countryCode) {
    const aliased =
      resolveCountryAlias(countryCode, stripped) || resolveCountryAlias(countryCode, raw);
    if (aliased) keys.add(aliased);
  }
  const global = globalAliasCanonical.get(stripped) || globalAliasCanonical.get(raw);
  if (global) keys.add(global);
  return [...keys];
}

/**
 * Pick a display label. English always prefers the caller’s source name
 * (CSC / package) so we don’t collapse “Al Ain City” → “Al Ain”.
 * Arabic uses the static bilingual index when available.
 */
function pickLabel(
  names: BilingualName,
  language: AppLanguage,
  sourceEnglish?: string
): string {
  if (language === "ar" && names.ar) return names.ar;
  return cleanLatinName(sourceEnglish || names.en);
}

/** Country code → normalized key → bilingual admin-division name */
const adminByCountry = new Map<string, Map<string, BilingualName>>();
/** Country code → normalized key → bilingual city name */
const cityByCountry = new Map<string, Map<string, BilingualName>>();
/** ISO country → bilingual country name */
const countryNames = new Map<string, BilingualName>();

function indexInto(
  target: Map<string, Map<string, BilingualName>>,
  countryCode: string,
  names: BilingualName
) {
  const cc = countryCode.toUpperCase();
  let bucket = target.get(cc);
  if (!bucket) {
    bucket = new Map();
    target.set(cc, bucket);
  }
  for (const key of placeLookupKeys(names.en, cc)) {
    if (!key) continue;
    const existing = bucket.get(key);
    // Prefer entries that already have Arabic; don't overwrite AR with empty.
    if (existing?.ar && !names.ar) continue;
    bucket.set(key, {
      en: cleanLatinName(names.en) || names.en,
      ar: names.ar || existing?.ar || "",
    });
  }
}

function buildIndexes() {
  for (const country of allCountries) {
    const code = String(country.code || "").toUpperCase();
    if (!code) continue;
    countryNames.set(code, {
      en: country.name || code,
      ar: country.nameAr || "",
    });

    for (const place of country.cities || []) {
      if (!place?.name) continue;
      const names: BilingualName = {
        en: place.name,
        ar: place.nameAr || "",
      };
      // Package "cities" are admin divisions (states/provinces/governorates).
      indexInto(adminByCountry, code, names);
      // Also index as city labels when a municipality shares the same English name.
      if (names.ar) indexInto(cityByCountry, code, names);
    }
  }

  const arCities = (arCitiesJson as { cities?: Record<string, Record<string, string>> }).cities || {};
  const enCities = (enCitiesJson as { cities?: Record<string, Record<string, string>> }).cities || {};

  for (const [code, arMap] of Object.entries(arCities)) {
    const enMap = enCities[code] || {};
    for (const [key, arName] of Object.entries(arMap || {})) {
      if (!arName) continue;
      const enName = enMap[key] || key;
      indexInto(cityByCountry, code, { en: enName, ar: arName });
    }
  }

  for (const [code, overrides] of Object.entries(CITY_AR_OVERRIDES)) {
    for (const [enKey, arName] of Object.entries(overrides)) {
      if (!arName) continue;
      indexInto(cityByCountry, code, { en: enKey, ar: arName });
    }
  }
}

buildIndexes();

export function bilingualCountryName(
  isoCode: string,
  language: AppLanguage,
  fallback?: string
): string {
  const code = isoCode.toUpperCase();
  const fromIndex = countryNames.get(code);
  if (fromIndex) return pickLabel(fromIndex, language);

  const fromPackage = getArCountryByCode(code);
  if (fromPackage) {
    return pickLabel(
      { en: fromPackage.name || code, ar: fromPackage.nameAr || "" },
      language
    );
  }

  return fallback || code;
}

export function bilingualAdminName(
  countryCode: string,
  englishName: string,
  language: AppLanguage
): string {
  const name = englishName.trim();
  if (!name) return name;
  const cc = countryCode.toUpperCase();
  const bucket = adminByCountry.get(cc);
  if (bucket) {
    for (const key of placeLookupKeys(name, cc)) {
      const hit = bucket.get(key);
      if (hit) return pickLabel(hit, language, name);
    }
  }
  // Fallback: direct package list exact key match (still static, no fuzzy).
  const pack = getCitiesByCountryCode(cc) || [];
  const keys = new Set(placeLookupKeys(name, cc));
  for (const place of pack) {
    if (!place?.name) continue;
    if (placeLookupKeys(place.name, cc).some((k) => keys.has(k))) {
      return pickLabel({ en: place.name, ar: place.nameAr || "" }, language, name);
    }
  }
  return pickLabel({ en: name, ar: "" }, language, name);
}

export function bilingualCityName(
  countryCode: string,
  englishName: string,
  language: AppLanguage
): string {
  const name = englishName.trim();
  if (!name) return name;
  const cc = countryCode.toUpperCase();
  const bucket = cityByCountry.get(cc);
  if (bucket) {
    for (const key of placeLookupKeys(name, cc)) {
      const hit = bucket.get(key);
      if (hit) return pickLabel(hit, language, name);
    }
  }
  return pickLabel({ en: name, ar: "" }, language, name);
}

export function bilingualSearchText(en: string, ar: string, extra = ""): string {
  return `${en} ${ar} ${extra}`.toLowerCase();
}
