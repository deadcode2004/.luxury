"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard, LogIn, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

type Variant = "desktop" | "mobile";

/**
 * Role-gated account dropdown/drawer links.
 * Guest / User / Owner menus are mutually exclusive — never mixed.
 */
export default function AccountMenuLinks({
  variant = "desktop",
  onNavigate,
  onLogout,
}: {
  variant?: Variant;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const { language } = useLanguage();
  const { user, ready, isAuthenticated, isOwner, isUser, loading } = useAuth();

  const desktopItem =
    "flex items-center gap-3 px-4 py-3 text-sm text-secondary/80 hover:bg-surface/50 hover:text-primary transition-all rounded-xl font-medium";
  const desktopItemBold = `${desktopItem} font-bold`;
  const mobileItem =
    "text-sm text-secondary/70 hover:text-primary py-2 transition-colors inline-flex items-center gap-2";
  const mobileItemBold = `${mobileItem} font-bold`;

  // Until auth has hydrated, show guest CTAs only (never Owner/User links from stale storage).
  if (!ready || !isAuthenticated || !user) {
    return (
      <>
        <Link
          href="/login"
          className={variant === "desktop" ? desktopItemBold : mobileItemBold}
          onClick={onNavigate}
        >
          {variant === "desktop" ? <LogIn size={16} className="shrink-0" /> : null}
          {language === "ar" ? "تسجيل الدخول" : "Sign In"}
        </Link>
        <Link
          href="/register"
          className={variant === "desktop" ? desktopItem : mobileItem}
          onClick={onNavigate}
        >
          {variant === "desktop" ? <User size={16} className="shrink-0" /> : null}
          {language === "ar" ? "إنشاء حساب" : "Create Account"}
        </Link>
      </>
    );
  }

  if (isOwner) {
    return (
      <>
        {variant === "desktop" ? (
          <div className="px-4 py-2 text-xs text-gray-400 truncate">{user.name || user.email}</div>
        ) : null}
        <Link
          href="/admin"
          className={variant === "desktop" ? desktopItemBold : mobileItemBold}
          onClick={onNavigate}
        >
          <LayoutDashboard size={variant === "desktop" ? 16 : 14} className="shrink-0" />
          {language === "ar" ? "لوحة تحكم المالك" : "Owner Dashboard"}
        </Link>
        <Link
          href="/admin/settings"
          className={variant === "desktop" ? desktopItem : mobileItem}
          onClick={onNavigate}
        >
          {variant === "desktop" ? <Settings size={16} className="shrink-0" /> : null}
          {language === "ar" ? "إعدادات الحساب" : "Account Settings"}
        </Link>
        <button
          type="button"
          disabled={loading}
          onClick={onLogout}
          className={
            variant === "desktop"
              ? "w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-all rounded-xl font-bold disabled:opacity-50"
              : "text-sm text-red-500 py-2 text-start font-bold"
          }
        >
          {variant === "desktop" ? <LogOut size={16} className="shrink-0" /> : null}
          {language === "ar" ? "تسجيل الخروج" : "Sign Out"}
        </button>
      </>
    );
  }

  if (isUser) {
    return (
      <>
        {variant === "desktop" ? (
          <div className="px-4 py-2 text-xs text-gray-400 truncate">{user.name || user.email}</div>
        ) : null}
        <Link
          href="/account"
          className={variant === "desktop" ? desktopItemBold : mobileItemBold}
          onClick={onNavigate}
        >
          {variant === "desktop" ? <LayoutDashboard size={16} className="shrink-0" /> : null}
          {language === "ar" ? "لوحة تحكم المستخدم" : "User Dashboard"}
        </Link>
        <Link
          href="/account?tab=profile"
          className={variant === "desktop" ? desktopItem : mobileItem}
          onClick={onNavigate}
        >
          {variant === "desktop" ? <Settings size={16} className="shrink-0" /> : null}
          {language === "ar" ? "إعدادات الحساب" : "Account Settings"}
        </Link>
        <button
          type="button"
          disabled={loading}
          onClick={onLogout}
          className={
            variant === "desktop"
              ? "w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-all rounded-xl font-bold disabled:opacity-50"
              : "text-sm text-red-500 py-2 text-start font-bold"
          }
        >
          {variant === "desktop" ? <LogOut size={16} className="shrink-0" /> : null}
          {language === "ar" ? "تسجيل الخروج" : "Sign Out"}
        </button>
      </>
    );
  }

  // Unknown/invalid role — treat as guest.
  return (
    <>
      <Link
        href="/login"
        className={variant === "desktop" ? desktopItemBold : mobileItemBold}
        onClick={onNavigate}
      >
        {language === "ar" ? "تسجيل الدخول" : "Sign In"}
      </Link>
      <Link
        href="/register"
        className={variant === "desktop" ? desktopItem : mobileItem}
        onClick={onNavigate}
      >
        {language === "ar" ? "إنشاء حساب" : "Create Account"}
      </Link>
    </>
  );
}
