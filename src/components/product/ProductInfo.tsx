"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Minus, Plus, Heart, ShoppingBag, Share2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/components/ui/Toast";
import { Product } from "@/data/mock";
import { formatMoney } from "@/lib/format/currency";
import Button from "@/components/ui/Button";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const wished = has(product.id);
  const stock = product.stock ?? 0;
  const outOfStock = stock <= 0;

  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));
  const increaseQuantity = () =>
    setQuantity((prev) => Math.min(stock > 0 ? stock : prev, prev + 1));

  const onAdd = async () => {
    setCartLoading(true);
    try {
      await addItem(product.id, quantity);
    } finally {
      setCartLoading(false);
    }
  };

  const onBuyNow = async () => {
    setBuyLoading(true);
    try {
      const ok = await addItem(product.id, quantity);
      if (ok) router.push("/checkout");
    } finally {
      setBuyLoading(false);
    }
  };

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast(language === "ar" ? "تم نسخ رابط المنتج" : "Product link copied", "success");
    } catch {
      toast(language === "ar" ? "تعذر النسخ" : "Could not copy", "danger");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-bold tracking-widest uppercase text-primary">
          {product.brand[language]}
        </span>
        <button
          type="button"
          onClick={() => void onShare()}
          className="text-gray-400 hover:text-primary transition-colors active:scale-95"
        >
          <Share2 size={20} />
        </button>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold font-sans text-secondary mb-4 leading-tight">
        {product.name[language]}
      </h1>

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

      {product.description && (
        <p className="text-gray-600 text-base leading-loose mb-10 pb-10 border-b border-gray-100">
          {product.description[language]}
        </p>
      )}

      <div className="mt-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center bg-surface border border-gray-100 rounded-lg h-14 px-2">
            <button
              type="button"
              onClick={decreaseQuantity}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-background rounded-md transition-all active:scale-95"
            >
              <Minus size={18} />
            </button>
            <span className="w-12 text-center font-bold text-secondary text-lg">{quantity}</span>
            <button
              type="button"
              onClick={increaseQuantity}
              disabled={outOfStock || quantity >= stock}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-background rounded-md transition-all active:scale-95 disabled:opacity-40"
            >
              <Plus size={18} />
            </button>
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="flex-1 rounded-lg"
            loading={cartLoading}
            disabled={outOfStock}
            onClick={() => void onAdd()}
          >
            <ShoppingBag size={20} />
            {outOfStock
              ? language === "ar"
                ? "غير متوفر"
                : "Out of Stock"
              : language === "ar"
                ? "إضافة للسلة"
                : "Add to Cart"}
          </Button>

          <button
            type="button"
            onClick={() => void toggle(product.id)}
            className={`w-14 h-14 rounded-lg flex items-center justify-center border transition-all active:scale-95 ${
              wished
                ? "bg-wishlist/10 border-wishlist text-wishlist"
                : "bg-surface border-gray-100 text-gray-400 hover:border-wishlist hover:text-wishlist"
            }`}
          >
            <Heart size={24} fill={wished ? "currentColor" : "none"} />
          </button>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="rounded-lg"
          loading={buyLoading}
          disabled={outOfStock}
          onClick={() => void onBuyNow()}
        >
          {language === "ar" ? "شراء الآن" : "Buy It Now"}
        </Button>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div
              className={`w-2 h-2 rounded-full ${outOfStock ? "bg-red-500" : "bg-green-500"}`}
            />
            {outOfStock
              ? language === "ar"
                ? "غير متوفر"
                : "Out of Stock"
              : language === "ar"
                ? `متوفر (${stock})`
                : `In Stock (${stock})`}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-2 h-2 rounded-full bg-primary" />
            {language === "ar" ? "توصيل مجاني" : "Free Shipping"}
          </div>
        </div>
      </div>
    </div>
  );
}
