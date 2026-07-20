"use client";

import React from "react";
import { Sparkles, Sparkle, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import PriceRangeSlider from "@/components/shop/PriceRangeSlider";
import { cn } from "@/lib/cn";

export type ShopFilterState = {
  featured: boolean;
  newest: boolean;
  priceRange: [number, number];
};

type ShopFiltersSidebarProps = {
  bounds: { min: number; max: number };
  value: ShopFilterState;
  onChange: (next: ShopFilterState) => void;
  resultCount: number;
  className?: string;
};

function FilterToggle({
  active,
  title,
  description,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "w-full flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-start transition-all duration-200",
        active
          ? "border-primary/40 bg-primary/8 shadow-sm"
          : "border-surface bg-background/60 hover:border-primary/25 hover:bg-surface/50"
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
          active ? "bg-primary text-background" : "bg-surface text-secondary/60"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm font-bold", active ? "text-primary" : "text-secondary")}>
          {title}
        </span>
        <span className="block text-[12px] text-secondary/55 mt-0.5 leading-snug">{description}</span>
      </span>
      <span
        className={cn(
          "mt-1 h-4 w-4 shrink-0 rounded-full border-2 transition-colors",
          active ? "border-primary bg-primary" : "border-secondary/25 bg-transparent"
        )}
      />
    </button>
  );
}

export default function ShopFiltersSidebar({
  bounds,
  value,
  onChange,
  resultCount,
  className,
}: ShopFiltersSidebarProps) {
  const { language } = useLanguage();

  const reset = () =>
    onChange({
      featured: false,
      newest: false,
      priceRange: [bounds.min, bounds.max],
    });

  const isDirty =
    value.featured ||
    value.newest ||
    value.priceRange[0] !== bounds.min ||
    value.priceRange[1] !== bounds.max;

  return (
    <aside
      className={cn(
        "rounded-3xl border border-surface/80 bg-background/80 backdrop-blur-md p-5 md:p-6 shadow-soft sticky top-28",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-surface">
        <div>
          <h2 className="text-lg font-bold text-secondary">
            {language === "ar" ? "الفلاتر" : "Filters"}
          </h2>
          <p className="text-xs text-secondary/50 mt-1">
            {language === "ar" ? `${resultCount} نتيجة` : `${resultCount} results`}
          </p>
        </div>
        {isDirty ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary/60 hover:text-primary transition-colors"
          >
            <RotateCcw size={14} />
            {language === "ar" ? "إعادة ضبط" : "Reset"}
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-6">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-secondary/45 mb-3">
            1 · {language === "ar" ? "المميزة" : "Featured"}
          </h3>
          <FilterToggle
            active={value.featured}
            title={language === "ar" ? "المنتجات المميزة" : "Featured products"}
            description={
              language === "ar"
                ? "اعرض اختيارات بارادايس المميزة فقط"
                : "Show only Paradise featured picks"
            }
            icon={<Sparkles size={16} />}
            onClick={() => onChange({ ...value, featured: !value.featured })}
          />
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-secondary/45 mb-3">
            2 · {language === "ar" ? "الأحدث" : "Newest"}
          </h3>
          <FilterToggle
            active={value.newest}
            title={language === "ar" ? "أحدث الوصولات" : "Newest arrivals"}
            description={
              language === "ar" ? "المنتجات الجديدة فقط" : "Show new arrivals only"
            }
            icon={<Sparkle size={16} />}
            onClick={() => onChange({ ...value, newest: !value.newest })}
          />
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-secondary/45 mb-3">
            3 · {language === "ar" ? "السعر" : "Price"}
          </h3>
          <div className="rounded-2xl border border-surface bg-background/60 px-4 py-4">
            <PriceRangeSlider
              min={bounds.min}
              max={bounds.max}
              value={value.priceRange}
              onChange={(priceRange) => onChange({ ...value, priceRange })}
            />
          </div>
        </section>
      </div>
    </aside>
  );
}
