"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/mock";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Categories() {
  const { language } = useLanguage();

  return (
    <section className="py-12 bg-background border-b border-surface">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-secondary mb-3">
            {language === "ar" ? "تسوق حسب التصنيف" : "Shop by Category"}
          </h2>
          <div className="w-20 h-1 bg-surface mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link href={`/category/${category.id}`} key={category.id} className="group relative overflow-hidden rounded-lg aspect-[4/5] block shadow-soft hover:shadow-lg transition-all duration-300">
              <Image
                src={category.image}
                alt={category.name[language]}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-5">
                <h3 className="text-background text-lg md:text-xl font-medium mb-2 transform group-hover:-translate-y-2 transition-transform duration-300">
                  {category.name[language]}
                </h3>
                <span className="text-primary text-xs md:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 block uppercase tracking-widest">
                  {language === "ar" ? "استكشف المجموعة" : "Explore Collection"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
