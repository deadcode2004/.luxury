"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { language } = useLanguage();

  return (
    <main className="min-h-screen bg-background relative flex items-center justify-center px-4 py-10 md:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(62,147,61,0.10),transparent_42%),radial-gradient(circle_at_82%_8%,rgba(188,155,89,0.12),transparent_38%)]"
      />

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8 md:mb-10">
          <Link
            href="/"
            className="inline-block text-3xl md:text-4xl font-bold tracking-widest uppercase text-secondary"
          >
            PARADISE<span className="text-primary">.</span>
          </Link>
          <p className="mt-2 text-sm text-secondary/55">
            {language === "ar" ? "متجر الفخامة والعناية الراقية" : "Luxury beauty & wellness"}
          </p>
        </div>

        <div className="bg-white/85 backdrop-blur-md border border-surface rounded-3xl shadow-soft p-7 sm:p-9 md:p-10">
          <h1 className="text-2xl md:text-[1.75rem] font-bold text-secondary mb-2">{title}</h1>
          <p className="text-sm text-secondary/55 mb-7 md:mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
