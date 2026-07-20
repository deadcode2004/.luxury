"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { categories as mockCategories } from "@/data/mock";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchPublicCategories, type ApiCategory } from "@/lib/api/owner";
import { useRealtimeDomains } from "@/contexts/RealtimeContext";

type DisplayCategory = {
  id: string;
  name: { ar: string; en: string };
  image: string;
};

export default function Categories() {
  const { language } = useLanguage();
  const [items, setItems] = useState<DisplayCategory[]>(
    mockCategories.map((c) => ({
      id: c.id,
      name: c.name,
      image: c.image,
    }))
  );

  useEffect(() => {
    let cancelled = false;
    fetchPublicCategories()
      .then((cats: ApiCategory[]) => {
        if (cancelled || !cats?.length) return;
        setItems(
          cats.map((c) => ({
            id: c.code || String(c.id),
            name: c.name,
            image: c.image || "/images/products/paradisecare-home02.jpg",
          }))
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useRealtimeDomains(["categories"], () => {
    void fetchPublicCategories()
      .then((cats: ApiCategory[]) => {
        if (!cats?.length) return;
        setItems(
          cats.map((c) => ({
            id: c.code || String(c.id),
            name: c.name,
            image: c.image || "/images/products/paradisecare-home02.jpg",
          }))
        );
      })
      .catch(() => undefined);
  });

  return (
    <section className="py-12 bg-background border-b border-surface">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-secondary mb-3">
            {language === "ar" ? "تسوق حسب التصنيف" : "Shop by Category"}
          </h2>
          <div className="w-20 h-1 bg-surface mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16 lg:gap-y-0 pt-4 pb-12">
          {items.map((category, index) => (
            <Link
              href={`/shop?category=${encodeURIComponent(category.id)}`}
              key={category.id}
              className="group block relative"
            >
              <div
                className={`relative overflow-hidden rounded-3xl shadow-soft-3d transition-transform duration-500 group-hover:-translate-y-2 ${
                  index % 2 === 0 ? "aspect-[4/5]" : "aspect-square lg:mt-12"
                }`}
              >
                <Image
                  src={category.image}
                  alt={category.name[language]}
                  fill
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                  unoptimized={category.image.startsWith("/storage/")}
                />
                <div className="absolute inset-0 bg-secondary/10 group-hover:bg-transparent transition-colors duration-500" />
              </div>

              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-10/12 bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl glass-fix rounded-2xl p-4 md:p-5 shadow-card text-center transform transition-all duration-500 group-hover:-translate-y-3 border border-white z-10">
                <h3 className="text-secondary text-sm md:text-base font-bold mb-1 leading-tight">
                  {category.name[language]}
                </h3>
                <span className="text-primary text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {language === "ar" ? "استكشف" : "Explore"}
                  <span
                    className={`transform transition-transform duration-300 ${
                      language === "ar" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"
                    }`}
                  >
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
