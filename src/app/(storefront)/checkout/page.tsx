"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreditCard, Banknote, ShieldCheck, ShoppingBag } from "lucide-react";
import { formatMoneyFixed } from "@/lib/format/currency";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/Toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import FormField from "@/components/ui/FormField";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function CheckoutPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const { lines, totals, clear } = useCart();
  const { currency, convertFromEgp } = useCurrency();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    full_address: "",
    city: language === "ar" ? "الرياض" : "Riyadh",
    zip_code: "",
    card_number: "",
    expiry: "",
    cvv: "",
  });

  const grandTotal = useMemo(
    () => (paymentMethod === "cod" ? totals.total + 15 : totals.total),
    [paymentMethod, totals.total]
  );

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.first_name.trim()) next.first_name = language === "ar" ? "مطلوب" : "Required";
    if (!form.last_name.trim()) next.last_name = language === "ar" ? "مطلوب" : "Required";
    if (!form.phone.trim()) next.phone = language === "ar" ? "مطلوب" : "Required";
    if (!form.email.trim() || !form.email.includes("@")) {
      next.email = language === "ar" ? "بريد غير صالح" : "Invalid email";
    }
    if (!form.full_address.trim()) next.full_address = language === "ar" ? "مطلوب" : "Required";
    if (paymentMethod === "card") {
      if (form.card_number.replace(/\s/g, "").length < 12) {
        next.card_number = language === "ar" ? "رقم البطاقة غير صالح" : "Invalid card";
      }
      if (!form.expiry.trim()) next.expiry = language === "ar" ? "مطلوب" : "Required";
      if (form.cvv.trim().length < 3) next.cvv = language === "ar" ? "مطلوب" : "Required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeOrder = async () => {
    if (!validate()) {
      toast(
        language === "ar" ? "يرجى تصحيح الحقول المطلوبة" : "Please fix the highlighted fields",
        "warning"
      );
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      await clear();
      toast(
        language === "ar" ? "تم تأكيد الطلب بنجاح" : "Order placed successfully",
        "success"
      );
      router.push("/account");
    } catch {
      toast(
        language === "ar" ? "حدث خطأ أثناء إنشاء الطلب" : "Failed to place order",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  if (lines.length === 0) {
    return (
      <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <EmptyState
            icon={<ShoppingBag size={48} className="text-gray-300" />}
            title={language === "ar" ? "السلة فارغة" : "Your cart is empty"}
            description={
              language === "ar"
                ? "أضف منتجات قبل إتمام الطلب."
                : "Add products before checkout."
            }
            action={
              <Link href="/shop">
                <Button variant="secondary">{language === "ar" ? "تسوق الآن" : "Shop now"}</Button>
              </Link>
            }
          />
        </div>
      </main>
    );
  }

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label={language === "ar" ? "الاسم الأول" : "First Name"} error={errors.first_name}>
                  <Input
                    value={form.first_name}
                    onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                    className={errors.first_name ? "border-red-300" : ""}
                  />
                </FormField>
                <FormField label={language === "ar" ? "اسم العائلة" : "Last Name"} error={errors.last_name}>
                  <Input
                    value={form.last_name}
                    onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                    className={errors.last_name ? "border-red-300" : ""}
                  />
                </FormField>
                <FormField label={language === "ar" ? "رقم الهاتف" : "Phone Number"} error={errors.phone}>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className={`text-start dir-ltr ${errors.phone ? "border-red-300" : ""}`}
                  />
                </FormField>
                <FormField label={language === "ar" ? "البريد الإلكتروني" : "Email"} error={errors.email}>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={errors.email ? "border-red-300" : ""}
                  />
                </FormField>
                <FormField
                  className="md:col-span-2"
                  label={language === "ar" ? "العنوان بالكامل" : "Full Address"}
                  error={errors.full_address}
                >
                  <Input
                    value={form.full_address}
                    onChange={(e) => setForm((f) => ({ ...f, full_address: e.target.value }))}
                    className={errors.full_address ? "border-red-300" : ""}
                  />
                </FormField>
                <FormField label={language === "ar" ? "المدينة" : "City"}>
                  <Select
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  >
                    <option>{language === "ar" ? "الرياض" : "Riyadh"}</option>
                    <option>{language === "ar" ? "جدة" : "Jeddah"}</option>
                    <option>{language === "ar" ? "الدمام" : "Dammam"}</option>
                  </Select>
                </FormField>
                <FormField label={language === "ar" ? "الرمز البريدي" : "Zip Code"}>
                  <Input
                    value={form.zip_code}
                    onChange={(e) => setForm((f) => ({ ...f, zip_code: e.target.value }))}
                  />
                </FormField>
              </div>
            </Card>

            <Card variant="glass" padding="lg">
              <h2 className="text-2xl font-bold text-secondary mb-8 pb-4 border-b border-gray-100 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-sm">
                  2
                </span>
                {language === "ar" ? "طريقة الدفع" : "Payment Method"}
              </h2>

              <div className="flex flex-col gap-4">
                {([
                  {
                    id: "card" as const,
                    title: language === "ar" ? "البطاقة الائتمانية" : "Credit Card",
                    desc:
                      language === "ar"
                        ? "دفع آمن بواسطة مدى، فيزا، ماستركارد"
                        : "Secure payment via Mada, Visa, Mastercard",
                    icon: CreditCard,
                  },
                  {
                    id: "cod" as const,
                    title: language === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery",
                    desc:
                      language === "ar"
                        ? `رسوم إضافية ${formatMoneyFixed(15, language, 0, { currency, convertFromEgp })}`
                        : `Additional fee ${formatMoneyFixed(15, language, 0, { currency, convertFromEgp })}`,
                    icon: Banknote,
                  },
                ]).map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`relative flex items-center justify-between p-6 rounded-xl border-2 text-start transition-all active:scale-[0.99] ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === method.id ? "border-primary" : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === method.id && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-secondary text-lg">{method.title}</h4>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                    </div>
                    <method.icon
                      size={32}
                      className={paymentMethod === method.id ? "text-primary" : "text-gray-300"}
                    />
                  </button>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <FormField
                    className="col-span-2"
                    label={language === "ar" ? "رقم البطاقة" : "Card Number"}
                    error={errors.card_number}
                  >
                    <Input
                      value={form.card_number}
                      onChange={(e) => setForm((f) => ({ ...f, card_number: e.target.value }))}
                      className={errors.card_number ? "border-red-300" : ""}
                    />
                  </FormField>
                  <FormField label={language === "ar" ? "تاريخ الانتهاء" : "Expiry"} error={errors.expiry}>
                    <Input
                      value={form.expiry}
                      onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))}
                      className={errors.expiry ? "border-red-300" : ""}
                    />
                  </FormField>
                  <FormField label="CVV" error={errors.cvv}>
                    <Input
                      value={form.cvv}
                      onChange={(e) => setForm((f) => ({ ...f, cvv: e.target.value }))}
                      className={errors.cvv ? "border-red-300" : ""}
                    />
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
                {lines.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-md overflow-visible relative border border-gray-200">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover mix-blend-multiply rounded-md"
                        />
                        <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center z-10 font-bold border border-white">
                          {item.quantity}
                        </span>
                      </div>
                      <span className="font-bold text-sm text-gray-600 truncate max-w-[120px]">
                        {item.name[language]}
                      </span>
                    </div>
                    <span className="font-bold text-secondary">
                      {formatMoneyFixed(item.price * item.quantity, language, 0, { currency, convertFromEgp })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between text-gray-500">
                  <span>{language === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span className="font-bold text-secondary">
                    {formatMoneyFixed(totals.subtotal, language, 2, { currency, convertFromEgp })}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{language === "ar" ? "الضريبة (15%)" : "Tax (15%)"}</span>
                  <span className="font-bold text-secondary">
                    {formatMoneyFixed(totals.tax, language, 2, { currency, convertFromEgp })}
                  </span>
                </div>
                {paymentMethod === "cod" && (
                  <div className="flex justify-between text-gray-500">
                    <span>{language === "ar" ? "رسوم الدفع عند الاستلام" : "COD Fee"}</span>
                    <span className="font-bold text-secondary">
                      {formatMoneyFixed(15, language, 2, { currency, convertFromEgp })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-100 mb-8">
                <span className="text-xl font-bold text-secondary">
                  {language === "ar" ? "الإجمالي" : "Total"}
                </span>
                <span className="text-3xl font-bold text-primary">
                  {formatMoneyFixed(grandTotal, language, 2, { currency, convertFromEgp })}
                </span>
              </div>

              <Button
                variant="secondary"
                size="xl"
                fullWidth
                loading={loading}
                onClick={() => void placeOrder()}
              >
                <ShieldCheck size={22} />
                {language === "ar" ? "تأكيد الطلب والدفع" : "Place Order & Pay"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
