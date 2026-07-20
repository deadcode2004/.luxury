"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Product } from "@/data/mock";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatMoney } from "@/lib/format/currency";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { currency, convertFromSar } = useCurrency();
  const [cartLoading, setCartLoading] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const wished = has(product.id);
  const outOfStock = (product.stock ?? 0) <= 0;

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    setCartLoading(true);
    try {
      await addItem(product.id, 1);
    } finally {
      setCartLoading(false);
    }
  };

  const onWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishLoading(true);
    try {
      await toggle(product.id);
    } finally {
      setWishLoading(false);
    }
  };

  return (
    <Card
      variant="glass"
      padding="none"
      className="group rounded-3xl p-3 hover:shadow-floating hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full"
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

      <button
        type="button"
        disabled={wishLoading}
        onClick={onWish}
        className={`absolute top-4 left-4 z-10 w-9 h-9 backdrop-blur glass-fix rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 ${
          wished
            ? "bg-wishlist/20 text-wishlist"
            : "bg-background/80 text-secondary/70 hover:text-wishlist hover:bg-background"
        }`}
        aria-label="Wishlist"
      >
        <Heart size={16} fill={wished ? "currentColor" : "none"} />
      </button>

      <Link
        href={`/product/${product.id}`}
        className="block relative aspect-square overflow-hidden rounded-2xl bg-transparent"
      >
        <Image
          src={product.image}
          alt={product.name[language]}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          quality={85}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </Link>

      <div className="pt-4 pb-2 px-2 flex flex-col items-start text-start flex-grow">
        <p className="text-secondary/50 text-[10px] tracking-[0.2em] uppercase mb-2 font-medium">
          {product.brand[language]}
        </p>
        <Link href={`/product/${product.id}`} className="w-full">
          <h3 className="text-secondary font-bold text-base md:text-lg mb-2 line-clamp-2 hover:text-primary transition-colors min-h-[3rem]">
            {product.name[language]}
          </h3>
        </Link>

        <div className="flex items-center mb-3">
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

        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-50 w-full mb-3">
          <span className="text-secondary font-bold text-lg tracking-tight">
            {formatMoney(product.price, language, { currency, convertFromSar })}
          </span>
          {product.oldPrice && (
            <span className="text-gray-400 line-through text-xs font-medium">
              {formatMoney(product.oldPrice, language, { currency, convertFromSar })}
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="md"
          fullWidth
          className="rounded-xl"
          loading={cartLoading}
          disabled={outOfStock}
          onClick={onAdd}
        >
          <ShoppingBag size={18} />
          {outOfStock
            ? language === "ar"
              ? "غير متوفر"
              : "Out of Stock"
            : language === "ar"
              ? "أضف للسلة"
              : "Add to Cart"}
        </Button>
      </div>
    </Card>
  );
}
