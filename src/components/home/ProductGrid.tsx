"use client";

import React from "react";
import { Product } from "@/data/mock";
import ProductCard from "@/components/common/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductGridProps {
  title: { ar: string; en: string };
  subtitle?: { ar: string; en: string };
  products: Product[];
}

export default function ProductGrid({ title, subtitle, products }: ProductGridProps) {
  const { language } = useLanguage();

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16 md:mb-20">
          {subtitle && (
            <span className="text-primary text-[10px] md:text-xs font-bold tracking-widest uppercase mb-3 block">
              {subtitle[language]}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-secondary mb-4">
            {title[language]}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-20 text-center">
          <button className="border border-secondary text-secondary px-10 py-4 rounded-md font-bold hover:bg-secondary hover:text-white transition-all tracking-wide">
            {language === "ar" ? "عرض جميع المنتجات" : "View All Products"}
          </button>
        </div>
      </div>
    </section>
  );
}
