"use client";

import React, { useEffect, useMemo, useState } from "react";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  citiesToOptions,
  countriesToOptions,
  fetchGeoCities,
  fetchGeoCountries,
  fetchGeoStates,
  statesToOptions,
  type GeoCity,
  type GeoCountry,
  type GeoState,
} from "@/lib/geo/api";

type ShippingLocationFieldsProps = {
  countryId: number | null;
  stateId: number | null;
  cityId: number | null;
  fullAddress: string;
  zipCode: string;
  onCountryChange: (countryId: number | null, iso2: string | null) => void;
  onStateChange: (stateId: number | null) => void;
  onCityChange: (cityId: number | null) => void;
  onFullAddressChange: (value: string) => void;
  onZipCodeChange: (value: string) => void;
  errors?: {
    country?: string;
    state?: string;
    city?: string;
    full_address?: string;
  };
};

export default function ShippingLocationFields({
  countryId,
  stateId,
  cityId,
  fullAddress,
  zipCode,
  onCountryChange,
  onStateChange,
  onCityChange,
  onFullAddressChange,
  onZipCodeChange,
  errors,
}: ShippingLocationFieldsProps) {
  const { language } = useLanguage();
  const [countries, setCountries] = useState<GeoCountry[]>([]);
  const [states, setStates] = useState<GeoState[]>([]);
  const [cities, setCities] = useState<GeoCity[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingCountries(true);
    void fetchGeoCountries()
      .then((rows) => {
        if (!cancelled) setCountries(rows);
      })
      .catch(() => {
        if (!cancelled) setCountries([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCountries(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!countryId) {
      setStates([]);
      return;
    }
    let cancelled = false;
    setLoadingStates(true);
    void fetchGeoStates(countryId)
      .then((rows) => {
        if (!cancelled) setStates(rows);
      })
      .catch(() => {
        if (!cancelled) setStates([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingStates(false);
      });
    return () => {
      cancelled = true;
    };
  }, [countryId]);

  useEffect(() => {
    if (!stateId) {
      setCities([]);
      return;
    }
    let cancelled = false;
    setLoadingCities(true);
    void fetchGeoCities(stateId)
      .then((rows) => {
        if (!cancelled) setCities(rows);
      })
      .catch(() => {
        if (!cancelled) setCities([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stateId]);

  // Labels remap instantly when language changes (same IDs / rows).
  const countryOptions = useMemo(
    () => countriesToOptions(countries, language),
    [countries, language]
  );
  const stateOptions = useMemo(() => statesToOptions(states, language), [states, language]);
  const cityOptions = useMemo(() => citiesToOptions(cities, language), [cities, language]);

  const hasStates = stateOptions.length > 0;
  const cityDisabled = !countryId || (hasStates && !stateId);

  return (
    <>
      <FormField label={language === "ar" ? "الدولة" : "Country"} error={errors?.country}>
        <SearchableSelect
          key={`country-${language}`}
          value={countryId ? String(countryId) : ""}
          options={countryOptions}
          onChange={(value) => {
            const id = value ? Number(value) : null;
            const row = countries.find((c) => c.id === id) || null;
            onCountryChange(id, row?.iso2 || null);
          }}
          disabled={loadingCountries}
          error={Boolean(errors?.country)}
          placeholder={
            loadingCountries
              ? language === "ar"
                ? "جاري التحميل..."
                : "Loading..."
              : language === "ar"
                ? "اختر الدولة"
                : "Select country"
          }
          searchPlaceholder={language === "ar" ? "ابحث عن دولة..." : "Search country..."}
          emptyLabel={language === "ar" ? "لا نتائج" : "No results"}
          limit={250}
          aria-label={language === "ar" ? "الدولة" : "Country"}
        />
      </FormField>

      <FormField
        label={language === "ar" ? "المحافظة / الولاية" : "State / Province"}
        error={errors?.state}
      >
        <SearchableSelect
          key={`state-${language}-${countryId || 0}`}
          value={stateId ? String(stateId) : ""}
          options={stateOptions}
          onChange={(value) => onStateChange(value ? Number(value) : null)}
          disabled={!countryId || loadingStates || !hasStates}
          error={Boolean(errors?.state)}
          placeholder={
            !countryId
              ? language === "ar"
                ? "اختر الدولة أولاً"
                : "Select country first"
              : loadingStates
                ? language === "ar"
                  ? "جاري التحميل..."
                  : "Loading..."
                : !hasStates
                  ? language === "ar"
                    ? "غير متاح لهذه الدولة"
                    : "Not available for this country"
                  : language === "ar"
                    ? "اختر المحافظة"
                    : "Select state"
          }
          searchPlaceholder={language === "ar" ? "ابحث عن محافظة..." : "Search state..."}
          emptyLabel={language === "ar" ? "لا نتائج" : "No results"}
          limit={400}
          aria-label={language === "ar" ? "المحافظة" : "State"}
        />
      </FormField>

      <FormField label={language === "ar" ? "المدينة" : "City"} error={errors?.city}>
        <SearchableSelect
          key={`city-${language}-${stateId || 0}`}
          value={cityId ? String(cityId) : ""}
          options={cityOptions}
          onChange={(value) => onCityChange(value ? Number(value) : null)}
          disabled={cityDisabled || loadingCities}
          error={Boolean(errors?.city)}
          placeholder={
            cityDisabled
              ? language === "ar"
                ? "اختر المحافظة أولاً"
                : "Select state first"
              : loadingCities
                ? language === "ar"
                  ? "جاري التحميل..."
                  : "Loading..."
                : language === "ar"
                  ? "اختر المدينة"
                  : "Select city"
          }
          searchPlaceholder={language === "ar" ? "ابحث عن مدينة..." : "Search city..."}
          emptyLabel={language === "ar" ? "لا نتائج" : "No results"}
          limit={200}
          aria-label={language === "ar" ? "المدينة" : "City"}
        />
      </FormField>

      <FormField
        label={language === "ar" ? "العنوان بالكامل" : "Full Address"}
        error={errors?.full_address}
      >
        <Input
          value={fullAddress}
          onChange={(e) => onFullAddressChange(e.target.value)}
          className={errors?.full_address ? "border-red-300" : ""}
          autoComplete="street-address"
          placeholder={
            language === "ar"
              ? "الشارع، رقم المبنى، علامة مميزة..."
              : "Street, building number, landmark..."
          }
        />
      </FormField>

      <FormField
        className="md:col-span-2"
        label={language === "ar" ? "الرمز البريدي" : "Zip / Postal Code"}
      >
        <Input
          value={zipCode}
          onChange={(e) => onZipCodeChange(e.target.value)}
          autoComplete="postal-code"
          className="text-start dir-ltr"
          placeholder={language === "ar" ? "الرمز البريدي" : "Postal code"}
        />
      </FormField>
    </>
  );
}
