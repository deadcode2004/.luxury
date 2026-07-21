"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  buildCountryData,
  defaultCountries,
  parseCountry,
  usePhoneInput,
  type CountryData,
  type CountryIso2,
} from "react-international-phone";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  isPossiblePhoneNumber,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import { useLanguage } from "@/contexts/LanguageContext";
import { countryDisplayName, getCountryByCode } from "@/lib/geo/locations";
import type { AppLanguage } from "@/lib/i18n/language";
import { cn } from "@/lib/cn";

type PhoneCountryFieldProps = {
  /** E.164 phone value, e.g. +966501234567 */
  value: string;
  onChange: (phone: string, countryIso2: string) => void;
  /** ISO2 uppercase, e.g. SA */
  defaultCountry?: string;
  error?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

function localizeCountries(language: AppLanguage): CountryData[] {
  return defaultCountries.map((raw) => {
    const parsed = parseCountry(raw);
    const name = countryDisplayName(parsed.iso2.toUpperCase(), language, parsed.name);
    return buildCountryData({ ...parsed, name });
  });
}

function toIso2(code: string | undefined | null): CountryIso2 {
  const v = String(code || "sa").toLowerCase() as CountryIso2;
  return v || "sa";
}

function flagEmoji(iso2: string): string {
  return getCountryByCode(iso2.toUpperCase())?.flag || "🏳️";
}

/** Public helpers for checkout validation / messages. */
export function validateCheckoutPhone(
  phone: string,
  language: AppLanguage
): string | null {
  const trimmed = phone.trim();
  if (!trimmed || trimmed === "+" || /^\+\d{1,3}$/.test(trimmed)) {
    return language === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required";
  }
  if (!isPossiblePhoneNumber(trimmed)) {
    return language === "ar"
      ? "رقم الهاتف غير مكتمل أو بتنسيق غير صالح"
      : "Phone number is incomplete or incorrectly formatted";
  }
  if (!isValidPhoneNumber(trimmed)) {
    return language === "ar"
      ? "رقم الهاتف غير صالح للدولة المحددة"
      : "Phone number is invalid for the selected country";
  }
  return null;
}

export function phoneCountryIso(phone: string, fallback = "SA"): string {
  const parsed = parsePhoneNumberFromString(phone);
  return (parsed?.country || fallback).toUpperCase();
}

const MENU_Z = 10000;

export default function PhoneCountryField({
  value,
  onChange,
  defaultCountry = "SA",
  error = false,
  disabled = false,
  onBlur,
  className,
}: PhoneCountryFieldProps) {
  const { language } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  useEffect(() => setMounted(true), []);

  const countries = useMemo(() => localizeCountries(language), [language]);

  const preferred = useMemo(
    () =>
      (["eg", "sa", "ae", "kw", "qa", "bh", "om", "jo"] as CountryIso2[]).filter((iso) =>
        countries.some((c) => parseCountry(c).iso2 === iso)
      ),
    [countries]
  );

  const { inputValue, country, setCountry, handlePhoneValueChange, inputRef } =
    usePhoneInput({
      defaultCountry: toIso2(defaultCountry),
      value: value || undefined,
      countries,
      forceDialCode: true,
      onChange: (data) => {
        onChange(data.phone, data.country.iso2.toUpperCase());
      },
    });

  useEffect(() => {
    const next = toIso2(defaultCountry);
    if (next && next !== country.iso2 && (!value || value.length <= 4)) {
      setCountry(next, { focusOnInput: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCountry]);

  const updatePosition = () => {
    const trigger = rootRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const gap = 8;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openUp = spaceBelow < 280 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(160, Math.min(320, openUp ? spaceAbove : spaceBelow));
    const width = Math.min(22 * 16, window.innerWidth - 16);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    setPos({
      top: openUp ? undefined : rect.bottom + gap,
      bottom: openUp ? window.innerHeight - rect.top + gap : undefined,
      left,
      width,
      maxHeight,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePosition();
    const onWin = () => updatePosition();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = countries.map((c) => parseCountry(c));
    const preferredSet = new Set(preferred);
    const sortPreferred = (
      a: ReturnType<typeof parseCountry>,
      b: ReturnType<typeof parseCountry>
    ) => {
      const ap = preferredSet.has(a.iso2) ? 0 : 1;
      const bp = preferredSet.has(b.iso2) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return a.name.localeCompare(b.name, language === "ar" ? "ar" : "en");
    };

    const source = !q
      ? [...list].sort(sortPreferred)
      : list
          .filter((c) => {
            const hay = `${c.name} ${c.iso2} +${c.dialCode}`.toLowerCase();
            return hay.includes(q);
          })
          .sort(sortPreferred);

    return source;
  }, [countries, query, preferred, language]);

  const menu =
    mounted && open && pos
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              width: pos.width,
              zIndex: MENU_Z,
              maxHeight: pos.maxHeight,
            }}
            className="flex flex-col overflow-hidden rounded-xl border border-surface bg-white shadow-floating"
          >
            <div className="flex items-center gap-2 border-b border-surface/70 px-3 py-2.5 shrink-0">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={language === "ar" ? "ابحث عن دولة..." : "Search country..."}
                className="w-full bg-transparent text-sm outline-none text-secondary placeholder:text-gray-400"
              />
            </div>
            <ul
              role="listbox"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1"
              style={{ maxHeight: pos.maxHeight - 48 }}
            >
              {filteredCountries.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-400">
                  {language === "ar" ? "لا نتائج" : "No results"}
                </li>
              ) : (
                filteredCountries.map((item) => {
                  const active = item.iso2 === country.iso2;
                  return (
                    <li key={item.iso2} role="option" aria-selected={active}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-2.5 px-3 py-2.5 text-start text-sm transition-colors",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-secondary hover:bg-gray-50"
                        )}
                        onClick={() => {
                          setCountry(item.iso2, { focusOnInput: true });
                          setOpen(false);
                        }}
                      >
                        <span className="text-lg leading-none shrink-0" aria-hidden>
                          {flagEmoji(item.iso2)}
                        </span>
                        <span className="flex-1 truncate min-w-0">{item.name}</span>
                        <span className="text-xs text-gray-400 shrink-0 font-medium dir-ltr">
                          +{item.dialCode}
                        </span>
                        {active ? <Check size={16} className="shrink-0 text-primary" /> : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body
        )
      : null;

  return (
    <div
      ref={rootRef}
      id="checkout-phone-field"
      className={cn("relative w-full dir-ltr", className)}
      data-phone-country={country.iso2}
    >
      <div
        className={cn(
          "flex items-stretch w-full h-14 rounded-lg border bg-gray-50 overflow-hidden transition-colors",
          "focus-within:border-primary focus-within:bg-white",
          error ? "border-red-300" : "border-gray-200",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={language === "ar" ? "اختر الدولة" : "Select country"}
          title={`${country.name} (+${country.dialCode})`}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 shrink-0 px-2.5 sm:px-3 h-full",
            "bg-transparent hover:bg-black/[0.03] transition-colors",
            "focus:outline-none focus-visible:bg-black/[0.04]"
          )}
        >
          <span className="text-xl leading-none" aria-hidden>
            {flagEmoji(country.iso2)}
          </span>
          <ChevronDown
            size={14}
            className={cn("text-gray-400 transition-transform", open && "rotate-180")}
          />
        </button>

        <span className="w-px self-stretch my-2.5 bg-gray-200 shrink-0" aria-hidden />

        <input
          ref={inputRef}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          name="phone"
          disabled={disabled}
          value={inputValue}
          onChange={handlePhoneValueChange}
          onBlur={onBlur}
          placeholder="+966 5X XXX XXXX"
          aria-invalid={error}
          className={cn(
            "flex-1 min-w-0 h-full bg-transparent px-3 text-sm text-secondary outline-none",
            "placeholder:text-gray-400"
          )}
        />
      </div>
      {menu}
    </div>
  );
}
