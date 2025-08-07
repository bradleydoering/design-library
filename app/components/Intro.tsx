"use client";
import { Button, Card } from "../Components";
import { ChevronRight } from "lucide-react";
import { Package } from "../types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PackageConfiguration from "./PackageConfiguration";
import { calculatePackagePrice as calculatePackagePriceUtil } from "@/lib/utils";
import { useEffect, useState } from "react";

type IntroProps = {
  packages: Package[];
  materials: Record<string, number>;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortDirection: "asc" | "desc" | "default";
  setSortDirection: (dir: "asc" | "desc" | "default") => void;
  onPackageSelect: (pkg: Package) => void;
  bathroomConfig: {
    size: "small" | "normal" | "large";
    type: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet";
    wallTileCoverage: "None" | "Half way up" | "Floor to ceiling";
  };
  setBathroomConfig: (config: {
    size: "small" | "normal" | "large";
    type: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet";
    wallTileCoverage: "None" | "Half way up" | "Floor to ceiling";
  }) => void;
  isApplying: boolean;
};

export default function Intro({
  packages,
  materials,
  selectedCategory,
  setSelectedCategory,
  sortDirection,
  setSortDirection,
  onPackageSelect,
  bathroomConfig,
  setBathroomConfig,
  isApplying,
}: IntroProps) {
  const router = useRouter();
  
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Calculate package price with specific configuration
  const calculatePackagePriceWithConfig = (pkg: Package, config: typeof bathroomConfig) => {
    // Create a modified package with the configuration
    const modifiedPkg = {
      ...pkg,
      UNIVERSAL_TOGGLES: {
        bathroomType: config.type,
        wallTileCoverage: config.wallTileCoverage,
        bathroomSize: config.size,
      }
    };
    return calculatePackagePriceUtil(modifiedPkg, materials, config.size);
  };

  // Get the lowest price across different bathroom configurations for "Starting at" display
  const getLowestPrice = (pkg: Package) => {
    const configs = [
      { type: "Bathtub" as const, size: "small" as const, wallTileCoverage: "None" as const },
      { type: "Walk-in Shower" as const, size: "small" as const, wallTileCoverage: "None" as const },
      { type: "Sink & Toilet" as const, size: "small" as const, wallTileCoverage: "None" as const },
    ];
    
    const prices = configs.map(config => calculatePackagePriceWithConfig(pkg, config));
    return Math.min(...prices);
  };

  // Dynamically generate categories from packages (capitalize each category)
  const CATEGORIES = ["All"].concat(
    Array.from(
      new Set(
        packages.map(
          (pkg) =>
            pkg.category.charAt(0).toUpperCase() +
            pkg.category.slice(1).toLowerCase()
        )
      )
    )
  );

  return (
    <div className="min-h-screen pt-24 pb-20 relative">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12 pt-4">
        {/* Header Section - Full Width */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-5xl font-space font-bold text-navy">
            Bathroom Design Ideas
          </h1>
          <h2 className="text-2xl font-space font-medium text-gray-700">
            Choose your ready to go bathroom package
          </h2>
        </div>
        
        {/* Filters Section - Style and Sort together */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-8">
          {/* Style Filters */}
          <div className="flex flex-col items-start gap-3">
            <h3 className="text-lg font-medium text-gray-900">Sort by Style</h3>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-w-[100px] font-inter font-medium ${
                    selectedCategory === cat
                      ? "btn-coral text-white border-none"
                      : "bg-white text-navy hover:bg-gray-50 border-none"
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex flex-col items-start gap-3">
            <h3 className="text-lg font-medium text-gray-900">Sort</h3>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as "asc" | "desc" | "default")}
              className="px-4 py-2 border border-gray-300 bg-white text-navy font-inter font-medium min-w-[200px] focus:ring-2 focus:ring-[#FF693E] focus:border-[#FF693E] transition-colors duration-200"
              style={{
                borderRadius: '0px',
              }}
            >
              <option value="default">Recommended</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Main Content Area - Two column layout */}
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:items-start lg:min-h-screen">
          {/* Packages Column */}
          <main className="space-y-8 mb-12">
            {/* Packages Grid */}
            <div id="packages-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 w-full gap-6 md:gap-8 justify-items-stretch max-w-none">
            {packages
              .filter(
                (p) =>
                  selectedCategory === "All" || p.category === selectedCategory
              )
              .sort((a, b) => {
                if (sortDirection === "default") return 0;
                const priceA = calculatePackagePriceWithConfig(a, bathroomConfig);
                const priceB = calculatePackagePriceWithConfig(b, bathroomConfig);
                return sortDirection === "asc"
                  ? priceA - priceB
                  : priceB - priceA;
              })
              .map((p) => {
                const price = calculatePackagePriceWithConfig(p, bathroomConfig);
                return (
                  <Card
                    key={p.id}
                    className="w-full relative overflow-hidden shadow-[0px_1px_4px_1px_rgba(0,0,0,0.05)] border-none bg-white cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] group"
                    onClick={() => router.push(`/packages/${generateSlug(p.name)}`)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === "Enter" && router.push(`/packages/${generateSlug(p.name)}`)}
                  >
                    <Image
                      src={p.image}
                      alt={p.name}
                      className="w-full h-[250px] md:h-[200px] lg:h-[220px] object-cover object-center"
                      width={300}
                      height={250}
                      onError={(e) => {
                        // If .jpg fails, try .png
                        const currentSrc = e.currentTarget.src;
                        if (currentSrc.endsWith('.jpg')) {
                          console.log('JPG failed, trying PNG for:', currentSrc);
                          e.currentTarget.src = currentSrc.replace('.jpg', '.png');
                        } else {
                          console.log('Image loading failed for:', currentSrc);
                        }
                      }}
                    />
                    <div className="p-3 pb-2 pt-3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[0.95rem] font-[500] text-gray-900">
                          {p.name}
                        </h3>
                        <div className="bg-[#EFEADF] px-3 py-1 text-[0.75rem] font-medium ml-2">
                          {p.category}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col items-start">
                          <span className="text-[0.8rem] text-gray-500 mb-0">
                            Current price
                          </span>
                          <span className="text-[1.2rem] font-[500] text-gray-900">
                            ${" "}
                            {price.toLocaleString("en-US", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <ChevronRight
                            className="h-5 w-5 text-gray-800 transform transition-all duration-300 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                            strokeWidth={3}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </main>

          {/* Sidebar - Sticky positioning */}
          <aside className="lg:block hidden sticky top-32 self-start max-h-[calc(100vh-128px)] overflow-y-auto">
            <PackageConfiguration
              totalPrice={0}
              selectedPackage={{ name: "Browse Packages" } as Package}
              selectedSize={bathroomConfig.size}
              onSizeChange={(size) => setBathroomConfig({ ...bathroomConfig, size })}
              selectedType={bathroomConfig.type}
              onTypeChange={(type) => setBathroomConfig({ ...bathroomConfig, type: type as any })}
              selectedTileConfig={bathroomConfig.wallTileCoverage}
              onTileConfigChange={(config) => setBathroomConfig({ ...bathroomConfig, wallTileCoverage: config as any })}
              onDownload={() => {}}
              showButton={false}
              showPrice={false}
              isApplying={isApplying}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
