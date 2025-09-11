import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  initialIndex?: number;
  onSelect?: (index: number) => void;
  className?: string;
}

export default function ImageCarousel({
  images,
  initialIndex = 0,
  onSelect,
  className = "",
}: ImageCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const touchStartXRef = useRef<number | null>(null);
  const mountedTimeRef = useRef(Date.now());

  const handleSelect = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      if (onSelect) {
        onSelect(index);
      }
    },
    [onSelect]
  );

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchStartXRef.current - touchEndX;
    const threshold = 50;
    if (Math.abs(distance) > threshold) {
      if (distance > 0 && selectedIndex < images.length - 1) {
        handleSelect(selectedIndex + 1);
      } else if (distance < 0 && selectedIndex > 0) {
        handleSelect(selectedIndex - 1);
      }
    }
    touchStartXRef.current = null;
  };

  // Update selectedIndex when initialIndex changes (from parent)
  useEffect(() => {
    setSelectedIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const currentMountTime = mountedTimeRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if this is the most recently mounted carousel
      const allCarousels = document.querySelectorAll("[data-carousel-mount]");
      const latestMountTime = Math.max(
        ...Array.from(allCarousels).map((el) =>
          parseInt(el.getAttribute("data-carousel-mount") || "0")
        )
      );

      if (currentMountTime !== latestMountTime) return;

      if (e.key === "ArrowLeft" && selectedIndex > 0) {
        handleSelect(selectedIndex - 1);
      } else if (e.key === "ArrowRight" && selectedIndex < images.length - 1) {
        handleSelect(selectedIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, images.length, handleSelect]);

  return (
    <div
      data-carousel-mount={mountedTimeRef.current}
      className={`relative w-full h-[500px] mb-4 flex items-center justify-center ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {images.length > 0 ? (
        <Image
          src={images[selectedIndex]}
          alt={`Image ${selectedIndex + 1}`}
          fill
          sizes="100vw"
          className={`object-contain w-full h-full ${className}`}
          onError={(e) => {
            // If image fails to load, show placeholder
            e.currentTarget.src = '/item-missing.svg';
          }}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📷</div>
            <p>No images available</p>
          </div>
        </div>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/4 flex items-center gap-[10px]">
          {images.map((_, index) => (
            <div
              key={index}
              onClick={() => handleSelect(index)}
              className="relative w-2 h-2 cursor-pointer"
            >
              <div className="absolute w-2 h-2 rounded-full bg-gray-200" />
            </div>
          ))}
          {images.length > 1 && (
            <div
              className="absolute w-5 h-2 rounded-full bg-gray-400 transition-all duration-500 ease-in-out"
              style={{
                left: `calc(${selectedIndex} * 20px)`,
                transform: "translateX(-6px)",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
