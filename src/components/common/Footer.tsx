"use client";

import React from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter, FaCcVisa, FaCcMastercard, FaCcPaypal } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-secondary text-background pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* القسم الأول: عن العلامة */}
          <div>
            <Link href="/" className="text-2xl md:text-3xl font-bold tracking-widest uppercase mb-6 inline-block">
              PARADISE<span className="text-primary">.</span>
            </Link>
            <p className="text-secondary/50 text-xs md:text-sm leading-relaxed mb-6">
              {language === "ar"
                ? "وجهتك الأولى للمنتجات الفاخرة والعناية الاستثنائية. نقدم لك أرقى الماركات العالمية لتبرزي جمالك وتعيشي تجربة تسوق لا تُنسى."
                : "Your ultimate destination for luxury products and exceptional care. We bring you the finest global brands to highlight your beauty."}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                <FaInstagram size={16} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                <FaFacebookF size={16} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                <FaTwitter size={16} />
              </a>
            </div>
          </div>

          {/* القسم الثاني: روابط سريعة */}
          <div>
            <h4 className="text-lg font-semibold mb-6 font-sans tracking-wide">
              {language === "ar" ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-3 text-secondary/50 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors block">{language === "ar" ? "الرئيسية" : "Home"}</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors block">{language === "ar" ? "المتجر" : "Shop"}</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors block">{language === "ar" ? "من نحن" : "About Us"}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors block">{language === "ar" ? "تواصل معنا" : "Contact"}</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors block">{language === "ar" ? "الأسئلة الشائعة" : "FAQ"}</Link></li>
            </ul>
          </div>

          {/* القسم الثالث: خدمة العملاء */}
          <div>
            <h4 className="text-lg font-semibold mb-6 font-sans tracking-wide">
              {language === "ar" ? "خدمة العملاء" : "Customer Service"}
            </h4>
            <ul className="space-y-3 text-secondary/50 text-sm">
              <li><Link href="/shipping" className="hover:text-primary transition-colors block">{language === "ar" ? "الشحن والتوصيل" : "Shipping & Delivery"}</Link></li>
              <li><Link href="/returns" className="hover:text-primary transition-colors block">{language === "ar" ? "سياسة الإرجاع" : "Returns Policy"}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors block">{language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors block">{language === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}</Link></li>
            </ul>
          </div>

          {/* القسم الرابع: النشرة البريدية */}
          <div>
            <h4 className="text-lg font-semibold mb-6 font-sans tracking-wide">
              {language === "ar" ? "النشرة البريدية" : "Newsletter"}
            </h4>
            <p className="text-secondary/50 text-sm leading-relaxed mb-5">
              {language === "ar"
                ? "اشترك الآن لتصلك أحدث العروض الحصرية والمنتجات الجديدة."
                : "Subscribe now to receive exclusive offers and new arrivals."}
            </p>
            <form className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder={language === "ar" ? "البريد الإلكتروني" : "Email Address"}
                className="bg-background/5 border border-white/10 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors w-full text-background placeholder-gray-500"
              />
              <button
                type="button"
                className="bg-primary hover:bg-primary-hover text-secondary font-bold tracking-wide rounded-md px-4 py-3 text-sm transition-colors w-full"
              >
                {language === "ar" ? "اشتراك" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* الحقوق */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-secondary/70 text-xs md:text-sm gap-4">
          <p className="mb-0 text-center md:text-start">
            &copy; {new Date().getFullYear()} PARADISE. {language === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <div className="flex items-center justify-center gap-3 text-secondary/50">
            {/* طرق الدفع */}
            <FaCcVisa size={24} className="hover:text-background transition-colors" />
            <FaCcMastercard size={24} className="hover:text-background transition-colors" />
            <FaCcPaypal size={24} className="hover:text-background transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}
