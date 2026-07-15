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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href="/shop" // Can be enhanced later to /shop?category=id
                className="group relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-soft block"
              >
                {/* Background Image */}
                <Image 
                  src={category.image} 
                  alt={category.name[language]} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:opacity-90"></div>
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 flex flex-col items-center md:items-start text-center md:text-start transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {category.name[language]}
                  </h2>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 flex items-center gap-2 text-primary font-bold">
                    <span>{language === "ar" ? "تسوق المجموعة" : "Shop Collection"}</span>
                    <span className={`transform ${language === "ar" ? "rotate-180" : ""}`}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
