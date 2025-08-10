/* eslint-disable @next/next/no-img-element */
// PackageConfiguration.tsx (modified to return lowercase for onSizeChange)
"use client";
import { ChevronDown, ChevronsDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/Components";
import { Package } from "@/app/types";
import PricingDisplay from "./PricingDisplay";
import { usePricingGate } from "../hooks/usePricingGate";
import { getAssetPath } from "../utils/apiPath";

type PackageConfigurationProps = {
  totalPrice: number;
  onDownload: () => void;
  selectedPackage: Package;
  selectedSize: "small" | "normal" | "large";
  onSizeChange: (size: "small" | "normal" | "large") => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedTileConfig: string;
  onTileConfigChange: (config: string) => void;
  buttonText?: string;
  showButton?: boolean;
  priceLabel?: string;
  showPrice?: boolean;
  isApplying?: boolean;
};

export default function PackageConfiguration({
  totalPrice,
  onDownload,
  selectedPackage,
  selectedSize,
  onSizeChange,
  selectedType,
  onTypeChange,
  selectedTileConfig,
  onTileConfigChange,
  buttonText = "Choose package",
  showButton = true,
  priceLabel = "Estimated price",
  showPrice = true,
  isApplying = false,
}: PackageConfigurationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isPricingUnlocked } = usePricingGate();

  const bathroomSizes = ["Small", "Normal", "Large"] as const;
  
  // Generate icon paths at runtime to ensure proper basePath detection
  const getBathroomTypes = () => [
    { label: "Bathtub", icon: getAssetPath("/icons/bathtub.png") },
    { label: "Walk-in Shower", icon: getAssetPath("/icons/walk-shower.png") },
    { label: "Tub & Shower", icon: getAssetPath("/icons/tub-shower.png") },
    { label: "Sink & Toilet", icon: getAssetPath("/icons/sink-toilet.png") },
  ];
  
  const bathroomTypes = getBathroomTypes();
  const tileConfigs = ["Half way up", "Floor to ceiling", "None"] as const;

  const handleTypeChange = (type: string) => {
    onTypeChange(type);
  };

  const handleTileConfigChange = (config: string) => {
    onTileConfigChange(config);
  };

  function ConfigContent() {
    return (
      <div className="space-y-6 bg-white">
        
        {/* Estimated Price */}
        {showPrice && (
          <div className="flex flex-col items-start justify-between">
            <div className="flex w-full justify-between">
              <span className="text-l font-medium mb-1">{priceLabel}</span>
              <PricingDisplay 
                ctaText="Unlock Instant Pricing"
                showButton={false}
                className="flex items-center gap-1 text-xl font-medium"
              >
                <div className="flex items-center gap-1 text-xl font-medium">
                  <span>$</span>
                  <span>
                    {totalPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </PricingDisplay>
            </div>
            <span className="text-gray-600 text-[0.75rem]">
              {selectedPackage.name} Package
            </span>
          </div>
        )}

        {/* Bathroom Size */}
        <div>
          <h3 className="text-[0.8rem] mb-3">What size is your bathroom?</h3>
          <div className="grid grid-cols-3 gap-1 bg-[#F6F7F9] py-3">
            {bathroomSizes.map((sizeLabel) => {
              const sizeKey = sizeLabel.toLowerCase() as
                | "small"
                | "normal"
                | "large";
              return (
                <div
                  key={sizeLabel}
                  className="flex flex-col items-center relative"
                >
                  <button onClick={() => onSizeChange(sizeKey)}>
                    <span
                      className={`py-2 px-6 border-[2px] transition-all text-sm
                      ${
                        sizeKey === selectedSize
                          ? "border-[#8DBACE] bg-white text-[#8DBACE] font-bold"
                          : "border-[#F6F7F9] hover:border-gray-300 text-gray-500"
                      }`}
                    >
                      {sizeLabel}
                    </span>
                  </button>
                  {sizeKey === selectedSize && (
                    <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-gray-500 text-sm whitespace-nowrap">
                      {sizeKey === "small" && "< 40 sqft."}
                      {sizeKey === "normal" && "40-80 sqft."}
                      {sizeKey === "large" && "> 80 sqft."}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bathroom Type */}
        <div>
          <h3 className="text-[0.8rem] mb-3 pt-6">
            What type of bathroom are you renovating?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {bathroomTypes.map(({ label, icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 w-full"
              >
                <button
                  onClick={() => handleTypeChange(label)}
                  className={`p-4 border transition-all w-full
                    ${
                      label === selectedType
                        ? "border-[#8DBACE] bg-white shadow-sm"
                        : "border-[#F6F7F9] hover:border-gray-300"
                    }`}
                >
                  <img src={icon} alt={label} className="w-8 h-auto mx-auto" />
                </button>
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tile Configuration */}
        <div>
          <h3 className="text-[0.8rem] mb-3">
            Do you want tiles in the dry areas?
          </h3>
          <div className="flex gap-2">
            {tileConfigs.map((option) => (
              <button
                key={option}
                onClick={() => handleTileConfigChange(option)}
              >
                <span
                  className={`inline-block py-2 px-4 border transition-all text-[0.7rem]
                  ${
                    option === selectedTileConfig
                      ? "border-[#8DBACE] bg-white text-[#8DBACE] font-bold"
                      : "border-[#F6F7F9] hover:border-gray-300 text-gray-400 font-bold"
                  }`}
                >
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Gate CTA Button - Hidden when pricing is unlocked */}
        {showButton && !isPricingUnlocked && (
          <PricingDisplay 
            ctaText="Unlock Instant Pricing"
            showButton={true}
            className="w-full"
          >
            <button
              onClick={onDownload}
              className="w-full font-medium text-white transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "#2D332C",
                color: "#fff",
                padding: '12px 16px',
                border: 'none',
                borderRadius: '0',
                boxShadow: 'none',
                filter: 'none',
                backdropFilter: 'none',
                textShadow: 'none',
                outline: 'none'
              }}
            >
              {buttonText}
            </button>
          </PricingDisplay>
        )}
      </div>
    );
  }

  // Desktop view
  const DesktopView = (
    <div className="hidden lg:block w-full bg-white">
      <div className="p-6">
        <ConfigContent />
      </div>
    </div>
  );

  // Mobile view
  const MobileView = (
    <div className="lg:hidden fixed bottom-2 left-0 w-full z-[10]">
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden
        ${isExpanded ? "max-h-[620px]" : "max-h-[100px]"}`}
      >
        {/* Toggle Header */}
        {!isExpanded && (
          <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm shadow-md mb-4  max-w-[450px] mx-auto">
            <div className="flex flex-col">
              <span className="text-[0.9rem] font-medium">
                {selectedPackage.name}
              </span>
              {showPrice ? (
                <div className="flex items-baseline text-[1.3rem] font-bold font-poppins">
                  <span>$</span>
                  <span>
                    {totalPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              ) : (
                <span className="text-[0.8rem] text-gray-600">
                  Configure your bathroom options
                </span>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="px-6 py-2 bg-[#2D332C] text-white hover:bg-opacity-90 transition-colors"
            >
              {showPrice ? "Continue" : "Configure"}
            </button>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pt-4 pb-3 max-w-[450px] mx-auto bg-white z-2 scale-x-[0.9] scale-y-[0.9] scale-origin-bottom">
            <button
              className="flex justify-center w-full sticky top-0 bg-white p-0"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronDown className="w-8 h-8 sm:w-8 sm:h-8  hover:-translate-y-1 transition-transform" />
            </button>
            <div className="max-h-[80vh] overflow-y-auto pb-safe">
              <ConfigContent />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {DesktopView}
      {MobileView}
    </>
  );
}
