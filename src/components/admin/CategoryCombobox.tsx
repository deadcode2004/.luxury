"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ApiCategory } from "@/lib/api/owner";
import { useLanguage } from "@/contexts/LanguageContext";

type CategoryComboboxProps = {
  categories: ApiCategory[];
  valueText: string;
  selectedId: number | null;
  onChangeText: (text: string) => void;
  onSelect: (category: ApiCategory | null) => void;
  onEdit?: (category: ApiCategory) => void;
  onDelete?: (category: ApiCategory) => void;
  error?: string;
  disabled?: boolean;
};

export default function CategoryCombobox({
  categories,
  valueText,
  selectedId,
  onChangeText,
  onSelect,
  onEdit,
  onDelete,
  error,
  disabled,
}: CategoryComboboxProps) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = valueText.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => {
      const ar = (c.name?.ar || "").toLowerCase();
      const en = (c.name?.en || "").toLowerCase();
      return ar.includes(q) || en.includes(q) || c.code.toLowerCase().includes(q);
    });
  }, [categories, valueText]);

  const exactMatch = useMemo(() => {
    const q = valueText.trim().toLowerCase();
    return categories.find((c) => (c.name?.ar || "").trim().toLowerCase() === q) ?? null;
  }, [categories, valueText]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-white h-12 px-3 transition-colors",
          error ? "border-red-300" : "border-gray-200 focus-within:border-primary",
          disabled && "opacity-60"
        )}
      >
        <input
          type="text"
          disabled={disabled}
          value={valueText}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChangeText(e.target.value);
            onSelect(null);
            setOpen(true);
          }}
          placeholder={
            language === "ar"
              ? "اكتب أو اختر قسماً (عربي)"
              : "Type or select a category (Arabic)"
          }
          className="flex-1 min-w-0 bg-transparent text-sm text-secondary outline-none"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          role="combobox"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="p-1 text-gray-400 hover:text-secondary"
          aria-label="Toggle"
        >
          <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}

      {open ? (
        <div
          className={cn(
            "absolute z-50 mt-2 w-full rounded-2xl border border-surface bg-background shadow-floating overflow-hidden",
            "max-h-[min(16rem,40vh)]"
          )}
        >
          <ul id={listId} role="listbox" className="max-h-[min(16rem,40vh)] overflow-y-auto p-1.5">
            {filtered.map((cat) => {
              const active = cat.id === selectedId;
              return (
                <li key={cat.id} role="option" aria-selected={active}>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-2 py-2",
                      active ? "bg-primary/10" : "hover:bg-surface/60"
                    )}
                  >
                    <button
                      type="button"
                      className="flex-1 min-w-0 text-start px-1"
                      onClick={() => {
                        onSelect(cat);
                        onChangeText(cat.name?.ar || "");
                        setOpen(false);
                      }}
                    >
                      <span className="block text-sm font-bold text-secondary truncate">
                        {language === "en" && cat.name?.en ? cat.name.en : cat.name?.ar}
                      </span>
                      {language === "en" && cat.name?.ar ? (
                        <span className="block text-[11px] text-secondary/50 truncate">
                          {cat.name.ar}
                        </span>
                      ) : cat.name?.en ? (
                        <span className="block text-[11px] text-secondary/50 truncate">
                          {cat.name.en}
                        </span>
                      ) : null}
                    </button>
                    {active ? <Check size={14} className="text-primary shrink-0" /> : null}
                    {onEdit ? (
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-white"
                        onClick={() => onEdit(cat)}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                    ) : null}
                    {onDelete ? (
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white"
                        onClick={() => onDelete(cat)}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}

            {!exactMatch && valueText.trim() ? (
              <li>
                <button
                  type="button"
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-primary hover:bg-primary/10"
                  onClick={() => {
                    onSelect(null);
                    setOpen(false);
                  }}
                >
                  <Plus size={16} />
                  {language === "ar"
                    ? `إنشاء قسم جديد: “${valueText.trim()}”`
                    : `Create new category: “${valueText.trim()}”`}
                </button>
              </li>
            ) : null}

            {filtered.length === 0 && !valueText.trim() ? (
              <li className="px-3 py-4 text-sm text-secondary/50 text-center">
                {language === "ar" ? "لا توجد أقسام بعد" : "No categories yet"}
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
