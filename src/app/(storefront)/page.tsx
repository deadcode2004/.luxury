"use client";

import React, { useEffect, useState } from "react";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import ProductGrid from "@/components/home/ProductGrid";
import Offers from "@/components/home/Offers";
import Features from "@/components/home/Features";
import Reviews from "@/components/home/Reviews";
import InstagramGallery from "@/components/home/InstagramGallery";
import type { Product } from "@/data/mock";
import { fetchPublicProducts } from "@/lib/products/catalog";
import { useRealtimeDomains } from "@/contexts/RealtimeContext";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchPublicProducts({ perPage: 50 })
      .then((list) => {
        if (!cancelled) setProducts(list);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useRealtimeDomains(["products"], () => {
    void fetchPublicProducts({ perPage: 50 })
      .then(setProducts)
      .catch(() => undefined);
  });

  const featuredProducts = products.filter((p) => p.isFeatured);
  const bestSellers = products.filter((p) => p.isBestSeller);

  return (
    <main className="flex-grow">
      <Hero />
      <Features />
      <Categories />
      <ProductGrid
        title={{ ar: "المنتجات المميزة", en: "Featured Products" }}
        subtitle={{ ar: "اختياراتنا لك", en: "Our Picks For You" }}
        products={featuredProducts}
      />
      <Offers />
      <ProductGrid
        title={{ ar: "الأكثر مبيعاً", en: "Best Sellers" }}
        subtitle={{ ar: "الأكثر طلباً", en: "Most Loved" }}
        products={bestSellers}
      />
      <Reviews />
      <InstagramGallery />
    </main>
  );
}
