"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function Offers() {
  const { language } = useLanguage();
  const [expandedOffer, setExpandedOffer] = useState<number | null>(null);

  const offer1Content = (isMobile: boolean) => (
    <>
      <span className="bg-primary text-background border border-transparent text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-3 md:mb-4 inline-block shadow-sm">
        {language === "ar" ? "العناية بالبشرة" : "Skincare"}
      </span>
      <h3 className="text-xl md:text-3xl font-bold mb-3 font-sans leading-tight text-black">
        {language === "ar" ? "حياة نقية" : "Pure Life"}
      </h3>
      <p className="text-black/80 mb-5 md:mb-6 text-xs md:text-sm leading-relaxed">
        {language === "ar" 
          ? "الذهب الغرواني والفضة والبلاتين. كريم الزعفران، سيروم حمض الهيالورونيك. تركيبات معدنية للعناية اليومية بالبشرة وصحة الجسم." 
          : "Colloidal gold, silver, and platinum. Saffron cream, hyaluronic acid serum. Mineral formulas for daily skincare and body wellness."}
      </p>
      <Link href="/shop" className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-hover transition-colors text-xs tracking-wide group/link" onClick={(e) => isMobile && e.stopPropagation()}>
        <span>{language === "ar" ? "تسوق الآن" : "Shop Now"}</span>
        <span className={`transform transition-transform duration-500 ${language === "ar" ? "group-hover/link:-translate-x-2" : "group-hover/link:translate-x-2"}`}>
          →
        </span>
      </Link>
    </>
  );

  const offer2Content = (isMobile: boolean) => (
    <>
      <span className="bg-surface text-secondary border border-transparent text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-3 md:mb-4 inline-block shadow-sm">
        {language === "ar" ? "العافية" : "Wellness"}
      </span>
      <h3 className="text-xl md:text-3xl font-bold mb-3 font-sans leading-tight text-black">
        {language === "ar" ? "حياة ماغنيتو" : "Magneto Life"}
      </h3>
      <p className="text-black/80 mb-5 md:mb-6 text-xs md:text-sm leading-relaxed">
        {language === "ar" 
          ? "مغناطيسات النيوديميوم الحيوية وهرم الحياة الذهبي. أجسام مغناطيسية دقيقة مصممة وفقًا لمواصفات جاوس المعتمدة - لمساحة العافية الشخصية الخاصة بك." 
          : "Vital neodymium magnets and the Golden Pyramid of Life. Precision magnetic bodies designed to certified Gauss specs - for your personal wellness space."}
      </p>
      <Link href="/shop" className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-hover transition-colors text-xs tracking-wide group/link" onClick={(e) => isMobile && e.stopPropagation()}>
        <span>{language === "ar" ? "تسوق الآن" : "Shop Now"}</span>
        <span className={`transform transition-transform duration-500 ${language === "ar" ? "group-hover/link:-translate-x-2" : "group-hover/link:translate-x-2"}`}>
          →
        </span>
      </Link>
    </>
  );

  return (
    <section className="py-12 bg-background border-b border-surface">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-secondary mb-3">
            {language === "ar" ? "العروض" : "Offers"}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto drop-shadow-sm"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* العرض الأول */}
          <div className="relative group pt-4 lg:pt-8 w-full md:flex md:justify-end">
            <div 
              className="relative rounded-3xl overflow-hidden h-[380px] sm:h-[450px] md:h-auto md:aspect-[16/9] shadow-soft-3d transition-transform duration-500 md:group-hover:-translate-y-2 w-full md:w-11/12 shrink-0 cursor-pointer md:cursor-default"
              onClick={() => setExpandedOffer(expandedOffer === 1 ? null : 1)}
            >
              <Image
                src="/images/products/paradisecare-home02.jpg"
                alt="حياة نقية"
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-secondary/5 group-hover:bg-transparent transition-colors duration-500"></div>
              
              {/* MOBILE Drawer Card */}
              <div 
                className={`md:hidden absolute inset-y-0 ${language === "ar" ? "right-0" : "left-0"} w-[85%] sm:w-[60%] z-20 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  expandedOffer === 1 
                    ? "translate-x-0" 
                    : (language === "ar" ? "translate-x-[85%]" : "-translate-x-[85%]")
                }`}
                onClick={(e) => { e.stopPropagation(); setExpandedOffer(expandedOffer === 1 ? null : 1); }}
              >
                <div className={`bg-white/95 h-full w-full py-6 px-5 ${language === "ar" ? "pl-12" : "pr-12"} flex flex-col justify-center relative shadow-2xl border-x border-white/40`}>
                  <div className={`absolute top-1/2 -translate-y-1/2 ${language === "ar" ? "left-3" : "right-3"} text-primary`}>
                    {expandedOffer === 1 ? (language === "ar" ? <ChevronRight size={28} /> : <ChevronLeft size={28} />) : (language === "ar" ? <ChevronLeft size={28} /> : <ChevronRight size={28} />)}
                  </div>
                  <div className={`${expandedOffer === 1 ? "opacity-100" : "opacity-0"} transition-opacity duration-500 ease-in-out`}>
                    {offer1Content(true)}
                  </div>
                </div>
              </div>
            </div>

            {/* DESKTOP Overlapping Text Card */}
            <div className={`hidden md:flex absolute top-1/2 -translate-y-1/2 w-[60%] lg:w-[75%] xl:w-[60%] z-20 -start-8 ${language === "ar" ? "justify-end" : "justify-start"}`}>
              <div className="bg-white/95 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 transform transition-transform duration-700 hover:-translate-y-2 w-full">
                {offer1Content(false)}
              </div>
            </div>
          </div>

          {/* العرض الثاني */}
          <div className="relative group pt-16 md:pt-4 lg:pt-8 w-full md:flex md:justify-start">
            <div 
              className="relative rounded-3xl overflow-hidden h-[380px] sm:h-[450px] md:h-auto md:aspect-[16/9] shadow-soft-3d transition-transform duration-500 md:group-hover:-translate-y-2 w-full md:w-11/12 shrink-0 cursor-pointer md:cursor-default"
              onClick={() => setExpandedOffer(expandedOffer === 2 ? null : 2)}
            >
              <Image
                src="/images/products/paradisecare-home03.jpg"
                alt="حياة ماغنيتو"
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-secondary/5 group-hover:bg-transparent transition-colors duration-500"></div>
              
              {/* MOBILE Drawer Card */}
              <div 
                className={`md:hidden absolute inset-y-0 ${language === "ar" ? "left-0" : "right-0"} w-[85%] sm:w-[60%] z-20 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  expandedOffer === 2 
                    ? "translate-x-0" 
                    : (language === "ar" ? "-translate-x-[85%]" : "translate-x-[85%]")
                }`}
                onClick={(e) => { e.stopPropagation(); setExpandedOffer(expandedOffer === 2 ? null : 2); }}
              >
                <div className={`bg-white/95 h-full w-full py-6 px-5 ${language === "ar" ? "pr-12" : "pl-12"} flex flex-col justify-center relative shadow-2xl border-x border-white/40`}>
                  <div className={`absolute top-1/2 -translate-y-1/2 ${language === "ar" ? "right-3" : "left-3"} text-primary`}>
                    {expandedOffer === 2 ? (language === "ar" ? <ChevronLeft size={28} /> : <ChevronRight size={28} />) : (language === "ar" ? <ChevronRight size={28} /> : <ChevronLeft size={28} />)}
                  </div>
                  <div className={`${expandedOffer === 2 ? "opacity-100" : "opacity-0"} transition-opacity duration-500 ease-in-out`}>
                    {offer2Content(true)}
                  </div>
                </div>
              </div>
            </div>

            {/* DESKTOP Overlapping Text Card */}
            <div className={`hidden md:flex absolute top-1/2 -translate-y-1/2 w-[60%] lg:w-[75%] xl:w-[60%] z-20 -end-8 ${language === "ar" ? "justify-start" : "justify-end"}`}>
              <div className="bg-white/95 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 transform transition-transform duration-700 hover:-translate-y-2 w-full">
                {offer2Content(false)}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
