"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaTiktok,
  FaWhatsapp,
  FaLinkedinIn,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
} from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchPublicCms, type CmsStorefront } from "@/lib/api/owner";
import {
  emptyCmsContact,
  emptyCmsSocial,
  socialHref,
  type SocialPlatform,
} from "@/lib/cms/footer";

const SOCIAL_ICONS: Record<
  SocialPlatform,
  { icon: React.ReactNode; label: string }
> = {
  twitter: { icon: <FaTwitter size={16} />, label: "Twitter" },
  instagram: { icon: <FaInstagram size={16} />, label: "Instagram" },
  facebook: { icon: <FaFacebookF size={16} />, label: "Facebook" },
  whatsapp: { icon: <FaWhatsapp size={16} />, label: "WhatsApp" },
  tiktok: { icon: <FaTiktok size={16} />, label: "TikTok" },
  linkedin: { icon: <FaLinkedinIn size={16} />, label: "LinkedIn" },
};

const SOCIAL_ORDER: SocialPlatform[] = [
  "instagram",
  "facebook",
  "twitter",
  "tiktok",
  "linkedin",
  "whatsapp",
];

export default function Footer() {
  const { language } = useLanguage();
  const [cms, setCms] = useState<CmsStorefront | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublicCms()
      .then((data) => {
        if (!cancelled) setCms(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const social = useMemo(
    () => ({ ...emptyCmsSocial(), ...(cms?.social ?? {}) }),
    [cms]
  );
  const contact = useMemo(
    () => ({ ...emptyCmsContact(), ...(cms?.contact ?? {}) }),
    [cms]
  );

  const enabledSocial = SOCIAL_ORDER.filter((key) => {
    const row = social[key];
    return row?.enabled && socialHref(key, row.value);
  });

  return (
    <footer className="bg-background text-secondary pt-16 pb-8 border-t border-surface/40">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Link
              href="/"
              className="text-2xl md:text-3xl font-bold tracking-widest uppercase mb-6 inline-block"
            >
              PARADISE<span className="text-primary">.</span>
            </Link>
            <p className="text-secondary/70 text-xs md:text-sm leading-relaxed mb-6">
              {language === "ar"
                ? "وجهتك الأولى للمنتجات الفاخرة والعناية الاستثنائية. نقدم لك أرقى الماركات العالمية لتبرزي جمالك وتعيشي تجربة تسوق لا تُنسى."
                : "Your ultimate destination for luxury products and exceptional care. We bring you the finest global brands to highlight your beauty."}
            </p>
            {enabledSocial.length > 0 ? (
              <div className="flex items-center flex-wrap gap-3">
                {enabledSocial.map((key) => {
                  const href = socialHref(key, social[key].value);
                  if (!href) return null;
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={SOCIAL_ICONS[key].label}
                      className="w-10 h-10 rounded-full bg-primary text-background flex items-center justify-center hover:bg-primary-hover transition-all"
                    >
                      {SOCIAL_ICONS[key].icon}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 font-sans tracking-wide">
              {language === "ar" ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-3 text-secondary/70 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors block">
                  {language === "ar" ? "الرئيسية" : "Home"}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-primary transition-colors block">
                  {language === "ar" ? "المتجر" : "Shop"}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors block">
                  {language === "ar" ? "من نحن" : "About Us"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors block">
                  {language === "ar" ? "تواصل معنا" : "Contact"}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors block">
                  {language === "ar" ? "الأسئلة الشائعة" : "FAQ"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 font-sans tracking-wide">
              {language === "ar" ? "خدمة العملاء" : "Customer Service"}
            </h4>
            <ul className="space-y-3 text-secondary/70 text-sm">
              <li>
                <Link href="/shipping" className="hover:text-primary transition-colors block">
                  {language === "ar" ? "الشحن والتوصيل" : "Shipping & Delivery"}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-primary transition-colors block">
                  {language === "ar" ? "سياسة الإرجاع" : "Returns Policy"}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors block">
                  {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors block">
                  {language === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 font-sans tracking-wide">
              {language === "ar" ? "تواصل معنا" : "Contact"}
            </h4>
            <ul className="space-y-3 text-secondary/70 text-sm">
              {contact.address.enabled &&
              (contact.address.text?.[language] || contact.address.text?.ar) ? (
                <li>{contact.address.text?.[language] || contact.address.text?.ar}</li>
              ) : null}
              {contact.phones.enabled
                ? contact.phones.numbers
                    .filter(Boolean)
                    .map((n) => (
                      <li key={n}>
                        <a
                          href={`tel:${n.replace(/\s+/g, "")}`}
                          className="hover:text-primary transition-colors dir-ltr inline-block"
                        >
                          {n}
                        </a>
                      </li>
                    ))
                : null}
              {contact.email.enabled && contact.email.value ? (
                <li>
                  <a
                    href={`mailto:${contact.email.value}`}
                    className="hover:text-primary transition-colors dir-ltr inline-block break-all"
                  >
                    {contact.email.value}
                  </a>
                </li>
              ) : null}
              {contact.hours.enabled &&
              (contact.hours.text?.[language] || contact.hours.text?.ar) ? (
                <li>{contact.hours.text?.[language] || contact.hours.text?.ar}</li>
              ) : null}
              {!contact.address.enabled &&
              !contact.phones.enabled &&
              !contact.email.enabled &&
              !contact.hours.enabled ? (
                <li className="text-secondary/45">
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    {language === "ar" ? "صفحة التواصل" : "Contact page"}
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="border-t border-surface/40 pt-6 flex flex-col md:flex-row justify-between items-center text-secondary/70 text-xs md:text-sm gap-4">
          <p className="mb-0 text-center md:text-start">
            &copy; {new Date().getFullYear()} PARADISE.{" "}
            {language === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <div className="flex items-center justify-center gap-3 text-secondary/70">
            <FaCcVisa size={24} className="hover:text-primary transition-colors" />
            <FaCcMastercard size={24} className="hover:text-primary transition-colors" />
            <FaCcPaypal size={24} className="hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}
