"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatMoney } from "@/lib/format/currency";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function FavoritesPage() {
  const { language } = useLanguage();
  const { items, count, remove } = useWishlist();
  const { addItem } = useCart();
  const { currency, convertFromEgp } = useCurrency();
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((product) => (
              <Card
                key={product.id}
                variant="glass"
                padding="md"
                className="flex flex-col sm:flex-row gap-5 items-center"
              >
                <Link
                  href={`/product/${product.id}`}
                  className="relative w-full sm:w-32 aspect-square rounded-2xl overflow-hidden shrink-0 bg-gray-50"
                >
                  <Image
                    src={product.image}
                    alt={product.name[language]}
                    fill
                    sizes="128px"
                    quality={80}
                    loading="lazy"
                    className="object-cover mix-blend-multiply"
                  />
                </Link>
                <div className="flex-1 w-full text-start">
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                    {product.brand[language]}
                  </p>
                  <Link
                    href={`/product/${product.id}`}
                    className="font-bold text-lg text-secondary hover:text-primary transition-colors"
                  >
                    {product.name[language]}
                  </Link>
                  <p className="mt-2 font-bold text-secondary">
                    {formatMoney(product.price, language, { currency, convertFromEgp })}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
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
                      <ShoppingBag size={16} />
                      {language === "ar" ? "نقل للسلة" : "Move to Cart"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => setConfirmId(product.id)}
                    >
                      <Trash2 size={16} />
                      {language === "ar" ? "إزالة" : "Remove"}
                    </Button>
                  </div>
                </div>
              </Card>
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
