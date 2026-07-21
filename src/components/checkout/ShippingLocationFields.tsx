"use client";

import React, { useMemo } from "react";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getCityOptions,
  getCountryOptions,
  getStateOptions,
} from "@/lib/geo/locations";

type ShippingLocationFieldsProps = {
  countryCode: string;
  stateCode: string;
  city: string;
  fullAddress: string;
  zipCode: string;
  onCountryChange: (countryCode: string) => void;
  onStateChange: (stateCode: string) => void;
  onCityChange: (city: string) => void;
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
  countryCode,
  stateCode,
  city,
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

  const countries = useMemo(() => getCountryOptions(language), [language]);
  const states = useMemo(
    () => getStateOptions(countryCode, language),
    [countryCode, language]
  );
  const cities = useMemo(
    () => getCityOptions(countryCode, stateCode, language),
    [countryCode, stateCode, language]
  );

  const hasStates = states.length > 0;
  const stateRequired = hasStates;
  const cityDisabled = !countryCode || (hasStates && !stateCode);
  const useCitySelect = !cityDisabled && cities.length > 0;

  return (
    <>
      {/* Row: Country + State */}
      <FormField label={language === "ar" ? "الدولة" : "Country"} error={errors?.country}>
        <SearchableSelect
          key={`country-${language}`}
          value={countryCode}
          options={countries}
          onChange={onCountryChange}
          error={Boolean(errors?.country)}
          placeholder={language === "ar" ? "اختر الدولة" : "Select country"}
          searchPlaceholder={language === "ar" ? "ابحث عن دولة..." : "Search country..."}
          emptyLabel={language === "ar" ? "لا نتائج" : "No results"}
          aria-label={language === "ar" ? "الدولة" : "Country"}
        />
      </FormField>

      <FormField
        label={language === "ar" ? "المحافظة / الولاية" : "State / Province"}
        error={errors?.state}
      >
        <SearchableSelect
          key={`state-${language}-${countryCode}`}
          value={stateCode}
          options={states}
          onChange={onStateChange}
          disabled={!countryCode || !hasStates}
          error={Boolean(errors?.state)}
          placeholder={
            !countryCode
              ? language === "ar"
                ? "اختر الدولة أولاً"
                : "Select country first"
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
          aria-label={language === "ar" ? "المحافظة" : "State"}
        />
      </FormField>

      {/* Row: City + Full address */}
      <FormField label={language === "ar" ? "المدينة" : "City"} error={errors?.city}>
        {useCitySelect ? (
          <SearchableSelect
            key={`city-${language}-${countryCode}-${stateCode}`}
            value={city}
            options={cities}
            onChange={onCityChange}
            error={Boolean(errors?.city)}
            placeholder={language === "ar" ? "اختر المدينة" : "Select city"}
            searchPlaceholder={language === "ar" ? "ابحث عن مدينة..." : "Search city..."}
            emptyLabel={language === "ar" ? "لا نتائج" : "No results"}
            limit={200}
            aria-label={language === "ar" ? "المدينة" : "City"}
          />
        ) : (
          <Input
            value={city}
            disabled={cityDisabled}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder={
              cityDisabled
                ? stateRequired
                  ? language === "ar"
                    ? "اختر المحافظة أولاً"
                    : "Select state first"
                  : language === "ar"
                    ? "اختر الدولة أولاً"
                    : "Select country first"
                : language === "ar"
                  ? "أدخل اسم المدينة"
                  : "Enter city name"
            }
            className={errors?.city ? "border-red-300" : ""}
          />
        )}
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

      {/* Row: Zip full width */}
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
