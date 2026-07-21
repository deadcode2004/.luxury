"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Globe,
  LogIn,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/cn";
import SidebarNav, { type SidebarNavItem } from "./SidebarNav";

export type DashboardLink = {
  name: { ar: string; en: string };
  /** Route key for active state; defaults to href when present. */
  key?: string;
  href?: string;
  icon: React.ReactNode;
  onClick?: () => void;
};

type DashboardShellProps = {
  children: React.ReactNode;
  links: DashboardLink[];
  brandHref?: string;
  brandLabel?: React.ReactNode;
  userName?: string;
  userRole?: string;
  settingsHref?: string;
  logoutHref?: string;
  /** Override active item (e.g. account tabs). Defaults to pathname. */
  activeKey?: string;
  /** Custom logout action (e.g. confirm dialog). */
  onLogout?: () => void;
  /** Show Sign In in the footer instead of Logout. */
  showLogin?: boolean;
  onLogin?: () => void;
  /** Custom logout label (Owner uses Logout; User uses Log Out). */
  logoutLabel?: { ar: string; en: string };
  loginLabel?: { ar: string; en: string };
  /** Desktop collapse toggle. Default true. */
  collapsible?: boolean;
};

const COLLAPSE_KEY = "paradise:dashboard-sidebar-collapsed";

export default function DashboardShell({
  children,
  links,
  brandHref = "/admin",
  brandLabel,
  userName = "Admin User",
  userRole = "Store Manager",
  settingsHref = "/admin/settings",
  logoutHref = "/login",
  activeKey,
  onLogout,
  showLogin = false,
  onLogin,
  logoutLabel,
  loginLabel,
  collapsible = true,
}: DashboardShellProps) {
  const { language, toggleLanguage, dir } = useLanguage();
  const { logout, loading: authLoading, user } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsLg(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!collapsible) return;
    try {
      setCollapsed(sessionStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // ignore
    }
  }, [collapsible]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const resolvedActiveKey = activeKey ?? pathname;
  const desktopCollapsed = collapsible && collapsed && isLg;

  const navItems: SidebarNavItem[] = useMemo(
    () =>
      links.map((link) => ({
        key: link.key || link.href || link.name.en,
        href: link.href,
        label: link.name[language],
        icon: link.icon,
        onClick: link.onClick,
      })),
    [language, links]
  );

  const activeTitle =
    links.find((l) => (l.key || l.href) === resolvedActiveKey)?.name[language] ||
    (language === "ar" ? "لوحة التحكم" : "Dashboard");

  const CollapseIcon =
    dir === "rtl"
      ? desktopCollapsed
        ? ChevronLeft
        : ChevronRight
      : desktopCollapsed
        ? ChevronRight
        : ChevronLeft;

  const handleLogout = () => {
    if (authLoading) return;
    if (onLogout) onLogout();
    else void logout(logoutHref);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 z-50 bg-secondary text-white flex flex-col",
          dir === "rtl" ? "right-0" : "left-0",
          "transform transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "lg:translate-x-0",
          isSidebarOpen
            ? "translate-x-0"
            : dir === "rtl"
              ? "translate-x-full"
              : "-translate-x-full",
          // Mobile drawer always full width; desktop respects collapse.
          "w-64",
          desktopCollapsed ? "lg:w-[4.75rem]" : "lg:w-64"
        )}
      >
        <div
          className={cn(
            "flex items-center h-20 border-b border-gray-800 shrink-0",
            desktopCollapsed ? "justify-center px-2" : "justify-between px-6"
          )}
        >
          <Link
            href={brandHref}
            className={cn(
              "text-2xl font-bold tracking-widest uppercase transition-opacity duration-300",
              desktopCollapsed && "lg:hidden"
            )}
          >
            {brandLabel ?? (
              <>
                ADMIN<span className="text-primary">.</span>
              </>
            )}
          </Link>
          {desktopCollapsed ? (
            <Link
              href={brandHref}
              className="hidden lg:inline-flex text-xl font-bold tracking-widest text-primary"
              aria-label="Dashboard"
            >
              A.
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
            aria-label={language === "ar" ? "إغلاق" : "Close"}
          >
            <X size={24} />
          </button>
        </div>

        <div
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden py-6 transition-[padding] duration-300",
            desktopCollapsed ? "px-2" : "px-4"
          )}
        >
          <SidebarNav
            items={navItems}
            activeKey={resolvedActiveKey}
            variant="dark"
            collapsed={desktopCollapsed}
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </div>

        <div
          className={cn(
            "border-t border-gray-800 space-y-2 transition-[padding] duration-300",
            desktopCollapsed ? "p-2" : "p-4"
          )}
        >
          {collapsible ? (
            <button
              type="button"
              onClick={toggleCollapsed}
              className={cn(
                "hidden lg:flex w-full items-center rounded-xl py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-all",
                desktopCollapsed ? "justify-center px-0" : "gap-3 px-4"
              )}
              aria-label={
                desktopCollapsed
                  ? language === "ar"
                    ? "توسيع القائمة"
                    : "Expand sidebar"
                  : language === "ar"
                    ? "طي القائمة"
                    : "Collapse sidebar"
              }
              title={
                desktopCollapsed
                  ? language === "ar"
                    ? "توسيع"
                    : "Expand"
                  : language === "ar"
                    ? "طي"
                    : "Collapse"
              }
            >
              <CollapseIcon size={20} />
              <span
                className={cn(
                  "text-sm font-medium transition-all duration-300",
                  desktopCollapsed ? "sr-only" : ""
                )}
              >
                {desktopCollapsed
                  ? language === "ar"
                    ? "توسيع"
                    : "Expand"
                  : language === "ar"
                    ? "طي القائمة"
                    : "Collapse"}
              </span>
            </button>
          ) : null}

          <SidebarNav
            variant="dark"
            collapsed={desktopCollapsed}
            items={
              showLogin
                ? [
                    {
                      key: "login",
                      label:
                        loginLabel?.[language] ||
                        (language === "ar" ? "تسجيل الدخول" : "Sign In"),
                      icon: <LogIn size={20} />,
                      onClick: () => onLogin?.(),
                    },
                  ]
                : [
                    {
                      key: "logout",
                      label:
                        logoutLabel?.[language] ||
                        (language === "ar" ? "تسجيل الخروج" : "Logout"),
                      icon: <LogOut size={20} />,
                      danger: true,
                      onClick: handleLogout,
                    },
                  ]
            }
          />
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-primary transition-colors"
              aria-label={language === "ar" ? "فتح القائمة" : "Open menu"}
            >
              <Menu size={24} />
            </button>
            {collapsible ? (
              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden lg:inline-flex p-2 text-gray-500 hover:text-primary transition-colors rounded-lg hover:bg-gray-50"
                aria-label={
                  desktopCollapsed
                    ? language === "ar"
                      ? "توسيع القائمة"
                      : "Expand sidebar"
                    : language === "ar"
                      ? "طي القائمة"
                      : "Collapse sidebar"
                }
              >
                <CollapseIcon size={20} />
              </button>
            ) : null}
            <h1 className="text-xl font-bold text-secondary hidden sm:block">{activeTitle}</h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
            >
              <Globe size={20} className="shrink-0" />
              <span>{language === "ar" ? "EN" : "AR"}</span>
            </button>

            <button
              type="button"
              className="relative text-gray-500 hover:text-primary transition-colors"
              aria-label={language === "ar" ? "الإشعارات" : "Notifications"}
            >
              <Bell size={22} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <div className="relative group h-20 flex items-center pl-4 rtl:pr-4 rtl:border-r ltr:border-l border-gray-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden ring-2 ring-primary/10">
                  {user?.avatar ? (
                    <Image
                      key={user.avatar}
                      src={user.avatar}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    (userName || "A").trim().charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
              </div>

              <div
                className={`absolute top-[100%] w-56 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 ${
                  dir === "rtl" ? "left-0" : "right-0"
                }`}
              >
                <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-floating overflow-hidden transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out">
                  <div className="p-2">
                    <Link
                      href={settingsHref}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-all rounded-xl font-medium group/item text-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 group-hover/item:bg-primary/10 group-hover/item:border-primary/20 flex items-center justify-center transition-colors">
                        <Settings size={16} />
                      </div>
                      {language === "ar" ? "إعدادات الحساب" : "Account Settings"}
                    </Link>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent my-1" />

                    {showLogin ? (
                      <button
                        type="button"
                        onClick={() => onLogin?.()}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-primary/5 transition-all rounded-xl font-bold group/item text-start"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center transition-colors">
                          <LogIn size={16} />
                        </div>
                        {loginLabel?.[language] ||
                          (language === "ar" ? "تسجيل الدخول" : "Sign In")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all rounded-xl font-bold group/item text-start"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 group-hover/item:bg-red-100 flex items-center justify-center transition-colors">
                          <LogOut size={16} />
                        </div>
                        {logoutLabel?.[language] ||
                          (language === "ar" ? "تسجيل الخروج" : "Logout")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
