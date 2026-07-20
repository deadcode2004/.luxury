"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  /** Saved English translation from the API (auto-translated on save). */
  english?: string | null;
  /** Optional list of English lines (e.g. ingredients). */
  englishLines?: string[] | null;
  className?: string;
};

/**
 * Shows the auto-translated English value under Arabic-only owner inputs.
 * Visible whenever a saved EN translation exists (most useful when the dashboard is in English).
 */
export default function TranslatedPreview({ english, englishLines, className = "" }: Props) {
  const { language } = useLanguage();
  const lines = (englishLines ?? []).map((l) => l.trim()).filter(Boolean);
  const single = (english || "").trim();

  if (!single && lines.length === 0) return null;

  return (
    <div
      className={`rounded-lg border border-dashed border-primary/20 bg-primary/[0.04] px-2.5 py-2 dir-ltr text-start ${className}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary/70 mb-0.5">
        {language === "ar" ? "الترجمة الإنجليزية (تلقائي)" : "English (auto-translated)"}
      </p>
      {lines.length > 0 ? (
        <ul className="text-xs text-secondary/70 list-disc ps-4 space-y-0.5 break-words">
          {lines.map((line, i) => (
            <li key={`${line}-${i}`}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-secondary/70 break-words whitespace-pre-wrap">{single}</p>
      )}
    </div>
  );
}
