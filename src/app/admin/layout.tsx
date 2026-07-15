"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Ticket, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Globe,
  Bell
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { language, toggleLanguage, dir } = useLanguage();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const adminLinks = [
    { name: { ar: "نظرة عامة", en: "Overview" }, href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: { ar: "الطلبات", en: "Orders" }, href: "/admin/orders", icon: <ShoppingCart size={20} /> },
    { name: { ar: "العملاء", en: "Customers" }, href: "/admin/customers", icon: <Users size={20} /> },
    { name: { ar: "المخزون", en: "Inventory" }, href: "/admin/inventory", icon: <Package size={20} /> },
    { name: { ar: "الكوبونات", en: "Coupons" }, href: "/admin/coupons", icon: <Ticket size={20} /> },
    { name: { ar: "إدارة المحتوى", en: "CMS" }, href: "/admin/cms", icon: <FileText size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 ${dir === "rtl" ? "right-0" : "left-0"} z-50 w-64 bg-secondary text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          isSidebarOpen ? "translate-x-0" : (dir === "rtl" ? "translate-x-full" : "-translate-x-full")
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-800">
          <Link href="/admin" className="text-2xl font-bold tracking-widest uppercase">
            ADMIN<span className="text-primary">.</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary text-secondary font-bold shadow-glow" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 font-medium"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {link.icon}
                {link.name[language]}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors font-medium">
            <LogOut size={20} />
            {language === "ar" ? "تسجيل الخروج" : "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-primary transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-secondary hidden sm:block">
              {adminLinks.find(l => l.href === pathname)?.name[language] || (language === "ar" ? "لوحة التحكم" : "Dashboard")}
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={toggleLanguage} 
              className="flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors"
            >
              <Globe size={20} className="me-2" />
              <span>{language === "ar" ? "EN" : "عربي"}</span>
            </button>
            
            <button className="relative text-gray-500 hover:text-primary transition-colors">
              <Bell size={22} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="relative group h-20 flex items-center pl-4 rtl:pr-4 rtl:border-r ltr:border-l border-gray-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  A
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">Admin User</p>
                  <p className="text-xs text-gray-500">Store Manager</p>
                </div>
              </div>

              {/* القائمة المنسدلة المودرن */}
              <div className={`absolute top-[100%] w-56 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 ${dir === "rtl" ? "left-0" : "right-0"}`}>
                <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out">
                  <div className="p-2">
                    <Link href="/admin/settings" className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-all rounded-xl font-medium group/item text-start">
                      <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 group-hover/item:bg-primary/10 group-hover/item:border-primary/20 flex items-center justify-center transition-colors">
                        <Settings size={16} />
                      </div>
                      {language === "ar" ? "إعدادات الحساب" : "Account Settings"}
                    </Link>
                    
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent my-1"></div>
                    
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all rounded-xl font-bold group/item">
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

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
