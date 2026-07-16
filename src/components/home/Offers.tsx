"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Offers() {
  const { language } = useLanguage();

  return (
    <section className="py-12 bg-background border-b border-surface">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-secondary mb-3">
            {language === "ar" ? "العروض" : "Offers"}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto drop-shadow-sm"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* العرض الأول */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] group flex items-center shadow-soft hover:shadow-lg transition-all duration-300">
            <Image
              src="/images/products/paradisecare-home02.jpg"
              alt="حياة نقية"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
            <div className="relative z-10 p-6 md:p-8 text-background max-w-lg flex flex-col items-start justify-center h-full">
              <span className="bg-primary text-background border border-transparent text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-3 inline-block shadow-sm">
                {language === "ar" ? "العناية بالبشرة" : "Skincare"}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 font-sans leading-tight">
                {language === "ar" ? "حياة نقية" : "Pure Life"}
              </h3>
              <p className="text-gray-200 mb-6 text-sm md:text-base leading-relaxed">
                {language === "ar" 
                  ? "الذهب الغرواني والفضة والبلاتين. كريم الزعفران، سيروم حمض الهيالورونيك. تركيبات معدنية للعناية اليومية بالبشرة وصحة الجسم." 
                  : "Colloidal gold, silver, and platinum. Saffron cream, hyaluronic acid serum. Mineral formulas for daily skincare and body wellness."}
              </p>
              <Link href="/shop" className="inline-block border-b-2 border-primary pb-0.5 text-xs font-bold hover:text-primary transition-colors tracking-wide">
                {language === "ar" ? "تسوق الآن" : "Shop Now"}
              </Link>
            </div>
          </div>

          {/* العرض الثاني */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] group flex items-center shadow-soft hover:shadow-lg transition-all duration-300">
            <Image
              src="/images/products/paradisecare-home03.jpg"
              alt="حياة ماغنيتو"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
            <div className="relative z-10 p-6 md:p-8 text-background max-w-lg flex flex-col items-start justify-center h-full">
              <span className="bg-surface text-secondary text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-3 inline-block shadow-sm">
                {language === "ar" ? "العافية" : "Wellness"}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 font-sans leading-tight">
                {language === "ar" ? "حياة ماغنيتو" : "Magneto Life"}
              </h3>
              <p className="text-gray-200 mb-6 text-sm md:text-base leading-relaxed">
                {language === "ar" 
                  ? "مغناطيسات النيوديميوم الحيوية وهرم الحياة الذهبي. أجسام مغناطيسية دقيقة مصممة وفقًا لمواصفات جاوس المعتمدة - لمساحة العافية الشخصية الخاصة بك." 
                  : "Vital neodymium magnets and the Golden Pyramid of Life. Precision magnetic bodies designed to certified Gauss specs - for your personal wellness space."}
              </p>
              <Link href="/shop" className="inline-block border-b-2 border-primary pb-0.5 text-xs font-bold hover:text-primary transition-colors tracking-wide">
                {language === "ar" ? "تسوق الآن" : "Shop Now"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
