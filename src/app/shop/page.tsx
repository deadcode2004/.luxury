"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ProductCard from "@/components/common/ProductCard";
import { products, categories } from "@/data/mock";
import { useLanguage } from "@/contexts/LanguageContext";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

export default function ShopPage() {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.id === 'p1' || p.id === 'p2');

    // Filter
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [selectedCategory, sortBy]);

  return (
    <>
      <Header />
      <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
        {/* Page Header */}
        <div className="container mx-auto px-4 md:px-8 mb-12">
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-sans text-secondary mb-4">
              {language === "ar" ? "التشكيلة الكاملة" : "Full Collection"}
            </h1>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar / Filters */}
            <aside className="lg:w-1/4 shrink-0">
              {/* Mobile Filter Toggle */}
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-between lg:hidden bg-surface p-4 rounded-xl border border-gray-100 font-bold text-secondary mb-4"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={20} className="text-primary" />
                  {language === "ar" ? "الفلاتر والترتيب" : "Filters & Sorting"}
                </div>
                <ChevronDown size={20} className={`transform transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
              </button>

              <div className={`lg:block ${isFilterOpen ? "block" : "hidden"}`}>
                <div className="bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-md sticky top-32">
                  
                  {/* Categories Filter */}
                  <div className="mb-10">
                    <h3 className="text-xl font-bold text-secondary mb-6 pb-4 border-b border-gray-100">
                      {language === "ar" ? "الأقسام" : "Categories"}
                    </h3>
                    <ul className="flex flex-col gap-4">
                      <li>
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className={`text-start w-full transition-colors font-medium text-lg ${
                            selectedCategory === null ? "text-primary font-bold" : "text-gray-500 hover:text-secondary"
                          }`}
                        >
                          {language === "ar" ? "الكل" : "All Products"}
                        </button>
                      </li>
                      {categories.map((category) => (
                        <li key={category.id}>
                          <button
                            onClick={() => setSelectedCategory(category.id)}
                            className={`text-start w-full transition-colors font-medium text-lg ${
                              selectedCategory === category.id ? "text-primary font-bold" : "text-gray-500 hover:text-secondary"
                            }`}
                          >
                            {category.name[language]}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sort By */}
                  <div>
                    <h3 className="text-xl font-bold text-secondary mb-6 pb-4 border-b border-gray-100">
                      {language === "ar" ? "الترتيب حسب" : "Sort By"}
                    </h3>
                    <div className="flex flex-col gap-4">
                      {[
                        { id: "featured", label: { ar: "المميزة", en: "Featured" } },
                        { id: "newest", label: { ar: "الأحدث", en: "Newest Arrivals" } },
                        { id: "price-asc", label: { ar: "السعر: من الأقل للأعلى", en: "Price: Low to High" } },
                        { id: "price-desc", label: { ar: "السعر: من الأعلى للأقل", en: "Price: High to Low" } },
                      ].map((sort) => (
                        <button
                          key={sort.id}
                          onClick={() => setSortBy(sort.id as SortOption)}
                          className={`text-start w-full transition-colors font-medium text-lg ${
                            sortBy === sort.id ? "text-primary font-bold" : "text-gray-500 hover:text-secondary"
                          }`}
                        >
                          {sort.label[language]}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="lg:w-3/4">
              <div className="mb-6 flex justify-between items-center text-gray-500">
                <span>
                  {language === "ar" ? `عرض ${filteredProducts.length} منتجات` : `Showing ${filteredProducts.length} products`}
                </span>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
                  <h3 className="text-2xl font-bold text-gray-400">
                    {language === "ar" ? "لا توجد منتجات تطابق هذا الفلتر." : "No products match this filter."}
                  </h3>
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="mt-6 text-primary font-bold hover:underline"
                  >
                    {language === "ar" ? "مسح الفلاتر" : "Clear Filters"}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
