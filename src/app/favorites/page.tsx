"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { products } from "@/data/mock";
import { Trash2, ShoppingBag } from "lucide-react";

export default function FavoritesPage() {
  const { language } = useLanguage();

  // Assuming first two products are favorited for the demo
  const favoriteItems = products.slice(0, 2);

  return (
    <>
      <Header />
      <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
        
        <div className="container mx-auto px-4 md:px-8">
          
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-sans text-secondary mb-4">
              {language === "ar" ? "المفضلة" : "Wishlist"}
            </h1>
            <p className="text-gray-500">
              {language === "ar" 
                ? `لديك ${favoriteItems.length} منتجات في قائمتك المفضلة.` 
                : `You have ${favoriteItems.length} items in your wishlist.`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteItems.map((product) => (
              <div key={product.id} className="group relative bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl border border-white/40 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-floating transition-all duration-300 flex flex-col">
                
                {/* زر إزالة */}
                <button className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-colors">
                  <Trash2 size={16} />
                </button>

                {/* Product Image */}
                <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] bg-gray-50 overflow-hidden w-full">
                  <Image 
                    src={product.image} 
                    alt={product.name[language]} 
                    fill 
                    className="object-cover mix-blend-multiply transform transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                </Link>

                {/* Product Details */}
                <div className="p-6 flex flex-col flex-grow text-center">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-lg font-bold text-secondary mb-2 hover:text-primary transition-colors line-clamp-1">
                      {product.name[language]}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.description?.[language] || ""}
                  </p>
                  
                  <div className="mt-auto">
                    <span className="text-xl font-bold text-secondary block mb-4">
                      {product.price} {language === "ar" ? "ر.س" : "SAR"}
                    </span>
                    
                    <button className="w-full bg-secondary hover:bg-primary hover:text-secondary text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all">
                      <ShoppingBag size={18} />
                      {language === "ar" ? "نقل للسلة" : "Move to Cart"}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

      </main>
      <Footer />
    </>
  );
}
