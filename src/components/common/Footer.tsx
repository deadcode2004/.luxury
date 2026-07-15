"use client";

import React from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter, FaCcVisa, FaCcMastercard, FaCcPaypal } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-secondary text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
          {/* القسم الأول: عن العلامة */}
          <div>
            <Link href="/" className="text-3xl md:text-4xl font-bold tracking-widest uppercase mb-8 inline-block">
              PARADISE<span className="text-primary">.</span>
            </Link>
            <p className="text-gray-400 text-sm md:text-base leading-loose mb-8">
              {language === "ar"
                ? "وجهتك الأولى للمنتجات الفاخرة والعناية الاستثنائية. نقدم لك أرقى الماركات العالمية لتبرزي جمالك وتعيشي تجربة تسوق لا تُنسى."
                : "Your ultimate destination for luxury products and exceptional care. We bring you the finest global brands to highlight your beauty."}
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                <FaFacebookF size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                <FaTwitter size={20} />
              </a>
            </div>
          </div>

          {/* القسم الثاني: روابط سريعة */}
          <div>
            <h4 className="text-xl font-semibold mb-8 font-sans tracking-wide">
              {language === "ar" ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-4 text-gray-400 text-base">
              <li><Link href="/" className="hover:text-primary transition-colors block">{language === "ar" ? "الرئيسية" : "Home"}</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors block">{language === "ar" ? "المتجر" : "Shop"}</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors block">{language === "ar" ? "من نحن" : "About Us"}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors block">{language === "ar" ? "تواصل معنا" : "Contact"}</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors block">{language === "ar" ? "الأسئلة الشائعة" : "FAQ"}</Link></li>
            </ul>
          </div>

          {/* القسم الثالث: خدمة العملاء */}
          <div>
            <h4 className="text-xl font-semibold mb-8 font-sans tracking-wide">
              {language === "ar" ? "خدمة العملاء" : "Customer Service"}
            </h4>
            <ul className="space-y-4 text-gray-400 text-base">
              <li><Link href="/shipping" className="hover:text-primary transition-colors block">{language === "ar" ? "الشحن والتوصيل" : "Shipping & Delivery"}</Link></li>
              <li><Link href="/returns" className="hover:text-primary transition-colors block">{language === "ar" ? "سياسة الإرجاع" : "Returns Policy"}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors block">{language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors block">{language === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}</Link></li>
            </ul>
          </div>

          {/* القسم الرابع: النشرة البريدية */}
          <div>
            <h4 className="text-xl font-semibold mb-8 font-sans tracking-wide">
              {language === "ar" ? "النشرة البريدية" : "Newsletter"}
            </h4>
            <p className="text-gray-400 text-base leading-relaxed mb-6">
              {language === "ar"
                ? "اشترك الآن لتصلك أحدث العروض الحصرية والمنتجات الجديدة."
                : "Subscribe now to receive exclusive offers and new arrivals."}
            </p>
            <form className="flex flex-col space-y-4">
              <input
                type="email"
                placeholder={language === "ar" ? "البريد الإلكتروني" : "Email Address"}
                className="bg-white/5 border border-white/10 rounded-md px-5 py-4 text-base focus:outline-none focus:border-primary transition-colors w-full text-white placeholder-gray-500"
              />
              <button
                type="button"
                className="bg-primary hover:bg-primary/90 text-secondary font-bold tracking-wide rounded-md px-5 py-4 text-base transition-colors w-full"
              >
                {language === "ar" ? "اشتراك" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* الحقوق */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm gap-4">
          <p className="mb-0 text-center md:text-start">
            &copy; {new Date().getFullYear()} PARADISE. {language === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <div className="flex items-center justify-center gap-4 text-gray-400">
            {/* طرق الدفع */}
            <FaCcVisa size={32} className="hover:text-white transition-colors" />
            <FaCcMastercard size={32} className="hover:text-white transition-colors" />
            <FaCcPaypal size={32} className="hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}
