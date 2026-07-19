"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type AlertVariant = "info" | "success" | "warning" | "danger";

type AlertProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  variant?: AlertVariant;
  title?: React.ReactNode;
};

const variantClasses: Record<AlertVariant, string> = {
  info: "bg-primary/5 border-primary/20 text-secondary",
  success: "bg-green-50 border-green-100 text-green-700",
  warning: "bg-orange-50 border-orange-100 text-orange-700",
  danger: "bg-red-50 border-red-100 text-red-700",
};

export default function Alert({
  variant = "info",
  title,
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {title != null && <p className="font-bold mb-1">{title}</p>}
      {children}
    </div>
  );
}
