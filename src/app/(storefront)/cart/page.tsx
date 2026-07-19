"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { products } from "@/data/mock";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { calcOrderTotals } from "@/lib/cart/totals";
import { formatMoneyFixed } from "@/lib/format/currency";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default function CartPage() {
  const { language, dir } = useLanguage();

  const [cartItems, setCartItems] = useState([
    { ...products[0], quantity: 1 },
    { ...products[1], quantity: 2 },
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const { subtotal, tax, total } = calcOrderTotals(cartItems);

  return (
    <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center gap-4 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-sans text-secondary">
            {language === "ar" ? "سلة المشتريات" : "Shopping Cart"}
          </h1>
          <Badge variant="soft">
            {cartItems.length} {language === "ar" ? "عناصر" : "Items"}
          </Badge>
        </div>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <div className="lg:w-2/3 flex flex-col gap-6">
              {cartItems.map((item) => (
                <Card
                  key={item.id}
                  variant="glass"
                  padding="md"
                  className="flex flex-col sm:flex-row gap-6 items-center relative group transition-all hover:shadow-floating"
                >
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>

                  <Link href={`/product/${item.id}`} className="shrink-0">
                    <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-50">
                      <Image
                        src={item.image}
                        alt={item.name[language]}
                        fill
                        className="object-cover mix-blend-multiply"
                      />
                    </div>
                  </Link>

                  <div className="flex-grow flex flex-col text-center sm:text-start w-full">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      {item.brand[language]}
                    </span>
                    <Link href={`/product/${item.id}`}>
                      <h3 className="text-lg md:text-xl font-bold text-secondary mb-2 hover:text-primary transition-colors">
                        {item.name[language]}
                      </h3>
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto gap-4 sm:gap-0 pt-4">
                      <span className="text-xl font-bold text-secondary">
                        {formatMoneyFixed(item.price, language, 0)}
                      </span>

                      <div className="flex items-center justify-center sm:justify-start bg-gray-50 border border-gray-100 rounded-lg h-12 px-2 self-center sm:self-auto">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-bold text-secondary">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              <div className="mt-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors"
                >
                  {dir === "rtl" ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                  {language === "ar" ? "متابعة التسوق" : "Continue Shopping"}
                </Link>
              </div>
            </div>

            <div className="lg:w-1/3 shrink-0">
              <Card variant="solid" padding="lg" className="sticky top-32">
                <h3 className="text-2xl font-bold mb-8 pb-4 border-b border-white/10">
                  {language === "ar" ? "ملخص الطلب" : "Order Summary"}
                </h3>

                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex justify-between text-gray-300">
                    <span>{language === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                    <span className="font-bold text-white">
                      {formatMoneyFixed(subtotal, language)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{language === "ar" ? "الضريبة (15%)" : "Tax (15%)"}</span>
                    <span className="font-bold text-white">
                      {formatMoneyFixed(tax, language)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{language === "ar" ? "التوصيل" : "Shipping"}</span>
                    <span className="font-bold text-green-400">
                      {language === "ar" ? "مجاني" : "Free"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-white/10 mb-8">
                  <span className="text-xl font-bold">
                    {language === "ar" ? "الإجمالي" : "Total"}
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    {total.toFixed(2)} <span className="text-lg">SAR</span>
                  </span>
                </div>

                <Link href="/checkout" className="block">
                  <Button variant="primary" size="xl" fullWidth className="text-secondary hover:text-secondary">
                    <ShoppingBag size={22} />
                    {language === "ar" ? "إتمام الطلب" : "Proceed to Checkout"}
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<ShoppingBag size={48} className="text-gray-300" />}
            title={language === "ar" ? "سلة المشتريات فارغة" : "Your cart is empty"}
            description={
              language === "ar"
                ? "يبدو أنك لم تقم بإضافة أي منتجات إلى سلة المشتريات بعد. اكتشف تشكيلتنا الفاخرة الآن."
                : "Looks like you haven't added any items to your cart yet. Discover our luxury collection now."
            }
            action={
              <Link href="/shop">
                <Button variant="secondary" size="lg">
                  {language === "ar" ? "بدء التسوق" : "Start Shopping"}
                </Button>
              </Link>
            }
            className="rounded-3xl py-32"
          />
        )}
      </div>
    </main>
  );
}
