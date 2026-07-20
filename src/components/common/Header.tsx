"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, Heart, User, Menu, X, Globe, LayoutDashboard, ChevronDown, LogOut, LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency, type CurrencyCode } from "@/contexts/CurrencyContext";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

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
  const { user, logout, loading: authLoading, isOwner } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { toast } = useToast();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const pathname = usePathname();

  const isTransparentRoute = pathname === "/" || pathname === "/about";
  const isTransparent = isTransparentRoute && !isScrolled;
  const textColorClass = isTransparent ? "text-background" : "text-secondary";
  const hoverColorClass = isTransparent ? "hover:text-gray-300" : "hover:text-primary";
  const logoDotColorClass = isTransparent ? "text-background" : "text-primary";

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
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: { ar: "الرئيسية", en: "Home" }, href: "/" },
    { name: { ar: "تسوق", en: "Shop" }, href: "/shop" },
    { name: { ar: "المجموعات", en: "Collections" }, href: "/collections" },
    { name: { ar: "عن العلامة", en: "Our Story" }, href: "/about" },
    { name: { ar: "تواصل معنا", en: "Contact" }, href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${
          isTransparent
            ? "bg-transparent py-5"
            : "bg-background/95 backdrop-blur-md shadow-soft py-3 border-b border-surface"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <button
            className={`lg:hidden transition-colors p-2 -ml-2 active:scale-95 ${textColorClass} ${hoverColorClass}`}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          <Link
            href="/"
            className={`text-xl md:text-2xl font-bold tracking-widest uppercase transition-colors ${textColorClass}`}
          >
            PARADISE<span className={logoDotColorClass}>.</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={`text-sm font-medium transition-colors relative group py-2 flex items-center ${textColorClass} ${hoverColorClass}`}
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

          <div className={`flex items-center gap-2 sm:gap-4 ${textColorClass}`}>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className={`hidden md:block bg-transparent text-xs font-bold border border-current/20 rounded-lg px-2 py-1.5 transition-colors ${hoverColorClass}`}
              aria-label="Currency"
            >
              <option value="SAR">SAR</option>
              <option value="EGP">EGP</option>
              <option value="USD">USD</option>
            </select>
            <button
              onClick={toggleLanguage}
              className={`hidden lg:flex items-center text-xs font-medium transition-colors active:scale-95 ${hoverColorClass}`}
              title="تغيير اللغة"
            >
              <Globe size={16} className="me-1.5" />
              <span className="mt-0.5">{language === "ar" ? "EN" : "AR"}</span>
            </button>

            <button
              type="button"
              className={`transition-colors p-2 flex items-center justify-center active:scale-95 ${hoverColorClass}`}
              aria-label="Search"
              onClick={() => {
                router.push("/shop");
                toast(
                  language === "ar" ? "✔ انتقل إلى التسوق للبحث" : "✔ Opened shop to search",
                  "info"
                );
              }}
            >
              <Search size={18} />
            </button>
            <Link
              href="/favorites"
              className={`transition-colors relative hidden lg:flex items-center justify-center p-2 active:scale-95 ${hoverColorClass}`}
            >
              <Heart size={18} />
              <CountBadge count={wishCount} isTransparent={isTransparent} />
            </Link>
            <Link
              href="/cart"
              className={`transition-colors relative flex items-center justify-center p-2 active:scale-95 ${hoverColorClass}`}
            >
              <ShoppingBag size={18} />
              <CountBadge count={cartCount} isTransparent={isTransparent} />
            </Link>
            <div className="relative group hidden lg:flex h-full items-center">
              <button
                className={`transition-colors flex items-center justify-center p-2 active:scale-95 ${hoverColorClass}`}
              >
                <User size={18} />
              </button>

              <div
                className={`absolute top-[100%] w-56 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 ${
                  dir === "rtl" ? "left-0" : "right-0"
                }`}
              >
                <div className="bg-background/95 backdrop-blur-xl border border-surface rounded-2xl shadow-floating overflow-hidden transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out">
                  <div className="p-2">
                    {user ? (
                      <>
                        <div className="px-4 py-2 text-xs text-gray-400">
                          {user.name || user.email}
                        </div>
                        <Link
                          href="/account"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-secondary/80 hover:bg-surface/50 hover:text-primary transition-all rounded-xl font-medium"
                        >
                          <User size={16} />
                          {language === "ar" ? "حسابي الشخصي" : "My Account"}
                        </Link>
                        {isOwner && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-secondary/80 hover:bg-surface/50 hover:text-primary transition-all rounded-xl font-bold"
                          >
                            <LayoutDashboard size={16} />
                            {language === "ar" ? "لوحة الإدارة" : "Admin Dashboard"}
                          </Link>
                        )}
                        <button
                          type="button"
                          disabled={authLoading}
                          onClick={() => setConfirmLogout(true)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-all rounded-xl font-bold disabled:opacity-50"
                        >
                          <LogOut size={16} />
                          {language === "ar" ? "تسجيل الخروج" : "Sign Out"}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-secondary/80 hover:bg-surface/50 hover:text-primary transition-all rounded-xl font-bold"
                        >
                          <LogIn size={16} />
                          {language === "ar" ? "تسجيل الدخول" : "Sign In"}
                        </Link>
                        <Link
                          href="/register"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-secondary/80 hover:bg-surface/50 hover:text-primary transition-all rounded-xl font-medium"
                        >
                          <User size={16} />
                          {language === "ar" ? "إنشاء حساب" : "Create Account"}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

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
          <Link href="/" className="text-xl font-bold uppercase text-secondary">
            PARADISE<span className="text-primary">.</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-secondary/70 hover:text-primary transition-colors bg-surface/50 p-2 rounded-full active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-5 flex flex-col gap-6">
          <nav className="flex flex-col">
            {navLinks.map((link, index) => (
              <React.Fragment key={index}>
                <Link
                  href={link.href}
                  className="text-base font-medium py-3.5 px-2 rounded-lg text-secondary hover:bg-surface/50 hover:text-primary transition-all flex items-center"
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

          <div className="flex flex-col space-y-2">
            <div className="flex flex-col">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center justify-between p-3 rounded-xl text-secondary/80 hover:bg-surface/50 hover:text-primary transition-all text-sm font-medium w-full text-start"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface/50 border border-surface flex items-center justify-center text-secondary">
                    <User size={18} />
                  </div>
                  <span>{language === "ar" ? "حسابي الشخصي" : "My Account"}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${
                    isAccountMenuOpen ? "rotate-180" : "rotate-0"
                  } text-secondary/50`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isAccountMenuOpen ? "max-h-56 opacity-100 mt-1" : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col space-y-1 py-2 px-12 border-l-2 border-transparent rtl:border-r-2 rtl:border-l-0 rtl:border-r-surface ltr:border-l-surface mx-4">
                  {user ? (
                    <>
                      <Link
                        href="/account"
                        className="text-sm text-secondary/70 hover:text-primary py-2 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {language === "ar" ? "الملف الشخصي" : "Profile"}
                      </Link>
                      {isOwner && (
                        <Link
                          href="/admin"
                          className="text-sm font-bold text-secondary/70 hover:text-primary py-2 transition-colors flex items-center gap-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <LayoutDashboard size={14} />
                          {language === "ar" ? "لوحة الإدارة" : "Admin Dashboard"}
                        </Link>
                      )}
                      <button
                        type="button"
                        className="text-sm text-red-500 py-2 text-start font-bold"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setConfirmLogout(true);
                        }}
                      >
                        {language === "ar" ? "تسجيل الخروج" : "Sign Out"}
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="text-sm text-primary py-2 text-start font-bold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {language === "ar" ? "تسجيل الدخول" : "Sign In"}
                    </Link>
                  )}
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

        <div className="p-5 border-t border-surface bg-surface/50/50 mt-auto">
          <button
            onClick={() => {
              toggleLanguage();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center justify-center w-full gap-2 p-3 bg-background border border-surface rounded-xl text-sm font-bold text-secondary hover:border-primary hover:text-primary transition-all shadow-sm active:scale-[0.98]"
          >
            <Globe size={18} />
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
