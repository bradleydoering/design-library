import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BATHROOM_SIZES_SQFT = {
  small: {
    floorTile: 40,
    wallTile: {
      "Bathtub": {
        none: 20,
        halfwayUp: 45,
        floorToCeiling: 85
      },
      "Walk-in Shower": {
        none: 25,
        halfwayUp: 50,
        floorToCeiling: 100
      },
      "Tub & Shower": {
        none: 30,
        halfwayUp: 60,
        floorToCeiling: 110
      },
      "Sink & Toilet": {
        none: 0,
        halfwayUp: 25,
        floorToCeiling: 70
      }
    },
    showerFloorTile: 9,
    accentTile: 15,
  },
  normal: {
    floorTile: 60,
    wallTile: {
      "Bathtub": {
        none: 25,
        halfwayUp: 55,
        floorToCeiling: 105
      },
      "Walk-in Shower": {
        none: 30,
        halfwayUp: 65,
        floorToCeiling: 120
      },
      "Tub & Shower": {
        none: 40,
        halfwayUp: 75,
        floorToCeiling: 130
      },
      "Sink & Toilet": {
        none: 0,
        halfwayUp: 30,
        floorToCeiling: 85
      }
    },
    showerFloorTile: 9,
    accentTile: 20,
  },
  large: {
    floorTile: 80,
    wallTile: {
      "Bathtub": {
        none: 30,
        halfwayUp: 70,
        floorToCeiling: 130
      },
      "Walk-in Shower": {
        none: 35,
        halfwayUp: 80,
        floorToCeiling: 150
      },
      "Tub & Shower": {
        none: 45,
        halfwayUp: 90,
        floorToCeiling: 160
      },
      "Sink & Toilet": {
        none: 0,
        halfwayUp: 40,
        floorToCeiling: 100
      }
    },
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

function getWallTileSquareFootage(
  sizeSqft: any, 
  wallTileCoverage: string = "Floor to ceiling",
  bathroomType: string = "Walk-in Shower"
): number {
  // Handle backward compatibility for old formats
  if (typeof sizeSqft.wallTile === 'number') {
    // Old format - apply multiplier for backward compatibility
    switch (wallTileCoverage) {
      case "None": return sizeSqft.wallTile * 0.25;
      case "Half way up": return sizeSqft.wallTile * 0.5;
      case "Floor to ceiling": return sizeSqft.wallTile;
      default: return sizeSqft.wallTile;
    }
  } else if (sizeSqft.wallTile.none !== undefined && typeof sizeSqft.wallTile.none === 'number') {
    // Old 2D format (coverage only, no bathroom type)
    switch (wallTileCoverage) {
      case "None": return sizeSqft.wallTile.none;
      case "Half way up": return sizeSqft.wallTile.halfwayUp;
      case "Floor to ceiling": return sizeSqft.wallTile.floorToCeiling;
      default: return sizeSqft.wallTile.floorToCeiling;
    }
  } else {
    // New 3D format - use bathroom type and coverage
    const bathroomTypeConfig = sizeSqft.wallTile[bathroomType];
    if (!bathroomTypeConfig) {
      // Fallback to Walk-in Shower if bathroom type not found
      const fallbackConfig = sizeSqft.wallTile["Walk-in Shower"];
      switch (wallTileCoverage) {
        case "None": return fallbackConfig?.none || 0;
        case "Half way up": return fallbackConfig?.halfwayUp || 0;
        case "Floor to ceiling": return fallbackConfig?.floorToCeiling || 0;
        default: return fallbackConfig?.floorToCeiling || 0;
      }
    }
    
    switch (wallTileCoverage) {
      case "None": return bathroomTypeConfig.none;
      case "Half way up": return bathroomTypeConfig.halfwayUp;
      case "Floor to ceiling": return bathroomTypeConfig.floorToCeiling;
      default: return bathroomTypeConfig.floorToCeiling;
    }
  }
}

export function calculatePackagePrice(
  pkg: any,
  materials: any,
  sizeKey: "small" | "normal" | "large" = "normal",
  globalSquareFootageConfig?: any,
  universalConfig?: any
): number {
  // Check if package has pre-calculated prices first (for backward compatibility)
  if (sizeKey === "small" && pkg.PRICE_SMALL) return pkg.PRICE_SMALL;
  if (sizeKey === "normal" && pkg.PRICE_MEDIUM) return pkg.PRICE_MEDIUM;
  if (sizeKey === "large" && pkg.PRICE_LARGE) return pkg.PRICE_LARGE;

  // Use global square footage config if available, otherwise fall back to defaults
  const sizeSqft = globalSquareFootageConfig?.[sizeKey] || BATHROOM_SIZES_SQFT[sizeKey];
  let total = 0;
  const items = pkg.items || {};

  // Get wall tile coverage and bathroom type from universal toggles 
  const wallTileCoverage = pkg.UNIVERSAL_TOGGLES?.wallTileCoverage || "Floor to ceiling";
  const bathroomType = pkg.UNIVERSAL_TOGGLES?.bathroomType || "Walk-in Shower";

  // Function to determine if an item should be included in pricing based on database config ONLY
  const shouldIncludeInPricing = (itemType: string): boolean => {
    // Use database configuration as single source of truth
    if (universalConfig && universalConfig.bathroomTypes) {
      const bathroomTypeConfig = universalConfig.bathroomTypes.find(
        (bt: any) => bt.name === bathroomType
      );
      
      if (bathroomTypeConfig && bathroomTypeConfig.includedItems) {
        // Use the database configuration directly - this is the single source of truth
        const shouldInclude = bathroomTypeConfig.includedItems[itemType] || false;
        console.log(`DB CONFIG: ${bathroomType} -> ${itemType} = ${shouldInclude}`);
        return shouldInclude;
      }
    }

    // If no database config, default to including all items (safe fallback)
    console.warn(`CRITICAL: No database configuration found for ${bathroomType}, defaulting to include ${itemType}. universalConfig = ${universalConfig ? 'exists' : 'NULL'}`);
    return true;
  };

  // Calculate price for tile items using per-square-foot price.
  const tileItems = [
    "floorTile",
    "wallTile",
    "showerFloorTile",
    "accentTile",
  ] as const;
  tileItems.forEach((tile) => {
    const sku = items[tile];
    if (sku && shouldIncludeInPricing(tile)) {
      const unitPrice = getMaterialPrice(materials, tile, sku);
      let sqft: number;
      
      // Use specific wall tile square footage based on coverage selection and bathroom type
      if (tile === "wallTile") {
        sqft = getWallTileSquareFootage(sizeSqft, wallTileCoverage, bathroomType);
      } else {
        sqft = sizeSqft[tile as keyof typeof sizeSqft];
      }
      
      total += unitPrice * sqft;
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
    if (sku && shouldIncludeInPricing(item)) {
      total += getMaterialPrice(materials, item, sku);
    }
  });

  return total;
}

export function calculatePriceChange(
  itemType: string,
  oldPrice: string,
  newPrice: string,
  sizeKey: "small" | "normal" | "large",
  wallTileCoverage: string = "Floor to ceiling",
  bathroomType: string = "Walk-in Shower"
): number {
  const oldVal = parsePriceValue(oldPrice);
  const newVal = parsePriceValue(newPrice);
  if (
    ["floorTile", "wallTile", "showerFloorTile", "accentTile"].includes(
      itemType
    )
  ) {
    const sizeSqft = BATHROOM_SIZES_SQFT[sizeKey];
    let sqft: number;
    
    if (itemType === "wallTile") {
      sqft = getWallTileSquareFootage(sizeSqft, wallTileCoverage, bathroomType);
    } else {
      sqft = sizeSqft[itemType as keyof typeof sizeSqft] as number || 0;
    }
    
    return (newVal - oldVal) * sqft;
  }
  return newVal - oldVal;
}
