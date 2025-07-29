/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, SetStateAction } from "react";
import { Package } from "@/app/types";
import { mapItemTypeToMaterialKey, BATHROOM_SIZES_SQFT_MAP } from "@/lib/utils";
import PackageSummaryBar from "./PackageSummaryBar";
import SwapItemCard from "./SwapItemCard";
import FilterModal from "./FilterModal";
import {
  Search,
  ListFilter,
  X,
  DollarSign,
  PaintBucket,
  Tag,
  LayoutGrid,
  Image,
  Filter,
} from "lucide-react";
import { calculatePriceBracket } from "@/app/utils/calculatePriceBracket";

type SwapModeViewProps = {
  itemType: string | null;
  customizations: Record<string, any>;
  materials: any;
  selectedPackage: Package;
  totalPrice: number;
  selectedSize: "small" | "normal" | "large";
  onSelect: (sku: string) => void;
  onCancel: () => void;
  onDownload: () => void;
  onOpenDetail: (item: any) => void;
};

type FilterChip = {
  type: "price" | "color" | "brand" | "type";
  value: string;
  display: React.ReactNode;
};

export default function SwapModeView({
  itemType,
  customizations,
  materials,
  selectedPackage,
  totalPrice,
  selectedSize,
  onSelect,
  onCancel,
  onDownload,
  onOpenDetail,
}: SwapModeViewProps) {
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    brands: new Set<string>(),
    colors: new Set<string>(),
    priceRange: "",
    types: new Set<string>(),
  });
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  useEffect(() => {
    if (!itemType) return;
    const matKey = mapItemTypeToMaterialKey(itemType);
    setAvailableItems(materials?.[matKey] || []);
  }, [itemType, materials]);

  useEffect(() => {
    if (!itemType || availableItems.length === 0) return;

    // 1) Build each item: isSelected, image, and priceIndicator
    let items = availableItems.map((opt: any) => {
      const isSelected =
        customizations[itemType]?.SKU?.toLowerCase() === opt.SKU?.toLowerCase();
      const image =
        opt.IMAGE_MAIN ||
        opt.IMAGE_01 ||
        opt.IMAGE_02 ||
        opt.IMAGE_03 ||
        "/item-missing.svg";

      const bracket = calculatePriceBracket(
        opt.PRICE || opt.PRICE_SQF,
        availableItems
      );

      return {
        ...opt,
        isSelected,
        image,
        priceIndicator: bracket,
      };
    });

    // Find selected item before applying filters
    const selectedItem = items.find((it: any) => it.isSelected);

    // 2) brand/color/type/price filters
    items = items.filter((it: any) => {
      if (it.isSelected) return true; // Always keep selected item

      // brand
      if (
        currentFilters.brands.size &&
        !currentFilters.brands.has(it.BRAND || "")
      ) {
        return false;
      }
      // color
      if (currentFilters.colors.size) {
        for (const cKey of Array.from(currentFilters.colors)) {
          if (!it[cKey]) return false;
        }
      }
      // type
      if (
        currentFilters.types.size &&
        !currentFilters.types.has(it.TYPE || "")
      ) {
        return false;
      }
      // price range
      if (currentFilters.priceRange) {
        const itemBracket = calculatePriceBracket(
          it.PRICE || it.PRICE_SQF,
          availableItems
        );
        if (itemBracket !== currentFilters.priceRange) {
          return false;
        }
      }
      return true;
    });

    // 3) Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      items = items.filter((it: any) => {
        if (it.isSelected) return true; // Always keep selected item
        return (
          it.NAME?.toLowerCase().includes(lower) ||
          it.BRAND?.toLowerCase().includes(lower) ||
          it.DESCRIPTION?.toLowerCase().includes(lower) ||
          it.SKU?.toLowerCase().includes(lower)
        );
      });
    }

    // 4) Keep selected item at top
    items.sort((a: any, b: any) => (a.isSelected ? -1 : b.isSelected ? 1 : 0));
    setFilteredItems(items);
  }, [itemType, availableItems, customizations, currentFilters, searchTerm]);

  // brand logos + color map
  const { logos: logosArray, colors: colorsArray } = materials || {};
  const logos =
    logosArray?.reduce((acc: Record<string, string>, logo: any) => {
      acc[logo.BRAND] = logo.LOGO;
      return acc;
    }, {}) || {};
  const colorMap =
    colorsArray?.reduce(
      (acc: Record<string, { name: string; hex: string }>, c: any) => {
        acc[`COLOR_${c.CODE}`] = { name: c.NAME, hex: c.HEX };
        return acc;
      },
      {}
    ) || {};

  function getTotalFilterCount() {
    const { brands, colors, priceRange, types } = currentFilters;
    return brands.size + colors.size + types.size + (priceRange ? 1 : 0);
  }

  const removeFilter = (
    type: "brand" | "color" | "price" | "type",
    value?: string
  ) => {
    const newFilters = { ...currentFilters };

    if (type === "price") {
      newFilters.priceRange = "";
    } else {
      const key = `${type}s` as "brands" | "colors" | "types";
      if (value) {
        // Remove specific value
        const newSet = new Set(newFilters[key]);
        newSet.delete(value);
        newFilters[key] = newSet;
      } else {
        // Clear all values of this type
        newFilters[key] = new Set();
      }
    }

    setCurrentFilters(newFilters);
  };

  const getFilterChips = (): FilterChip[] => {
    const chips: FilterChip[] = [];

    if (currentFilters.priceRange) {
      chips.push({
        type: "price",
        value: currentFilters.priceRange,
        display: currentFilters.priceRange,
      });
    }

    currentFilters.colors.forEach((colorKey) => {
      chips.push({
        type: "color",
        value: colorKey,
        display: (
          <>
            <span
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: colorMap[colorKey]?.hex }}
            />
            {colorMap[colorKey]?.name || colorKey}
          </>
        ),
      });
    });

    currentFilters.brands.forEach((brand) => {
      chips.push({
        type: "brand",
        value: brand,
        display: logos[brand] ? (
          <img
            src={logos[brand]}
            alt={brand}
            width={100}
            height={100}
            className="h-4 w-auto object-contain filter grayscale"
          />
        ) : (
          <>
            <Tag className="w-4 h-4" />
            {brand}
          </>
        ),
      });
    });

    currentFilters.types.forEach((type) => {
      chips.push({
        type: "type",
        value: type,
        display: (
          <>
            <LayoutGrid className="w-4 h-4" />
            {type}
          </>
        ),
      });
    });

    return chips;
  };

  const formattedType = itemType
    ?.replace(/([A-Z])/g, " $1")
    .replace(/^./, (str: string) => str.toUpperCase())
    .trim();

  return (
    <div className="w-[calc(100%-32px)] max-w-[1000px] mx-auto px-0 pb-12">
      <PackageSummaryBar
        selectedPackage={selectedPackage}
        totalPrice={totalPrice}
        selectedSize={selectedSize}
        bathroomSqft={BATHROOM_SIZES_SQFT_MAP[selectedSize]}
        onCancel={onCancel}
        onDownload={onDownload}
      />

      <div className="flex items-center gap-2 justify-between items-center mt-10 mb-2">
        <h2 className="text-3xl font-regular ">Change {formattedType}</h2>
        <p className="text-gray-300 text-[1rem] font-regular">
          {`${filteredItems.length} item${
            filteredItems.length === 1 ? "" : "s"
          } available`}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex items-start gap-2 mb-10 flex-wrap">
        <div className="relative w-[200px] focus-within:w-[300px] transition-all duration-200 shrink-0">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 text-sm border bg-[#F6F7F9] border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        {/* Active Filters - Now in a scrollable container */}
        <div className="flex-1 relative">
          <div className="hidden md:flex flex-wrap gap-2 justify-end">
            {getFilterChips().map((chip, index) => (
              <button
                key={`${chip.type}-${chip.value}-${index}`}
                onClick={() => removeFilter(chip.type, chip.value)}
                className="h-9 px-3 bg-gray-100 rounded-lg border border-[#D0D5DD] flex items-center gap-2 text-sm hover:bg-gray-200 shrink-0"
              >
                {chip.display}
                <X className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>

          {/* Mobile Overflow Menu */}
          <div className="md:hidden flex ">
            {getFilterChips().length > 0 && (
              <button
                onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                className="w-30 h-9 px-3 bg-gray-100 rounded-lg border border-[#D0D5DD] flex items-center gap-2 text-xs hover:bg-gray-200"
              >
                <Filter className="w-4 h-4" />
                <span>{getFilterChips().length} active</span>
              </button>
            )}

            {/* Overflow Menu Popup */}
            {showOverflowMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2 space-y-2">
                  {getFilterChips().map((chip, index) => (
                    <button
                      key={`${chip.type}-${chip.value}-${index}`}
                      onClick={() => {
                        removeFilter(chip.type, chip.value);
                        setShowOverflowMenu(false);
                      }}
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg border border-[#D0D5DD] flex items-center gap-2 text-sm hover:bg-gray-200"
                    >
                      {chip.display}
                      <X className="w-4 h-4 text-gray-300 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowFilterModal(true)}
          className="px-8 py-2 border bg-[#F6F7F9] border-[#E5E7EB] rounded-md hover:bg-gray-50 transition flex items-center gap-2 shrink-0"
        >
          <ListFilter className="w-5 h-5 text-gray-500" />
          <span className="text-sm">
            Filters
            {getTotalFilterCount() > 0 ? ` (${getTotalFilterCount()})` : ""}
          </span>
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <SwapItemCard
            key={item.SKU}
            item={item}
            isSelected={item.isSelected}
            onPreview={() => onOpenDetail(item)}
            logo={logos[item.BRAND]}
            colors={colorMap}
          />
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            {searchTerm ? (
              <p>No items match your search. Try clearing your text.</p>
            ) : (
              <p>
                No items match your filter criteria. Reset filters to see more.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          items={availableItems}
          logos={logos}
          colors={colorMap}
          initialFilters={currentFilters}
          onClose={() => setShowFilterModal(false)}
          onApply={(newFilters, filteredArray) => {
            setCurrentFilters(newFilters);
            setFilteredItems(filteredArray);
            setShowFilterModal(false);
          }}
        />
      )}
    </div>
  );
}
