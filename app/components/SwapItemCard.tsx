// SwapItemCard.tsx
"use client";
import Image from "next/image";
import { ArrowRightLeft, Check, Filter } from "lucide-react";
import { useState } from "react";
import { processItemColors } from "@/app/utils/colorProcessing";

type ItemCardProps = {
  item: any;
  isSelected?: boolean;
  onPreview: () => void;
  logo: string; // brand logo
  colors?: Record<string, { name: string; hex: string }>;
};

export default function SwapItemCard({
  item,
  isSelected = false,
  onPreview,
  logo,
  colors = {},
}: ItemCardProps) {
  const availableColors = processItemColors(item, colors);

  // Limit the color dots shown
  const maxDisplayColors = 3;
  const remainingColors = availableColors.length - maxDisplayColors;

  return (
    <>
      <div
        className={`bg-white  p-4 pt-[0px] pb-[12px] relative shadow-sm border-2 border-[#F6F7F9] flex flex-col h-full hover:shadow-md transition-shadow ${
          isSelected ? "!border-[#8DBACE]" : "cursor-pointer border-[6px]"
        }`}
        onClick={!isSelected ? onPreview : undefined}
      >
        {/* Price indicator */}
        {item.priceIndicator && (
          <div className="absolute top-4 left-3">
            <span className="bg-gray-100 px-2 py-[8px] text-gray-700 font-semibold text-sm">
              {Array(item.priceIndicator.length)
                .fill(0)
                .map((_, i) => (
                  <Image
                    key={i}
                    src="/icons/dollar-bold.png"
                    alt="$"
                    width={8}
                    height={8}
                    className="inline mx-[2px] opacity-60"
                  />
                ))}
            </span>
          </div>
        )}

        {/* Main image - clicking it previews */}
        <div
          onClick={!isSelected ? onPreview : undefined}
          className="flex justify-center mb-4"
        >
          <Image
            src={item.image || "/placeholder.png"}
            alt={item.NAME || "Product image"}
            width={100}
            height={100}
            className="object-contain max-h-[100px] mt-[46px]"
          />
        </div>

        {/* Color swatches (top-right) */}
        <div className="absolute top-[46px] right-4 flex flex-col gap-1">
          {availableColors.slice(0, maxDisplayColors).map((cObj, idx) => (
            <div
              key={idx}
              className="w-4 h-4 border border-gray-200 relative"
              style={{ backgroundColor: cObj.color }}
            >
              {cObj.isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check
                    className={`h-2.5 w-2.5 ${
                      cObj.color.toLowerCase() === "#ffffff" ||
                      cObj.color.toLowerCase() === "#fff"
                        ? "text-gray-800"
                        : "text-white"
                    }`}
                    strokeWidth={3}
                  />
                </div>
              )}
            </div>
          ))}
          {remainingColors > 0 && (
            <span className="text-xs text-gray-500 mt-1">
              +{remainingColors}
            </span>
          )}
        </div>

        {/* Brand Logo & Info */}
        <div className="flex-grow flex flex-col">
          <div className="w-full mb-2">
            {logo && (
              <Image
                src={logo}
                alt={item.BRAND || "Brand logo"}
                width={60}
                height={40}
                className="object-contain max-h-[32px] w-[60px] filter grayscale"
              />
            )}
          </div>
          <div className="flex flex-col gap-1 h-[100px]">
            <p className="text-xs text-gray-400 opacity-50 mb-1">
              SKU: {item.SKU}
            </p>
            <h3 className="font-medium text-gray-900 line-clamp-1">
              {item.NAME}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {item.DESCRIPTION}
            </p>
          </div>
        </div>

        {/* Swap action or Selected checkbox */}
        <div className="mt-auto pt-3">
          {isSelected ? (
            <div className="flex w-[32px] h-[32px] ml-auto items-center justify-center bg-[#8DBACE]">
              <Check className="w-5 h-5 text-white" />
            </div>
          ) : (
            <button
              onClick={onPreview}
              className="w-full flex items-center justify-center gap-2 px-4 py-1.5 bg-[#EFEADF] text-[#2d332c] hover:bg-[#E5E0D5] transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Swap</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
