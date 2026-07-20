"use client";

import React, { useMemo, useState, useEffect, useDeferredValue, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/common/ProductCard";
import { products } from "@/data/mock";
import { useLanguage } from "@/contexts/LanguageContext";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import {
  filterAndSortProducts,
  getProductPriceBounds,
} from "@/lib/products/query";
import ShopFiltersSidebar, {
  type ShopFilterState,
} from "@/components/shop/ShopFiltersSidebar";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/layout/PageHeader";

function filtersFromParam(filter: string | null): Partial<ShopFilterState> {
  switch (filter) {
    case "new":
      return { newest: true };
    case "offers":
      return { offers: true };
    case "discounts":
      return { discounts: true };
    case "featured":
      return { featured: true };
    default:
      return {};
  }
}

function ShopContent() {
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const filterParam = searchParams.get("filter");
  const deferredSearch = useDeferredValue(searchQuery);

  const bounds = useMemo(() => getProductPriceBounds(products), []);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filters, setFilters] = useState<ShopFilterState>(() => ({
    featured: false,
    newest: false,
    offers: false,
    discounts: false,
    priceRange: [bounds.min, bounds.max],
    ...filtersFromParam(filterParam),
  }));

  // Sync hero CTA / deep-link ?filter= into sidebar state.
  useEffect(() => {
    const fromUrl = filtersFromParam(filterParam);
    setFilters((prev) => ({
      ...prev,
      featured: Boolean(fromUrl.featured),
      newest: Boolean(fromUrl.newest),
      offers: Boolean(fromUrl.offers),
      discounts: Boolean(fromUrl.discounts),
    }));
  }, [filterParam]);

  // Keep sidebar open on large screens; collapse by default on small.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setFiltersOpen(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const pushFilterUrl = useCallback(
    (next: ShopFilterState) => {
      const params = new URLSearchParams(searchParams.toString());
      let filter: string | null = null;
      if (next.offers) filter = "offers";
      else if (next.discounts) filter = "discounts";
      else if (next.newest) filter = "new";
      else if (next.featured) filter = "featured";

      if (filter) params.set("filter", filter);
      else params.delete("filter");

      const qs = params.toString();
      router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
    },
    [router, searchParams]
  );

  const onFiltersChange = (next: ShopFilterState) => {
    setFilters(next);
    pushFilterUrl(next);
  };

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(products, {
        featuredOnly: filters.featured,
        newestOnly: filters.newest,
        offersOnly: filters.offers,
        discountsOnly: filters.discounts,
        priceMin: filters.priceRange[0],
        priceMax: filters.priceRange[1],
        search: deferredSearch || null,
        sortBy: filters.newest ? "newest" : "featured",
      }),
    [filters, deferredSearch]
  );

  const clearAll = () => {
    const next: ShopFilterState = {
      featured: false,
      newest: false,
      offers: false,
      discounts: false,
      priceRange: [bounds.min, bounds.max],
    };
    setFilters(next);
    pushFilterUrl(next);
  };

  return (
    <main className="flex-grow pt-28 md:pt-32 pb-20 md:pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-8 mb-8 md:mb-10">
        <PageHeader
          title={language === "ar" ? "التشكيلة الكاملة" : "Full Collection"}
          description={
            deferredSearch
              ? language === "ar"
                ? `نتائج البحث عن “${deferredSearch}”`
                : `Search results for “${deferredSearch}”`
              : language === "ar"
                ? "صفِّ التشكيلة حسب المميز والأحدث والعروض والخصومات"
                : "Refine by featured, newest, offers, and discounts"
          }
          centered
          showAccent
          className="mb-2"
        />
      </div>

      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <div className="lg:w-[280px] xl:w-[300px] shrink-0">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="w-full inline-flex items-center justify-between lg:hidden bg-background border border-surface p-4 rounded-2xl font-bold text-secondary mb-3 shadow-soft"
            >
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-primary shrink-0" />
                {language === "ar" ? "الفلاتر" : "Filters"}
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${filtersOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
              <ShopFiltersSidebar
                bounds={bounds}
                value={filters}
                onChange={onFiltersChange}
                resultCount={filteredProducts.length}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-5 flex items-center justify-between gap-3 text-sm text-secondary/55">
              <span>
                {language === "ar"
                  ? `عرض ${filteredProducts.length} منتجات`
                  : `Showing ${filteredProducts.length} products`}
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
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
                  <Button variant="ghost" className="mt-2" onClick={clearAll}>
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

export default function ShopPage() {
  return (
    <React.Suspense
      fallback={
        <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
          <div className="container mx-auto px-4 md:px-8">
            <div className="h-10 w-64 mx-auto rounded-lg bg-surface/70 animate-pulse mb-12" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 rounded-3xl bg-surface/60 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      }
    >
      <ShopContent />
    </React.Suspense>
  );
}
