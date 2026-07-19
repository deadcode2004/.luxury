"use client";

import React, { useState, useMemo } from "react";
import ProductCard from "@/components/common/ProductCard";
import { products, categories } from "@/data/mock";
import { useLanguage } from "@/contexts/LanguageContext";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { filterAndSortProducts, type SortOption } from "@/lib/products/query";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/layout/PageHeader";

export default function ShopPage() {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(products, {
        categoryId: selectedCategory,
        sortBy,
        ids: ["p1", "p2"],
      }),
    [selectedCategory, sortBy]
  );

  return (
    <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-8 mb-12">
        <PageHeader
          title={language === "ar" ? "التشكيلة الكاملة" : "Full Collection"}
          centered
          showAccent
          className="mb-8"
        />
      </div>

      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="lg:w-1/4 shrink-0">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-between lg:hidden bg-surface p-4 rounded-xl border border-gray-100 font-bold text-secondary mb-4"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-primary" />
                {language === "ar" ? "الفلاتر والترتيب" : "Filters & Sorting"}
              </div>
              <ChevronDown
                size={20}
                className={`transform transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div className={`lg:block ${isFilterOpen ? "block" : "hidden"}`}>
              <Card variant="glass" padding="lg" className="sticky top-32 border-white/50 shadow-md">
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-secondary mb-6 pb-4 border-b border-gray-100">
                    {language === "ar" ? "الأقسام" : "Categories"}
                  </h3>
                  <ul className="flex flex-col gap-4">
                    <li>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`text-start w-full transition-colors font-medium text-lg ${
                          selectedCategory === null
                            ? "text-primary font-bold"
                            : "text-gray-500 hover:text-secondary"
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
                            selectedCategory === category.id
                              ? "text-primary font-bold"
                              : "text-gray-500 hover:text-secondary"
                          }`}
                        >
                          {category.name[language]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

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
                          sortBy === sort.id
                            ? "text-primary font-bold"
                            : "text-gray-500 hover:text-secondary"
                        }`}
                      >
                        {sort.label[language]}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </aside>

          <div className="lg:w-3/4">
            <div className="mb-6 flex justify-between items-center text-gray-500">
              <span>
                {language === "ar"
                  ? `عرض ${filteredProducts.length} منتجات`
                  : `Showing ${filteredProducts.length} products`}
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={
                  language === "ar"
                    ? "لا توجد منتجات تطابق هذا الفلتر."
                    : "No products match this filter."
                }
                action={
                  <Button variant="ghost" className="mt-2" onClick={() => setSelectedCategory(null)}>
                    {language === "ar" ? "مسح الفلاتر" : "Clear Filters"}
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
