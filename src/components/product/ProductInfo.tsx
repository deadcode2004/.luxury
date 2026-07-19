"use client";

import React, { useState } from "react";
import { Star, Minus, Plus, Heart, ShoppingBag, Share2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/data/mock";
import { formatMoney } from "@/lib/format/currency";
import Button from "@/components/ui/Button";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));
  const increaseQuantity = () => setQuantity((prev) => prev + 1);

  return (
    <div className="flex flex-col h-full">
      {/* Brand & Share */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-bold tracking-widest uppercase text-primary">
          {product.brand[language]}
        </span>
        <button className="text-gray-400 hover:text-primary transition-colors">
          <Share2 size={20} />
        </button>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold font-sans text-secondary mb-4 leading-tight">
        {product.name[language]}
      </h1>

      {/* Rating & Reviews */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex text-accent">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={18}
              fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
              className={i < Math.floor(product.rating) ? "text-accent" : "text-gray-300"}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500 font-medium">
          {product.rating} ({product.reviews} {language === "ar" ? "تقييم" : "Reviews"})
        </span>
      </div>

      {/* Price */}
      <div className="flex items-end gap-4 mb-8">
        <span className="text-3xl font-bold text-secondary">
          {formatMoney(product.price, language)}
        </span>
        {product.oldPrice && (
          <span className="text-xl text-gray-400 line-through mb-1">
            {formatMoney(product.oldPrice, language)}
          </span>
        )}
      </div>

      {/* Short Description */}
      {product.description && (
        <p className="text-gray-600 text-base leading-loose mb-10 pb-10 border-b border-gray-100">
          {product.description[language]}
        </p>
      )}

      {/* Add to Cart Actions */}
      <div className="mt-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center bg-surface border border-gray-100 rounded-lg h-14 px-2">
            <button
              onClick={decreaseQuantity}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-background rounded-md transition-all"
            >
              <Minus size={18} />
            </button>
            <span className="w-12 text-center font-bold text-secondary text-lg">
              {quantity}
            </span>
            <button
              onClick={increaseQuantity}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-background rounded-md transition-all"
            >
              <Plus size={18} />
            </button>
          </div>

          <Button variant="secondary" size="lg" className="flex-1 rounded-lg">
            <ShoppingBag size={20} />
            {language === "ar" ? "إضافة للسلة" : "Add to Cart"}
          </Button>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`w-14 h-14 rounded-lg flex items-center justify-center border transition-all ${
              isFavorite
                ? "bg-wishlist/10 border-wishlist text-wishlist"
                : "bg-surface border-gray-100 text-gray-400 hover:border-wishlist hover:text-wishlist"
            }`}
          >
            <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        <Button variant="primary" size="lg" fullWidth className="rounded-lg">
          {language === "ar" ? "شراء الآن" : "Buy It Now"}
        </Button>

        {/* Perks */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {language === "ar" ? "متوفر في المخزون" : "In Stock"}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            {language === "ar" ? "توصيل مجاني" : "Free Shipping"}
          </div>
        </div>
      </div>
    </div>
  );
}
