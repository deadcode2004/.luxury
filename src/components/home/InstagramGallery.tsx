"use client";

import React from "react";
import Image from "next/image";
import { FaInstagram } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";

export default function InstagramGallery() {
  const { language } = useLanguage();

  const images = [
    "/images/products/paradisecare-home02.jpg",
    "/images/products/paradisecare-shop-gold-saffron-cream-01-300x300.jpg",
    "/images/products/paradisecare-shop-biomagneti-01-300x300.jpeg",
    "/images/products/paradisecare-shop-hyaluronic-with-gold-and-silver-01-300x300.jpg",
    "/images/products/paradisecare-home03.jpg",
  ];

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="text-center mb-16 md:mb-20">
        <div className="flex items-center justify-center space-x-3 space-x-reverse rtl:space-x-reverse ltr:space-x mb-6 text-primary">
          <FaInstagram size={28} />
          <span className="font-semibold tracking-[0.2em] uppercase text-lg">@ParadiseOfficial</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-sans text-secondary">
          {language === "ar" ? "تابعنا على انستغرام" : "Follow Us On Instagram"}
        </h2>
      </div>

      <div className="flex flex-nowrap w-full overflow-hidden">
        {images.map((src, index) => (
          <div key={index} className="relative w-1/2 md:w-1/5 aspect-square group flex-shrink-0 cursor-pointer">
            <Image
              src={src}
              alt={`Instagram post ${index + 1}`}
              fill
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <FaInstagram size={32} className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
