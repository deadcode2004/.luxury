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
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(62,147,61,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(188,155,89,0.14),transparent_35%)]" />
      <div className="relative container mx-auto px-4 md:px-8 py-16 md:py-24 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block text-3xl font-bold tracking-widest uppercase text-secondary">
              PARADISE<span className="text-primary">.</span>
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              {language === "ar" ? "متجر الفخامة والعناية الراقية" : "Luxury beauty & wellness"}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-floating p-6 md:p-8">
            <h1 className="text-2xl font-bold text-secondary mb-2">{title}</h1>
            <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
