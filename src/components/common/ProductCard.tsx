"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Product } from "@/data/mock";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMoney } from "@/lib/format/currency";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { language } = useLanguage();

  return (
    <Card
      variant="glass"
      padding="none"
      className="group rounded-3xl p-3 hover:shadow-floating hover:-translate-y-2 transition-all duration-500 relative flex flex-col"
    >
      {product.isNew && (
        <Badge variant="primary" className="absolute top-4 right-4 z-10">
          {language === "ar" ? "جديد" : "New"}
        </Badge>
      )}
      {!product.isNew && product.isBestSeller && (
        <Badge variant="accent" className="absolute top-4 right-4 z-10">
          {language === "ar" ? "الأكثر مبيعاً" : "Best Seller"}
        </Badge>
      )}

      <button className="absolute top-4 left-4 z-10 w-8 h-8 bg-background/80 backdrop-blur glass-fix rounded-full flex items-center justify-center text-secondary/70 hover:text-wishlist hover:bg-background transition-colors">
        <Heart size={16} />
      </button>

      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden rounded-2xl bg-transparent">
        <Image
          src={product.image}
          alt={product.name[language]}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={90}
          className="object-cover mix-blend-multiply transition-transform duration-1000 ease-out group-hover:scale-105"
        />

        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <Button variant="primary" size="md" fullWidth className="rounded-lg">
            <ShoppingBag size={18} />
            <span>{language === "ar" ? "أضف للسلة" : "Add to Cart"}</span>
          </Button>
        </div>
      </Link>

      <div className="pt-5 pb-3 px-2 flex flex-col items-start text-start flex-grow">
        <p className="text-secondary/50 text-[10px] tracking-[0.2em] uppercase mb-2 font-medium">
          {product.brand[language]}
        </p>
        <Link href={`/product/${product.id}`} className="w-full">
          <h3 className="text-secondary font-bold text-base md:text-lg mb-2 truncate hover:text-primary transition-colors">
            {product.name[language]}
          </h3>
        </Link>

        <div className="flex items-center mb-2">
          <div className="flex text-accent gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                className={i < Math.floor(product.rating) ? "text-accent" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="text-secondary/70 text-[9px] ms-1">({product.reviews})</span>
        </div>

        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50 w-full">
          <span className="text-secondary font-bold text-lg tracking-tight">
            {formatMoney(product.price, language)}
          </span>
          {product.oldPrice && (
            <span className="text-gray-400 line-through text-xs font-medium">
              {formatMoney(product.oldPrice, language)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
