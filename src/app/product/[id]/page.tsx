"use client";

import React, { use } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import ProductGrid from "@/components/home/ProductGrid";
import { products } from "@/data/mock";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use() to unwrap the params promise (Next.js 15+ requirement for app router dynamic segments)
  const resolvedParams = use(params);
  
  const product = products.find((p) => p.id === resolvedParams.id);
  const relatedProducts = products.filter((p) => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  if (!product) {
    return (
      <>
        <Header />
        <main className="flex-grow pt-32 pb-24 text-center">
          <h1 className="text-3xl font-bold">Product not found</h1>
        </main>
        <Footer />
      </>
    );
  }

  // Use gallery if exists, otherwise fallback to main image
  const images = product.gallery || [product.image];

  return (
    <>
      <Header />
      <main className="flex-grow pt-32 pb-24 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          
          {/* Top Section: Gallery & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
            {/* Left: Gallery */}
            <div>
              <ProductGallery images={images} />
            </div>

            {/* Right: Info */}
            <div>
              <ProductInfo product={product} />
            </div>
          </div>

          {/* Middle Section: Tabs */}
          <div className="mb-24">
            <ProductTabs product={product} />
          </div>

          {/* Bottom Section: Related Products */}
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
      <Footer />
    </>
  );
}
