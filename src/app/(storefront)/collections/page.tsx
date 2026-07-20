"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchPublicCategories, type ApiCategory } from "@/lib/api/owner";
import { useRealtimeDomains } from "@/contexts/RealtimeContext";
import { pickLocale } from "@/lib/i18n/localeText";

export default function CollectionsPage() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [ready, setReady] = useState(false);

  const load = () =>
    fetchPublicCategories()
      .then((list) => setCategories(Array.isArray(list) ? list : []))
      .catch(() => setCategories([]))
      .finally(() => setReady(true));

  useEffect(() => {
    void load();
  }, []);

  useRealtimeDomains(["categories"], () => {
    void load();
  });

  return (
    <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-8 mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-sans text-secondary mb-4">
          {language === "ar" ? "المجموعات الحصرية" : "Exclusive Collections"}
        </h1>
        <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          {language === "ar"
            ? "اكتشف تشكيلاتنا الفاخرة والمختارة بعناية لتلبي كافة الأذواق."
            : "Discover our curated luxury collections tailored for every taste."}
        </p>
      </div>

      <div className="container mx-auto px-4 md:px-8">
        {!ready ? (
          <p className="text-center text-secondary/40 py-20">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        ) : categories.length === 0 ? (
          <p className="text-center text-secondary/50 py-20">
            {language === "ar" ? "لا توجد مجموعات بعد." : "No collections yet."}
          </p>
        ) : (
          <div className="flex flex-col gap-16 md:gap-24 lg:gap-32">
            {categories.map((category, index) => {
              const name = pickLocale(category.name, language) || category.name?.ar || "";
              const image = category.image || "/images/products/paradisecare-home02.jpg";
              const href = `/shop?category=${encodeURIComponent(category.code || String(category.id))}`;
              return (
                <div
                  key={category.id}
                  className={`flex flex-col ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  } items-center gap-8 lg:gap-0`}
                >
                  <Link
                    href={href}
                    className="w-full lg:w-2/3 group relative h-[400px] lg:h-[600px] rounded-[2rem] overflow-hidden shadow-soft-3d block shrink-0 z-10"
                  >
                    <Image
                      src={image}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                      unoptimized={image.startsWith("/storage/")}
                    />
                    <div className="absolute inset-0 bg-secondary/5 group-hover:bg-transparent transition-colors duration-500"></div>
                  </Link>

                  <div
                    className={`w-11/12 mx-auto lg:w-5/12 bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl glass-fix p-8 md:p-12 lg:p-16 rounded-[2rem] shadow-card z-20 -mt-16 lg:mt-0 ${
                      index % 2 === 0 ? "lg:-ms-24" : "lg:-me-24"
                    } border border-white transform transition-transform duration-500 hover:-translate-y-2`}
                  >
                    <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">
                      {language === "ar" ? "المجموعة الحصرية" : "Exclusive Collection"}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-sans text-secondary mb-6 leading-tight">
                      {name}
                    </h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                      {language === "ar"
                        ? "اكتشف روعة التصميم ودقة التفاصيل في هذه المجموعة المصممة لتبرز جمالك الحقيقي وتمنحك إطلالة لا تُنسى."
                        : "Discover the brilliance of design and attention to detail in this collection, crafted to highlight your true beauty and give you an unforgettable look."}
                    </p>
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 text-secondary font-bold hover:text-primary transition-colors group/link"
                    >
                      <span>{language === "ar" ? "تسوق الآن" : "Shop Now"}</span>
                      <span
                        className={`transform transition-transform ${
                          language === "ar"
                            ? "group-hover/link:-translate-x-2"
                            : "group-hover/link:translate-x-2"
                        }`}
                      >
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
