"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatMoney } from "@/lib/format/currency";

type PriceRangeSliderProps = {
  min: number;
  max: number;
  value: [number, number];
  onChange: (next: [number, number]) => void;
  className?: string;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export default function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  className,
}: PriceRangeSliderProps) {
  const { language } = useLanguage();
  const { currency, convertFromSar } = useCurrency();
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);
  const labelId = useId();

  const span = Math.max(max - min, 1);
  const leftPct = ((value[0] - min) / span) * 100;
  const rightPct = ((value[1] - min) / span) * 100;

  const setFromClientX = useCallback(
    (clientX: number, thumb: "min" | "max") => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / Math.max(rect.width, 1), 0, 1);
      const raw = Math.round(min + ratio * span);
      if (thumb === "min") {
        onChange([clamp(raw, min, value[1]), value[1]]);
      } else {
        onChange([value[0], clamp(raw, value[0], max)]);
      }
    },
    [min, max, span, value, onChange]
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => setFromClientX(e.clientX, dragging);
    const onUp = () => setDragging(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, setFromClientX]);

  const format = useMemo(
    () => (amount: number) =>
      formatMoney(amount, language, { currency, convertFromSar, decimals: 0 }),
    [language, currency, convertFromSar]
  );

  return (
    <div className={cn("select-none", className)} aria-labelledby={labelId}>
      <div className="flex items-center justify-between gap-3 mb-5 text-sm">
        <span id={labelId} className="font-bold text-secondary">
          {format(value[0])}
        </span>
        <span className="text-secondary/30">—</span>
        <span className="font-bold text-secondary">{format(value[1])}</span>
      </div>

      <div ref={trackRef} className="relative h-8 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-surface" />
        <div
          className="absolute h-1.5 rounded-full bg-primary/80"
          style={{
            left: `${leftPct}%`,
            width: `${Math.max(rightPct - leftPct, 0)}%`,
          }}
        />

        {(["min", "max"] as const).map((thumb) => {
          const pct = thumb === "min" ? leftPct : rightPct;
          return (
            <button
              key={thumb}
              type="button"
              aria-label={
                thumb === "min"
                  ? language === "ar"
                    ? "أقل سعر"
                    : "Minimum price"
                  : language === "ar"
                    ? "أعلى سعر"
                    : "Maximum price"
              }
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={thumb === "min" ? value[0] : value[1]}
              role="slider"
              onPointerDown={(e) => {
                e.preventDefault();
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                setDragging(thumb);
                setFromClientX(e.clientX, thumb);
              }}
              className={cn(
                "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-background border-2 border-primary shadow-md transition-transform duration-150",
                "hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                dragging === thumb && "scale-110"
              )}
              style={{ left: `${pct}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
