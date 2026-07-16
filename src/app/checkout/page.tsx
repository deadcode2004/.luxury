"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { products } from "@/data/mock";
import { CreditCard, Banknote, ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
  const { language } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "cod">("card");

  // Mock cart totals
  const subtotal = (products[0].price * 1) + (products[1].price * 2);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  return (
    <>
      <Header />
      <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-sans text-secondary mb-4">
              {language === "ar" ? "إتمام الطلب" : "Checkout"}
            </h1>
            <p className="text-gray-500 text-lg">
              {language === "ar" ? "الرجاء إدخال بيانات الشحن والدفع لإتمام طلبك." : "Please enter your shipping and payment details to complete your order."}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            
            {/* Forms Section */}
            <div className="lg:w-2/3 flex flex-col gap-12">
              
              {/* 1. Shipping Information */}
              <div className="bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-2xl font-bold text-secondary mb-8 pb-4 border-b border-gray-100 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-sm">1</span>
                  {language === "ar" ? "بيانات الشحن" : "Shipping Information"}
                </h2>
                
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 flex gap-6 flex-col sm:flex-row">
                    <div className="w-full">
                      <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "الاسم الأول" : "First Name"}</label>
                      <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" placeholder={language === "ar" ? "أحمد" : "Ahmed"} />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "اسم العائلة" : "Last Name"}</label>
                      <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" placeholder={language === "ar" ? "محمد" : "Mohammad"} />
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "رقم الهاتف" : "Phone Number"}</label>
                    <input type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors text-start dir-ltr" placeholder="+966 5X XXX XXXX" />
                  </div>

                  <div className="w-full">
                    <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "البريد الإلكتروني" : "Email Address"}</label>
                    <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" placeholder="example@email.com" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "العنوان بالكامل" : "Full Address"}</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" placeholder={language === "ar" ? "اسم الشارع، الحي، رقم المبنى" : "Street name, District, Building number"} />
                  </div>

                  <div className="w-full">
                    <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "المدينة" : "City"}</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors appearance-none">
                      <option>{language === "ar" ? "الرياض" : "Riyadh"}</option>
                      <option>{language === "ar" ? "جدة" : "Jeddah"}</option>
                      <option>{language === "ar" ? "الدمام" : "Dammam"}</option>
                    </select>
                  </div>

                  <div className="w-full">
                    <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "الرمز البريدي (اختياري)" : "Zip Code (Optional)"}</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" />
                  </div>
                </form>
              </div>

              {/* 2. Payment Method */}
              <div className="bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-2xl font-bold text-secondary mb-8 pb-4 border-b border-gray-100 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-sm">2</span>
                  {language === "ar" ? "طريقة الدفع" : "Payment Method"}
                </h2>

                <div className="flex flex-col gap-4">
                  {/* Credit Card */}
                  <label className={`relative flex items-center justify-between p-6 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" ? "border-primary" : "border-gray-300"}`}>
                        {paymentMethod === "card" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                      <div>
                        <h4 className="font-bold text-secondary text-lg">{language === "ar" ? "البطاقة الائتمانية" : "Credit Card"}</h4>
                        <p className="text-sm text-gray-500">{language === "ar" ? "دفع آمن وموثوق بواسطة مدى، فيزا، ماستركارد" : "Secure payment via Mada, Visa, Mastercard"}</p>
                      </div>
                    </div>
                    <CreditCard size={32} className={paymentMethod === "card" ? "text-primary" : "text-gray-300"} />
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`relative flex items-center justify-between p-6 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-primary" : "border-gray-300"}`}>
                        {paymentMethod === "cod" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                      <div>
                        <h4 className="font-bold text-secondary text-lg">{language === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}</h4>
                        <p className="text-sm text-gray-500">{language === "ar" ? "رسوم إضافية 15 ر.س" : "Additional fee 15 SAR"}</p>
                      </div>
                    </div>
                    <Banknote size={32} className={paymentMethod === "cod" ? "text-primary" : "text-gray-300"} />
                  </label>
                </div>

                {paymentMethod === "card" && (
                  <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "رقم البطاقة" : "Card Number"}</label>
                      <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" placeholder="XXXX XXXX XXXX XXXX" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "تاريخ الانتهاء" : "Expiry Date"}</label>
                      <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "رمز الأمان" : "CVV"}</label>
                      <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" placeholder="123" />
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:w-1/3 shrink-0">
              <div className="bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/50 sticky top-32 shadow-md">
                <h3 className="text-2xl font-bold mb-8 pb-4 border-b border-gray-100 text-secondary">
                  {language === "ar" ? "ملخص الطلب" : "Order Summary"}
                </h3>

                {/* Items Preview */}
                <div className="flex flex-col gap-4 mb-8 pb-8 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-md overflow-visible relative border border-gray-200">
                        <Image src={products[0].image} alt="" fill className="object-cover mix-blend-multiply rounded-md" />
                        <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center z-10 font-bold border border-white">1</span>
                      </div>
                      <span className="font-bold text-sm text-gray-600 truncate max-w-[120px]">{products[0].name[language]}</span>
                    </div>
                    <span className="font-bold text-secondary">{products[0].price} SAR</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-md overflow-visible relative border border-gray-200">
                        <Image src={products[1].image} alt="" fill className="object-cover mix-blend-multiply rounded-md" />
                        <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center z-10 font-bold border border-white">2</span>
                      </div>
                      <span className="font-bold text-sm text-gray-600 truncate max-w-[120px]">{products[1].name[language]}</span>
                    </div>
                    <span className="font-bold text-secondary">{products[1].price * 2} SAR</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex justify-between text-gray-500">
                    <span>{language === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                    <span className="font-bold text-secondary">{subtotal.toFixed(2)} {language === "ar" ? "ر.س" : "SAR"}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>{language === "ar" ? "الضرائب (15%)" : "Tax (15%)"}</span>
                    <span className="font-bold text-secondary">{tax.toFixed(2)} {language === "ar" ? "ر.س" : "SAR"}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>{language === "ar" ? "التوصيل" : "Shipping"}</span>
                    <span className="font-bold text-green-500">{language === "ar" ? "مجاني" : "Free"}</span>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="flex justify-between text-gray-500">
                      <span>{language === "ar" ? "رسوم الدفع عند الاستلام" : "COD Fee"}</span>
                      <span className="font-bold text-secondary">15.00 {language === "ar" ? "ر.س" : "SAR"}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-100 mb-8">
                  <span className="text-xl font-bold text-secondary">{language === "ar" ? "الإجمالي" : "Total"}</span>
                  <span className="text-3xl font-bold text-primary">{(paymentMethod === "cod" ? total + 15 : total).toFixed(2)} <span className="text-lg">SAR</span></span>
                </div>

                <button 
                  className="w-full bg-secondary hover:bg-primary hover:text-secondary text-white font-bold text-lg h-16 rounded-xl flex items-center justify-center gap-3 transition-all shadow-md"
                >
                  <ShieldCheck size={22} />
                  {language === "ar" ? "تأكيد الطلب والدفع" : "Place Order & Pay"}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
                  {language === "ar" ? "بإتمامك للطلب، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا." : "By placing your order, you agree to our Terms of Service and Privacy Policy."}
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
