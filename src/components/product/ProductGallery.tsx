"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`
    });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-6 sticky top-32">
      {/* Thumbnails (Vertical on desktop, horizontal on mobile) */}
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

      {/* Main Image */}
      <div 
        className="relative w-full aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 group cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => {
          setIsZoomed(false);
          // Optional: reset origin when leaving
          setTimeout(() => setZoomStyle({}), 300);
        }}
      >
        <Image
          src={activeImage}
          alt="Product Main Image"
          fill
          className={`object-cover transition-transform duration-300 ease-out ${isZoomed ? "scale-[1.8]" : "scale-100"}`}
          style={isZoomed ? zoomStyle : {}}
          priority
        />
      </div>
    </div>
  );
}
