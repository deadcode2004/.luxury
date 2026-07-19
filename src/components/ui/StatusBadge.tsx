"use client";

import React from "react";
import Badge, { type BadgeVariant } from "./Badge";
import { useLanguage } from "@/contexts/LanguageContext";

export type StatusKey =
  | "delivered"
  | "processing"
  | "pending"
  | "cancelled"
  | "active"
  | "inactive"
  | "expired"
  | "in_stock"
  | "low_stock"
  | "out_of_stock";

const statusVariant: Record<StatusKey, BadgeVariant> = {
  delivered: "success",
  processing: "info",
  pending: "warning",
  cancelled: "danger",
  active: "success",
  inactive: "neutral",
  expired: "danger",
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "danger",
};

const statusLabels: Record<StatusKey, { ar: string; en: string }> = {
  delivered: { ar: "مكتمل", en: "Delivered" },
  processing: { ar: "قيد المعالجة", en: "Processing" },
  pending: { ar: "قيد الانتظار", en: "Pending" },
  cancelled: { ar: "ملغي", en: "Cancelled" },
  active: { ar: "نشط", en: "Active" },
  inactive: { ar: "غير نشط", en: "Inactive" },
  expired: { ar: "منتهي", en: "Expired" },
  in_stock: { ar: "متوفر", en: "In Stock" },
  low_stock: { ar: "مخزون منخفض", en: "Low Stock" },
  out_of_stock: { ar: "غير متوفر", en: "Out of Stock" },
};

type StatusBadgeProps = {
  status: string;
  label?: string;
  uppercase?: boolean;
  className?: string;
};

function normalizeStatus(status: string): StatusKey | null {
  const key = status.toLowerCase().replace(/\s+/g, "_") as StatusKey;
  return key in statusVariant ? key : null;
}

export default function StatusBadge({
  status,
  label,
  uppercase = false,
  className,
}: StatusBadgeProps) {
  const { language } = useLanguage();
  const key = normalizeStatus(status);
  const variant = key ? statusVariant[key] : "neutral";
  const text =
    label ??
    (key ? statusLabels[key][language] : uppercase ? status.toUpperCase() : status);

  return (
    <Badge variant={variant} className={className}>
      {uppercase && !label && !key ? status.toUpperCase() : uppercase && key ? statusLabels[key].en.toUpperCase() : text}
    </Badge>
  );
}
