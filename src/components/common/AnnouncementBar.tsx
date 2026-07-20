"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { fetchPublicCms, type CmsStorefront } from "@/lib/api/owner";
import { localizeAnnouncementAmounts } from "@/lib/format/announcement";
import { cn } from "@/lib/cn";

type AnnouncementBarProps = {
  className?: string;
};

export default function AnnouncementBar({ className }: AnnouncementBarProps) {
  const { language } = useLanguage();
  const { currency, convertFromEgp, ready } = useCurrency();
  const [cms, setCms] = useState<CmsStorefront | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublicCms()
      .then((data) => {
        if (!cancelled) setCms(data);
      })
      .catch(() => {
        /* keep hidden if API unavailable */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayText = useMemo(() => {
    if (!cms?.announcement?.enabled) return null;
    const raw = cms.announcement.text?.[language] || cms.announcement.text?.ar;
    if (!raw?.trim()) return null;
    return localizeAnnouncementAmounts(raw, {
      language,
      currency: ready ? currency : "EGP",
      convertFromEgp: ready ? convertFromEgp : (n) => n,
      sourceAr: cms.announcement.text?.ar,
    });
  }, [cms, language, currency, convertFromEgp, ready]);

  if (!displayText) return null;

  return (
    <div
      className={cn(
        "w-full bg-secondary text-background text-center text-xs sm:text-sm font-medium tracking-wide py-2.5 px-4",
        className
      )}
    >
      {displayText}
    </div>
  );
}
