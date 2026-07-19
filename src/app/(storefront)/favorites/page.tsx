"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { products } from "@/data/mock";
import { ShoppingBag } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";

export default function FavoritesPage() {
  const { language } = useLanguage();
  const favoriteItems = products.slice(0, 2);

  return (
    <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <PageHeader
          title={language === "ar" ? "المفضلة" : "Wishlist"}
          description={
            language === "ar"
              ? `لديك ${favoriteItems.length} منتجات في قائمتك المفضلة.`
              : `You have ${favoriteItems.length} items in your wishlist.`
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteItems.map((product) => (
            <div key={product.id} className="flex flex-col gap-3">
              <ProductCard product={product} />
              <Button variant="secondary" size="md" fullWidth>
                <ShoppingBag size={18} />
                {language === "ar" ? "نقل للسلة" : "Move to Cart"}
              </Button>
              <Link
                href={`/product/${product.id}`}
                className="text-center text-sm text-gray-500 hover:text-primary font-medium"
              >
                {language === "ar" ? "عرض المنتج" : "View Product"}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
