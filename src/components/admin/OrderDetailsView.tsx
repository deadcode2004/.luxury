"use client";

import React from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { displayPersonName, pickLocale } from "@/lib/i18n/localeText";
import type { AppLanguage } from "@/lib/i18n/language";
import { formatMoney } from "@/lib/format/currency";
import type { CurrencyCode } from "@/lib/format/currency";
import type { ApiOrder, ApiOrderItem } from "@/lib/api/owner";

type OrderDetailsViewProps = {
  order: ApiOrder;
  language: AppLanguage;
};

function money(amount: number, language: AppLanguage, currency: string) {
  return formatMoney(amount, language, {
    decimals: 2,
    currency: (currency || "EGP") as CurrencyCode,
    converted: true,
  });
}

function SummaryRow({
  label,
  value,
  emphasize,
  muted,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 ${
        emphasize ? "pt-3 mt-1 border-t border-gray-200" : ""
      }`}
    >
      <span className={emphasize ? "font-bold text-secondary" : muted ? "text-gray-500" : "text-gray-600"}>
        {label}
      </span>
      <span
        className={`text-end tabular-nums ${
          emphasize ? "font-bold text-secondary text-base" : muted ? "text-gray-500" : "font-medium text-secondary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function OrderItemRow({
  item,
  language,
  currency,
}: {
  item: ApiOrderItem;
  language: AppLanguage;
  currency: string;
}) {
  const name = pickLocale(item.product_name, language, item.product_code || "—");
  const hasDiscount = Boolean(item.has_discount && item.original_unit_price != null);
  const imageSrc = item.product_image || "/placeholder-product.png";

  return (
    <article className="flex gap-3 sm:gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      <div className="min-w-0 flex-1 flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
          <div className="min-w-0">
            <h5 className="font-semibold text-secondary leading-snug break-words">{name}</h5>
            {item.product_code ? (
              <p className="text-xs text-gray-400 mt-0.5 dir-ltr text-start">{item.product_code}</p>
            ) : null}
          </div>
          <div className="sm:text-end shrink-0">
            <p className="font-bold text-secondary tabular-nums">
              {money(item.line_total, language, currency)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === "ar" ? "إجمالي المنتج" : "Line total"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 text-xs sm:text-sm">
          <div>
            <p className="text-gray-400">{language === "ar" ? "سعر القطعة" : "Unit price"}</p>
            {hasDiscount ? (
              <div className="flex flex-wrap items-baseline gap-1.5 mt-0.5">
                <span className="text-gray-400 line-through tabular-nums">
                  {money(Number(item.original_unit_price), language, currency)}
                </span>
                <span className="font-medium text-secondary tabular-nums">
                  {money(item.unit_price, language, currency)}
                </span>
              </div>
            ) : (
              <p className="font-medium text-secondary tabular-nums mt-0.5">
                {money(item.unit_price, language, currency)}
              </p>
            )}
          </div>

          <div>
            <p className="text-gray-400">{language === "ar" ? "الكمية" : "Quantity"}</p>
            <p className="font-medium text-secondary mt-0.5 tabular-nums">× {item.quantity}</p>
          </div>

          {hasDiscount ? (
            <div className="col-span-2 sm:col-span-1">
              <p className="text-gray-400">{language === "ar" ? "خصم المنتج" : "Item discount"}</p>
              <p className="font-medium text-emerald-700 mt-0.5 tabular-nums">
                − {money(item.line_discount || item.unit_discount * item.quantity, language, currency)}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function OrderDetailsView({ order, language }: OrderDetailsViewProps) {
  const currency = order.currency || "EGP";
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsGross =
    order.items_subtotal_before_discount ??
    items.reduce((sum, item) => {
      const unit = item.original_unit_price ?? item.unit_price;
      return sum + Number(unit) * item.quantity;
    }, 0);
  const itemsDiscount =
    order.items_discount_total ??
    items.reduce((sum, item) => sum + Number(item.line_discount || 0), 0);
  const couponDiscount = order.coupon_discount ?? order.discount ?? 0;
  const shipping = Number(order.shipping || 0);
  const tax = Number(order.tax || 0);
  const codFee = Number(order.cod_fee || 0);
  const totalDiscounts = itemsDiscount + couponDiscount;

  const customerName =
    displayPersonName(order.customer, language, "") ||
    [order.billing_snapshot?.first_name, order.billing_snapshot?.last_name].filter(Boolean).join(" ") ||
    (order.billing_snapshot?.is_guest
      ? language === "ar"
        ? "زائر"
        : "Guest"
      : "—");

  return (
    <div className="space-y-5 text-sm">
      {/* Header meta */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
        <div className="flex justify-between sm:block gap-3">
          <p className="text-gray-500 text-xs uppercase tracking-wide">
            {language === "ar" ? "رقم الطلب" : "Order ID"}
          </p>
          <p className="font-bold text-secondary mt-0.5">{order.number}</p>
        </div>
        <div className="flex justify-between sm:block gap-3">
          <p className="text-gray-500 text-xs uppercase tracking-wide">
            {language === "ar" ? "الحالة" : "Status"}
          </p>
          <div className="mt-1">
            <StatusBadge status={order.status} uppercase />
          </div>
        </div>
        <div className="flex justify-between sm:block gap-3">
          <p className="text-gray-500 text-xs uppercase tracking-wide">
            {language === "ar" ? "العميل" : "Customer"}
          </p>
          <p className="font-medium text-secondary mt-0.5 text-end sm:text-start">{customerName}</p>
        </div>
        <div className="flex justify-between sm:block gap-3">
          <p className="text-gray-500 text-xs uppercase tracking-wide">
            {language === "ar" ? "طريقة الدفع" : "Payment"}
          </p>
          <p className="font-medium text-secondary mt-0.5 capitalize">
            {order.payment_method === "cod"
              ? language === "ar"
                ? "الدفع عند الاستلام"
                : "Cash on delivery"
              : order.payment_method === "card"
                ? language === "ar"
                  ? "بطاقة"
                  : "Card"
                : order.payment_method || "—"}
          </p>
        </div>
        {order.billing_snapshot?.phone ? (
          <div className="flex justify-between sm:block gap-3">
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              {language === "ar" ? "الهاتف" : "Phone"}
            </p>
            <p className="font-medium dir-ltr text-end sm:text-start mt-0.5">
              {order.billing_snapshot.phone}
            </p>
          </div>
        ) : null}
        {order.billing_snapshot?.email ? (
          <div className="flex justify-between sm:block gap-3 sm:col-span-2">
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              {language === "ar" ? "البريد" : "Email"}
            </p>
            <p className="font-medium text-end sm:text-start mt-0.5 break-all">
              {order.billing_snapshot.email}
            </p>
          </div>
        ) : null}
      </section>

      {/* Products */}
      <section className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between gap-3">
          <h4 className="font-bold text-secondary">
            {language === "ar" ? "منتجات الطلب" : "Order items"}
          </h4>
          <span className="text-xs text-gray-500">
            {items.length}{" "}
            {language === "ar" ? "صنف" : items.length === 1 ? "item" : "items"}
            {order.items_count != null ? ` · ${order.items_count} ${language === "ar" ? "قطعة" : "pcs"}` : ""}
          </span>
        </div>
        <div className="px-4 bg-white">
          {items.length === 0 ? (
            <p className="py-8 text-center text-gray-400">
              {language === "ar" ? "لا توجد منتجات في هذا الطلب" : "No items in this order"}
            </p>
          ) : (
            items.map((item) => (
              <OrderItemRow key={item.id} item={item} language={language} currency={currency} />
            ))
          )}
        </div>
      </section>

      {/* Financial summary */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 space-y-2.5">
        <h4 className="font-bold text-secondary mb-3">
          {language === "ar" ? "الملخص المالي" : "Financial summary"}
        </h4>

        <SummaryRow
          label={language === "ar" ? "إجمالي المنتجات قبل الخصومات" : "Items subtotal (before discounts)"}
          value={money(itemsGross, language, currency)}
        />

        {totalDiscounts > 0 ? (
          <SummaryRow
            label={language === "ar" ? "إجمالي الخصومات" : "Total discounts"}
            value={`− ${money(totalDiscounts, language, currency)}`}
            muted
          />
        ) : null}

        {couponDiscount > 0 ? (
          <SummaryRow
            label={
              order.coupon?.code
                ? language === "ar"
                  ? `قيمة كوبون الخصم (${order.coupon.code})`
                  : `Coupon discount (${order.coupon.code})`
                : language === "ar"
                  ? "قيمة كوبون الخصم"
                  : "Coupon discount"
            }
            value={`− ${money(couponDiscount, language, currency)}`}
            muted
          />
        ) : null}

        <SummaryRow
          label={language === "ar" ? "تكلفة الشحن" : "Shipping"}
          value={
            shipping > 0
              ? money(shipping, language, currency)
              : language === "ar"
                ? "مجاني"
                : "Free"
          }
        />

        {codFee > 0 ? (
          <SummaryRow
            label={language === "ar" ? "رسوم الدفع عند الاستلام" : "COD fee"}
            value={money(codFee, language, currency)}
          />
        ) : null}

        <SummaryRow
          label={language === "ar" ? "الضريبة" : "Tax"}
          value={money(tax, language, currency)}
          muted={tax <= 0}
        />

        <SummaryRow
          label={language === "ar" ? "الإجمالي النهائي" : "Order total"}
          value={money(Number(order.total || 0), language, currency)}
          emphasize
        />

        <p className="text-[11px] text-gray-400 pt-1">
          {language === "ar"
            ? "الأسعار المعروضة هي الأسعار المسجّلة وقت إنشاء الطلب وبعملة الطلب."
            : "Amounts shown are the prices recorded when the order was placed, in the order currency."}
        </p>
      </section>

      {/* Shipping */}
      {order.shipping_address ? (
        <section className="rounded-xl border border-gray-100 bg-background/60 p-4 space-y-2">
          <h4 className="font-bold text-secondary">
            {language === "ar" ? "عنوان الشحن" : "Shipping address"}
          </h4>
          <p className="text-secondary leading-relaxed">
            {order.shipping_address.full_address || "—"}
          </p>
          <p className="text-gray-500">
            {[
              language === "ar"
                ? order.shipping_address.city_name_ar || order.shipping_address.city
                : order.shipping_address.city_name_en || order.shipping_address.city,
              language === "ar"
                ? order.shipping_address.state_name_ar || order.shipping_address.state_name
                : order.shipping_address.state_name_en || order.shipping_address.state_name,
              language === "ar"
                ? order.shipping_address.country_name_ar ||
                  order.shipping_address.country_name ||
                  order.shipping_address.country_code
                : order.shipping_address.country_name_en ||
                  order.shipping_address.country_name ||
                  order.shipping_address.country_code,
              order.shipping_address.zip_code,
            ]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
        </section>
      ) : null}
    </div>
  );
}
