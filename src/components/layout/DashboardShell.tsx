"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Globe, LogOut, Menu, Settings, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav, { type SidebarNavItem } from "./SidebarNav";

export type DashboardLink = {
  name: { ar: string; en: string };
  href: string;
  icon: React.ReactNode;
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
};

export default function DashboardShell({
  children,
  links,
  brandHref = "/admin",
  brandLabel,
  userName = "Admin User",
  userRole = "Store Manager",
  settingsHref = "/admin/settings",
  logoutHref = "/login",
}: DashboardShellProps) {
  const { language, toggleLanguage, dir } = useLanguage();
  const { logout, loading: authLoading, user } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems: SidebarNavItem[] = links.map((link) => ({
    key: link.href,
    href: link.href,
    label: link.name[language],
    icon: link.icon,
  }));

  const activeTitle =
    links.find((l) => l.href === pathname)?.name[language] ||
    (language === "ar" ? "لوحة التحكم" : "Dashboard");

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 ${dir === "rtl" ? "right-0" : "left-0"} z-50 w-64 bg-secondary text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          isSidebarOpen
            ? "translate-x-0"
            : dir === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-800">
          <Link href={brandHref} className="text-2xl font-bold tracking-widest uppercase">
            {brandLabel ?? (
              <>
                ADMIN<span className="text-primary">.</span>
              </>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <SidebarNav
            items={navItems}
            activeKey={pathname}
            variant="dark"
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </div>

        <div className="p-4 border-t border-gray-800">
          <SidebarNav
            variant="dark"
            items={[
              {
                key: "logout",
                label: language === "ar" ? "تسجيل الخروج" : "Logout",
                icon: <LogOut size={20} />,
                danger: true,
                onClick: () => {
                  if (!authLoading) void logout(logoutHref);
                },
              },
            ]}
          />
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-primary transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-secondary hidden sm:block">
              {activeTitle}
            </h1>
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

            <button className="relative text-gray-500 hover:text-primary transition-colors">
              <Bell size={22} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <div className="relative group h-20 flex items-center pl-4 rtl:pr-4 rtl:border-r ltr:border-l border-gray-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  A
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

                    <Link
                      href={logoutHref}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all rounded-xl font-bold group/item"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 group-hover/item:bg-red-100 flex items-center justify-center transition-colors">
                        <LogOut size={16} />
                      </div>
                      {language === "ar" ? "تسجيل الخروج" : "Logout"}
                    </Link>
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
