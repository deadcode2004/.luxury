"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { products } from "@/data/mock";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { language, dir } = useLanguage();
  
  // Initialize with some mock items for the demo
  const [cartItems, setCartItems] = useState([
    { ...products[0], quantity: 1 },
    { ...products[1], quantity: 2 }
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15; // 15% VAT for example
  const total = subtotal + tax;

  return (
    <>
      <Header />
      <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          
          <div className="flex items-center gap-4 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-sans text-secondary">
              {language === "ar" ? "سلة المشتريات" : "Shopping Cart"}
            </h1>
            <span className="bg-primary/10 text-primary font-bold px-4 py-1 rounded-full">
              {cartItems.length} {language === "ar" ? "عناصر" : "Items"}
            </span>
          </div>

          {cartItems.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
              
              {/* Cart Items List */}
              <div className="lg:w-2/3 flex flex-col gap-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group transition-all hover:shadow-floating">
                    
                    {/* Remove Button */}
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>

                    <Link href={`/product/${item.id}`} className="shrink-0">
                      <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-50">
                        <Image src={item.image} alt={item.name[language]} fill className="object-cover mix-blend-multiply" />
                      </div>
                    </Link>

                    <div className="flex-grow flex flex-col text-center sm:text-start w-full">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{item.brand[language]}</span>
                      <Link href={`/product/${item.id}`}>
                        <h3 className="text-lg md:text-xl font-bold text-secondary mb-2 hover:text-primary transition-colors">
                          {item.name[language]}
                        </h3>
                      </Link>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto gap-4 sm:gap-0 pt-4">
                        <span className="text-xl font-bold text-secondary">
                          {item.price} {language === "ar" ? "ر.س" : "SAR"}
                        </span>

                        <div className="flex items-center justify-center sm:justify-start bg-gray-50 border border-gray-100 rounded-lg h-12 px-2 self-center sm:self-auto">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary transition-colors">
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-bold text-secondary">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary transition-colors">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}

                <div className="mt-4">
                  <Link href="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors">
                    {dir === "rtl" ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                    {language === "ar" ? "متابعة التسوق" : "Continue Shopping"}
                  </Link>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:w-1/3 shrink-0">
                <div className="bg-secondary rounded-2xl p-8 text-white sticky top-32 shadow-soft">
                  <h3 className="text-2xl font-bold mb-8 pb-4 border-b border-white/10">
                    {language === "ar" ? "ملخص الطلب" : "Order Summary"}
                  </h3>

                  <div className="flex flex-col gap-4 mb-8">
                    <div className="flex justify-between text-gray-300">
                      <span>{language === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                      <span className="font-bold text-white">{subtotal.toFixed(2)} {language === "ar" ? "ر.س" : "SAR"}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>{language === "ar" ? "الضرائب (15%)" : "Tax (15%)"}</span>
                      <span className="font-bold text-white">{tax.toFixed(2)} {language === "ar" ? "ر.س" : "SAR"}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>{language === "ar" ? "التوصيل" : "Shipping"}</span>
                      <span className="font-bold text-green-400">{language === "ar" ? "مجاني" : "Free"}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-white/10 mb-8">
                    <span className="text-xl font-bold">{language === "ar" ? "الإجمالي" : "Total"}</span>
                    <span className="text-3xl font-bold text-primary">{total.toFixed(2)} <span className="text-lg">SAR</span></span>
                  </div>

                  <Link 
                    href="/checkout"
                    className="w-full bg-primary hover:bg-primary/90 text-secondary font-bold text-lg h-16 rounded-xl flex items-center justify-center gap-3 transition-all shadow-glow"
                  >
                    <ShoppingBag size={22} />
                    {language === "ar" ? "إتمام الطلب" : "Proceed to Checkout"}
                  </Link>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-32 bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={48} className="text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-secondary mb-4">
                {language === "ar" ? "سلة المشتريات فارغة" : "Your cart is empty"}
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {language === "ar" ? "يبدو أنك لم تقم بإضافة أي منتجات إلى سلة المشتريات بعد. اكتشف تشكيلتنا الفاخرة الآن." : "Looks like you haven't added any items to your cart yet. Discover our luxury collection now."}
              </p>
              <Link 
                href="/shop"
                className="inline-flex items-center justify-center px-8 h-14 bg-secondary text-white font-bold rounded-lg hover:bg-primary hover:text-secondary transition-colors"
              >
                {language === "ar" ? "بدء التسوق" : "Start Shopping"}
              </Link>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
