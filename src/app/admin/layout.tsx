"use client";

import React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Ticket,
  FileText,
} from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocale } from "@/lib/i18n/localeText";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { language } = useLanguage();

  const adminLinks = [
    { name: { ar: "نظرة عامة", en: "Overview" }, href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: { ar: "الطلبات", en: "Orders" }, href: "/admin/orders", icon: <ShoppingCart size={20} /> },
    { name: { ar: "العملاء", en: "Customers" }, href: "/admin/customers", icon: <Users size={20} /> },
    { name: { ar: "المخزون", en: "Inventory" }, href: "/admin/inventory", icon: <Package size={20} /> },
    { name: { ar: "الكوبونات", en: "Coupons" }, href: "/admin/coupons", icon: <Ticket size={20} /> },
    { name: { ar: "إدارة المحتوى", en: "CMS" }, href: "/admin/cms", icon: <FileText size={20} /> },
  ];

  const displayName =
    pickLocale(user?.name_i18n, language) ||
    [
      pickLocale(user?.first_name_i18n, language) || user?.first_name,
      pickLocale(user?.last_name_i18n, language) || user?.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    user?.name ||
    (language === "ar" ? "المالك" : "Owner");

  return (
    <DashboardShell
      links={adminLinks}
      userName={displayName}
      userRole={
        user?.role === "owner"
          ? language === "ar"
            ? "مالك المتجر"
            : "Store owner"
          : language === "ar"
            ? "مستخدم"
            : "User"
      }
    >
      {children}
    </DashboardShell>
  );
}
