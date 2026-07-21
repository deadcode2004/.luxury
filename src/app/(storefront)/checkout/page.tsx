"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Banknote, ShieldCheck, ShoppingBag } from "lucide-react";
import { formatMoneyFixed } from "@/lib/format/currency";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/Toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import PhoneCountryField, {
  phoneCountryIso,
  validateCheckoutPhone,
} from "@/components/checkout/PhoneCountryField";
import ShippingLocationFields from "@/components/checkout/ShippingLocationFields";
import CheckoutAccountChoiceModal from "@/components/checkout/CheckoutAccountChoiceModal";
import AuthModal from "@/components/auth/AuthModal";
import Modal from "@/components/ui/Modal";
import { apiRequest, ApiRequestError } from "@/lib/api/client";
import { fetchGeoCountries } from "@/lib/geo/api";
import { getCountryByCode } from "@/lib/geo/locations";
import { parsePhoneNumberFromString } from "libphonenumber-js";

type SavedAddress = {
  id: number;
  label?: string;
  full_address?: string;
  city?: string;
  zip_code?: string | null;
  is_default?: boolean;
};

const GEO_SESSION_KEY = "paradise_geo_country";

export default function CheckoutPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, ready: authReady } = useAuth();
  const { lines, totals, clear } = useCart();
  const { currency, convertFromEgp } = useCurrency();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accountChoiceOpen, setAccountChoiceOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [placedOrder, setPlacedOrder] = useState<{ number: string; isGuest: boolean } | null>(
    null
  );
  const prefillsDone = useRef({ geo: false, profile: false, address: false });
  const placeAfterAuth = useRef(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    phone_country: "SA",
    email: "",
    full_address: "",
    country_id: null as number | null,
    country_iso2: "SA",
    state_id: null as number | null,
    city_id: null as number | null,
    zip_code: "",
    card_number: "",
    expiry: "",
    cvv: "",
  });

  const grandTotal = useMemo(
    () => (paymentMethod === "cod" ? totals.total + 15 : totals.total),
    [paymentMethod, totals.total]
  );

  /** Detect visitor country once and map ISO2 → country_id from geo API. */
  useEffect(() => {
    if (prefillsDone.current.geo) return;
    prefillsDone.current.geo = true;

    let cancelled = false;
    const applyCountryIso = async (code: string) => {
      const iso = code.toUpperCase();
      if (!/^[A-Z]{2}$/.test(iso)) return;
      try {
        const countries = await fetchGeoCountries("", 300);
        const match = countries.find((c) => c.iso2 === iso);
        if (!match || cancelled) return;
        setForm((f) => {
          if (f.country_id || f.state_id || f.city_id || f.phone.length > 4) {
            return {
              ...f,
              country_id: f.country_id || match.id,
              country_iso2: f.country_iso2 || match.iso2,
              phone_country: f.phone.length > 4 ? f.phone_country : match.iso2,
            };
          }
          return {
            ...f,
            country_id: match.id,
            country_iso2: match.iso2,
            phone_country: match.iso2,
            state_id: null,
            city_id: null,
          };
        });
      } catch {
        // ignore
      }
    };

    try {
      const cached = sessionStorage.getItem(GEO_SESSION_KEY);
      if (cached && /^[A-Z]{2}$/i.test(cached)) {
        void applyCountryIso(cached);
        return () => {
          cancelled = true;
        };
      }
    } catch {
      // ignore
    }

    void fetch("/api/geo", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { country?: string }) => {
        const code = String(data?.country || "").toUpperCase();
        if (!/^[A-Z]{2}$/.test(code)) return;
        try {
          sessionStorage.setItem(GEO_SESSION_KEY, code);
        } catch {
          // ignore
        }
        void applyCountryIso(code);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  /** Prefill from authenticated user profile. */
  useEffect(() => {
    if (!authReady || !user || prefillsDone.current.profile) return;
    prefillsDone.current.profile = true;

    const parts = (user.name || "").trim().split(/\s+/);
    const parsedPhone = parsePhoneNumberFromString(user.phone || "");
    const phoneE164 = parsedPhone?.number || "";
    const phoneIso = (parsedPhone?.country || form.phone_country || form.country_iso2 || "SA").toUpperCase();

    setForm((f) => ({
      ...f,
      first_name: f.first_name || user.first_name || parts[0] || "",
      last_name: f.last_name || user.last_name || parts.slice(1).join(" ") || "",
      email: f.email || user.email || "",
      phone: f.phone.length > 4 ? f.phone : phoneE164 || f.phone,
      phone_country: f.phone.length > 4 ? f.phone_country : phoneIso,
    }));
  }, [authReady, user, form.phone_country, form.country_iso2]);

  /** Prefill street/zip from saved address (city IDs come from geo dropdowns). */
  useEffect(() => {
    if (!authReady || !token || prefillsDone.current.address) return;
    prefillsDone.current.address = true;

    let cancelled = false;
    void apiRequest<SavedAddress[]>("/account/addresses", { token, cache: "no-store" })
      .then((list) => {
        if (cancelled || !Array.isArray(list) || list.length === 0) return;
        const preferred = list.find((a) => a.is_default) || list[0];
        if (!preferred) return;
        setForm((f) => {
          if (f.full_address.trim()) return f;
          return {
            ...f,
            full_address: preferred.full_address || f.full_address,
            zip_code: preferred.zip_code || f.zip_code,
          };
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [authReady, token]);

  const onCountryChange = (countryId: number | null, iso2: string | null) => {
    setForm((f) => ({
      ...f,
      country_id: countryId,
      country_iso2: iso2 || f.country_iso2,
      state_id: null,
      city_id: null,
      phone_country: f.phone.length > 4 ? f.phone_country : iso2 || f.phone_country,
    }));
  };

  const onStateChange = (stateId: number | null) => {
    setForm((f) => ({ ...f, state_id: stateId, city_id: null }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.first_name.trim()) next.first_name = language === "ar" ? "مطلوب" : "Required";
    if (!form.last_name.trim()) next.last_name = language === "ar" ? "مطلوب" : "Required";
    const phoneError = validateCheckoutPhone(form.phone, language);
    if (phoneError) next.phone = phoneError;
    if (!form.email.trim() || !form.email.includes("@")) {
      next.email = language === "ar" ? "بريد غير صالح" : "Invalid email";
    }
    if (!form.country_id) next.country = language === "ar" ? "مطلوب" : "Required";
    if (!form.state_id) next.state = language === "ar" ? "مطلوب" : "Required";
    if (!form.city_id) next.city = language === "ar" ? "مطلوب" : "Required";
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

  const placeOrder = async (authToken?: string | null) => {
    if (!validate()) {
      toast(
        language === "ar" ? "يرجى تصحيح الحقول المطلوبة" : "Please fix the highlighted fields",
        "warning"
      );
      return;
    }

    const activeToken = authToken === undefined ? token : authToken;
    const phoneCountryIso2 = phoneCountryIso(form.phone, form.phone_country);
    const phoneCountry = getCountryByCode(phoneCountryIso2);
    const phone = form.phone.trim();

    const items = lines
      .map((line) => ({
        product_id: Number(line.id),
        quantity: line.quantity,
      }))
      .filter((item) => Number.isFinite(item.product_id) && item.product_id > 0 && item.quantity > 0);

    if (items.length === 0) {
      toast(
        language === "ar" ? "السلة فارغة" : "Your cart is empty",
        "warning"
      );
      return;
    }

    setLoading(true);
    try {
      // Best-effort sync for logged-in users (server cart cleanup).
      if (activeToken) {
        try {
          await apiRequest("/cart", { method: "DELETE", token: activeToken, cache: "no-store" });
          for (const item of items) {
            await apiRequest("/cart/items", {
              method: "POST",
              token: activeToken,
              body: item,
              cache: "no-store",
            });
          }
        } catch {
          // Checkout still sends items[] so placement can succeed without sync.
        }
      }

      const order = await apiRequest<{ number?: string; id?: number }>("/checkout", {
        method: "POST",
        token: activeToken,
        body: {
          payment_method: paymentMethod,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone,
          email: form.email.trim(),
          items,
          shipping_address: {
            full_address: form.full_address.trim(),
            country_id: form.country_id,
            state_id: form.state_id,
            city_id: form.city_id,
            zip_code: form.zip_code.trim() || null,
            phone_country_code: phoneCountryIso2,
            phone_dial_code: phoneCountry ? `+${phoneCountry.phonecode}` : null,
          },
        },
      });

      await clear({ silent: true });
      setAccountChoiceOpen(false);
      toast(
        language === "ar" ? "تم تأكيد الطلب بنجاح" : "Order placed successfully",
        "success"
      );

      if (activeToken) {
        router.push("/account?tab=orders");
      } else {
        setPlacedOrder({
          number: order?.number || "",
          isGuest: true,
        });
      }
    } catch (err) {
      toast(
        err instanceof ApiRequestError
          ? err.message
          : language === "ar"
            ? "حدث خطأ أثناء إنشاء الطلب"
            : "Failed to place order",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  const requestPlaceOrder = () => {
    if (!validate()) {
      toast(
        language === "ar" ? "يرجى تصحيح الحقول المطلوبة" : "Please fix the highlighted fields",
        "warning"
      );
      return;
    }
    if (token) {
      void placeOrder(token);
      return;
    }
    setAccountChoiceOpen(true);
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
                <Button variant="secondary">
                  {language === "ar" ? "تسوق الآن" : "Shop now"}
                </Button>
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
                <FormField
                  label={language === "ar" ? "الاسم الأول" : "First Name"}
                  error={errors.first_name}
                >
                  <Input
                    value={form.first_name}
                    onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                    className={errors.first_name ? "border-red-300" : ""}
                    autoComplete="given-name"
                  />
                </FormField>
                <FormField
                  label={language === "ar" ? "اسم العائلة" : "Last Name"}
                  error={errors.last_name}
                >
                  <Input
                    value={form.last_name}
                    onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                    className={errors.last_name ? "border-red-300" : ""}
                    autoComplete="family-name"
                  />
                </FormField>

                <FormField
                  className="md:col-span-2"
                  label={language === "ar" ? "رقم الهاتف" : "Phone Number"}
                  error={errors.phone}
                >
                  <PhoneCountryField
                    value={form.phone}
                    defaultCountry={form.phone_country}
                    onChange={(phone, countryIso2) => {
                      setForm((f) => ({
                        ...f,
                        phone,
                        phone_country: countryIso2,
                      }));
                      setErrors((e) => {
                        if (!e.phone) return e;
                        const msg = validateCheckoutPhone(phone, language);
                        if (msg) return { ...e, phone: msg };
                        const next = { ...e };
                        delete next.phone;
                        return next;
                      });
                    }}
                    onBlur={() => {
                      setForm((current) => {
                        const msg = validateCheckoutPhone(current.phone, language);
                        setErrors((e) => {
                          if (!msg) {
                            if (!e.phone) return e;
                            const next = { ...e };
                            delete next.phone;
                            return next;
                          }
                          return { ...e, phone: msg };
                        });
                        return current;
                      });
                    }}
                    error={Boolean(errors.phone)}
                  />
                </FormField>

                <FormField
                  className="md:col-span-2"
                  label={language === "ar" ? "البريد الإلكتروني" : "Email"}
                  error={errors.email}
                >
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={errors.email ? "border-red-300" : ""}
                    autoComplete="email"
                  />
                </FormField>

                <ShippingLocationFields
                  countryId={form.country_id}
                  stateId={form.state_id}
                  cityId={form.city_id}
                  fullAddress={form.full_address}
                  zipCode={form.zip_code}
                  onCountryChange={onCountryChange}
                  onStateChange={onStateChange}
                  onCityChange={(cityId) => setForm((f) => ({ ...f, city_id: cityId }))}
                  onFullAddressChange={(full_address) =>
                    setForm((f) => ({ ...f, full_address }))
                  }
                  onZipCodeChange={(zip_code) => setForm((f) => ({ ...f, zip_code }))}
                  errors={{
                    country: errors.country,
                    state: errors.state,
                    city: errors.city,
                    full_address: errors.full_address,
                  }}
                />
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
                {(
                  [
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
                  ] as const
                ).map((method) => (
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
                  <FormField
                    label={language === "ar" ? "تاريخ الانتهاء" : "Expiry"}
                    error={errors.expiry}
                  >
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
                      {formatMoneyFixed(item.price * item.quantity, language, 0, {
                        currency,
                        convertFromEgp,
                      })}
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
                onClick={() => requestPlaceOrder()}
              >
                <ShieldCheck size={22} />
                {language === "ar" ? "تأكيد الطلب والدفع" : "Place Order & Pay"}
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <CheckoutAccountChoiceModal
        open={accountChoiceOpen}
        loading={loading}
        onClose={() => setAccountChoiceOpen(false)}
        onGuest={() => void placeOrder(null)}
        onLogin={() => {
          placeAfterAuth.current = true;
          setAccountChoiceOpen(false);
          setAuthModalMode("login");
          setAuthModalOpen(true);
        }}
        onRegister={() => {
          placeAfterAuth.current = true;
          setAccountChoiceOpen(false);
          setAuthModalMode("register");
          setAuthModalOpen(true);
        }}
      />

      <AuthModal
        open={authModalOpen}
        initialMode={authModalMode}
        prefill={{
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
        }}
        onClose={() => {
          setAuthModalOpen(false);
          if (placeAfterAuth.current) {
            placeAfterAuth.current = false;
            setAccountChoiceOpen(true);
          }
        }}
        onSuccess={(nextToken) => {
          placeAfterAuth.current = false;
          void placeOrder(nextToken);
        }}
      />

      <Modal
        open={placedOrder != null}
        onClose={() => {
          setPlacedOrder(null);
          router.push("/shop");
        }}
        title={language === "ar" ? "تم تأكيد طلبك" : "Order confirmed"}
      >
        {placedOrder ? (
          <div className="space-y-4 text-sm">
            <p className="text-gray-600">
              {language === "ar"
                ? "شكراً لطلبك! يمكنك حفظ رقم الطلب للمتابعة."
                : "Thank you for your order! Save your order number for reference."}
            </p>
            {placedOrder.number ? (
              <div className="rounded-xl border border-surface bg-background/60 px-4 py-3 flex justify-between gap-3">
                <span className="text-gray-500">
                  {language === "ar" ? "رقم الطلب" : "Order number"}
                </span>
                <span className="font-bold text-secondary dir-ltr">{placedOrder.number}</span>
              </div>
            ) : null}
            <p className="text-gray-500">
              {language === "ar"
                ? "أرسلنا تفاصيل الطلب إلى بريدك الإلكتروني إن وُجد."
                : "Order details were sent to your email if provided."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setPlacedOrder(null);
                  router.push("/shop");
                }}
              >
                {language === "ar" ? "متابعة التسوق" : "Continue shopping"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setPlacedOrder(null);
                  setAuthModalMode("register");
                  setAuthModalOpen(true);
                }}
              >
                {language === "ar" ? "إنشاء حساب لتتبع الطلبات" : "Create account to track orders"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </main>
  );
}
