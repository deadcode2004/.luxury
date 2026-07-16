"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgSize, setBgSize] = useState({ w: 0, h: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const LENS_SIZE = 240;
  const LENS_RADIUS = LENS_SIZE / 2;
  const ZOOM_SCALE = 2.5;

  if (!images || images.length === 0) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    setLensPos({ 
      x: e.clientX - left, 
      y: e.clientY - top 
    });
    setBgSize({ w: width, h: height });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-6 sticky top-32">
      {/* Thumbnails (Vertical on desktop, horizontal on mobile) */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible no-scrollbar w-full md:w-24 shrink-0">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(img)}
              className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                activeImage === img ? "border-primary opacity-100" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Container */}
      <div 
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden bg-gray-50 group cursor-none flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src={activeImage}
          alt="Product Main Image"
          width={1000}
          height={1000}
          className="w-full h-auto object-contain"
          priority
        />
        
        {/* Modern Floating Magnifying Glass Lens */}
        {isZoomed && (
          <div 
            className="absolute z-10 pointer-events-none rounded-full border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.3)] overflow-hidden flex items-center justify-center transition-opacity duration-200"
            style={{
              width: `${LENS_SIZE}px`,
              height: `${LENS_SIZE}px`,
              left: `${lensPos.x - LENS_RADIUS}px`,
              top: `${lensPos.y - LENS_RADIUS}px`,
            }}
          >
            {/* The zoomed image inside the lens */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${activeImage})`,
                backgroundSize: `${bgSize.w * ZOOM_SCALE}px ${bgSize.h * ZOOM_SCALE}px`,
                backgroundPosition: `-${lensPos.x * ZOOM_SCALE - LENS_RADIUS}px -${lensPos.y * ZOOM_SCALE - LENS_RADIUS}px`,
                backgroundRepeat: 'no-repeat',
              }}
            />
            {/* Professional Watermark / Logo on the lens */}
            <div className="absolute bottom-5 left-0 right-0 text-center z-20">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/90 drop-shadow-md">
                PARADISE
              </span>
            </div>
            {/* Inner ring for aesthetic */}
            <div className="absolute inset-2 rounded-full border border-white/10 pointer-events-none"></div>
          </div>
        )}
      </div>
    </div>
  );
}
