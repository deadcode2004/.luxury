"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Heart, User, Menu, X, Globe, LayoutDashboard, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const { language, toggleLanguage, dir } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
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

  // قفل تمرير الشاشة (Scroll Lock) عند فتح القائمة الجانبية
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
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
          isTransparent ? "bg-transparent py-5" : "bg-white/95 backdrop-blur-md shadow-soft py-3 border-b border-gray-100"
        }`}
      >
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* زر القائمة للموبايل */}
        <button
          className={`md:hidden transition-colors p-2 -ml-2 ${textColorClass} ${hoverColorClass}`}
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>

        {/* الشعار */}
        <Link href="/" className={`text-xl md:text-2xl font-bold tracking-widest uppercase transition-colors ${textColorClass}`}>
          PARADISE<span className={logoDotColorClass}>.</span>
        </Link>

        {/* قائمة التنقل - شاشات كبيرة */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={`text-sm font-medium transition-colors relative group py-2 flex items-center ${textColorClass} ${hoverColorClass}`}
            >
              {link.name[language]}
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isTransparent ? "bg-white" : "bg-primary"}`}></span>
            </Link>
          ))}
        </nav>

        {/* الأيقونات (بحث، سلة، مفضلة، حساب، لغة) */}
        <div className={`flex items-center gap-4 ${textColorClass}`}>
          <button onClick={toggleLanguage} className={`hidden md:flex items-center text-xs font-medium transition-colors ${hoverColorClass}`} title="تغيير اللغة">
            <Globe size={16} className="me-1.5" />
            <span className="mt-0.5">{language === "ar" ? "EN" : "AR"}</span>
          </button>
          
          <button className={`transition-colors p-2 flex items-center justify-center ${hoverColorClass}`}>
            <Search size={18} />
          </button>
          <Link href="/favorites" className={`transition-colors relative hidden md:flex items-center justify-center p-2 ${hoverColorClass}`}>
            <Heart size={18} />
            <span className={`absolute top-0.5 right-0.5 text-[9px] font-bold w-[14px] h-[14px] rounded-full flex items-center justify-center ${isTransparent ? "bg-white text-secondary" : "bg-primary text-white"}`}>2</span>
          </Link>
          <Link href="/cart" className={`transition-colors relative flex items-center justify-center p-2 ${hoverColorClass}`}>
            <ShoppingBag size={18} />
            <span className={`absolute top-0.5 right-0.5 text-[9px] font-bold w-[14px] h-[14px] rounded-full flex items-center justify-center ${isTransparent ? "bg-white text-secondary" : "bg-primary text-white"}`}>2</span>
          </Link>
          <div className="relative group hidden md:block h-full flex items-center">
            <button className={`transition-colors flex items-center justify-center p-2 ${hoverColorClass}`}>
              <User size={18} />
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
      </header>

      {/* خلفية داكنة (Backdrop) */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* قائمة الموبايل الجانبية (Drawer Menu) */}
      <div
        className={`fixed top-0 bottom-0 bg-white z-50 w-[85vw] max-w-sm flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          dir === "rtl" ? "right-0" : "left-0"
        } ${
          isMobileMenuOpen 
            ? "translate-x-0" 
            : dir === "rtl" 
              ? "translate-x-full" 
              : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex justify-between items-center border-b border-gray-100">
          <Link href="/" className="text-xl font-bold uppercase text-secondary">
            PARADISE<span className="text-primary">.</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-primary transition-colors bg-gray-50 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-5 flex flex-col gap-6">
          <nav className="flex flex-col">
            {navLinks.map((link, index) => (
              <React.Fragment key={index}>
                <Link
                  href={link.href}
                  className="text-base font-medium py-3.5 px-2 rounded-lg text-secondary hover:bg-gray-50 hover:text-primary transition-all flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name[language]}
                </Link>
                {index < navLinks.length - 1 && <div className="h-px w-full bg-gray-50 my-1"></div>}
              </React.Fragment>
            ))}
          </nav>
          
          <div className="h-px w-full bg-gray-100"></div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex flex-col">
              <button 
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center justify-between p-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-primary transition-all text-sm font-medium w-full text-start"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-secondary">
                    <User size={18} />
                  </div>
                  <span>{language === "ar" ? "حسابي الشخصي" : "My Account"}</span>
                </div>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isAccountMenuOpen ? "rotate-180" : "rotate-0"} text-gray-400`} />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isAccountMenuOpen ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
              >
                <div className="flex flex-col space-y-1 py-2 px-12 border-l-2 border-transparent rtl:border-r-2 rtl:border-l-0 rtl:border-r-gray-100 ltr:border-l-gray-100 mx-4">
                  <Link href="/account" className="text-sm text-gray-500 hover:text-primary py-2 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    {language === "ar" ? "الملف الشخصي" : "Profile"}
                  </Link>
                  <div className="h-px w-full bg-gray-50 my-1"></div>
                  <Link href="/admin" className="text-sm font-bold text-gray-500 hover:text-primary py-2 transition-colors flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <LayoutDashboard size={14} />
                    {language === "ar" ? "لوحة الإدارة" : "Admin Dashboard"}
                  </Link>
                </div>
              </div>
            </div>
            
            <Link href="/favorites" className="flex items-center gap-4 p-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-primary transition-all text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-secondary relative">
                <Heart size={18} />
                <span className="absolute top-0 right-0 -mt-1 -mr-1 text-[9px] font-bold w-[14px] h-[14px] rounded-full flex items-center justify-center bg-primary text-white">2</span>
              </div>
              {language === "ar" ? "المفضلة" : "Wishlist"}
            </Link>

            <Link href="/cart" className="flex items-center gap-4 p-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-primary transition-all text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-secondary relative">
                <ShoppingBag size={18} />
                <span className="absolute top-0 right-0 -mt-1 -mr-1 text-[9px] font-bold w-[14px] h-[14px] rounded-full flex items-center justify-center bg-primary text-white">2</span>
              </div>
              {language === "ar" ? "سلة المشتريات" : "Shopping Cart"}
            </Link>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50/50 mt-auto">
          <button 
            onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }} 
            className="flex items-center justify-center w-full gap-2 p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-secondary hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            <Globe size={18} />
            {language === "ar" ? "Switch to English" : "التبديل للعربية"}
          </button>
        </div>
      </div>
    </>
  );
}
