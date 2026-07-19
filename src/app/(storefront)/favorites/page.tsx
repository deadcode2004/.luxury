"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function FavoritesPage() {
  const { language } = useLanguage();
  const { items, count, remove } = useWishlist();
  const { addItem } = useCart();
  const [movingId, setMovingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  return (
    <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <PageHeader
          title={language === "ar" ? "المفضلة" : "Wishlist"}
          description={
            language === "ar"
              ? `لديك ${count} منتجات في قائمتك المفضلة.`
              : `You have ${count} items in your wishlist.`
          }
        />

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => (
              <div key={product.id} className="flex flex-col gap-3">
                <ProductCard product={product} />
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  loading={movingId === product.id}
                  onClick={async () => {
                    setMovingId(product.id);
                    try {
                      const ok = await addItem(product.id, 1);
                      if (ok) await remove(product.id);
                    } finally {
                      setMovingId(null);
                    }
                  }}
                >
                  <ShoppingBag size={18} />
                  {language === "ar" ? "نقل للسلة" : "Move to Cart"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmId(product.id)}
                >
                  {language === "ar" ? "إزالة من المفضلة" : "Remove from wishlist"}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Heart size={48} className="text-gray-300" />}
            title={language === "ar" ? "قائمة المفضلة فارغة" : "Wishlist is empty"}
            description={
              language === "ar"
                ? "أضف منتجات تعجبك لتجدها هنا لاحقاً."
                : "Save products you love to find them here later."
            }
            action={
              <Link href="/shop">
                <Button variant="secondary" size="lg">
                  {language === "ar" ? "تصفح المتجر" : "Browse Shop"}
                </Button>
              </Link>
            }
          />
        )}
      </div>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        loading={removing}
        title={language === "ar" ? "إزالة من المفضلة؟" : "Remove from wishlist?"}
        description={
          language === "ar"
            ? "لن يظهر هذا المنتج في قائمة المفضلة بعد الآن."
            : "This product will no longer appear in your wishlist."
        }
        onConfirm={async () => {
          if (!confirmId) return;
          setRemoving(true);
          try {
            await remove(confirmId);
            setConfirmId(null);
          } finally {
            setRemoving(false);
          }
        }}
      />
    </main>
  );
}
