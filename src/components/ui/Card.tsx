"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "glass" | "panel" | "solid";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
};

const variantClasses: Record<CardVariant, string> = {
  glass:
    "bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl glass-fix border border-white/40 shadow-card",
  panel: "bg-white border border-gray-100 shadow-sm",
  solid: "bg-secondary text-white shadow-soft",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  variant = "panel",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
