"use client";

import React from "react";
import { ShieldCheck, Truck, PackageOpen, HeadphonesIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Features() {
  const { language } = useLanguage();

  const features = [
    {
      icon: <ShieldCheck size={28} />,
      title: { ar: "منتجات أصلية 100%", en: "100% Authentic" },
      description: { ar: "نضمن لك أن جميع منتجاتنا أصلية ومن مصادرها المعتمدة.", en: "We guarantee that all our products are authentic and from certified sources." }
    },
    {
      icon: <Truck size={28} />,
      title: { ar: "توصيل سريع ومجاني", en: "Fast & Free Delivery" },
      description: { ar: "توصيل مجاني للطلبات التي تزيد عن 500 ريال داخل المملكة.", en: "Free delivery for orders over 500 SAR within the kingdom." }
    },
    {
      icon: <PackageOpen size={28} />,
      title: { ar: "تغليف فاخر", en: "Luxury Packaging" },
      description: { ar: "نعتني بأدق التفاصيل لتصلك مشترياتك بتغليف يعكس الفخامة.", en: "We pay attention to details so your purchases arrive in luxurious packaging." }
    },
    {
      icon: <HeadphonesIcon size={28} />,
      title: { ar: "خدمة عملاء مميزة", en: "Premium Support" },
      description: { ar: "فريقنا متواجد على مدار الساعة للرد على استفساراتكم.", en: "Our team is available 24/7 to answer your inquiries." }
    }
  ];

  return (
    <section className="relative z-20 -mt-20 pb-12 pt-0">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold font-sans text-white mb-2.5 drop-shadow-md">
            {language === "ar" ? "لماذا تختارنا؟" : "Why Choose Us?"}
          </h2>
          <div className="w-12 h-1 bg-primary mx-auto drop-shadow-sm"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="relative text-center group p-6 md:p-8 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-floating transition-all duration-500 hover:-translate-y-3 hover:bg-white/15"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-primary to-primary-hover shadow-soft-3d text-background flex items-center justify-center mb-5 mx-auto transform group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3">
                  {feature.icon}
                </div>
                <h3 className="text-base md:text-lg font-bold mb-2 text-white drop-shadow-sm">{feature.title[language]}</h3>
                <p className="text-white/80 text-xs leading-relaxed font-medium">{feature.description[language]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
