import { useState } from "react";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { Package } from "@/app/types";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import PricingDisplay from "./PricingDisplay";

type PackageSummaryBarProps = {
  selectedPackage: Package;
  totalPrice: number;
  selectedSize: "small" | "normal" | "large";
  bathroomSqft: number;
  onCancel: () => void;
  onDownload: () => void;
};

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function PackageSummaryBar({
  selectedPackage,
  totalPrice,
  selectedSize,
  bathroomSqft,
  onCancel,
  onDownload,
}: PackageSummaryBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMobile = () => setIsExpanded((prev) => !prev);

  return (
    <div
      className={`rounded-xl shadow-sm bg-white border-[6px] border-[#f6f7f9] overflow-hidden ${poppins.className}`}
    >
      {/* 1) Mobile-only top row: just package name + price + expand/collapse */}
      <div className="flex items-center justify-between p-3 sm:hidden">
        <div className="flex flex-col">
          <h2 className="text-[sm] font-semibold">
            {selectedPackage.name} Package
          </h2>
          <PricingDisplay 
            ctaText="Unlock Instant Pricing"
            showButton={false}
            className="text-xs text-gray-500"
          >
            <span className="text-xs text-gray-500">
              Estimated price: ${totalPrice.toLocaleString()}
            </span>
          </PricingDisplay>
        </div>
        <button onClick={toggleMobile} className="p-1">
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* 2) Full desktop layout (always visible on screens >= sm) */}
      <div className="hidden sm:flex gap-0 p-4">
        {/* Left Column: Image */}
        <div className="w-56 h-[160px] rounded-md overflow-hidden flex-shrink-0">
          <Image
            src={selectedPackage.image}
            alt={selectedPackage.name}
            width={200}
            height={180}
            className="object-cover w-full h-full rounded-xl object-center"
          />
        </div>

        {/* Right Column: Content rows */}
        <div className="flex flex-col flex-grow ml-4">
          {/* Row 1: Package name and price */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[0.9rem] font-[600]">
              {selectedPackage.name} Package
            </h2>
            <PricingDisplay 
              ctaText="Unlock Instant Pricing"
              showButton={false}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-[0.8rem] font-[500] text-gray-700">
                  Estimated price
                </span>
                <span className="text-[0.8rem] font-[600]">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>
            </PricingDisplay>
          </div>

          {/* Row 2: Description */}
          <div className="mb-4">
            <p className="text-[0.7rem] text-gray-600 max-w-[400px]">
              {selectedPackage.description}
            </p>
          </div>

          {/* Row 3: Package details and actions */}
          <div className="flex justify-between items-center mt-auto">
            {/* Package details (badges) */}
            <div className="flex flex-wrap gap-1">
              {/* Size badge */}
              <div className="flex items-center bg-gray-50 px-3 py-2 rounded-full gap-2">
                <Image
                  src="/icons/summary/size.png"
                  alt="Size icon"
                  width={24}
                  height={24}
                />
                <div>
                  <div className="text-[0.7rem] font-medium">
                    {bathroomSqft} sqft.
                  </div>
                  <div className="text-[0.6rem] text-gray-500">
                    {selectedSize === "small"
                      ? "Small"
                      : selectedSize === "normal"
                      ? "Normal"
                      : "Large"}
                  </div>
                </div>
              </div>
              {/* Bathroom type */}
              <div className="flex items-center bg-gray-50 px-3 py-2 rounded-full gap-2">
                <Image
                  src="/icons/summary/type.png"
                  alt="Bathroom icon"
                  width={24}
                  height={24}
                />
                <div className="flex flex-col pr-2">
                  <div className="text-[0.7rem] font-medium">Bathroom</div>
                  <div className="text-[0.6rem] text-gray-500">
                    Sink &amp; Toilet
                  </div>
                </div>
              </div>
              {/* Dry zone */}
              <div className="flex items-center bg-gray-50 px-3 py-2 rounded-full gap-2">
                <Image
                  src="/icons/summary/dry.png"
                  alt="Dry zone icon"
                  width={24}
                  height={24}
                />
                <div className="flex flex-col pr-2">
                  <div className="text-[0.7rem] font-medium">Dry zone</div>
                  <div className="text-[0.6rem] text-gray-500">None</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-400 rounded-md hover:bg-gray-50 text-[0.6rem] font-medium"
              >
                Back to package
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3) Mobile expanded content (hidden behind expand toggle) */}
      {isExpanded && (
        <div className="block sm:hidden border-t px-4 pt-3 pb-4">
          {/* Image */}
          <div className="w-full h-40 mb-4 rounded-md overflow-hidden">
            <Image
              src={selectedPackage.image}
              alt={selectedPackage.name}
              width={400}
              height={160}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3">
            {selectedPackage.description}
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap gap-3 mb-4 justify-center">
            {/* Size badge */}
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-full gap-2">
              <Image
                src="/icons/summary/size.png"
                alt="Size icon"
                width={32}
                height={32}
              />
              <div>
                <div className="text-sm font-medium">{bathroomSqft} sqft.</div>
                <div className="text-xs text-gray-500">
                  {selectedSize === "small"
                    ? "Small"
                    : selectedSize === "normal"
                    ? "Normal"
                    : "Large"}
                </div>
              </div>
            </div>
            {/* Bathroom type */}
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-full gap-2">
              <Image
                src="/icons/summary/type.png"
                alt="Bathroom icon"
                width={32}
                height={32}
              />
              <div>
                <div className="text-sm font-medium">Bathroom</div>
                <div className="text-xs text-gray-500">Sink &amp; Toilet</div>
              </div>
            </div>
            {/* Dry zone */}
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-full gap-2">
              <Image
                src="/icons/summary/dry.png"
                alt="Dry zone icon"
                width={32}
                height={32}
              />
              <div>
                <div className="text-sm font-medium">Dry zone</div>
                <div className="text-xs text-gray-500">None</div>
              </div>
            </div>
          </div>

          {/* Price + Actions */}
          <div className="flex flex-col items-center">
            <PricingDisplay 
              ctaText="Unlock Instant Pricing"
              showButton={false}
              className="text-center mt-4 mb-4"
            >
              <div className="text-center mt-4 mb-4 flex items-center gap-2">
                <div className="text-sm text-gray-500">Estimated price</div>
                <div className="text-lg font-semibold">
                  ${totalPrice.toLocaleString()}
                </div>
              </div>
            </PricingDisplay>
            <div className="flex gap-2 max-w-[350px] mx-auto justify-center">
              <button
                onClick={onCancel}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Back to package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
