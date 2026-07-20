"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  AlertTriangle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  ApiRequestError,
  fetchOwnerDashboard,
  type DashboardData,
} from "@/lib/api/owner";
import { pickLocale } from "@/lib/i18n/localeText";
import { useAutoFetch } from "@/hooks/useAutoFetch";

export default function AdminOverview() {
  const { language } = useLanguage();
  const { token } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  // Start false so SSR HTML matches the first client paint.
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!token) return;
    if (!options?.silent) setLoading(true);
    try {
      const res = await fetchOwnerDashboard(token);
      setData(res);
    } catch (err) {
      toast(
        err instanceof ApiRequestError
          ? err.message
          : language === "ar"
            ? "تعذر تحميل لوحة التحكم"
            : "Failed to load dashboard",
        "danger"
      );
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [token, language, toast]);

  useAutoFetch(load);

  const stats = data?.stats;
  const cards = [
    {
      title: { ar: "إجمالي المبيعات", en: "Total Sales" },
      value: stats ? `${stats.total_sales.toLocaleString()} EGP` : "—",
      icon: <DollarSign size={24} className="text-green-600" />,
      bg: "bg-green-100",
    },
    {
      title: { ar: "الطلبات النشطة", en: "Active Orders" },
      value: stats ? String(stats.active_orders) : "—",
      icon: <ShoppingBag size={24} className="text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      title: { ar: "إجمالي العملاء", en: "Total Customers" },
      value: stats ? String(stats.total_customers) : "—",
      icon: <Users size={24} className="text-purple-600" />,
      bg: "bg-purple-100",
    },
    {
      title: { ar: "معدل التحويل", en: "Conversion Rate" },
      value: stats ? `${stats.conversion_rate}%` : "—",
      icon: <TrendingUp size={24} className="text-orange-600" />,
      bg: "bg-orange-100",
    },
    {
      title: { ar: "المنتجات النشطة", en: "Active Products" },
      value: stats ? String(stats.products_count ?? 0) : "—",
      icon: <Package size={24} className="text-secondary" />,
      bg: "bg-gray-100",
    },
    {
      title: { ar: "مخزون منخفض / نفد", en: "Low / Out of Stock" },
      value: stats
        ? `${stats.low_stock_count ?? 0} / ${stats.out_of_stock_count ?? 0}`
        : "—",
      icon: <AlertTriangle size={24} className="text-amber-600" />,
      bg: "bg-amber-100",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-secondary">
            {language === "ar" ? "نظرة عامة" : "Overview"}
          </h2>
          <p className="text-sm text-gray-500">
            {language === "ar"
              ? "إحصائيات حقيقية من الطلبات والمنتجات"
              : "Live stats from orders and products"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((stat, idx) => (
          <Card key={idx} variant="panel" padding="md" className="flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{stat.title[language]}</p>
              <h3 className="text-2xl font-bold text-secondary">
                {loading ? "…" : stat.value}
              </h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card variant="panel" padding="md" className="lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-secondary">
              {language === "ar" ? "أحدث الطلبات" : "Recent Orders"}
            </h3>
            <Link href="/admin/orders" className="text-sm font-bold text-primary hover:underline">
              {language === "ar" ? "عرض الكل" : "View all"}
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="text-start py-2 font-medium">
                    {language === "ar" ? "الطلب" : "Order"}
                  </th>
                  <th className="text-start py-2 font-medium">
                    {language === "ar" ? "العميل" : "Customer"}
                  </th>
                  <th className="text-start py-2 font-medium">
                    {language === "ar" ? "الإجمالي" : "Total"}
                  </th>
                  <th className="text-start py-2 font-medium">
                    {language === "ar" ? "الحالة" : "Status"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data?.recent_orders || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      {loading
                        ? language === "ar"
                          ? "جاري التحميل..."
                          : "Loading..."
                        : language === "ar"
                          ? "لا توجد طلبات بعد"
                          : "No orders yet"}
                    </td>
                  </tr>
                ) : (
                  data?.recent_orders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-3 font-mono text-xs font-bold text-secondary">
                        {order.number}
                      </td>
                      <td className="py-3 text-gray-600">
                        {order.customer?.name || order.customer?.email || "—"}
                      </td>
                      <td className="py-3 font-bold">
                        {order.total.toLocaleString()} {order.currency || "EGP"}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card variant="panel" padding="md" className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-secondary">
              {language === "ar" ? "تنبيهات المخزون" : "Stock Alerts"}
            </h3>
            <Link
              href="/admin/inventory"
              className="text-sm font-bold text-primary hover:underline"
            >
              {language === "ar" ? "المخزون" : "Inventory"}
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {(data?.low_stock_products || []).length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                {loading
                  ? "…"
                  : language === "ar"
                    ? "لا توجد تنبيهات حالياً"
                    : "No stock alerts"}
              </p>
            ) : (
              data?.low_stock_products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-secondary truncate">
                      {pickLocale(p.name, language)}
                    </p>
                    <p className="text-[11px] text-gray-400">{p.code}</p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-sm font-bold text-secondary">{p.stock}</p>
                    <StatusBadge status={p.inventory_status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
