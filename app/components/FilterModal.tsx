"use client";
import { useState, useMemo } from "react";
import { X, DollarSign, PaintBucket, Tag, LayoutGrid } from "lucide-react";
import Image from "next/image";
import { calculatePriceBracket } from "@/app/utils/calculatePriceBracket";

type FilterModalProps = {
  items: any[];
  onClose: () => void;
  onApply: (
    newFilters: {
      brands: Set<string>;
      colors: Set<string>;
      priceRange: string;
      types: Set<string>;
    },
    filtered: any[]
  ) => void;
  logos: Record<string, string>;
  colors: Record<string, { name: string; hex: string }>;
  initialFilters: {
    brands: Set<string>;
    colors: Set<string>;
    priceRange: string;
    types: Set<string>;
  };
};

export default function FilterModal({
  items,
  onClose,
  onApply,
  logos,
  colors,
  initialFilters,
}: FilterModalProps) {
  const [selectedBrands, setSelectedBrands] = useState(
    new Set(initialFilters.brands)
  );
  const [selectedColorKeys, setSelectedColorKeys] = useState(
    new Set(initialFilters.colors)
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState(
    initialFilters.priceRange
  );
  const [selectedTypes, setSelectedTypes] = useState(
    new Set(initialFilters.types)
  );

  // Unique brand values
  const brandArray = useMemo(() => {
    const s = new Set<string>();
    items.forEach((it) => {
      if (it.BRAND) s.add(it.BRAND);
    });
    return Array.from(s);
  }, [items]);

  // Unique color keys
  const colorArray = useMemo(() => {
    const s = new Set<string>();
    items.forEach((it) => {
      Object.keys(it).forEach((key) => {
        // if an item has a property "COLOR_XX" that is a non-empty string, treat it as color
        if (key.startsWith("COLOR_")) {
          const val = it[key];
          if (typeof val === "string" && val.trim().length > 0) {
            s.add(key);
          }
        }
      });
    });
    return Array.from(s);
  }, [items]);

  // Unique type values
  const typeArray = useMemo(() => {
    const s = new Set<string>();
    items.forEach((it) => {
      if (it.TYPE) s.add(it.TYPE);
    });
    return Array.from(s);
  }, [items]);

  // Show price brackets that have items
  const priceSymbols = useMemo(() => {
    return ["$", "$$", "$$$"].filter((sym) => {
      return items.some((it) => {
        const calculatedBracket = calculatePriceBracket(
          it.PRICE || it.PRICE_SQF,
          items
        );
        return calculatedBracket === sym;
      });
    });
  }, [items]);

  // Toggling logic
  function toggleBrand(brand: string) {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) {
        next.delete(brand);
      } else {
        next.add(brand);
      }
      return next;
    });
  }
  function toggleColor(cKey: string) {
    setSelectedColorKeys((prev) => {
      const next = new Set(prev);
      if (next.has(cKey)) {
        next.delete(cKey);
      } else {
        next.add(cKey);
      }
      return next;
    });
  }
  function toggleType(t: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) {
        next.delete(t);
      } else {
        next.add(t);
      }
      return next;
    });
  }

  function clearAll() {
    setSelectedBrands(new Set());
    setSelectedColorKeys(new Set());
    setSelectedTypes(new Set());
    setSelectedPriceRange("");
  }

  function handleApply() {
    let filtered = [...items];

    // brand filter
    if (selectedBrands.size) {
      filtered = filtered.filter((it) => selectedBrands.has(it.BRAND));
    }

    // color filter
    if (selectedColorKeys.size) {
      filtered = filtered.filter((it) => {
        for (const c of Array.from(selectedColorKeys)) {
          const val = it[c];
          if (!val || !val.trim()) {
            return false;
          }
        }
        return true;
      });
    }

    // type filter
    if (selectedTypes.size) {
      filtered = filtered.filter((it) => selectedTypes.has(it.TYPE));
    }

    // Price bracket filter
    if (selectedPriceRange) {
      filtered = filtered.filter((it) => {
        const calculatedBracket = calculatePriceBracket(
          it.PRICE || it.PRICE_SQF,
          items
        );
        return calculatedBracket === selectedPriceRange;
      });
    }

    const newFilters = {
      brands: selectedBrands,
      colors: selectedColorKeys,
      priceRange: selectedPriceRange,
      types: selectedTypes,
    };
    onApply(newFilters, filtered);
  }

  // UI helpers
  function getTotalFilterCount() {
    return (
      selectedBrands.size +
      selectedColorKeys.size +
      selectedTypes.size +
      (selectedPriceRange ? 1 : 0)
    );
  }
  function isBrandSelected(b: string) {
    return selectedBrands.has(b);
  }
  function isColorSelected(cKey: string) {
    return selectedColorKeys.has(cKey);
  }
  function isTypeSelected(t: string) {
    return selectedTypes.has(t);
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Filters{getTotalFilterCount() ? ` (${getTotalFilterCount()})` : ""}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Price Range */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <h3 className="text-md font-medium">Price</h3>
            </div>
            <div className="flex gap-3">
              {priceSymbols.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setSelectedPriceRange(symbol)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    selectedPriceRange === symbol
                      ? "bg-gray-200 border-gray-300"
                      : "bg-gray-50 hover:bg-gray-100 border"
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          {colorArray.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PaintBucket className="w-5 h-5 text-gray-500" />
                <h3 className="text-md font-medium">Colour</h3>
              </div>
              <div className="flex flex-wrap gap-2 max-h-[88px] overflow-y-auto">
                {colorArray.map((cKey) => {
                  const cObj = colors[cKey];
                  if (!cObj) return null;
                  const active = isColorSelected(cKey);
                  return (
                    <button
                      key={cKey}
                      onClick={() => toggleColor(cKey)}
                      className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-colors ${
                        active
                          ? "bg-gray-200 border-gray-300"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: cObj.hex }}
                      />
                      <span className="text-sm">{cObj.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Brand */}
          {brandArray.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-gray-500" />
                <h3 className="text-md font-medium">Brand</h3>
              </div>
              <div className="flex flex-wrap gap-2 max-h-[88px] overflow-y-auto">
                {brandArray.map((brand) => {
                  const active = isBrandSelected(brand);
                  const logoUrl = logos[brand];
                  return (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-colors ${
                        active
                          ? "bg-gray-200 border-gray-300"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt={brand}
                          width={100}
                          height={100}
                          className="h-4 w-auto object-contain filter grayscale"
                        />
                      ) : (
                        <span className="text-sm font-medium">{brand}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Type */}
          {typeArray.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LayoutGrid className="w-5 h-5 text-gray-500" />
                <h3 className="text-md font-medium">Type</h3>
              </div>
              <div className="flex flex-wrap gap-2 max-h-[88px] overflow-y-auto">
                {typeArray.map((type) => {
                  const active = isTypeSelected(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-colors ${
                        active
                          ? "bg-gray-200 border-gray-300"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-sm">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={clearAll}
              className="flex-1 px-4 py-3 border rounded-full hover:bg-gray-50"
            >
              Clear filters
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-3 bg-[#2d332c] text-white rounded-full hover:bg-[#1f231f]"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
