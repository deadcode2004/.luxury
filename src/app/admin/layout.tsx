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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminLinks = [
    { name: { ar: "نظرة عامة", en: "Overview" }, href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: { ar: "الطلبات", en: "Orders" }, href: "/admin/orders", icon: <ShoppingCart size={20} /> },
    { name: { ar: "العملاء", en: "Customers" }, href: "/admin/customers", icon: <Users size={20} /> },
    { name: { ar: "المخزون", en: "Inventory" }, href: "/admin/inventory", icon: <Package size={20} /> },
    { name: { ar: "الكوبونات", en: "Coupons" }, href: "/admin/coupons", icon: <Ticket size={20} /> },
    { name: { ar: "إدارة المحتوى", en: "CMS" }, href: "/admin/cms", icon: <FileText size={20} /> },
  ];

  return <DashboardShell links={adminLinks}>{children}</DashboardShell>;
}
