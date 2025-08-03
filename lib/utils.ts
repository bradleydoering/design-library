import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BATHROOM_SIZES_SQFT = {
  small: {
    floorTile: 40,
    wallTile: 100,
    showerFloorTile: 9,
    accentTile: 15,
  },
  normal: {
    floorTile: 60,
    wallTile: 120,
    showerFloorTile: 9,
    accentTile: 20,
  },
  large: {
    floorTile: 80,
    wallTile: 150,
    showerFloorTile: 9,
    accentTile: 25,
  },
};

export const BATHROOM_SIZES_SQFT_MAP = {
  small: 40,
  normal: 60,
  large: 100,
};

export function mapItemTypeToMaterialKey(itemType: string): string {
  switch (itemType) {
    case "floorTile":
    case "wallTile":
    case "showerFloorTile":
    case "accentTile":
      return "tiles";
    case "vanity":
      return "vanities";
    case "tub":
      return "tubs";
    case "tubFiller":
      return "tub_fillers";
    case "toilet":
      return "toilets";
    case "shower":
      return "showers";
    case "faucet":
      return "faucets";
    case "glazing":
      return "shower_glazing";
    case "mirror":
      return "mirrors";
    case "towelBar":
      return "towel_bars";
    case "toiletPaperHolder":
      return "toilet_paper_holders";
    case "hook":
      return "hooks";
    case "lighting":
      return "lighting";
    default:
      return "";
  }
}

function parsePriceValue(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  const cleaned = value.toString().replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function getMaterialPrice(
  materials: any,
  itemType: string,
  sku?: string
): number {
  if (!sku) return 0;
  const matKey = mapItemTypeToMaterialKey(itemType);
  if (!matKey) return 0;
  const arr = materials[matKey] || [];
  const material = arr.find(
    (m: any) => m.SKU?.toLowerCase() === sku.toLowerCase()
  );
  if (!material) return 0;
  const tileItems = ["floorTile", "wallTile", "showerFloorTile", "accentTile"];
  return tileItems.includes(itemType)
    ? parsePriceValue(material.PRICE_SQF)
    : parsePriceValue(material.PRICE);
}

export function calculatePackagePrice(
  pkg: any,
  materials: any,
  sizeKey: "small" | "normal" | "large" = "normal"
): number {
  // Check if package has a custom price formula
  if (pkg.PRICE_FORMULA) {
    const formula = pkg.PRICE_FORMULA;
    const sizeMap = { small: "small", normal: "medium", large: "large" };
    const size = sizeMap[sizeKey] as "small" | "medium" | "large";
    
    const { basePrice, sizeMulitpliers, laborCost, markupPercentage } = formula;
    const sizedPrice = basePrice * sizeMulitpliers[size];
    const totalBeforeMarkup = sizedPrice + laborCost;
    return Math.round(totalBeforeMarkup * (1 + markupPercentage / 100));
  }

  // Check if package has pre-calculated prices
  if (sizeKey === "small" && pkg.PRICE_SMALL) return pkg.PRICE_SMALL;
  if (sizeKey === "normal" && pkg.PRICE_MEDIUM) return pkg.PRICE_MEDIUM;
  if (sizeKey === "large" && pkg.PRICE_LARGE) return pkg.PRICE_LARGE;

  // Fallback to original calculation method
  const sizeSqft = BATHROOM_SIZES_SQFT[sizeKey];
  let total = 0;
  const items = pkg.items || {};

  // Calculate price for tile items using per-square-foot price.
  const tileItems = [
    "floorTile",
    "wallTile",
    "showerFloorTile",
    "accentTile",
  ] as const;
  tileItems.forEach((tile) => {
    const sku = items[tile];
    if (sku) {
      const unitPrice = getMaterialPrice(materials, tile, sku);
      total += unitPrice * sizeSqft[tile as keyof typeof sizeSqft];
    }
  });

  // Calculate price for non-tile items.
  const otherItems = [
    "vanity",
    "tub",
    "tubFiller",
    "toilet",
    "shower",
    "faucet",
    "glazing",
    "mirror",
    "towelBar",
    "toiletPaperHolder",
    "hook",
    "lighting",
  ];
  otherItems.forEach((item) => {
    const sku = items[item];
    if (sku) {
      total += getMaterialPrice(materials, item, sku);
    }
  });

  return total;
}

export function calculatePriceChange(
  itemType: string,
  oldPrice: string,
  newPrice: string,
  sizeKey: "small" | "normal" | "large"
): number {
  const oldVal = parsePriceValue(oldPrice);
  const newVal = parsePriceValue(newPrice);
  if (
    ["floorTile", "wallTile", "showerFloorTile", "accentTile"].includes(
      itemType
    )
  ) {
    const sizeSqft = BATHROOM_SIZES_SQFT[sizeKey];
    return (
      (newVal - oldVal) * (sizeSqft[itemType as keyof typeof sizeSqft] || 0)
    );
  }
  return newVal - oldVal;
}
