"use client";

import React from "react";
import { ShieldCheck, Truck, PackageOpen, HeadphonesIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Features() {
  const { language } = useLanguage();

  const features = [
    {
      icon: <div className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center mb-4 mx-auto hover:bg-primary-hover transition-colors"><ShieldCheck size={28} /></div>,
      title: { ar: "منتجات أصلية 100%", en: "100% Authentic" },
      description: { ar: "نضمن لك أن جميع منتجاتنا أصلية ومن مصادرها المعتمدة.", en: "We guarantee that all our products are authentic and from certified sources." }
    },
    {
      icon: <div className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center mb-4 mx-auto hover:bg-primary-hover transition-colors"><Truck size={28} /></div>,
      title: { ar: "توصيل سريع ومجاني", en: "Fast & Free Delivery" },
      description: { ar: "توصيل مجاني للطلبات التي تزيد عن 500 ريال داخل المملكة.", en: "Free delivery for orders over 500 SAR within the kingdom." }
    },
    {
      icon: <div className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center mb-4 mx-auto hover:bg-primary-hover transition-colors"><PackageOpen size={28} /></div>,
      title: { ar: "تغليف فاخر", en: "Luxury Packaging" },
      description: { ar: "نعتني بأدق التفاصيل لتصلك مشترياتك بتغليف يعكس الفخامة.", en: "We pay attention to details so your purchases arrive in luxurious packaging." }
    },
    {
      icon: <div className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center mb-4 mx-auto hover:bg-primary-hover transition-colors"><HeadphonesIcon size={28} /></div>,
      title: { ar: "خدمة عملاء مميزة", en: "Premium Support" },
      description: { ar: "فريقنا متواجد على مدار الساعة للرد على استفساراتكم.", en: "Our team is available 24/7 to answer your inquiries." }
    }
  ];

  return (
    <section className="relative z-20 -mt-32 pb-12 pt-0">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-background mb-3 drop-shadow-md">
            {language === "ar" ? "لماذا تختارنا؟" : "Why Choose Us?"}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto drop-shadow-sm"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`text-center group p-8 transition-all duration-300 hover:bg-surface/30 ${
                index === 0 ? "border-b border-surface md:border-e lg:border-b-0" :
                index === 1 ? "border-b border-surface lg:border-b-0 lg:border-e" :
                index === 2 ? "border-b border-surface md:border-b-0 md:border-e" : ""
              }`}
            >
              <div className="flex justify-center transform group-hover:-translate-y-1.5 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-base md:text-lg font-bold mb-2 text-secondary drop-shadow-sm">{feature.title[language]}</h3>
              <p className="text-secondary/80 text-xs md:text-sm leading-relaxed font-medium">{feature.description[language]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
