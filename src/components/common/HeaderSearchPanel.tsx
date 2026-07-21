"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { type Product } from "@/data/mock";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatMoney } from "@/lib/format/currency";
import { cn } from "@/lib/cn";
import { fetchPublicProducts, getCachedCatalog } from "@/lib/products/catalog";
import { useRealtimeDomains } from "@/contexts/RealtimeContext";

type HeaderSearchPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F]/g, "")
    .trim();
}

function searchProducts(
  catalog: Product[],
  query: string,
  language: "ar" | "en"
): Product[] {
  const q = normalize(query);
  if (!q) return [];
  return catalog
    .filter((p) => {
      const hay = normalize(
        `${p.name.ar} ${p.name.en} ${p.brand.ar} ${p.brand.en} ${p.description?.ar ?? ""} ${p.description?.en ?? ""}`
      );
      return hay.includes(q) || normalize(p.name[language]).includes(q);
    })
    .slice(0, 8);
}

/**
 * Full-width search sheet that slides down from under the header.
 */
export default function HeaderSearchPanel({ open, onOpenChange }: HeaderSearchPanelProps) {
  const { language } = useLanguage();
  const { currency, convertFromEgp } = useCurrency();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<Product[]>(() => getCachedCatalog());
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const results = useMemo(
    () => searchProducts(catalog, query, language),
    [catalog, query, language]
  );

  useEffect(() => {
    let cancelled = false;
    fetchPublicProducts({ perPage: 50 })
      .then((list) => {
        if (!cancelled) setCatalog(list);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useRealtimeDomains(["products"], () => {
    void fetchPublicProducts({ perPage: 50 })
      .then(setCatalog)
      .catch(() => undefined);
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 180);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  const goShop = () => {
    const q = query.trim();
    onOpenChange(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <>
      {/* Page dimmer — closes on outside click; sits under the header chrome */}
      <button
        type="button"
        aria-label={language === "ar" ? "إغلاق البحث" : "Close search"}
        tabIndex={open ? 0 : -1}
        className={cn(
          "fixed inset-0 z-[35] bg-secondary/25 backdrop-blur-[2px] transition-opacity duration-200 ease-out",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => onOpenChange(false)}
      />

      <div
        className={cn(
          "absolute inset-x-0 top-full z-[36] overflow-hidden",
          "transition-[visibility] duration-200",
          open ? "visible pointer-events-auto" : "invisible pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div
          ref={panelRef}
          id="header-search-panel"
          role="dialog"
          aria-modal="true"
          aria-label={language === "ar" ? "بحث المنتجات" : "Product search"}
          className={cn(
            "w-full border-b border-surface/60 bg-background/95 shadow-floating backdrop-blur-xl",
            "origin-top will-change-transform",
            "transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "-translate-y-4 opacity-0 pointer-events-none"
          )}
        >
          <div className="container mx-auto px-4 md:px-8 py-5 md:py-6">
            <div className="mx-auto w-full max-w-3xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={18}
                    className="pointer-events-none absolute top-1/2 start-4 -translate-y-1/2 text-secondary/40"
                  />
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (results[0]) {
                          onOpenChange(false);
                          router.push(`/product/${results[0].id}`);
                        } else {
                          goShop();
                        }
                      }
                    }}
                    placeholder={
                      language === "ar"
                        ? "ابحث عن منتج، علامة، أو وصف..."
                        : "Search products, brands, or descriptions..."
                    }
                    className={cn(
                      "h-12 w-full rounded-2xl border border-surface/70 bg-surface/35 ps-12 pe-12",
                      "text-[15px] font-medium text-secondary placeholder:text-secondary/40",
                      "shadow-soft transition-all duration-150",
                      "focus:border-primary/45 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/15"
                    )}
                    autoComplete="off"
                    dir="auto"
                    aria-autocomplete="list"
                    aria-controls={listId}
                  />
                  {query ? (
                    <button
                      type="button"
                      aria-label={language === "ar" ? "مسح" : "Clear"}
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className="absolute top-1/2 end-2 inline-flex -translate-y-1/2 rounded-xl p-2 text-secondary/45 transition-colors hover:bg-surface hover:text-secondary"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label={language === "ar" ? "إغلاق" : "Close"}
                  className={cn(
                    "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-surface/70",
                    "bg-background text-secondary/70 transition-colors",
                    "hover:border-primary/30 hover:bg-primary/[0.06] hover:text-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
                    "active:scale-95"
                  )}
                >
                  <X size={18} />
                </button>
              </div>

              <div id={listId} className="mt-4" role="listbox">
                {!query.trim() ? (
                  <p className="px-1 py-3 text-center text-sm text-secondary/50">
                    {language === "ar"
                      ? "ابدأ الكتابة لعرض اقتراحات فورية بالعربية أو الإنجليزية"
                      : "Start typing for instant Arabic & English suggestions"}
                  </p>
                ) : results.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-surface/70 bg-surface/20 px-4 py-8 text-center">
                    <p className="text-sm text-secondary/60 mb-3">
                      {language === "ar" ? "لا توجد نتائج مطابقة" : "No matching results"}
                    </p>
                    <button
                      type="button"
                      onClick={goShop}
                      className="text-sm font-bold text-primary hover:underline"
                    >
                      {language === "ar" ? "تصفح المتجر" : "Browse shop"}
                    </button>
                  </div>
                ) : (
                  <ul className="grid max-h-[min(52vh,26rem)] gap-1.5 overflow-y-auto overscroll-contain pe-0.5 sm:grid-cols-2">
                    {results.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/product/${product.id}`}
                          onClick={() => onOpenChange(false)}
                          className={cn(
                            "group flex items-center gap-3 rounded-2xl border border-transparent bg-background/70 p-2.5",
                            "transition-colors duration-150 hover:border-primary/20 hover:bg-primary/[0.05]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          )}
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface">
                            <Image
                              src={product.image}
                              alt={product.name[language]}
                              fill
                              sizes="56px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="min-w-0 flex-1 text-start">
                            <p className="line-clamp-1 text-sm font-bold text-secondary transition-colors group-hover:text-primary">
                              {product.name[language]}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-secondary/45">
                              {product.brand[language]}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-secondary">
                              {formatMoney(product.price, language, {
                                currency,
                                convertFromEgp,
                              })}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {query.trim() && results.length > 0 ? (
                  <div className="mt-3 flex justify-center border-t border-surface/50 pt-3">
                    <button
                      type="button"
                      onClick={goShop}
                      className="text-xs font-bold tracking-wide text-primary hover:underline"
                    >
                      {language === "ar"
                        ? "عرض كل النتائج في المتجر"
                        : "View all results in shop"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
