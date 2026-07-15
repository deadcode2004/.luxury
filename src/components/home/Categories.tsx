"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/mock";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Categories() {
  const { language } = useLanguage();

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl font-bold font-sans text-secondary mb-6">
            {language === "ar" ? "تسوق حسب التصنيف" : "Shop by Category"}
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto"></div>
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 w-full p-8 text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-white text-2xl font-semibold tracking-wide">
                  {category.name[language]}
                </h3>
                <span className="text-primary text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 block uppercase tracking-widest">
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
