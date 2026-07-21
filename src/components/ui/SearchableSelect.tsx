"use client";

import React, { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";

export type SearchableOption = {
  value: string;
  label: string;
  searchText?: string;
  flag?: string;
  /** Optional trailing meta (e.g. +20) */
  meta?: string;
};

type SearchableSelectProps = {
  value: string;
  options: SearchableOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  /** Compact trigger (standalone dial button). */
  compact?: boolean;
  /**
   * Borderless trigger for embedding inside another field shell
   * (e.g. phone input with dial picker).
   */
  embedded?: boolean;
  /** Max options rendered after filter (perf). */
  limit?: number;
  emptyLabel?: string;
  "aria-label"?: string;
};

export default function SearchableSelect({
  value,
  options,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled = false,
  error = false,
  className,
  compact = false,
  embedded = false,
  limit = 120,
  emptyLabel = "No results",
  "aria-label": ariaLabel,
}: SearchableSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const selected = useMemo(
    () => options.find((o) => o.value === value) || null,
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const source = !q
      ? options
      : options.filter((o) => (o.searchText || o.label).toLowerCase().includes(q));
    return source.slice(0, limit);
  }, [options, deferredQuery, limit]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", embedded ? "shrink-0" : "w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 text-start transition-colors text-sm",
          "focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
          embedded
            ? cn(
                "h-full rounded-s-lg px-2.5 sm:px-3 bg-transparent hover:bg-black/[0.03]",
                "min-w-[5.5rem]"
              )
            : cn(
                "w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-3 sm:px-4",
                "focus:border-primary focus:bg-white",
                open && "border-primary bg-white",
                error && "border-red-300"
              ),
          compact && !embedded && "min-w-[7.5rem] w-auto shrink-0 px-2.5 sm:px-3"
        )}
      >
        {selected?.flag ? (
          <span className="text-base leading-none shrink-0" aria-hidden>
            {selected.flag}
          </span>
        ) : null}
        <span
          className={cn(
            "truncate",
            embedded ? "max-w-[4.5rem] sm:max-w-[5.5rem]" : "flex-1",
            selected ? "text-secondary font-medium" : "text-gray-400"
          )}
        >
          {selected
            ? compact || embedded
              ? selected.meta || selected.label
              : selected.label
            : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-gray-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute z-50 mt-2 overflow-hidden rounded-xl border border-surface",
            "bg-white shadow-floating",
            embedded || compact
              ? "start-0 w-[min(22rem,calc(100vw-2rem))]"
              : "w-full min-w-[16rem]"
          )}
        >
          <div className="flex items-center gap-2 border-b border-surface/70 px-3 py-2.5">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none text-secondary placeholder:text-gray-400"
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            className="max-h-64 overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400">{emptyLabel}</li>
            ) : (
              filtered.map((option) => {
                const isActive = option.value === value;
                return (
                  <li key={option.value} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2.5 text-start text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-secondary hover:bg-gray-50"
                      )}
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      {option.flag ? (
                        <span className="text-base leading-none shrink-0" aria-hidden>
                          {option.flag}
                        </span>
                      ) : null}
                      <span className="flex-1 truncate min-w-0">{option.label}</span>
                      {option.meta ? (
                        <span className="text-xs text-gray-400 shrink-0 dir-ltr font-medium">
                          {option.meta}
                        </span>
                      ) : null}
                      {isActive ? <Check size={16} className="shrink-0 text-primary" /> : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
