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
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
};

export default function SidebarNav({
  items,
  activeKey,
  variant = "dark",
  collapsed = false,
  onNavigate,
  className,
}: SidebarNavProps) {
  return (
    <nav className={cn("flex flex-col gap-2", className)}>
      {items.map((item) => {
        const isActive = activeKey === item.key;
        const classes = cn(
          "group/nav relative flex items-center rounded-xl transition-all font-medium text-start w-full",
          collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
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

        const content = (
          <>
            <span className="inline-flex shrink-0 items-center justify-center [&_svg]:shrink-0">
              {item.icon}
            </span>
            <span
              className={cn(
                "truncate transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                collapsed ? "sr-only w-0 opacity-0" : "opacity-100"
              )}
            >
              {item.label}
            </span>
            {collapsed ? (
              <span
                role="tooltip"
                className={cn(
                  "pointer-events-none absolute top-1/2 z-[60] -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5",
                  "text-xs font-semibold shadow-floating opacity-0 scale-95",
                  "transition-all duration-200 ease-out",
                  "group-hover/nav:opacity-100 group-hover/nav:scale-100",
                  "start-full ms-3",
                  variant === "dark"
                    ? "bg-white text-secondary"
                    : "bg-secondary text-background"
                )}
              >
                {item.label}
              </span>
            ) : null}
          </>
        );

        if (item.href) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className={classes}
              title={collapsed && typeof item.label === "string" ? item.label : undefined}
              onClick={() => {
                item.onClick?.();
                onNavigate?.();
              }}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.key}
            type="button"
            className={classes}
            title={collapsed && typeof item.label === "string" ? item.label : undefined}
            onClick={() => {
              item.onClick?.();
              onNavigate?.();
            }}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
