"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const SLIDES = [
  {
    id: 1,
    image: "/images/products/paradisecare-home02.jpg",
    subtitle: { ar: "المجموعة الجديدة ٢٠٢٦", en: "NEW COLLECTION 2026" },
    title: { ar: "جوهر الفخامة الحقيقية", en: "Essence of True Luxury" },
    description: { 
      ar: "اكتشف مجموعتنا الحصرية المصممة بعناية لتمنحك إطلالة لا تقاوم وتفرد بلا حدود.",
      en: "Discover our exclusive collection carefully crafted to give you an irresistible look and boundless uniqueness."
    },
    cta: { ar: "تسوق الآن", en: "Shop Now" },
    link: "/shop"
  },
  {
    id: 2,
    image: "/images/products/paradisecare-home03.jpg",
    subtitle: { ar: "أناقة بلا تكلف", en: "EFFORTLESS ELEGANCE" },
    title: { ar: "تصاميم تعكس شخصيتك", en: "Designs Reflecting You" },
    description: { 
      ar: "ارتقِ بمظهرك مع قطعنا الفريدة التي تجمع بين الرقي الكلاسيكي واللمسة العصرية.",
      en: "Elevate your look with our unique pieces that blend classic sophistication with a modern touch."
    },
    cta: { ar: "اكتشف الجديد", en: "Discover New" },
    link: "/collections"
  },
  {
    id: 3,
    image: "/images/products/paradisecare-shop-biomagneti-01-300x300.jpeg",
    subtitle: { ar: "عروض حصرية", en: "EXCLUSIVE OFFERS" },
    title: { ar: "فخامة بمتناول يديك", en: "Luxury at Your Fingertips" },
    description: { 
      ar: "تسوق أفضل العلامات التجارية بأفضل الأسعار واستمتع بتجربة تسوق استثنائية.",
      en: "Shop the best brands at the best prices and enjoy an exceptional shopping experience."
    },
    cta: { ar: "العروض الحالية", en: "Current Offers" },
    link: "/shop"
  }
];

export default function Hero() {
  const { language, dir } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  }, []);

  // Autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      dir === "rtl" ? prevSlide() : nextSlide();
    }
    if (isRightSwipe) {
      dir === "rtl" ? nextSlide() : prevSlide();
    }
  };

  return (
    <section 
      className="relative h-[100svh] min-h-[600px] flex items-center bg-black overflow-hidden group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      {SLIDES.map((slide, index) => (
        <div 
          key={slide.id} 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title[language]}
            fill
            className={`object-cover transition-transform duration-[10000ms] ${
              index === currentSlide ? "scale-105" : "scale-100"
            }`}
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/40"></div>
          
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center container mx-auto px-4 md:px-8 text-center text-background">
            <div className={`transition-all duration-1000 transform ${index === currentSlide ? "translate-y-0 opacity-100 delay-100" : "translate-y-8 opacity-0"}`}>
              <span className="text-primary font-medium tracking-[0.2em] uppercase mb-4 block text-xs md:text-sm">
                {slide.subtitle[language]}
              </span>
            </div>
            
            <div className={`transition-all duration-1000 transform ${index === currentSlide ? "translate-y-0 opacity-100 delay-300" : "translate-y-8 opacity-0"}`}>
              <h1 className="text-4xl md:text-[40px] lg:text-[50px] font-bold mb-6 font-sans drop-shadow-lg max-w-3xl leading-tight">
                {slide.title[language]}
              </h1>
            </div>
            
            <div className={`transition-all duration-1000 transform ${index === currentSlide ? "translate-y-0 opacity-100 delay-500" : "translate-y-8 opacity-0"}`}>
              <p className="text-base md:text-lg text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
                {slide.description[language]}
              </p>
            </div>
            
            <div className={`transition-all duration-1000 transform ${index === currentSlide ? "translate-y-0 opacity-100 delay-700" : "translate-y-8 opacity-0"}`}>
              <Link
                href={slide.link}
                className="bg-primary text-background px-6 py-3 rounded-md font-bold hover:bg-primary-hover hover:text-background transition-all flex items-center justify-center group tracking-wide text-base"
              >
                {slide.cta[language]}
                {dir === "rtl" ? (
                  <ArrowLeft size={18} className="ms-2 group-hover:-translate-x-1.5 transition-transform" />
                ) : (
                  <ArrowRight size={18} className="ms-2 group-hover:translate-x-1.5 transition-transform" />
                )}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-background/10 hover:bg-background/30 backdrop-blur-sm text-background rounded-full transition-all opacity-0 group-hover:opacity-100 rtl:right-4 rtl:left-auto ltr:left-4 ltr:right-auto"
      >
        {dir === "rtl" ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-background/10 hover:bg-background/30 backdrop-blur-sm text-background rounded-full transition-all opacity-0 group-hover:opacity-100 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto"
      >
        {dir === "rtl" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide ? "w-6 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-background/50 hover:bg-background/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
