import { apiRequest } from "@/lib/api/client";
import type { AppLanguage } from "@/lib/i18n/language";

export type GeoCountry = {
  id: number;
  iso2: string;
  name_en: string;
  name_ar: string;
  phonecode: string | null;
  flag: string | null;
  dial_code: string | null;
  postal_code_required?: boolean;
};

export type GeoState = {
  id: number;
  country_id: number;
  code: string | null;
  name_en: string;
  name_ar: string;
};

export type GeoCity = {
  id: number;
  country_id: number;
  state_id: number;
  name_en: string;
  name_ar: string;
};

export type GeoPostalCode = {
  id: number;
  country_id: number;
  state_id: number;
  city_id: number;
  code: string;
  place_name_en: string | null;
  place_name_ar: string | null;
};

export type GeoOption = {
  value: string;
  label: string;
  searchText: string;
  flag?: string;
  meta?: string;
  dialCode?: string;
};

function labelFor(row: { name_en: string; name_ar: string }, language: AppLanguage): string {
  return language === "ar" ? row.name_ar : row.name_en;
}

function toOption(
  row: { id: number; name_en: string; name_ar: string },
  language: AppLanguage,
  extra?: Partial<GeoOption>
): GeoOption {
  const label = labelFor(row, language);
  return {
    value: String(row.id),
    label,
    searchText: `${row.name_en} ${row.name_ar} ${extra?.meta || ""}`.toLowerCase(),
    ...extra,
  };
}

export async function fetchGeoCountries(q = "", limit = 300): Promise<GeoCountry[]> {
  const qs = new URLSearchParams();
  if (q.trim()) qs.set("q", q.trim());
  qs.set("limit", String(limit));
  return apiRequest<GeoCountry[]>(`/geo/countries?${qs.toString()}`, { cache: "no-store" });
}

export async function fetchGeoStates(
  countryId: number,
  q = "",
  limit = 500
): Promise<GeoState[]> {
  const qs = new URLSearchParams();
  if (q.trim()) qs.set("q", q.trim());
  qs.set("limit", String(limit));
  return apiRequest<GeoState[]>(`/geo/countries/${countryId}/states?${qs.toString()}`, {
    cache: "no-store",
  });
}

export async function fetchGeoCities(
  stateId: number,
  q = "",
  limit = 200
): Promise<GeoCity[]> {
  const qs = new URLSearchParams();
  if (q.trim()) qs.set("q", q.trim());
  qs.set("limit", String(limit));
  return apiRequest<GeoCity[]>(`/geo/states/${stateId}/cities?${qs.toString()}`, {
    cache: "no-store",
  });
}

export async function fetchGeoPostalCodes(
  cityId: number,
  q = "",
  limit = 50
): Promise<GeoPostalCode[]> {
  const qs = new URLSearchParams();
  if (q.trim()) qs.set("q", q.trim());
  qs.set("limit", String(limit));
  return apiRequest<GeoPostalCode[]>(`/geo/cities/${cityId}/postal-codes?${qs.toString()}`, {
    cache: "no-store",
  });
}

export function countriesToOptions(rows: GeoCountry[], language: AppLanguage): GeoOption[] {
  return rows.map((c) =>
    toOption(c, language, {
      flag: c.flag || undefined,
      meta: c.dial_code || undefined,
      dialCode: c.phonecode || undefined,
    })
  );
}

export function statesToOptions(rows: GeoState[], language: AppLanguage): GeoOption[] {
  return rows.map((s) => toOption(s, language));
}

export function citiesToOptions(rows: GeoCity[], language: AppLanguage): GeoOption[] {
  return rows.map((c) => toOption(c, language));
}
