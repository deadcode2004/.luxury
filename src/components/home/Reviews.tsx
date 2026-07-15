"use client";

import React from "react";
import { Star, Quote } from "lucide-react";
import { reviews } from "@/data/mock";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Reviews() {
  const { language } = useLanguage();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* لمسة تصميمية في الخلفية */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl font-bold font-sans text-secondary mb-6">
            {language === "ar" ? "ماذا يقول عملاؤنا" : "What Our Clients Say"}
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          {reviews.map((review) => (
            <div key={review.id} className="bg-surface p-10 lg:p-12 rounded-2xl shadow-soft hover:shadow-glow border border-transparent hover:border-primary/10 relative group hover:-translate-y-2 transition-all duration-300">
              <Quote size={40} className="text-primary/10 absolute top-8 right-8 transform -scale-x-100 rtl:scale-x-100 group-hover:text-primary/20 transition-colors" />
              
              <div className="flex text-primary mb-8 relative z-10">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-primary" : "text-gray-300"} />
                ))}
              </div>
              
              <p className="text-gray-600 mb-10 leading-loose italic relative z-10 min-h-[100px] text-lg">
                "{review.comment[language]}"
              </p>
              
              <div className="flex items-center">
                <div className="w-14 h-14 bg-secondary text-white rounded-full flex items-center justify-center font-bold text-xl me-4 shadow-md">
                  {review.author[language].charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-lg">{review.author[language]}</h4>
                  <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 block">
                    {language === "ar" ? "عميل موثق" : "Verified Buyer"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
