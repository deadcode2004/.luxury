"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Heart, User, Menu, X, Globe, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const { language, toggleLanguage, dir } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isTransparent = isHome && !isScrolled;
  const textColorClass = isTransparent ? "text-white" : "text-secondary";
  const hoverColorClass = isTransparent ? "hover:text-gray-300" : "hover:text-primary";
  const logoDotColorClass = isTransparent ? "text-white" : "text-primary";

  // تأثير التمرير (Scroll Effect)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: { ar: "الرئيسية", en: "Home" }, href: "/" },
    { name: { ar: "تسوق", en: "Shop" }, href: "/shop" },
    { name: { ar: "المجموعات", en: "Collections" }, href: "/collections" },
    { name: { ar: "عن العلامة", en: "Our Story" }, href: "/about" },
    { name: { ar: "تواصل معنا", en: "Contact" }, href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isTransparent ? "bg-transparent py-8" : "bg-white/95 backdrop-blur-md shadow-soft py-4 border-b border-gray-100"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* زر القائمة للموبايل */}
        <button
          className={`md:hidden transition-colors p-2 -ml-2 ${textColorClass} ${hoverColorClass}`}
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={28} />
        </button>

        {/* الشعار */}
        <Link href="/" className={`text-3xl md:text-4xl font-bold tracking-widest uppercase transition-colors ${textColorClass}`}>
          LUXE<span className={logoDotColorClass}>.</span>
        </Link>

        {/* قائمة التنقل - شاشات كبيرة */}
        <nav className="hidden md:flex items-center gap-10 absolute left-1/2 transform -translate-x-1/2">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={`text-base font-medium transition-colors relative group py-2 flex items-center ${textColorClass} ${hoverColorClass}`}
            >
              {link.name[language]}
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isTransparent ? "bg-white" : "bg-primary"}`}></span>
            </Link>
          ))}
        </nav>

        {/* الأيقونات (بحث، سلة، مفضلة، حساب، لغة) */}
        <div className={`flex items-center gap-5 ${textColorClass}`}>
          <button onClick={toggleLanguage} className={`hidden md:flex items-center text-sm font-medium transition-colors ${hoverColorClass}`} title="تغيير اللغة">
            <Globe size={20} className="me-2" />
            <span className="mt-1">{language === "ar" ? "EN" : "AR"}</span>
          </button>
          
          <button className={`transition-colors p-2 flex items-center justify-center ${hoverColorClass}`}>
            <Search size={22} />
          </button>
          <Link href="/favorites" className={`transition-colors relative hidden md:flex items-center justify-center p-2 ${hoverColorClass}`}>
            <Heart size={22} />
            <span className={`absolute top-0 right-0 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${isTransparent ? "bg-white text-secondary" : "bg-primary text-white"}`}>2</span>
          </Link>
          <Link href="/cart" className={`transition-colors relative flex items-center justify-center p-2 ${hoverColorClass}`}>
            <ShoppingBag size={22} />
            <span className={`absolute top-0 right-0 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${isTransparent ? "bg-white text-secondary" : "bg-primary text-white"}`}>2</span>
          </Link>
          <div className="relative group hidden md:block h-full flex items-center">
            <button className={`transition-colors flex items-center justify-center p-2 ${hoverColorClass}`}>
              <User size={22} />
            </button>
            
            {/* غلاف شفاف لضمان عدم اختفاء القائمة (Invisible Hover Bridge) */}
            <div className={`absolute top-[100%] w-56 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 ${dir === "rtl" ? "left-0" : "right-0"}`}>
              
              {/* القائمة نفسها */}
              <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out">
                <div className="p-2">
                  <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-all rounded-xl font-medium group/item">
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 group-hover/item:bg-primary/10 group-hover/item:border-primary/20 flex items-center justify-center transition-colors">
                      <User size={16} />
                    </div>
                    {language === "ar" ? "حسابي الشخصي" : "My Account"}
                  </Link>
                  
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent my-1"></div>
                  
                  <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-all rounded-xl font-bold group/item">
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 group-hover/item:bg-primary/10 group-hover/item:border-primary/20 flex items-center justify-center transition-colors">
                      <LayoutDashboard size={16} />
                    </div>
                    {language === "ar" ? "لوحة الإدارة" : "Admin Dashboard"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة الموبايل (Mobile Menu) */}
      <div
        className={`fixed inset-0 bg-background z-50 transform transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : dir === "rtl" ? "translate-x-full" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <Link href="/" className="text-2xl font-bold uppercase text-foreground">
            LUXE<span className="text-primary">.</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-foreground">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 flex flex-col space-y-4">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-lg font-medium border-b border-gray-50 pb-2 text-foreground hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name[language]}
            </Link>
          ))}
          <button 
            onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }} 
            className="flex items-center text-lg font-medium pt-4 text-foreground hover:text-primary"
          >
            <Globe size={20} className="me-2" />
            {language === "ar" ? "Switch to English" : "التبديل للعربية"}
          </button>
        </nav>
      </div>
    </header>
  );
}
