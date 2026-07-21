"use client";

import React, { useMemo } from "react";
import Input from "@/components/ui/Input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  formatDialCode,
  getAllCountries,
  normalizeDialCode,
} from "@/lib/geo/locations";
import { cn } from "@/lib/cn";

type PhoneCountryFieldProps = {
  countryCode: string;
  nationalNumber: string;
  onCountryChange: (countryCode: string) => void;
  onNationalChange: (nationalNumber: string) => void;
  error?: boolean;
  disabled?: boolean;
};

export default function PhoneCountryField({
  countryCode,
  nationalNumber,
  onCountryChange,
  onNationalChange,
  error = false,
  disabled = false,
}: PhoneCountryFieldProps) {
  const { language } = useLanguage();

  const dialOptions = useMemo(() => {
    return getAllCountries().map((c) => {
      const dial = formatDialCode(c.phonecode);
      return {
        value: c.isoCode,
        label: `${c.flag}  ${dial}  ${c.name}`,
        flag: c.flag,
        meta: dial,
        searchText: `${c.name} ${c.isoCode} ${dial} ${normalizeDialCode(c.phonecode)}`.toLowerCase(),
      };
    });
  }, []);

  return (
    <div
      className={cn(
        "flex items-stretch gap-2 dir-ltr",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <SearchableSelect
        compact
        value={countryCode}
        options={dialOptions}
        onChange={onCountryChange}
        error={error}
        disabled={disabled}
        placeholder="+--"
        searchPlaceholder={language === "ar" ? "ابحث عن دولة..." : "Search country..."}
        emptyLabel={language === "ar" ? "لا نتائج" : "No results"}
        aria-label={language === "ar" ? "رمز الدولة" : "Country calling code"}
        className="w-auto"
      />
      <Input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={nationalNumber}
        disabled={disabled}
        onChange={(e) => onNationalChange(e.target.value.replace(/[^\d\s-]/g, ""))}
        className={cn("flex-1 min-w-0 text-start", error && "border-red-300")}
        placeholder={language === "ar" ? "رقم الهاتف" : "Phone number"}
        aria-invalid={error}
      />
    </div>
  );
}
