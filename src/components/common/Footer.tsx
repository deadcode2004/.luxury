"use client";

import React from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter, FaCcVisa, FaCcMastercard, FaCcPaypal } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-background text-secondary pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ø£ÙˆÙ„: Ø¹Ù† Ø§Ù„Ø¹Ù„Ø§Ù…Ø© */}
          <div>
            <Link href="/" className="text-2xl md:text-3xl font-bold tracking-widest uppercase mb-6 inline-block">
              PARADISE<span className="text-primary">.</span>
            </Link>
            <p className="text-secondary/70 text-xs md:text-sm leading-relaxed mb-6">
              {language === "ar"
                ? "ÙˆØ¬Ù‡ØªÙƒ Ø§Ù„Ø£ÙˆÙ„Ù‰ Ù„Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„ÙØ§Ø®Ø±Ø© ÙˆØ§Ù„Ø¹Ù†Ø§ÙŠØ© Ø§Ù„Ø§Ø³ØªØ«Ù†Ø§Ø¦ÙŠØ©. Ù†Ù‚Ø¯Ù… Ù„Ùƒ Ø£Ø±Ù‚Ù‰ Ø§Ù„Ù…Ø§Ø±ÙƒØ§Øª Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ© Ù„ØªØ¨Ø±Ø²ÙŠ Ø¬Ù…Ø§Ù„Ùƒ ÙˆØªØ¹ÙŠØ´ÙŠ ØªØ¬Ø±Ø¨Ø© ØªØ³ÙˆÙ‚ Ù„Ø§ ØªÙÙ†Ø³Ù‰."
                : "Your ultimate destination for luxury products and exceptional care. We bring you the finest global brands to highlight your beauty."}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary text-background flex items-center justify-center hover:bg-primary-hover transition-all">
                <FaInstagram size={16} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary text-background flex items-center justify-center hover:bg-primary-hover transition-all">
                <FaFacebookF size={16} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary text-background flex items-center justify-center hover:bg-primary-hover transition-all">
                <FaTwitter size={16} />
              </a>
            </div>
          </div>

          {/* Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ø«Ø§Ù†ÙŠ: Ø±ÙˆØ§Ø¨Ø· Ø³Ø±ÙŠØ¹Ø© */}
          <div>
            <h4 className="text-lg font-semibold mb-6 font-sans tracking-wide">
              {language === "ar" ? "Ø±ÙˆØ§Ø¨Ø· Ø³Ø±ÙŠØ¹Ø©" : "Quick Links"}
            </h4>
            <ul className="space-y-3 text-secondary/70 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors block">{language === "ar" ? "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©" : "Home"}</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors block">{language === "ar" ? "Ø§Ù„Ù…ØªØ¬Ø±" : "Shop"}</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors block">{language === "ar" ? "Ù…Ù† Ù†Ø­Ù†" : "About Us"}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors block">{language === "ar" ? "ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§" : "Contact"}</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors block">{language === "ar" ? "Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø´Ø§Ø¦Ø¹Ø©" : "FAQ"}</Link></li>
            </ul>
          </div>

          {/* Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ø«Ø§Ù„Ø«: Ø®Ø¯Ù…Ø© Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ */}
          <div>
            <h4 className="text-lg font-semibold mb-6 font-sans tracking-wide">
              {language === "ar" ? "Ø®Ø¯Ù…Ø© Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡" : "Customer Service"}
            </h4>
            <ul className="space-y-3 text-secondary/70 text-sm">
              <li><Link href="/shipping" className="hover:text-primary transition-colors block">{language === "ar" ? "Ø§Ù„Ø´Ø­Ù† ÙˆØ§Ù„ØªÙˆØµÙŠÙ„" : "Shipping & Delivery"}</Link></li>
              <li><Link href="/returns" className="hover:text-primary transition-colors block">{language === "ar" ? "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø¥Ø±Ø¬Ø§Ø¹" : "Returns Policy"}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors block">{language === "ar" ? "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©" : "Privacy Policy"}</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors block">{language === "ar" ? "Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù…" : "Terms & Conditions"}</Link></li>
            </ul>
          </div>

          {/* Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ø±Ø§Ø¨Ø¹: Ø§Ù„Ù†Ø´Ø±Ø© Ø§Ù„Ø¨Ø±ÙŠØ¯ÙŠØ© */}
          <div>
            <h4 className="text-lg font-semibold mb-6 font-sans tracking-wide">
              {language === "ar" ? "Ø§Ù„Ù†Ø´Ø±Ø© Ø§Ù„Ø¨Ø±ÙŠØ¯ÙŠØ©" : "Newsletter"}
            </h4>
            <p className="text-secondary/70 text-sm leading-relaxed mb-5">
              {language === "ar"
                ? "Ø§Ø´ØªØ±Ùƒ Ø§Ù„Ø¢Ù† Ù„ØªØµÙ„Ùƒ Ø£Ø­Ø¯Ø« Ø§Ù„Ø¹Ø±ÙˆØ¶ Ø§Ù„Ø­ØµØ±ÙŠØ© ÙˆØ§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©."
                : "Subscribe now to receive exclusive offers and new arrivals."}
            </p>
            <form className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder={language === "ar" ? "Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ" : "Email Address"}
                className="bg-surface/50 border border-surface rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors w-full text-secondary placeholder-secondary/50"
              />
              <button
                type="button"
                className="bg-primary hover:bg-primary-hover text-background font-bold tracking-wide rounded-md px-4 py-3 text-sm transition-colors w-full"
              >
                {language === "ar" ? "Ø§Ø´ØªØ±Ø§Ùƒ" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* Ø§Ù„Ø­Ù‚ÙˆÙ‚ */}
        <div className="border-t border-surface pt-6 flex flex-col md:flex-row justify-between items-center text-secondary/70 text-xs md:text-sm gap-4">
          <p className="mb-0 text-center md:text-start">
            &copy; {new Date().getFullYear()} PARADISE. {language === "ar" ? "Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ‚ Ù…Ø­ÙÙˆØ¸Ø©." : "All rights reserved."}
          </p>
          <div className="flex items-center justify-center gap-3 text-secondary/50">
            {/* Ø·Ø±Ù‚ Ø§Ù„Ø¯ÙØ¹ */}
            <FaCcVisa size={24} className="hover:text-primary transition-colors" />
            <FaCcMastercard size={24} className="hover:text-primary transition-colors" />
            <FaCcPaypal size={24} className="hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}
