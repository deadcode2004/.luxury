"use client";

import React from "react";
import { Star, Quote } from "lucide-react";
import { reviews } from "@/data/mock";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Reviews() {
  const { language } = useLanguage();

  return (
    <section className="py-12 bg-background relative overflow-hidden">
      {/* لمسة تصميمية في الخلفية */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-secondary mb-3">
            {language === "ar" ? "ماذا يقول عملاؤنا" : "What Our Clients Say"}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-surface p-6 rounded-2xl shadow-soft hover:shadow-lg border border-transparent hover:border-primary/10 relative group hover:-translate-y-1 transition-all duration-300">
              <Quote size={28} className="text-primary/10 absolute top-5 right-5 transform -scale-x-100 rtl:scale-x-100 group-hover:text-primary/20 transition-colors" />
              
              <div className="flex text-primary mb-5 relative z-10">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-primary" : "text-gray-300"} />
                ))}
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed italic relative z-10 min-h-[70px] text-xs md:text-sm">
                "{review.comment[language]}"
              </p>
              
              <div className="flex items-center">
                <div className="w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold text-sm me-3 shadow-md">
                  {review.author[language].charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-xs md:text-sm">{review.author[language]}</h4>
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5 block">
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
