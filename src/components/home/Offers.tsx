"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Offers() {
  const { language } = useLanguage();

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
          {/* العرض الأول */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] group flex items-center shadow-soft hover:shadow-glow transition-all duration-300">
            <Image
              src="https://picsum.photos/seed/offer1/1000/800"
              alt="Special Offer"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
            <div className="relative z-10 p-10 lg:p-14 text-white max-w-lg flex flex-col items-start justify-center h-full">
              <span className="bg-primary text-secondary text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6 inline-block shadow-sm">
                {language === "ar" ? "عرض خاص" : "Special Offer"}
              </span>
              <h3 className="text-4xl font-bold mb-4 font-sans leading-tight">
                {language === "ar" ? "مجموعة العناية الفاخرة" : "Luxury Care Set"}
              </h3>
              <p className="text-gray-200 mb-8 text-lg leading-relaxed">
                {language === "ar" ? "خصم يصل إلى 30% على مجموعة العناية بالبشرة الجديدة." : "Up to 30% off on the new skincare collection."}
              </p>
              <Link href="/shop" className="inline-block border-b-2 border-primary pb-1 text-base font-medium hover:text-primary transition-colors tracking-wide">
                {language === "ar" ? "تسوق الآن" : "Shop Now"}
              </Link>
            </div>
          </div>

          {/* العرض الثاني */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] group flex items-center shadow-soft hover:shadow-glow transition-all duration-300">
            <Image
              src="https://picsum.photos/seed/offer2/1000/800"
              alt="New Arrival"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
            <div className="relative z-10 p-10 lg:p-14 text-white max-w-lg flex flex-col items-start justify-center h-full">
              <span className="bg-white text-secondary text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6 inline-block shadow-sm">
                {language === "ar" ? "وصل حديثاً" : "New Arrival"}
              </span>
              <h3 className="text-4xl font-bold mb-4 font-sans leading-tight">
                {language === "ar" ? "عطور الصيف المنعشة" : "Fresh Summer Scents"}
              </h3>
              <p className="text-gray-200 mb-8 text-lg leading-relaxed">
                {language === "ar" ? "تشكيلة جديدة من العطور الصيفية التي تدوم طويلاً." : "A new selection of long-lasting summer perfumes."}
              </p>
              <Link href="/shop" className="inline-block border-b-2 border-primary pb-1 text-base font-medium hover:text-primary transition-colors tracking-wide">
                {language === "ar" ? "تسوق الآن" : "Shop Now"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
