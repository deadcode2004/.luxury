"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchPublicCms, type CmsStorefront } from "@/lib/api/owner";

export default function AnnouncementBar() {
  const { language } = useLanguage();
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

  if (!cms?.announcement?.enabled) return null;
  const text = cms.announcement.text?.[language] || cms.announcement.text?.ar;
  if (!text?.trim()) return null;

  return (
    <div className="w-full bg-secondary text-background text-center text-xs sm:text-sm font-medium tracking-wide py-2.5 px-4">
      {text}
    </div>
  );
}
