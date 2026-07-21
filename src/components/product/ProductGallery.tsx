"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

interface ProductGalleryProps {
  images: string[];
  productId?: string;
}

export default function ProductGallery({ images, productId }: ProductGalleryProps) {
  const { language } = useLanguage();
  const { has, toggle } = useWishlist();
  const [activeImage, setActiveImage] = useState(images[0]);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgSize, setBgSize] = useState({ w: 0, h: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [lensSize, setLensSize] = useState(240);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchActiveRef = useRef(false);

  const lensRadius = lensSize / 2;
  const ZOOM_SCALE = 2.5;
  const wished = productId ? has(productId) : false;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setLensSize(mq.matches ? 168 : 240);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setActiveImage(images[0]);
  }, [images]);

  const updateLens = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - left, 0), width);
    const y = Math.min(Math.max(clientY - top, 0), height);
    setLensPos({ x, y });
    setBgSize({ w: width, h: height });
  }, []);

  // Non-passive touch listeners so we can prevent page scroll while dragging the lens.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-wishlist-btn]")) return;
      if (e.touches.length !== 1) return;
      touchActiveRef.current = true;
      const touch = e.touches[0];
      updateLens(touch.clientX, touch.clientY);
      setIsZoomed(true);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchActiveRef.current || e.touches.length !== 1) return;
      e.preventDefault();
      const touch = e.touches[0];
      updateLens(touch.clientX, touch.clientY);
    };

    const onTouchEnd = () => {
      touchActiveRef.current = false;
      setIsZoomed(false);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [updateLens, images.length]);

  if (!images || images.length === 0) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (touchActiveRef.current) return;
    updateLens(e.clientX, e.clientY);
  };

  const onWish = async () => {
    if (!productId || wishLoading) return;
    setWishLoading(true);
    try {
      await toggle(productId);
    } finally {
      setWishLoading(false);
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-6 sticky top-32">
      {images.length > 1 && (
        <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible no-scrollbar w-full md:w-24 shrink-0">
          {images.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveImage(img)}
              className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                activeImage === img
                  ? "border-primary opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="96px"
                quality={75}
                loading="lazy"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden bg-gray-50 group md:cursor-none flex items-center justify-center touch-none select-none"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          if (!touchActiveRef.current) setIsZoomed(true);
        }}
        onMouseLeave={() => {
          if (!touchActiveRef.current) setIsZoomed(false);
        }}
      >
        <Image
          src={activeImage}
          alt="Product Main Image"
          width={1000}
          height={1000}
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={85}
          className="w-full h-auto object-contain pointer-events-none"
          priority
          draggable={false}
        />

        {productId ? (
          <button
            type="button"
            data-wishlist-btn
            disabled={wishLoading}
            onClick={(e) => {
              e.stopPropagation();
              void onWish();
            }}
            onMouseEnter={(e) => e.stopPropagation()}
            className={cn(
              "lg:hidden absolute top-3 end-3 z-20 w-11 h-11 rounded-full flex items-center justify-center",
              "backdrop-blur-md border border-white/40 shadow-soft cursor-pointer touch-auto",
              "transition-all active:scale-95 disabled:opacity-50",
              wished
                ? "bg-wishlist/20 text-wishlist"
                : "bg-background/85 text-secondary/70 hover:text-wishlist"
            )}
            aria-label={
              wished
                ? language === "ar"
                  ? "إزالة من المفضلة"
                  : "Remove from wishlist"
                : language === "ar"
                  ? "إضافة للمفضلة"
                  : "Add to wishlist"
            }
          >
            <Heart size={20} fill={wished ? "currentColor" : "none"} />
          </button>
        ) : null}

        {isZoomed ? (
          <div
            className="absolute z-10 pointer-events-none rounded-full border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.3)] overflow-hidden flex items-center justify-center transition-opacity duration-200"
            style={{
              width: `${lensSize}px`,
              height: `${lensSize}px`,
              left: `${lensPos.x - lensRadius}px`,
              top: `${lensPos.y - lensRadius}px`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${activeImage})`,
                backgroundSize: `${bgSize.w * ZOOM_SCALE}px ${bgSize.h * ZOOM_SCALE}px`,
                backgroundPosition: `-${lensPos.x * ZOOM_SCALE - lensRadius}px -${lensPos.y * ZOOM_SCALE - lensRadius}px`,
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="absolute bottom-5 left-0 right-0 text-center z-20">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/90 drop-shadow-md">
                PARADISE
              </span>
            </div>
            <div className="absolute inset-2 rounded-full border border-white/10 pointer-events-none" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
