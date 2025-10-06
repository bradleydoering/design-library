"use client";

import { useState } from "react";
import Image from "next/image";

interface CustomerImageGalleryProps {
  images: string[];
  packageName: string;
}

export default function CustomerImageGallery({ images, packageName }: CustomerImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="mb-3">
      {/* Main Large Image */}
      <div className="relative w-full h-[500px] bg-gray-100 overflow-hidden">
        <Image
          src={currentImage}
          alt={`${packageName}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          priority
          unoptimized
        />
      </div>

      {/* Thumbnail Grid (only show if multiple images) */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 mt-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-video overflow-hidden transition-all ${
                index === currentIndex
                  ? "ring-2 ring-coral ring-offset-2"
                  : "ring-1 ring-gray-200 hover:ring-gray-300 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt={`${packageName} view ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 200px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
