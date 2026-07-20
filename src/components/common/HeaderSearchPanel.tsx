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

type HeaderSearchPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dir: "rtl" | "ltr";
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
    .slice(0, 6);
}

export default function HeaderSearchPanel({
  open,
  onOpenChange,
  dir,
}: HeaderSearchPanelProps) {
  const { language } = useLanguage();
  const { currency, convertFromEgp } = useCurrency();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<Product[]>(() => getCachedCatalog());
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

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

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const goShop = () => {
    const q = query.trim();
    onOpenChange(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <div
      ref={rootRef}
      id={panelId}
      className={cn(
        "absolute top-[calc(100%+0.75rem)] z-50 w-[min(92vw,26rem)] transition-all duration-200 ease-out",
        dir === "rtl" ? "left-0" : "right-0",
        open
          ? "opacity-100 visible translate-y-0 pointer-events-auto"
          : "opacity-0 invisible -translate-y-1 pointer-events-none"
      )}
    >
      <div className="rounded-2xl border border-surface bg-background/95 backdrop-blur-xl shadow-floating overflow-hidden">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-surface/80">
          <Link
            href="/"
            onClick={() => onOpenChange(false)}
            className="shrink-0 text-sm font-bold tracking-widest uppercase text-secondary"
          >
            PARADISE<span className="text-primary">.</span>
          </Link>
          <div className="relative flex-1 min-w-0">
            <Search
              size={16}
              className="absolute top-1/2 -translate-y-1/2 start-3 text-secondary/40 pointer-events-none"
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
              placeholder={language === "ar" ? "ابحث عن منتج..." : "Search products..."}
              className="w-full h-11 rounded-xl border border-surface bg-surface/40 ps-10 pe-10 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all"
              autoComplete="off"
              dir="auto"
            />
            {query ? (
              <button
                type="button"
                aria-label={language === "ar" ? "مسح" : "Clear"}
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute top-1/2 -translate-y-1/2 end-2 p-1.5 rounded-lg text-secondary/45 hover:text-secondary hover:bg-surface transition-colors inline-flex"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="max-h-[min(60vh,22rem)] overflow-y-auto">
          {!query.trim() ? (
            <p className="px-4 py-6 text-sm text-secondary/50 text-center">
              {language === "ar"
                ? "ابدأ الكتابة لعرض اقتراحات فورية بالعربية أو الإنجليزية"
                : "Start typing for instant Arabic & English suggestions"}
            </p>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-secondary/60 mb-3">
                {language === "ar" ? "لا توجد نتائج" : "No results"}
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
            <ul className="p-2">
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/product/${product.id}`}
                    prefetch
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-surface/70 transition-colors group"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface">
                      <Image
                        src={product.image}
                        alt={product.name[language]}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-start">
                      <p className="text-sm font-bold text-secondary group-hover:text-primary transition-colors line-clamp-1">
                        {product.name[language]}
                      </p>
                      <p className="text-[11px] text-secondary/45 mt-0.5 line-clamp-1">
                        {product.brand[language]}
                      </p>
                      <p className="text-sm font-semibold text-secondary mt-1">
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
        </div>

        {query.trim() && results.length > 0 ? (
          <div className="border-t border-surface/80 px-3 py-2.5">
            <button
              type="button"
              onClick={goShop}
              className="w-full text-center text-xs font-bold text-primary hover:underline py-1"
            >
              {language === "ar" ? "عرض كل النتائج في المتجر" : "View all results in shop"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
