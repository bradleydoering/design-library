// Core pricing engine extracted from design library
import { createHash } from 'crypto';
import { 
  DesignConfig, 
  PricingResult, 
  MaterialsDatabase, 
  UniversalConfig,
  PricingItem,
  SquareFootageForSize 
} from './types';

// Default square footage configuration (fallback)
const DEFAULT_BATHROOM_SIZES_SQFT = {
  small: {
    floorTile: 40,
    wallTile: {
      "Bathtub": { none: 20, halfwayUp: 45, floorToCeiling: 85 },
      "Walk-in Shower": { none: 25, halfwayUp: 50, floorToCeiling: 100 },
      "Tub & Shower": { none: 30, halfwayUp: 60, floorToCeiling: 110 },
      "Sink & Toilet": { none: 0, halfwayUp: 25, floorToCeiling: 70 }
    },
    showerFloorTile: 9,
    accentTile: 15,
  },
  normal: {
    floorTile: 60,
    wallTile: {
      "Bathtub": { none: 25, halfwayUp: 55, floorToCeiling: 105 },
      "Walk-in Shower": { none: 30, halfwayUp: 65, floorToCeiling: 120 },
      "Tub & Shower": { none: 40, halfwayUp: 75, floorToCeiling: 130 },
      "Sink & Toilet": { none: 0, halfwayUp: 30, floorToCeiling: 85 }
    },
    showerFloorTile: 9,
    accentTile: 20,
  },
  large: {
    floorTile: 80,
    wallTile: {
      "Bathtub": { none: 30, halfwayUp: 70, floorToCeiling: 130 },
      "Walk-in Shower": { none: 35, halfwayUp: 80, floorToCeiling: 150 },
      "Tub & Shower": { none: 45, halfwayUp: 90, floorToCeiling: 160 },
      "Sink & Toilet": { none: 0, halfwayUp: 40, floorToCeiling: 100 }
    },
    showerFloorTile: 9,
    accentTile: 25,
  },
};

const CATALOG_VERSION = "1.0.0";

function parsePriceValue(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  const cleaned = value.toString().replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function mapItemTypeToMaterialKey(itemType: string): string {
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

function getMaterialPrice(materials: MaterialsDatabase, itemType: string, sku?: string): number {
  if (!sku) return 0;
  const matKey = mapItemTypeToMaterialKey(itemType) as keyof MaterialsDatabase;
  if (!matKey) return 0;
  const arr = materials[matKey] || [];
  const material = arr.find((m: any) => m.SKU?.toLowerCase() === sku.toLowerCase());
  if (!material) return 0;
  const tileItems = ["floorTile", "wallTile", "showerFloorTile", "accentTile"];
  return tileItems.includes(itemType)
    ? parsePriceValue(material.PRICE_SQF)
    : parsePriceValue(material.PRICE);
}

function getMaterialInfo(materials: MaterialsDatabase, itemType: string, sku?: string): any | null {
  if (!sku) return null;
  const matKey = mapItemTypeToMaterialKey(itemType) as keyof MaterialsDatabase;
  if (!matKey) return null;
  const arr = materials[matKey] || [];
  return arr.find((m: any) => m.SKU?.toLowerCase() === sku.toLowerCase()) || null;
}

function getWallTileSquareFootage(
  sizeSqft: SquareFootageForSize, 
  wallTileCoverage: string = "Floor to ceiling",
  bathroomType: string = "Walk-in Shower"
): number {
  const bathroomTypeConfig = sizeSqft.wallTile[bathroomType as keyof typeof sizeSqft.wallTile];
  if (!bathroomTypeConfig) {
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

function generateSignature(config: DesignConfig, materials: MaterialsDatabase): string {
  const configString = JSON.stringify({
    config,
    catalogVersion: CATALOG_VERSION,
    timestamp: Date.now()
  });
  return createHash('sha256').update(configString).digest('hex').substring(0, 16);
}

export function priceDesign(
  config: DesignConfig,
  materials: MaterialsDatabase,
  universalConfig?: UniversalConfig
): PricingResult {
  console.log('🧮 Starting design pricing calculation...');
  console.log('Config:', config);
  
  // Use universal config if available, otherwise fall back to defaults
  const sqftConfig = universalConfig?.squareFootageConfig || DEFAULT_BATHROOM_SIZES_SQFT;
  const sizeSqft = sqftConfig[config.bathroomSize];
  
  let total = 0;
  const items: PricingItem[] = [];
  const breakdown = {
    tiles: {} as any,
    fixtures: {} as any
  };

  // Function to determine if an item should be included in pricing
  const shouldIncludeInPricing = (itemType: string): boolean => {
    // First check explicit includedItems config
    if (config.includedItems && config.includedItems.hasOwnProperty(itemType)) {
      return config.includedItems[itemType];
    }
    
    // Use universal config from database if available
    if (universalConfig && universalConfig.bathroomTypes) {
      const bathroomTypeConfig = universalConfig.bathroomTypes.find(
        (bt: any) => bt.name === config.bathroomType
      );
      
      if (bathroomTypeConfig && bathroomTypeConfig.includedItems) {
        const dbValue = bathroomTypeConfig.includedItems[itemType];
        return dbValue !== false; // Treat null/undefined as true (include by default)
      }
    }

    console.warn(`⚠️ No configuration found for ${itemType} in ${config.bathroomType}, defaulting to include`);
    return true; // Conservative fallback: include all items
  };

  // Calculate price for tile items using per-square-foot price
  const tileItems = ["floorTile", "wallTile", "showerFloorTile", "accentTile"] as const;
  
  tileItems.forEach((tile) => {
    const sku = config.items[tile as keyof typeof config.items];
    if (sku && shouldIncludeInPricing(tile)) {
      const unitPrice = getMaterialPrice(materials, tile, sku);
      const material = getMaterialInfo(materials, tile, sku);
      
      let sqft: number;
      
      // Use specific wall tile square footage based on coverage selection and bathroom type
      if (tile === "wallTile") {
        sqft = getWallTileSquareFootage(sizeSqft, config.wallTileCoverage, config.bathroomType);
      } else {
        sqft = sizeSqft[tile as keyof typeof sizeSqft] as number || 0;
      }
      
      const itemTotal = unitPrice * sqft;
      total += itemTotal;
      
      if (material) {
        items.push({
          sku,
          name: material.NAME || 'Unknown',
          category: tile,
          price: Math.round(itemTotal * 100), // Convert to cents
          priceType: 'PRICE_SQF',
          brand: material.BRAND,
          image: material.IMAGE_MAIN || material.IMAGE_01,
          description: material.DESCRIPTION
        });
      }
      
      breakdown.tiles[tile] = {
        sku,
        sqft,
        pricePerSqft: unitPrice,
        total: Math.round(itemTotal * 100)
      };
      
      console.log(`💰 ${tile}: ${sku} - ${sqft} sqft × $${unitPrice}/sqft = $${itemTotal}`);
    }
  });

  // Calculate price for non-tile items
  const otherItems = [
    "vanity", "tub", "tubFiller", "toilet", "shower", "faucet", 
    "glazing", "mirror", "towelBar", "toiletPaperHolder", "hook", "lighting"
  ];
  
  otherItems.forEach((item) => {
    const sku = config.items[item as keyof typeof config.items];
    if (sku && shouldIncludeInPricing(item)) {
      const itemPrice = getMaterialPrice(materials, item, sku);
      const material = getMaterialInfo(materials, item, sku);
      
      total += itemPrice;
      
      if (material) {
        items.push({
          sku,
          name: material.NAME || 'Unknown',
          category: item,
          price: Math.round(itemPrice * 100), // Convert to cents
          priceType: 'PRICE',
          brand: material.BRAND,
          image: material.IMAGE_MAIN || material.IMAGE_01,
          description: material.DESCRIPTION
        });
      }
      
      breakdown.fixtures[item] = {
        sku,
        price: Math.round(itemPrice * 100)
      };
      
      console.log(`💰 ${item}: ${sku} - $${itemPrice}`);
    }
  });

  const result: PricingResult = {
    subtotalCents: Math.round(total * 100),
    items,
    catalogVersion: CATALOG_VERSION,
    signature: generateSignature(config, materials),
    breakdown
  };
  
  console.log(`✅ Pricing complete: $${total} (${Math.round(total * 100)} cents)`);
  
  return result;
}