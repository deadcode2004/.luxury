"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useCurrency, type CurrencyCode } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { CURRENCY_OPTIONS, getCurrencyMeta } from "@/lib/currency/meta";
import CurrencyFlag from "@/components/common/CurrencyFlag";
import { cn } from "@/lib/cn";

type CurrencySwitcherProps = {
  variant?: "header" | "drawer" | "plain";
  /** When true, trigger uses inverted/light text (transparent header). */
  inverted?: boolean;
  className?: string;
  onSelect?: (code: CurrencyCode) => void;
};

export default function CurrencySwitcher({
  variant = "header",
  inverted = false,
  className,
  onSelect,
}: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();
  const { language, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = getCurrencyMeta(currency);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (code: CurrencyCode) => {
    setCurrency(code);
    setOpen(false);
    onSelect?.(code);
  };

  const isDrawer = variant === "drawer";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group inline-flex items-center gap-2 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.98]",
          isDrawer
            ? "w-full justify-between bg-background border-surface px-4 py-3 text-secondary hover:border-primary/40 hover:bg-surface/40"
            : inverted
              ? "border-white/25 bg-white/10 px-3 py-2 text-background hover:bg-white/20 hover:border-white/40"
              : "border-surface bg-background/70 px-3 py-2 text-secondary hover:border-primary/35 hover:bg-surface/60",
          open && !isDrawer && !inverted && "border-primary/40 bg-surface/70 shadow-sm",
          open && inverted && "bg-white/25 border-white/50"
        )}
      >
        <span className="inline-flex items-center gap-2.5 min-w-0">
          <CurrencyFlag
            code={current.code}
            className={cn(isDrawer ? "h-5 w-7 rounded-md" : "h-4 w-6")}
          />
          <span className="flex flex-col items-start leading-tight min-w-0">
            <span className="text-xs font-bold tracking-wide">{current.code}</span>
            {isDrawer ? (
              <span className="text-[11px] text-secondary/55 truncate max-w-[10rem]">
                {current.name[language]}
              </span>
            ) : null}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 opacity-70 transition-transform duration-300",
            open && "rotate-180",
            inverted && !isDrawer && "text-background"
          )}
        />
      </button>

      <div
        className={cn(
          "absolute z-50 overflow-hidden transition-all duration-200 ease-out",
          isDrawer ? "left-0 right-0 top-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)] w-56",
          !isDrawer && (dir === "rtl" ? "left-0" : "right-0"),
          open
            ? "opacity-100 visible translate-y-0 pointer-events-auto"
            : "opacity-0 invisible -translate-y-1 pointer-events-none"
        )}
      >
        <ul
          id={listId}
          role="listbox"
          aria-label={language === "ar" ? "اختيار العملة" : "Select currency"}
          className="rounded-2xl border border-surface bg-background/95 backdrop-blur-xl shadow-floating p-1.5"
        >
          {CURRENCY_OPTIONS.map((option) => {
            const active = option.code === currency;
            return (
              <li key={option.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => select(option.code)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-all duration-150",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-secondary/80 hover:bg-surface/70 hover:text-secondary"
                  )}
                >
                  <CurrencyFlag code={option.code} className="h-5 w-7 rounded-md" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold">{option.code}</span>
                    <span className="block text-[11px] opacity-70 truncate">
                      {option.name[language]}
                    </span>
                  </span>
                  <Check
                    size={16}
                    className={cn(
                      "shrink-0 transition-opacity duration-150",
                      active ? "opacity-100 text-primary" : "opacity-0"
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
