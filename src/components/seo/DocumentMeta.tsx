"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildMetadata, PAGE_SEO, SITE_URL, type PageSeo } from "@/lib/seo/meta";

function resolvePage(pathname: string): PageSeo {
  if (pathname.startsWith("/admin")) return PAGE_SEO.admin;
  if (pathname.startsWith("/product/")) {
    return {
      path: pathname,
      title: {
        ar: "تفاصيل المنتج | PARADISE",
        en: "Product Details | PARADISE",
      },
      description: {
        ar: "استعرض تفاصيل منتج فاخر من متجر PARADISE مع المكونات وطريقة الاستخدام والسعر.",
        en: "View luxury product details from PARADISE including ingredients, usage, and pricing.",
      },
      keywords: {
        ar: "منتج, تفاصيل المنتج, بارادايس",
        en: "product, product details, paradise",
      },
    };
  }

  const exact = Object.values(PAGE_SEO).find((p) => p.path === pathname);
  return exact ?? PAGE_SEO.home;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function DocumentMeta() {
  const pathname = usePathname();
  const { language } = useLanguage();

  useEffect(() => {
    const page = resolvePage(pathname || "/");
    const meta = buildMetadata(page, language);
    document.title = meta.title;
    upsertMeta("name", "description", meta.description);
    upsertMeta("name", "keywords", meta.keywords);
    upsertMeta("property", "og:title", meta.openGraph.title);
    upsertMeta("property", "og:description", meta.openGraph.description);
    upsertMeta("property", "og:url", meta.openGraph.url);
    upsertMeta("property", "og:locale", meta.openGraph.locale);
    upsertMeta("name", "twitter:title", meta.twitter.title);
    upsertMeta("name", "twitter:description", meta.twitter.description);
    upsertMeta("name", "twitter:card", "summary_large_image");

    let canonical = document.head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = meta.alternates.canonical || `${SITE_URL}${pathname}`;
  }, [pathname, language]);

  return null;
}
