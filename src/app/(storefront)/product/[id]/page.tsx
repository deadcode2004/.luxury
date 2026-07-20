"use client";

import React, { use } from "react";
import { useEffect, useState } from "react";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import ProductReviews from "@/components/product/ProductReviews";
import ProductGrid from "@/components/home/ProductGrid";
import type { Product } from "@/data/mock";
import { fetchPublicProduct } from "@/lib/products/catalog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealtimeDomains } from "@/contexts/RealtimeContext";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { language } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadProduct = () =>
    fetchPublicProduct(resolvedParams.id)
      .then((res) => {
        setProduct(res?.product ?? null);
        setRelatedProducts(res?.related ?? []);
      })
      .catch(() => undefined);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPublicProduct(resolvedParams.id)
      .then((res) => {
        if (cancelled) return;
        setProduct(res?.product ?? null);
        setRelatedProducts(res?.related ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setProduct(null);
          setRelatedProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id]);

  useRealtimeDomains(["products"], () => {
    void reloadProduct();
  });

  if (loading) {
    return (
      <main className="flex-grow pt-32 pb-24 text-center text-secondary/50">
        {language === "ar" ? "جاري التحميل..." : "Loading..."}
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex-grow pt-32 pb-24 text-center">
        <h1 className="text-3xl font-bold">
          {language === "ar" ? "المنتج غير موجود" : "Product not found"}
        </h1>
      </main>
    );
  }

  const images = [product.image, ...(product.gallery || [])].filter(Boolean);

  return (
    <main className="flex-grow pt-32 pb-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          <div>
            <ProductGallery images={images} />
          </div>
          <div>
            <ProductInfo product={product} />
          </div>
        </div>

        <div className="mb-24">
          <ProductTabs product={product} />
        </div>

        <div className="mb-24">
          <ProductReviews productId={product.id} onStatsChange={() => void reloadProduct()} />
        </div>

        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-100 pt-24">
            <ProductGrid
              title={{ ar: "منتجات ذات صلة", en: "Related Products" }}
              subtitle={{ ar: "قد يعجبك أيضاً", en: "You May Also Like" }}
              products={relatedProducts}
            />
          </div>
        )}
      </div>
    </main>
  );
}
