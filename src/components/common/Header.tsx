"use client";

import React, { useState, useEffect, useLayoutEffect, lazy, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CurrencySwitcher from "@/components/common/CurrencySwitcher";
import AnnouncementBar from "@/components/common/AnnouncementBar";
import AccountMenu from "@/components/common/AccountMenu";
import AccountMenuPanel from "@/components/common/AccountMenuPanel";
import { displayPersonName } from "@/lib/i18n/localeText";
import { cn } from "@/lib/cn";

const HeaderSearchPanel = lazy(() => import("@/components/common/HeaderSearchPanel"));

function CountBadge({
  count,
  isTransparent,
}: {
  count: number;
  isTransparent: boolean;
}) {
  if (count <= 0) return null;
  return (
    <span
      className={`absolute top-0.5 right-0.5 text-[9px] font-bold min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center transition-all ${
        isTransparent ? "bg-background text-secondary" : "bg-primary text-background"
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Header() {
  const { language, toggleLanguage, dir } = useLanguage();
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, logout, loading: authLoading, isAuthenticated, isOwner, ready } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const pathname = usePathname();
  const accountLabel = !ready || !isAuthenticated
    ? language === "ar"
      ? "الحساب"
      : "Account"
    : isOwner
      ? language === "ar"
        ? "حساب المالك"
        : "Owner Account"
      : language === "ar"
        ? "حسابي"
        : "My Account";
  const accountDisplayName = displayPersonName(user, language, "");

  const isTransparentRoute = pathname === "/" || pathname === "/about";
  const isTransparent = isTransparentRoute && !isScrolled && !isSearchOpen;
  const textColorClass = isTransparent ? "text-background" : "text-secondary";
  const hoverColorClass = isTransparent ? "hover:text-gray-300" : "hover:text-primary";
  const logoDotColorClass = isTransparent ? "text-background" : "text-primary";

  // Sync scroll before paint so mid-page reloads don't flash a transparent header.
  useLayoutEffect(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen || isSearchOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) setIsAccountMenuOpen(false);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  const bagTotal = cartCount + wishCount;
  const menuBadgeLabel =
    language === "ar"
      ? `القائمة، ${bagTotal} عناصر في السلة والمفضلة`
      : `Menu, ${bagTotal} items in cart and wishlist`;

  const navLinks = [
    { name: { ar: "الرئيسية", en: "Home" }, href: "/" },
    { name: { ar: "تسوق", en: "Shop" }, href: "/shop" },
    { name: { ar: "المجموعات", en: "Collections" }, href: "/collections" },
    { name: { ar: "عن العلامة", en: "Our Story" }, href: "/about" },
    { name: { ar: "تواصل معنا", en: "Contact" }, href: "/contact" },
  ];

  return (
    <>
      <div className="fixed top-0 w-full z-40">
        <AnnouncementBar />
        <header
          className={cn(
            "relative z-[45] w-full",
            isTransparent
              ? "bg-transparent py-5"
              : "bg-background/95 backdrop-blur-md shadow-soft py-3 border-b border-surface"
          )}
          style={{ transition: "background-color 200ms ease, padding 200ms ease, box-shadow 200ms ease" }}
        >
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="relative lg:hidden -ms-2">
            <button
              type="button"
              className={cn(
                "relative inline-flex items-center justify-center rounded-xl p-2 transition-colors active:scale-95",
                textColorClass,
                hoverColorClass,
                isTransparent ? "hover:bg-white/10" : "hover:bg-surface/60"
              )}
              onClick={() => {
                setIsSearchOpen(false);
                setIsMobileMenuOpen(true);
              }}
              aria-label={bagTotal > 0 ? menuBadgeLabel : language === "ar" ? "فتح القائمة" : "Open menu"}
            >
              <Menu size={24} />
            </button>
            {bagTotal > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -top-0.5 z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1",
                  "text-[10px] font-bold leading-none shadow-soft ring-2",
                  dir === "rtl" ? "-start-0.5" : "-end-0.5",
                  isTransparent
                    ? "bg-background text-secondary ring-background/80"
                    : "bg-primary text-background ring-background"
                )}
              >
                {bagTotal > 99 ? "99+" : bagTotal}
              </span>
            ) : null}
          </div>

          <Link
            href="/"
            className={`text-xl md:text-2xl font-bold tracking-widest uppercase transition-colors ${textColorClass}`}
          >
            PARADISE<span className={logoDotColorClass}>.</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors relative group py-2 inline-flex items-center ${textColorClass} ${hoverColorClass}`}
              >
                {link.name[language]}
                <span
                  className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                    isTransparent ? "bg-background" : "bg-primary"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className={`flex items-center gap-1.5 sm:gap-3 ${textColorClass}`}>
            <div className="hidden md:block">
              <CurrencySwitcher inverted={isTransparent} />
            </div>

            <button
              type="button"
              onClick={toggleLanguage}
              className={`hidden lg:inline-flex items-center gap-1.5 text-xs font-medium transition-colors active:scale-95 rounded-lg px-2 py-2 ${hoverColorClass}`}
              title={language === "ar" ? "Switch to English" : "التبديل للعربية"}
            >
              <Globe size={16} className="shrink-0" />
              <span>{language === "ar" ? "EN" : "AR"}</span>
            </button>

            <button
              type="button"
              aria-label={
                isSearchOpen
                  ? language === "ar"
                    ? "إغلاق البحث"
                    : "Close search"
                  : language === "ar"
                    ? "بحث"
                    : "Search"
              }
              aria-expanded={isSearchOpen}
              aria-controls="header-search-panel"
              onClick={() => setIsSearchOpen((v) => !v)}
              onPointerEnter={() => {
                void import("@/components/common/HeaderSearchPanel");
              }}
              className={cn(
                "inline-flex items-center justify-center rounded-lg p-2 transition-colors active:scale-95",
                hoverColorClass,
                isSearchOpen && (isTransparent ? "bg-white/15" : "bg-surface/70 text-primary")
              )}
            >
              {isSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            <Link
              href="/favorites"
              className={`transition-colors relative hidden lg:inline-flex items-center justify-center p-2 active:scale-95 ${hoverColorClass}`}
            >
              <Heart size={18} />
              <CountBadge count={wishCount} isTransparent={isTransparent} />
            </Link>
            <Link
              href="/cart"
              className={`transition-colors relative inline-flex items-center justify-center p-2 active:scale-95 ${hoverColorClass}`}
            >
              <ShoppingBag size={18} />
              <CountBadge count={cartCount} isTransparent={isTransparent} />
            </Link>
            <AccountMenu
              inverted={isTransparent}
              onLogoutRequest={() => setConfirmLogout(true)}
            />
          </div>
        </div>
        </header>

        <Suspense fallback={null}>
          <HeaderSearchPanel open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        </Suspense>
      </div>

      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 bottom-0 bg-background z-50 w-[85vw] max-w-sm flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          dir === "rtl" ? "right-0" : "left-0"
        } ${
          isMobileMenuOpen
            ? "translate-x-0"
            : dir === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex justify-between items-center border-b border-surface">
          <Link
            href="/"
            className="text-xl font-bold uppercase text-secondary"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            PARADISE<span className="text-primary">.</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-secondary/70 hover:text-primary transition-colors bg-surface/50 p-2 rounded-full active:scale-95"
            aria-label={language === "ar" ? "إغلاق" : "Close"}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-5 flex flex-col gap-6">
          <nav className="flex flex-col">
            {navLinks.map((link, index) => (
              <React.Fragment key={link.href}>
                <Link
                  href={link.href}
                  className="text-base font-medium py-3.5 px-2 rounded-lg text-secondary hover:bg-surface/50 hover:text-primary transition-all inline-flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name[language]}
                </Link>
                {index < navLinks.length - 1 && (
                  <div className="h-px w-full bg-surface/50 my-1" />
                )}
              </React.Fragment>
            ))}
          </nav>

          <div className="h-px w-full bg-surface" />

          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary/45 px-1 mb-1">
              {language === "ar" ? "العملة" : "Currency"}
            </p>
            <CurrencySwitcher variant="drawer" />
          </div>

          <div className="h-px w-full bg-surface" />

          <div className="flex flex-col space-y-2">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((v) => !v)}
                aria-expanded={isAccountMenuOpen}
                aria-controls="mobile-account-panel"
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border border-surface/50 bg-background p-3 text-start text-sm font-semibold text-secondary transition-all",
                  "hover:border-primary/30 hover:bg-primary/[0.04] hover:text-primary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
                  "active:scale-[0.99]",
                  isAccountMenuOpen && "border-primary/25 bg-primary/[0.05] text-primary"
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/15 to-accent/25 ring-2 ring-accent/25">
                    {ready && isAuthenticated && user?.avatar ? (
                      <Image src={user.avatar} alt="" fill sizes="44px" className="object-cover" />
                    ) : ready && isAuthenticated && user ? (
                      <span className="text-sm font-bold">
                        {(accountDisplayName || user.email).slice(0, 1).toUpperCase()}
                      </span>
                    ) : (
                      <User size={18} className="text-secondary/70" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate">{accountLabel}</span>
                    {ready && isAuthenticated && user ? (
                      <span className="mt-0.5 block truncate text-[11px] font-medium text-secondary/45">
                        {accountDisplayName || user.email}
                      </span>
                    ) : null}
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={cn(
                    "shrink-0 text-secondary/45 transition-transform duration-200 ease-out",
                    isAccountMenuOpen && "rotate-180 text-primary"
                  )}
                />
              </button>

              <div
                id="mobile-account-panel"
                className={cn(
                  "grid transition-[grid-template-rows,opacity,margin] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isAccountMenuOpen
                    ? "mt-2 grid-rows-[1fr] opacity-100"
                    : "mt-0 grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="rounded-2xl border border-surface/50 bg-background/90 p-2 shadow-soft">
                    <AccountMenuPanel
                      compact
                      onNavigate={() => setIsMobileMenuOpen(false)}
                      onLogout={() => {
                        setIsMobileMenuOpen(false);
                        setConfirmLogout(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/favorites"
              className="flex items-center gap-4 p-3 rounded-xl text-secondary/80 hover:bg-surface/50 hover:text-primary transition-all text-sm font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-10 h-10 rounded-full bg-surface/50 border border-surface flex items-center justify-center text-secondary relative">
                <Heart size={18} />
                <CountBadge count={wishCount} isTransparent={false} />
              </div>
              {language === "ar" ? "المفضلة" : "Wishlist"}
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-4 p-3 rounded-xl text-secondary/80 hover:bg-surface/50 hover:text-primary transition-all text-sm font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-10 h-10 rounded-full bg-surface/50 border border-surface flex items-center justify-center text-secondary relative">
                <ShoppingBag size={18} />
                <CountBadge count={cartCount} isTransparent={false} />
              </div>
              {language === "ar" ? "سلة المشتريات" : "Shopping Cart"}
            </Link>
          </div>
        </div>

        <div className="p-5 border-t border-surface bg-surface/30 mt-auto">
          <button
            type="button"
            onClick={() => {
              toggleLanguage();
              setIsMobileMenuOpen(false);
            }}
            className="inline-flex items-center justify-center w-full gap-2 p-3 bg-background border border-surface rounded-xl text-sm font-bold text-secondary hover:border-primary hover:text-primary transition-all shadow-sm active:scale-[0.98]"
          >
            <Globe size={18} className="shrink-0" />
            {language === "ar" ? "Switch to English" : "التبديل للعربية"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        loading={authLoading}
        title={language === "ar" ? "تسجيل الخروج؟" : "Sign out?"}
        description={
          language === "ar" ? "سيتم إنهاء جلستك الحالية." : "Your current session will end."
        }
        confirmLabel={language === "ar" ? "تسجيل الخروج" : "Sign Out"}
        onConfirm={async () => {
          setConfirmLogout(false);
          await logout("/login");
        }}
      />
    </>
  );
}
