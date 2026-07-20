"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export type SidebarNavItem = {
  key: string;
  label: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
};

type SidebarNavProps = {
  items: SidebarNavItem[];
  activeKey?: string;
  variant?: "dark" | "light";
  onNavigate?: () => void;
  className?: string;
};

export default function SidebarNav({
  items,
  activeKey,
  variant = "dark",
  onNavigate,
  className,
}: SidebarNavProps) {
  return (
    <nav className={cn("flex flex-col gap-2", className)}>
      {items.map((item) => {
        const isActive = activeKey === item.key;
        const classes = cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-start w-full",
          item.danger &&
            (variant === "dark"
              ? "text-red-400 hover:text-red-300 hover:bg-red-400/10"
              : "text-red-500 hover:bg-red-50"),
          !item.danger &&
            variant === "dark" &&
            (isActive
              ? "bg-primary text-secondary font-bold shadow-glow"
              : "text-gray-400 hover:text-white hover:bg-white/5"),
          !item.danger &&
            variant === "light" &&
            (isActive
              ? "bg-primary/10 text-primary"
              : "text-gray-500 hover:bg-gray-50 hover:text-secondary")
        );

        if (item.href) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className={classes}
              onClick={onNavigate}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        }

        return (
          <button key={item.key} type="button" className={classes} onClick={item.onClick}>
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
