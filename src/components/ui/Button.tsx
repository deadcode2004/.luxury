"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "soft";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-background hover:bg-primary-hover hover:text-background font-medium shadow-glow",
  secondary:
    "bg-secondary text-white hover:bg-primary hover:text-secondary font-bold shadow-md",
  outline:
    "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold",
  ghost: "bg-transparent text-gray-500 hover:text-primary font-bold",
  danger: "bg-red-50 text-red-500 hover:bg-red-100 font-medium",
  soft: "bg-primary/10 text-primary hover:bg-primary hover:text-secondary font-bold",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm rounded-lg",
  md: "h-12 px-6 text-sm rounded-xl",
  lg: "h-14 px-8 text-base rounded-lg",
  xl: "h-16 px-8 text-lg rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
