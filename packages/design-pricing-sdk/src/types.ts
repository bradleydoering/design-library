// Core types for design pricing SDK

export interface DesignConfig {
  bathroomType: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet";
  wallTileCoverage: "None" | "Half way up" | "Floor to ceiling";
  bathroomSize: "small" | "normal" | "large";
  items: {
    floorTile?: string;
    wallTile?: string;
    showerFloorTile?: string;
    accentTile?: string;
    vanity?: string;
    tub?: string;
    tubFiller?: string;
    toilet?: string;
    shower?: string;
    faucet?: string;
    glazing?: string;
    mirror?: string;
    towelBar?: string;
    toiletPaperHolder?: string;
    hook?: string;
    lighting?: string;
  };
  includedItems?: {
    [key: string]: boolean;
  };
}

export interface PricingItem {
  sku: string;
  name: string;
  category: string;
  price: number;
  priceType: 'PRICE' | 'PRICE_SQF';
  brand?: string;
  image?: string;
  description?: string;
}

export interface PricingResult {
  subtotalCents: number;
  items: PricingItem[];
  catalogVersion: string;
  signature: string;
  breakdown: {
    tiles: {
      floorTile?: { sku: string; sqft: number; pricePerSqft: number; total: number };
      wallTile?: { sku: string; sqft: number; pricePerSqft: number; total: number };
      showerFloorTile?: { sku: string; sqft: number; pricePerSqft: number; total: number };
      accentTile?: { sku: string; sqft: number; pricePerSqft: number; total: number };
    };
    fixtures: {
      [key: string]: { sku: string; price: number };
    };
  };
}

export interface MaterialsDatabase {
  tiles: any[];
  vanities: any[];
  tubs: any[];
  tub_fillers: any[];
  toilets: any[];
  showers: any[];
  faucets: any[];
  shower_glazing: any[];
  mirrors: any[];
  towel_bars: any[];
  toilet_paper_holders: any[];
  hooks: any[];
  lighting: any[];
}

export interface UniversalConfig {
  bathroomTypes: Array<{
    name: string;
    includedItems: { [key: string]: boolean };
  }>;
  squareFootageConfig: {
    small: SquareFootageForSize;
    normal: SquareFootageForSize;
    large: SquareFootageForSize;
  };
}

export interface SquareFootageForSize {
  floorTile: number;
  wallTile: {
    "Bathtub": { none: number; halfwayUp: number; floorToCeiling: number };
    "Walk-in Shower": { none: number; halfwayUp: number; floorToCeiling: number };
    "Tub & Shower": { none: number; halfwayUp: number; floorToCeiling: number };
    "Sink & Toilet": { none: number; halfwayUp: number; floorToCeiling: number };
  };
  showerFloorTile: number;
  accentTile: number;
}

export interface DefaultDesignLevel {
  level: 'budget' | 'mid' | 'high';
  config: DesignConfig;
}