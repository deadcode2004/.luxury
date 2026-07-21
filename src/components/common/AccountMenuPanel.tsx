"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  UserPlus,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { displayPersonName } from "@/lib/i18n/localeText";
import { cn } from "@/lib/cn";

type AccountMenuPanelProps = {
  onNavigate?: () => void;
  onLogout: () => void;
  className?: string;
  /** Compact density for narrow drawers */
  compact?: boolean;
};

function UserAvatar({
  name,
  avatar,
  size = 44,
}: {
  name: string;
  avatar?: string | null;
  size?: number;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (avatar) {
    return (
      <span
        className="relative shrink-0 overflow-hidden rounded-full ring-2 ring-accent/35 shadow-soft"
        style={{ width: size, height: size }}
      >
        <Image
          key={avatar}
          src={avatar}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 via-background to-accent/25 text-secondary font-bold tracking-wide ring-2 ring-accent/30 shadow-soft"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
      aria-hidden
    >
      {initials || <UserRound size={size * 0.42} className="text-secondary/70" />}
    </span>
  );
}

function MenuItem({
  href,
  icon,
  label,
  onClick,
  tone = "default",
  disabled,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  tone?: "default" | "danger" | "accent";
  disabled?: boolean;
}) {
  const className = cn(
    "group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-start text-[13px] font-semibold tracking-wide transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:scale-[0.985]",
    tone === "default" &&
      "text-secondary/85 hover:bg-primary/[0.07] hover:text-primary",
    tone === "accent" &&
      "text-secondary hover:bg-accent/15 hover:text-secondary",
    tone === "danger" &&
      "text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50",
    disabled && "pointer-events-none opacity-50"
  );

  const content = (
    <>
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150",
          tone === "danger"
            ? "border-red-100 bg-red-50 text-red-600 group-hover:border-red-200"
            : "border-surface/60 bg-background text-secondary/70 group-hover:border-primary/25 group-hover:bg-primary/10 group-hover:text-primary"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 leading-snug">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick} role="menuitem">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
    >
      {content}
    </button>
  );
}

/**
 * Shared premium account panel (desktop dropdown + mobile drawer).
 * Guest / User / Owner menus are mutually exclusive.
 */
export default function AccountMenuPanel({
  onNavigate,
  onLogout,
  className,
  compact = false,
}: AccountMenuPanelProps) {
  const { language } = useLanguage();
  const { user, ready, isAuthenticated, isOwner, isUser, loading } = useAuth();
  const displayName = displayPersonName(user, language, "");
  const roleLabel = isOwner
    ? language === "ar"
      ? "مالك المتجر"
      : "Store owner"
    : language === "ar"
      ? "عميل"
      : "Customer";

  return (
    <div
      className={cn("flex flex-col", className)}
      role="menu"
      aria-label={language === "ar" ? "قائمة الحساب" : "Account menu"}
    >
      {ready && isAuthenticated && user ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-surface/50",
            "bg-[linear-gradient(135deg,rgba(62,147,61,0.10),rgba(247,246,243,0.95)_42%,rgba(188,155,89,0.14))]",
            compact ? "mb-3 p-3.5" : "mb-2 p-4"
          )}
        >
          <div className="relative flex items-center gap-3">
            <UserAvatar name={displayName || user.email} avatar={user.avatar} size={compact ? 40 : 46} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-secondary tracking-wide">
                {displayName || user.email}
              </p>
              <p className="mt-0.5 truncate text-[11px] font-medium text-secondary/50">
                {user.email}
              </p>
              <span className="mt-1.5 inline-flex rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className={cn("flex flex-col gap-0.5", compact ? "p-1" : "p-1.5")}>
        {!ready || !isAuthenticated || !user ? (
          <>
            <MenuItem
              href="/login"
              icon={<LogIn size={16} strokeWidth={2.1} />}
              label={language === "ar" ? "تسجيل الدخول" : "Sign In"}
              onClick={onNavigate}
              tone="accent"
            />
            <MenuItem
              href="/register"
              icon={<UserPlus size={16} strokeWidth={2.1} />}
              label={language === "ar" ? "إنشاء حساب" : "Create Account"}
              onClick={onNavigate}
            />
          </>
        ) : isOwner ? (
          <>
            <MenuItem
              href="/admin"
              icon={<LayoutDashboard size={16} strokeWidth={2.1} />}
              label={language === "ar" ? "لوحة تحكم المالك" : "Owner Dashboard"}
              onClick={onNavigate}
            />
            <MenuItem
              href="/admin/settings"
              icon={<Settings size={16} strokeWidth={2.1} />}
              label={language === "ar" ? "إعدادات الحساب" : "Account Settings"}
              onClick={onNavigate}
            />
            <div className="my-1.5 h-px bg-surface/50" role="separator" />
            <MenuItem
              icon={<LogOut size={16} strokeWidth={2.1} />}
              label={language === "ar" ? "تسجيل الخروج" : "Sign Out"}
              onClick={onLogout}
              tone="danger"
              disabled={loading}
            />
          </>
        ) : isUser ? (
          <>
            <MenuItem
              href="/account"
              icon={<LayoutDashboard size={16} strokeWidth={2.1} />}
              label={language === "ar" ? "لوحة تحكم المستخدم" : "User Dashboard"}
              onClick={onNavigate}
            />
            <MenuItem
              href="/account?tab=profile"
              icon={<Settings size={16} strokeWidth={2.1} />}
              label={language === "ar" ? "إعدادات الحساب" : "Account Settings"}
              onClick={onNavigate}
            />
            <div className="my-1.5 h-px bg-surface/50" role="separator" />
            <MenuItem
              icon={<LogOut size={16} strokeWidth={2.1} />}
              label={language === "ar" ? "تسجيل الخروج" : "Sign Out"}
              onClick={onLogout}
              tone="danger"
              disabled={loading}
            />
          </>
        ) : (
          <>
            <MenuItem
              href="/login"
              icon={<LogIn size={16} strokeWidth={2.1} />}
              label={language === "ar" ? "تسجيل الدخول" : "Sign In"}
              onClick={onNavigate}
            />
            <MenuItem
              href="/register"
              icon={<UserPlus size={16} strokeWidth={2.1} />}
              label={language === "ar" ? "إنشاء حساب" : "Create Account"}
              onClick={onNavigate}
            />
          </>
        )}
      </div>
    </div>
  );
}
