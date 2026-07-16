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
          <div className="relative group pt-4 lg:pt-8 flex justify-end">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] md:aspect-[16/9] shadow-soft-3d transition-transform duration-500 group-hover:-translate-y-2 w-full md:w-11/12 shrink-0">
              <Image
                src="/images/products/paradisecare-home02.jpg"
                alt="حياة نقية"
                fill
                className="object-cover transition-transform duration-[15s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-secondary/5 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            
            {/* Overlapping Text Card */}
            <div className="absolute -bottom-6 md:top-1/2 md:-translate-y-1/2 w-11/12 md:w-5/12 bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-floating z-20 start-4 md:start-0 border border-white/60 transform transition-transform duration-500 hover:-translate-y-2">
              <span className="bg-primary text-background border border-transparent text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4 inline-block shadow-sm">
                {language === "ar" ? "العناية بالبشرة" : "Skincare"}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 font-sans leading-tight text-secondary">
                {language === "ar" ? "حياة نقية" : "Pure Life"}
              </h3>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                {language === "ar" 
                  ? "الذهب الغرواني والفضة والبلاتين. كريم الزعفران، سيروم حمض الهيالورونيك. تركيبات معدنية للعناية اليومية بالبشرة وصحة الجسم." 
                  : "Colloidal gold, silver, and platinum. Saffron cream, hyaluronic acid serum. Mineral formulas for daily skincare and body wellness."}
              </p>
              <Link href="/shop" className="inline-flex items-center gap-2 text-secondary font-bold hover:text-primary transition-colors text-xs tracking-wide group/link">
                <span>{language === "ar" ? "تسوق الآن" : "Shop Now"}</span>
                <span className={`transform transition-transform ${language === "ar" ? "group-hover/link:-translate-x-1" : "group-hover/link:translate-x-1"}`}>
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* العرض الثاني */}
          <div className="relative group pt-16 md:pt-4 lg:pt-8 flex justify-start">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] md:aspect-[16/9] shadow-soft-3d transition-transform duration-500 group-hover:-translate-y-2 w-full md:w-11/12 shrink-0">
              <Image
                src="/images/products/paradisecare-home03.jpg"
                alt="حياة ماغنيتو"
                fill
                className="object-cover transition-transform duration-[15s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-secondary/5 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            
            {/* Overlapping Text Card */}
            <div className="absolute -bottom-6 md:top-1/2 md:-translate-y-1/2 w-11/12 md:w-5/12 bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-floating z-20 end-4 md:end-0 border border-white/60 transform transition-transform duration-500 hover:-translate-y-2">
              <span className="bg-surface text-secondary border border-transparent text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4 inline-block shadow-sm">
                {language === "ar" ? "العافية" : "Wellness"}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 font-sans leading-tight text-secondary">
                {language === "ar" ? "حياة ماغنيتو" : "Magneto Life"}
              </h3>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                {language === "ar" 
                  ? "مغناطيسات النيوديميوم الحيوية وهرم الحياة الذهبي. أجسام مغناطيسية دقيقة مصممة وفقًا لمواصفات جاوس المعتمدة - لمساحة العافية الشخصية الخاصة بك." 
                  : "Vital neodymium magnets and the Golden Pyramid of Life. Precision magnetic bodies designed to certified Gauss specs - for your personal wellness space."}
              </p>
              <Link href="/shop" className="inline-flex items-center gap-2 text-secondary font-bold hover:text-primary transition-colors text-xs tracking-wide group/link">
                <span>{language === "ar" ? "تسوق الآن" : "Shop Now"}</span>
                <span className={`transform transition-transform ${language === "ar" ? "group-hover/link:-translate-x-1" : "group-hover/link:translate-x-1"}`}>
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
