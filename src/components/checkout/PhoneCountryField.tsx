"use client";

import React, { useMemo } from "react";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDialOptions } from "@/lib/geo/locations";
import { cn } from "@/lib/cn";

type PhoneCountryFieldProps = {
  countryCode: string;
  nationalNumber: string;
  onCountryChange: (countryCode: string) => void;
  onNationalChange: (nationalNumber: string) => void;
  error?: boolean;
  disabled?: boolean;
};

/**
 * Single phone field: flag + dial dropdown embedded in one input shell,
 * then the national number typed in the same field.
 */
export default function PhoneCountryField({
  countryCode,
  nationalNumber,
  onCountryChange,
  onNationalChange,
  error = false,
  disabled = false,
}: PhoneCountryFieldProps) {
  const { language } = useLanguage();
  const dialOptions = useMemo(() => getDialOptions(language), [language]);

  return (
    <div
      className={cn(
        "flex items-stretch w-full h-14 rounded-lg border bg-gray-50 overflow-hidden transition-colors dir-ltr",
        "focus-within:border-primary focus-within:bg-white",
        error ? "border-red-300" : "border-gray-200",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <SearchableSelect
        embedded
        compact
        value={countryCode}
        options={dialOptions}
        onChange={onCountryChange}
        disabled={disabled}
        placeholder="+--"
        searchPlaceholder={language === "ar" ? "ابحث عن دولة..." : "Search country..."}
        emptyLabel={language === "ar" ? "لا نتائج" : "No results"}
        aria-label={language === "ar" ? "رمز الدولة" : "Country calling code"}
      />

      <span className="w-px self-stretch my-2.5 bg-gray-200 shrink-0" aria-hidden />

      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={nationalNumber}
        disabled={disabled}
        onChange={(e) => onNationalChange(e.target.value.replace(/[^\d\s-]/g, ""))}
        className="flex-1 min-w-0 h-full bg-transparent px-3 text-sm text-secondary outline-none placeholder:text-gray-400"
        placeholder={language === "ar" ? "رقم الهاتف" : "Phone number"}
        aria-invalid={error}
      />
    </div>
  );
}
