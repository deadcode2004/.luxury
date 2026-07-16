"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { categories } from "@/data/mock";

export default function CollectionsPage() {
  const { language } = useLanguage();

  return (
    <>
      <Header />
      <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
        
        {/* Page Header */}
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

        {/* Collections Grid */}
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col gap-16 md:gap-24 lg:gap-32">
            {categories.map((category, index) => (
              <div key={category.id} className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-8 lg:gap-0`}>
                
                {/* Image Section */}
                <Link href="/shop" className="w-full lg:w-2/3 group relative h-[400px] lg:h-[600px] rounded-[2rem] overflow-hidden shadow-soft-3d block shrink-0 z-10">
                  <Image 
                    src={category.image} 
                    alt={category.name[language]} 
                    fill 
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-secondary/5 group-hover:bg-transparent transition-colors duration-500"></div>
                </Link>

                {/* Text Section (Overlapping) */}
                <div className={`w-11/12 mx-auto lg:w-5/12 bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl glass-fix p-8 md:p-12 lg:p-16 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-20 -mt-16 lg:mt-0 ${index % 2 === 0 ? "lg:-ms-24" : "lg:-me-24"} border border-white transform transition-transform duration-500 hover:-translate-y-2`}>
                  <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">
                    {language === "ar" ? "المجموعة الحصرية" : "Exclusive Collection"}
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-sans text-secondary mb-6 leading-tight">
                    {category.name[language]}
                  </h2>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    {language === "ar"
                      ? "اكتشف روعة التصميم ودقة التفاصيل في هذه المجموعة المصممة لتبرز جمالك الحقيقي وتمنحك إطلالة لا تُنسى."
                      : "Discover the brilliance of design and attention to detail in this collection, crafted to highlight your true beauty and give you an unforgettable look."}
                  </p>
                  <Link href="/shop" className="inline-flex items-center gap-2 text-secondary font-bold hover:text-primary transition-colors group/link">
                    <span>{language === "ar" ? "تسوق الآن" : "Shop Now"}</span>
                    <span className={`transform transition-transform ${language === "ar" ? "group-hover/link:-translate-x-2" : "group-hover/link:translate-x-2"}`}>
                      →
                    </span>
                  </Link>
                </div>

              </div>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
