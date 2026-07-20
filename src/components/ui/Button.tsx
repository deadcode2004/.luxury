"use client";

import React from "react";
import { cn } from "@/lib/cn";
import Spinner from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "soft";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-background hover:bg-primary-hover active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40 font-medium shadow-glow",
  secondary:
    "bg-secondary text-white hover:bg-primary hover:text-secondary active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-secondary/30 font-bold shadow-md",
  outline:
    "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/20 font-bold",
  ghost:
    "bg-transparent text-gray-500 hover:text-primary hover:bg-primary/5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/20 font-bold",
  danger:
    "bg-red-50 text-red-500 hover:bg-red-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-red-200 font-medium",
  soft:
    "bg-primary/10 text-primary hover:bg-primary hover:text-secondary active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/30 font-bold",
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
  loading = false,
  className,
  type = "button",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex flex-row items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:inline-block [&_svg]:shrink-0 [&_svg]:align-middle",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading && <Spinner size={size === "sm" ? 14 : 18} />}
      {children}
    </button>
  );
}
