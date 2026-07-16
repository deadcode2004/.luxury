"use client";

import React from "react";
import { ShieldCheck, Truck, PackageOpen, HeadphonesIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Features() {
  const { language } = useLanguage();

  const features = [
    {
      icon: <ShieldCheck size={22} />,
      title: { ar: "منتجات أصلية 100%", en: "100% Authentic" },
      description: { ar: "نضمن لك أن جميع منتجاتنا أصلية ومن مصادرها المعتمدة.", en: "We guarantee that all our products are authentic and from certified sources." }
    },
    {
      icon: <Truck size={22} />,
      title: { ar: "توصيل سريع ومجاني", en: "Fast & Free Delivery" },
      description: { ar: "توصيل مجاني للطلبات التي تزيد عن 500 ريال داخل المملكة.", en: "Free delivery for orders over 500 SAR within the kingdom." }
    },
    {
      icon: <PackageOpen size={22} />,
      title: { ar: "تغليف فاخر", en: "Luxury Packaging" },
      description: { ar: "نعتني بأدق التفاصيل لتصلك مشترياتك بتغليف يعكس الفخامة.", en: "We pay attention to details so your purchases arrive in luxurious packaging." }
    },
    {
      icon: <HeadphonesIcon size={22} />,
      title: { ar: "خدمة عملاء مميزة", en: "Premium Support" },
      description: { ar: "فريقنا متواجد على مدار الساعة للرد على استفساراتكم.", en: "Our team is available 24/7 to answer your inquiries." }
    }
  ];

  return (
    <section className="relative z-20 -mt-12 pb-8 pt-0 bg-transparent border-b border-surface">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-6 md:mb-8 flex flex-col items-center -mt-20 md:mt-0">
          <div className="bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl border border-white/40 px-6 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-3 inline-block">
            <h2 className="text-base md:text-lg font-bold font-sans text-black drop-shadow-sm">
              {language === "ar" ? "لماذا تختارنا؟" : "Why Choose Us?"}
            </h2>
          </div>
          <div className="w-10 h-1 bg-primary drop-shadow-sm"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="relative text-center group p-2 md:p-4 transition-all duration-500 hover:-translate-y-1.5"
            >
              {/* Vertical line (right/left depending on RTL) */}
              {(index === 0 || index === 1 || index === 2) && (
                <div 
                  className={`absolute top-4 bottom-4 rtl:left-0 ltr:right-0 w-px bg-black/10 hidden ${
                    index === 1 ? 'lg:block' : 'md:block'
                  }`} 
                />
              )}
              
              {/* Horizontal line (bottom) */}
              {(index === 0 || index === 1 || index === 2) && (
                <div 
                  className={`absolute bottom-0 left-4 right-4 h-px bg-black/10 md:hidden lg:hidden ${
                    index === 2 ? 'md:block' : ''
                  }`} 
                />
              )}

              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-background flex items-center justify-center mx-auto mb-3 shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-sm md:text-base font-bold text-black mb-1.5 md:mb-2">{feature.title[language]}</h3>
              <p className="text-black/70 text-xs leading-relaxed max-w-[200px] mx-auto">{feature.description[language]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
