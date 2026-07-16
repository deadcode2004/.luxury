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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16 lg:gap-y-0 pt-4 pb-12">
          {categories.map((category, index) => (
            <Link href={`/category/${category.id}`} key={category.id} className="group block relative">
              {/* Image Container with Soft 3D shadow */}
              <div className={`relative overflow-hidden rounded-3xl shadow-soft-3d transition-transform duration-500 group-hover:-translate-y-2 ${index % 2 === 0 ? "aspect-[4/5]" : "aspect-square lg:mt-12"}`}>
                <Image
                  src={category.image}
                  alt={category.name[language]}
                  fill
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-secondary/10 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              
              {/* Floating Layered Card */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-10/12 bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl glass-fix rounded-2xl p-4 md:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center transform transition-all duration-500 group-hover:-translate-y-3 border border-white z-10">
                <h3 className="text-secondary text-sm md:text-base font-bold mb-1 leading-tight">
                  {category.name[language]}
                </h3>
                <span className="text-primary text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {language === "ar" ? "استكشف" : "Explore"}
                  <span className={`transform transition-transform duration-300 ${language === "ar" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}>
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
