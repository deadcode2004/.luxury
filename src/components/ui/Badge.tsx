"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "primary" | "accent" | "soft" | "neutral" | "success" | "warning" | "danger" | "info";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary text-background",
  accent: "bg-accent text-background",
  soft: "bg-primary/10 text-primary",
  neutral: "bg-gray-100 text-gray-600",
  success: "bg-green-100 text-green-600",
  warning: "bg-orange-100 text-orange-600",
  danger: "bg-red-100 text-red-600",
  info: "bg-blue-100 text-blue-600",
};

export default function Badge({
  variant = "primary",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-3 py-1 rounded-full text-xs font-bold",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
