"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Hero() {
  const { language, dir } = useLanguage();

  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://picsum.photos/seed/hero1/1920/1080"
          alt="Luxury Beauty"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* المحتوى */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 text-center text-white flex flex-col items-center justify-center">
        <span className="text-primary font-medium tracking-[0.2em] uppercase mb-6 block text-sm md:text-base">
          {language === "ar" ? "المجموعة الجديدة ٢٠٢٦" : "NEW COLLECTION 2026"}
        </span>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 font-sans drop-shadow-lg max-w-4xl leading-tight">
          {language === "ar" ? "جوهر الفخامة الحقيقية" : "Essence of True Luxury"}
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-12 max-w-3xl mx-auto drop-shadow-md leading-relaxed">
          {language === "ar" 
            ? "اكتشف مجموعتنا الحصرية من العطور الملكية المصممة بعناية لتمنحك جاذبية لا تقاوم."
            : "Discover our exclusive collection of royal perfumes carefully crafted to give you irresistible charm."}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
          <Link
            href="/shop"
            className="bg-primary text-secondary px-10 py-5 rounded-md font-bold hover:bg-white hover:text-secondary transition-all flex items-center shadow-glow w-full sm:w-auto justify-center group tracking-wide text-lg"
          >
            {language === "ar" ? "تسوق الآن" : "Shop Now"}
            {dir === "rtl" ? (
              <ArrowLeft size={20} className="ms-3 group-hover:-translate-x-2 transition-transform" />
            ) : (
              <ArrowRight size={20} className="ms-3 group-hover:translate-x-2 transition-transform" />
            )}
          </Link>
          <Link
            href="/collections"
            className="bg-white/5 backdrop-blur-sm border border-white/20 text-white px-10 py-5 rounded-md font-bold hover:bg-white/20 transition-all w-full sm:w-auto text-center tracking-wide text-lg"
          >
            {language === "ar" ? "استكشف المجموعات" : "Explore Collections"}
          </Link>
        </div>
      </div>
    </section>
  );
}
