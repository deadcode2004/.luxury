"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { products } from "@/data/mock";
import { CreditCard, Banknote, ShieldCheck } from "lucide-react";
import { calcOrderTotals } from "@/lib/cart/totals";
import { formatMoneyFixed } from "@/lib/format/currency";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import FormField from "@/components/ui/FormField";
import PageHeader from "@/components/layout/PageHeader";

export default function CheckoutPage() {
  const { language } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "cod">("card");

  const cartLines = [
    { price: products[0].price, quantity: 1 },
    { price: products[1].price, quantity: 2 },
  ];
  const { subtotal, tax, total } = calcOrderTotals(cartLines);
  const grandTotal = paymentMethod === "cod" ? total + 15 : total;

  return (
    <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <PageHeader
          title={language === "ar" ? "إتمام الطلب" : "Checkout"}
          description={
            language === "ar"
              ? "الرجاء إدخال بيانات الشحن والدفع لإتمام طلبك."
              : "Please enter your shipping and payment details to complete your order."
          }
        />

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="lg:w-2/3 flex flex-col gap-12">
            <Card variant="glass" padding="lg">
              <h2 className="text-2xl font-bold text-secondary mb-8 pb-4 border-b border-gray-100 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-sm">
                  1
                </span>
                {language === "ar" ? "بيانات الشحن" : "Shipping Information"}
              </h2>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex gap-6 flex-col sm:flex-row">
                  <FormField label={language === "ar" ? "الاسم الأول" : "First Name"}>
                    <Input placeholder={language === "ar" ? "أحمد" : "Ahmed"} />
                  </FormField>
                  <FormField label={language === "ar" ? "اسم العائلة" : "Last Name"}>
                    <Input placeholder={language === "ar" ? "محمد" : "Mohammad"} />
                  </FormField>
                </div>

                <FormField label={language === "ar" ? "رقم الهاتف" : "Phone Number"}>
                  <Input type="tel" className="text-start dir-ltr" placeholder="+966 5X XXX XXXX" />
                </FormField>

                <FormField label={language === "ar" ? "البريد الإلكتروني" : "Email Address"}>
                  <Input type="email" placeholder="example@email.com" />
                </FormField>

                <FormField
                  className="md:col-span-2"
                  label={language === "ar" ? "العنوان بالكامل" : "Full Address"}
                >
                  <Input
                    placeholder={
                      language === "ar"
                        ? "اسم الشارع، الحي، رقم المبنى"
                        : "Street name, District, Building number"
                    }
                  />
                </FormField>

                <FormField label={language === "ar" ? "المدينة" : "City"}>
                  <Select>
                    <option>{language === "ar" ? "الرياض" : "Riyadh"}</option>
                    <option>{language === "ar" ? "جدة" : "Jeddah"}</option>
                    <option>{language === "ar" ? "الدمام" : "Dammam"}</option>
                  </Select>
                </FormField>

                <FormField
                  label={language === "ar" ? "الرمز البريدي (اختياري)" : "Zip Code (Optional)"}
                >
                  <Input type="text" />
                </FormField>
              </form>
            </Card>

            <Card variant="glass" padding="lg">
              <h2 className="text-2xl font-bold text-secondary mb-8 pb-4 border-b border-gray-100 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-sm">
                  2
                </span>
                {language === "ar" ? "طريقة الدفع" : "Payment Method"}
              </h2>

              <div className="flex flex-col gap-4">
                <label
                  className={`relative flex items-center justify-between p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="sr-only"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "card" ? "border-primary" : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "card" && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-secondary text-lg">
                        {language === "ar" ? "البطاقة الائتمانية" : "Credit Card"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {language === "ar"
                          ? "دفع آمن وموثوق بواسطة مدى، فيزا، ماستركارد"
                          : "Secure payment via Mada, Visa, Mastercard"}
                      </p>
                    </div>
                  </div>
                  <CreditCard
                    size={32}
                    className={paymentMethod === "card" ? "text-primary" : "text-gray-300"}
                  />
                </label>

                <label
                  className={`relative flex items-center justify-between p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-primary bg-primary/5"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="sr-only"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "cod" ? "border-primary" : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "cod" && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-secondary text-lg">
                        {language === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {language === "ar" ? "رسوم إضافية 15 ر.س" : "Additional fee 15 SAR"}
                      </p>
                    </div>
                  </div>
                  <Banknote
                    size={32}
                    className={paymentMethod === "cod" ? "text-primary" : "text-gray-300"}
                  />
                </label>
              </div>

              {paymentMethod === "card" && (
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <FormField
                    className="col-span-2"
                    label={language === "ar" ? "رقم البطاقة" : "Card Number"}
                  >
                    <Input placeholder="XXXX XXXX XXXX XXXX" />
                  </FormField>
                  <FormField label={language === "ar" ? "تاريخ الانتهاء" : "Expiry Date"}>
                    <Input placeholder="MM/YY" />
                  </FormField>
                  <FormField label={language === "ar" ? "رمز الأمان" : "CVV"}>
                    <Input placeholder="123" />
                  </FormField>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:w-1/3 shrink-0">
            <Card variant="glass" padding="lg" className="sticky top-32 border-white/50 shadow-md">
              <h3 className="text-2xl font-bold mb-8 pb-4 border-b border-gray-100 text-secondary">
                {language === "ar" ? "ملخص الطلب" : "Order Summary"}
              </h3>

              <div className="flex flex-col gap-4 mb-8 pb-8 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-md overflow-visible relative border border-gray-200">
                      <Image
                        src={products[0].image}
                        alt=""
                        fill
                        className="object-cover mix-blend-multiply rounded-md"
                      />
                      <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center z-10 font-bold border border-white">
                        1
                      </span>
                    </div>
                    <span className="font-bold text-sm text-gray-600 truncate max-w-[120px]">
                      {products[0].name[language]}
                    </span>
                  </div>
                  <span className="font-bold text-secondary">
                    {formatMoneyFixed(products[0].price, language, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-md overflow-visible relative border border-gray-200">
                      <Image
                        src={products[1].image}
                        alt=""
                        fill
                        className="object-cover mix-blend-multiply rounded-md"
                      />
                      <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center z-10 font-bold border border-white">
                        2
                      </span>
                    </div>
                    <span className="font-bold text-sm text-gray-600 truncate max-w-[120px]">
                      {products[1].name[language]}
                    </span>
                  </div>
                  <span className="font-bold text-secondary">
                    {formatMoneyFixed(products[1].price * 2, language, 0)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between text-gray-500">
                  <span>{language === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span className="font-bold text-secondary">
                    {formatMoneyFixed(subtotal, language)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{language === "ar" ? "الضريبة (15%)" : "Tax (15%)"}</span>
                  <span className="font-bold text-secondary">
                    {formatMoneyFixed(tax, language)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{language === "ar" ? "التوصيل" : "Shipping"}</span>
                  <span className="font-bold text-green-500">
                    {language === "ar" ? "مجاني" : "Free"}
                  </span>
                </div>
                {paymentMethod === "cod" && (
                  <div className="flex justify-between text-gray-500">
                    <span>{language === "ar" ? "رسوم الدفع عند الاستلام" : "COD Fee"}</span>
                    <span className="font-bold text-secondary">
                      {formatMoneyFixed(15, language)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-100 mb-8">
                <span className="text-xl font-bold text-secondary">
                  {language === "ar" ? "الإجمالي" : "Total"}
                </span>
                <span className="text-3xl font-bold text-primary">
                  {grandTotal.toFixed(2)} <span className="text-lg">SAR</span>
                </span>
              </div>

              <Button variant="secondary" size="xl" fullWidth>
                <ShieldCheck size={22} />
                {language === "ar" ? "تأكيد الطلب والدفع" : "Place Order & Pay"}
              </Button>

              <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
                {language === "ar"
                  ? "بإتمامك للطلب، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا."
                  : "By placing your order, you agree to our Terms of Service and Privacy Policy."}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
