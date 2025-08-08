// Define types for each category of data

export interface PackageItem {
  ID: string;
  NAME: string;
  DESCRIPTION: string;
  TILES_FLOOR_SKU: string;
  TILES_WALL_SKU: string;
  TILES_SHOWER_FLOOR_SKU: string;
  TILES_ACCENT_SKU: string;
  VANITY_SKU: string;
  TUB_SKU: string;
  TUB_FILLER_SKU: string;
  TOILET_SKU: string;
  SHOWER_SKU: string;
  FAUCET_SKU: string;
  GLAZING_SKU: string;
  MIRROR_SKU: string;
  TOWEL_BAR_SKU: string;
  TOILET_PAPER_HOLDER_SKU: string;
  HOOK_SKU: string;
  LIGHTING_SKU: string;
  IMAGE_MAIN: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  IMAGE_03?: string;
  IMAGE_04?: string;
  IMAGE_05?: string;
  CATEGORY: string;
  VISION?: string;
  _productData?: {
    floorTile: any;
    wallTile: any;
    showerFloorTile: any;
    accentTile: any;
    vanity: any;
    tub: any;
    tubFiller: any;
    toilet: any;
    shower: any;
    faucet: any;
    glazing: any;
    mirror: any;
    towelBar: any;
    toiletPaperHolder: any;
    hook: any;
    lighting: any;
  };
}

type Brand =
  | "Olympia"
  | "Kubebath"
  | "Royo"
  | "Karton Republic"
  | "Kohler"
  | "Hytec"
  | "Pearl"
  | "Riobel"
  | "Delta"
  | "Moen"
  | "Pfister"
  | "Vigo"
  | "Paris Mirror"
  | "Ico"
  | "Kuzko"
  | "Matteo";

export interface LogoItem {
  BRAND: Brand;
  LOGO: string;
}

export interface ColorItem {
  NAME: string;
  CODE: string;
  HEX: string;
}

export interface TileItem
  extends Partial<Record<`COLOR_${ColorCode}`, "DEFAULT" | string>> {
  BRAND: Brand;
  COLLECTION: string;
  SIZE: string;
  SKU: string;
  MATERIAL: string;
  WALL: "TRUE" | "FALSE";
  FLOOR: "TRUE" | "FALSE";
  SHOWER_FLOOR: "TRUE" | "FALSE";
  ACCENT: "TRUE" | "FALSE";
  URL: string;
  IMAGE_MAIN: string;
  COST_SQF: string;
  PRICE_SQF: string;
  DESCRIPTION: string;
  SPECS: string;
}

export interface VanityItem
  extends Partial<Record<`COLOR_${ColorCode}`, "DEFAULT" | string>> {
  BRAND: Brand;
  NAME: string;
  SKU: string;
  SINK_TYPE: string;
  FAUCET_TYPE: string;
  WIDTH: string;
  URL: string;
  IMAGE_MAIN: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  COST?: string;
  PRICE?: string;
  DESCRIPTION: string;
  SPECS: string;
}

export interface TubItem
  extends Partial<Record<`COLOR_${ColorCode}`, "DEFAULT" | string>> {
  BRAND: Brand;
  NAME: string;
  SKU: string;
  TYPE?: string;
  DIMENSIONS?: string;
  DRAIN_LOCATION?: string;
  URL?: string;
  IMAGE_MAIN?: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  COST?: string;
  PRICE?: string;
  DESCRIPTION: string;
  SPECS: string;
}

export interface TubFillerItem
  extends Partial<Record<`COLOR_${ColorCode}`, "DEFAULT" | string>> {
  BRAND: Brand;
  NAME: string;
  SKU: string;
  TYPE: string;
  URL: string;
  IMAGE_MAIN: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  COST?: string;
  PRICE?: string;
  DESCRIPTION: string;
  SPECS: string;
}

export interface ToiletItem
  extends Partial<Record<`COLOR_${ColorCode}`, "DEFAULT" | string>> {
  BRAND: Brand;
  NAME: string;
  SKU: string;
  HEIGHT: string;
  FLANGE_SIZE: string;
  URL: string;
  IMAGE_MAIN: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  COST?: string;
  PRICE?: string;
  DESCRIPTION: string;
  SPECS: string;
}

export interface ShowerItem
  extends Partial<Record<`COLOR_${ColorCode}`, "DEFAULT" | string>> {
  BRAND: Brand;
  NAME: string;
  SKU: string;
  TYPE: string;
  TUB_SPOUT: number | "TRUE" | "FALSE";
  HAND_SHOWER: number | "TRUE" | "FALSE";
  URL: string;
  IMAGE_MAIN?: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  COST?: string;
  PRICE?: string;
  DESCRIPTION: string;
  SPECS: string;
}

export interface FaucetItem
  extends Partial<Record<`COLOR_${ColorCode}`, "DEFAULT" | string>> {
  BRAND: Brand;
  NAME: string;
  SKU: string;
  TYPE: string;
  DIMENSIONS: string;
  VESSEL?: boolean;
  URL: string;
  IMAGE_MAIN: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  COST?: string;
  PRICE?: string;
  DESCRIPTION: string;
  SPECS: string;
}

export interface ShowerGlazingItem
  extends Partial<Record<`COLOR_${ColorCode}`, "DEFAULT" | string>> {
  BRAND: Brand;
  NAME: string;
  SKU: string;
  DIMENSIONS: string;
  TYPE: string;
  URL: string;
  IMAGE_MAIN: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  COST?: string;
  PRICE?: string;
  DESCRIPTION: string;
  SPECS: string;
}

export interface MirrorItem
  extends Partial<Record<`COLOR_${ColorCode}`, "DEFAULT" | string>> {
  BRAND: Brand;
  NAME: string;
  SKU: string;
  DIMENSIONS: string;
  MEDICINE_CABINET: number | boolean | "TRUE" | "FALSE";
  LED_MIRROR: number | boolean | "TRUE" | "FALSE";
  URL: string;
  IMAGE_MAIN: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  COST?: string;
  PRICE?: string;
  DESCRIPTION: string;
  SPECS: string;
}

export interface TowelBarItem
  extends Partial<Record<`COLOR_${ColorCode}`, "DEFAULT" | string>> {
  BRAND: Brand;
  NAME: string;
  SKU: string;
  DIMENSIONS: string;
  HEATED: number | boolean | "TRUE" | "FALSE";
  URL: string;
  IMAGE_MAIN: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  COST?: string;
  PRICE: string;
  DESCRIPTION: string;
  SPECS: string;
}

export interface ToiletPaperHolderItem
  extends Partial<Record<`COLOR_${ColorCode}`, "DEFAULT" | string>> {
  BRAND: Brand;
  NAME: string;
  SKU: string;
  URL: string;
  IMAGE_MAIN: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  COST?: string;
  PRICE: string;
  DESCRIPTION: string;
  SPECS: string;
}

export interface HookItem
  extends Partial<Record<`COLOR_${ColorCode}`, "DEFAULT" | string>> {
  BRAND: Brand;
  NAME: string;
  SKU: string;
  URL: string;
  IMAGE_MAIN: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  COST?: string;
  PRICE: string;
  DESCRIPTION: string;
  SPECS: string;
}

export interface LightingItem
  extends Partial<Record<`COLOR_${ColorCode}`, "DEFAULT" | string>> {
  BRAND: Brand;
  NAME: string;
  SKU: string;
  DIMENSIONS: string;
  URL: string;
  IMAGE_MAIN: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  COST?: string;
  PRICE: string;
  DESCRIPTION: string;
  SPECS: string;
}

// Main Data Interface
export interface MaterialsData {
  packages: PackageItem[];
  logos: LogoItem[];
  colors: ColorItem[];
  tiles: TileItem[];
  vanities: VanityItem[];
  tubs: TubItem[];
  tub_fillers: TubFillerItem[];
  toilets: ToiletItem[];
  showers: ShowerItem[];
  faucets: FaucetItem[];
  shower_glazing: ShowerGlazingItem[];
  mirrors: MirrorItem[];
  towel_bars: TowelBarItem[];
  toilet_paper_holders: ToiletPaperHolderItem[];
  hooks: HookItem[];
  lighting: LightingItem[];
}

export type ColorCode =
  | "TP"
  | "GD"
  | "LM"
  | "GY"
  | "BL"
  | "DG"
  | "CH"
  | "SW"
  | "AW"
  | "TG"
  | "SG"
  | "ST"
  | "BE"
  | "BK"
  | "WH"
  | "PW"
  | "OL"
  | "DK"
  | "MS"
  | "PA"
  | "CT"
  | "RP"
  | "DN"
  | "SN"
  | "TQ"
  | "MV"
  | "AQ"
  | "JN"
  | "CY"
  | "PK"
  | "EM"
  | "GN"
  | "SM"
  | "AN"
  | "CM"
  | "PU"
  | "RS"
  | "IV"
  | "LG"
  | "MG"
  | "CG"
  | "CW"
  | "TB"
  | "TS"
  | "VW"
  | "OP"
  | "OY"
  | "PT"
  | "CA"
  | "GF"
  | "IM"
  | "IW"
  | "CD"
  | "SP"
  | "SD"
  | "GH"
  | "PM"
  | "LB"
  | "MT"
  | "SL"
  | "SK"
  | "SR"
  | "VM"
  | "CB"
  | "DC"
  | "CR"
  | "MB"
  | "PL"
  | "BO"
  | "HN"
  | "AS"
  | "WE"
  | "DW"
  | "BN"
  | "RG"
  | "BR"
  | "BS"
  | "GV"
  | "GW"
  | "WA"
  | "WC"
  | "WB"
  | "GL"
  | "NW"
  | "NG"
  | "OG"
  | "BT"
  | "GO"
  | "EO"
  | "SS"
  | "FG"
  | "DB";

import { supabase } from './supabase';

const CACHE_KEY = "materials-data";
const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 minutes (milliseconds)

// Map database category names to the expected property names
const CATEGORY_MAP: Record<string, keyof MaterialsData> = {
  'tiles': 'tiles',
  'vanities': 'vanities',
  'tubs': 'tubs',
  'tub_fillers': 'tub_fillers',
  'toilets': 'toilets',
  'showers': 'showers',
  'faucets': 'faucets',
  'shower_glazing': 'shower_glazing',
  'mirrors': 'mirrors',
  'towel_bars': 'towel_bars',
  'toilet_paper_holders': 'toilet_paper_holders',
  'hooks': 'hooks',
  'lighting': 'lighting'
};

export async function getMaterials(): Promise<MaterialsData> {
  // Check cache first (only in browser)
  let cachedData = null;
  if (typeof window !== 'undefined') {
    cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CACHE_EXPIRATION;

      if (!isExpired) {
        console.log("Using cached materials data");
        return data;
      }
    }
  }

  try {
    console.log("Fetching data from Supabase...");

    // Fetch data from Supabase
    const [productsResponse, packagesResponse, colorsResponse, logosResponse] = await Promise.all([
      supabase.from('products').select('*').order('category, name'),
      supabase.from('packages').select(`
        *,
        package_products(*, products(*))
      `).order('name'),
      supabase.from('colors').select('*').order('name'),
      supabase.from('brand_logos').select('*').order('brand')
    ]);

    if (productsResponse.error) throw productsResponse.error;
    if (packagesResponse.error) throw packagesResponse.error;
    if (colorsResponse.error) throw colorsResponse.error;
    if (logosResponse.error) throw logosResponse.error;

    // Transform Supabase data to match the existing interface
    const data: MaterialsData = {
      packages: [],
      logos: [],
      colors: [],
      tiles: [],
      vanities: [],
      tubs: [],
      tub_fillers: [],
      toilets: [],
      showers: [],
      faucets: [],
      shower_glazing: [],
      mirrors: [],
      towel_bars: [],
      toilet_paper_holders: [],
      hooks: [],
      lighting: []
    };

    // Transform products by category
    productsResponse.data?.forEach((product: any) => {
      const categoryKey = CATEGORY_MAP[product.category];
      if (categoryKey && data[categoryKey]) {
        // Transform database product to match the expected interface
        const transformedProduct = transformDatabaseProduct(product);
        (data[categoryKey] as any[]).push(transformedProduct);
      }
    });

    // Transform packages
    data.packages = packagesResponse.data?.map((pkg: any) => transformDatabasePackage(pkg, productsResponse.data || [])) || [];

    // Transform colors
    data.colors = colorsResponse.data?.map((color: any) => ({
      NAME: color.name,
      CODE: color.code,
      HEX: color.hex_value
    })) || [];

    // Transform logos
    data.logos = logosResponse.data?.map((logo: any) => ({
      BRAND: logo.brand,
      LOGO: logo.logo_url
    })) || [];

    // Apply existing transformations
    applyDataTransformations(data);

    // Store in cache with timestamp (only in browser)
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    }

    return data;
  } catch (error: any) {
    console.error("Failed to fetch from Supabase, attempting fallback to JSON:", error);
    
    // Fallback to JSON file if Supabase fails
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/data.json`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load data.json: ${response.status}`);
      }

      const data = (await response.json()) as MaterialsData;
      
      // Apply the same transformations as before
      applyDataTransformations(data);
      
      console.log("Successfully loaded data from JSON fallback");
      
      // Store in cache with timestamp (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      }

      return data;
    } catch (fallbackError) {
      console.error("Both Supabase and JSON fallback failed:", fallbackError);
      if (error.message?.includes("high demand")) {
        throw new Error(
          "The service is temporarily unavailable due to high demand. Please try again in a minute."
        );
      }
      throw new Error("Failed to load materials data. Please try again later.");
    }
  }
}

// Transform database product to match interface
function transformDatabaseProduct(product: any): any {
  // Map database fields to interface fields
  const transformed: any = {
    SKU: product.sku,
    NAME: product.name,
    BRAND: product.brand,
    MATERIAL: product.material,
    FINISH: product.finish,
    COLOR_TA: product.color_ta,
    SIZE: product.size,
    DESCRIPTION: product.description,
    URL: product.url,
    IMAGE_MAIN: product.image_main,
    IMAGE_01: product.image_01,
    IMAGE_02: product.image_02,
    IMAGE_03: product.image_03,
    COST_SQF: product.cost_sqf?.toString(),
    PRICE_SQF: product.price_sqf?.toString(),
    COST: product.cost?.toString(),
    PRICE: product.price?.toString(),
  };

  // Add category-specific fields
  if (product.category === 'tiles') {
    transformed.WALL = product.wall ? "TRUE" : "FALSE";
    transformed.FLOOR = product.floor ? "TRUE" : "FALSE";
    transformed.SHOWER_FLOOR = product.shower_floor ? "TRUE" : "FALSE";
    transformed.ACCENT = product.accent ? "TRUE" : "FALSE";
    transformed.COLLECTION = product.material || 'Unknown';
    transformed.SPECS = product.description || '';
  }

  // Remove undefined/null values
  Object.keys(transformed).forEach(key => {
    if (transformed[key] === undefined || transformed[key] === null) {
      delete transformed[key];
    }
  });

  return transformed;
}

// Transform database package to match interface  
function transformDatabasePackage(pkg: any, allProducts: any[] = []): PackageItem {
  // Get products by type from package_products relation
  const getSkuByType = (type: string) => {
    const packageProduct = pkg.package_products?.find((pp: any) => pp.product_type === type);
    return packageProduct?.products?.sku || '';
  };

  // Create a lookup for products by SKU for fast access
  const productLookup = new Map();
  try {
    if (Array.isArray(allProducts)) {
      allProducts.forEach(product => {
        if (product && product.sku) {
          productLookup.set(product.sku.toLowerCase(), product);
        }
      });
    }
  } catch (error) {
    console.error('Error building product lookup:', error);
  }

  // Helper to get product data by SKU
  const getProductDataBySku = (sku: string) => {
    if (!sku) return null;
    try {
      return productLookup.get(sku.toLowerCase()) || null;
    } catch (error) {
      console.error('Error getting product data for SKU:', sku, error);
      return null;
    }
  };

  const result: PackageItem = {
    ID: pkg.id,
    NAME: pkg.name,
    DESCRIPTION: pkg.description || '',
    VISION: pkg.vision || '',
    CATEGORY: pkg.category,
    IMAGE_MAIN: pkg.image_main || '',
    IMAGE_01: pkg.image_01 || '',
    IMAGE_02: pkg.image_02 || '',
    IMAGE_03: pkg.image_03 || '',
    TILES_FLOOR_SKU: getSkuByType('floor_tile'),
    TILES_WALL_SKU: getSkuByType('wall_tile'),
    TILES_SHOWER_FLOOR_SKU: getSkuByType('shower_floor_tile'),
    TILES_ACCENT_SKU: getSkuByType('accent_tile'),
    VANITY_SKU: getSkuByType('vanity'),
    TUB_SKU: getSkuByType('tub'),
    TUB_FILLER_SKU: getSkuByType('tub_filler'),
    TOILET_SKU: getSkuByType('toilet'),
    SHOWER_SKU: getSkuByType('shower'),
    FAUCET_SKU: getSkuByType('faucet'),
    GLAZING_SKU: getSkuByType('glazing'),
    MIRROR_SKU: getSkuByType('mirror'),
    TOWEL_BAR_SKU: getSkuByType('towel_bar'),
    TOILET_PAPER_HOLDER_SKU: getSkuByType('toilet_paper_holder'),
    HOOK_SKU: getSkuByType('hook'),
    LIGHTING_SKU: getSkuByType('lighting')
  };

  // Add product data for easy access (with error handling)
  try {
    result._productData = {
      floorTile: getProductDataBySku(getSkuByType('floor_tile')),
      wallTile: getProductDataBySku(getSkuByType('wall_tile')),
      showerFloorTile: getProductDataBySku(getSkuByType('shower_floor_tile')),
      accentTile: getProductDataBySku(getSkuByType('accent_tile')),
      vanity: getProductDataBySku(getSkuByType('vanity')),
      tub: getProductDataBySku(getSkuByType('tub')),
      tubFiller: getProductDataBySku(getSkuByType('tub_filler')),
      toilet: getProductDataBySku(getSkuByType('toilet')),
      shower: getProductDataBySku(getSkuByType('shower')),
      faucet: getProductDataBySku(getSkuByType('faucet')),
      glazing: getProductDataBySku(getSkuByType('glazing')),
      mirror: getProductDataBySku(getSkuByType('mirror')),
      towelBar: getProductDataBySku(getSkuByType('towel_bar')),
      toiletPaperHolder: getProductDataBySku(getSkuByType('toilet_paper_holder')),
      hook: getProductDataBySku(getSkuByType('hook')),
      lighting: getProductDataBySku(getSkuByType('lighting'))
    };
  } catch (error) {
    console.error('Error adding product data:', error);
  }

  return result;
}

// Apply existing data transformations
function applyDataTransformations(data: MaterialsData) {
  // Helper function to transform package items:
  const trimPackageSkus = (pkg: PackageItem): PackageItem => {
    // Iterate over keys so any field with "_SKU" gets trimmed.
    Object.keys(pkg).forEach((key) => {
      if (
        key.includes("_SKU") &&
        typeof pkg[key as keyof PackageItem] === "string"
      ) {
        const value = pkg[key as keyof PackageItem];
        if (typeof value === "string") {
          (pkg as any)[key] = value.trim() || "";
        }
      }
    });

    // Ensure VISION property is preserved
    if (pkg.VISION) {
      pkg.VISION = pkg.VISION.trim();
    }

    return pkg;
  };

  // Transform packages to use NAME, trim SKU values,
  // and filter out packages without a valid main image.
  data.packages = data.packages
    .map(trimPackageSkus)
    .filter((pkg) => pkg.IMAGE_MAIN && pkg.IMAGE_MAIN.trim() !== "")
    .map((pkg) => {
      // Transform R2 URLs to use custom domain with consistent naming structure
      const transformR2Url = (url: string, packageName: string, imageType: 'main' | '01' | '02' | '03') => {
        if (url && url.includes('r2.cloudflarestorage.com')) {
          // Convert package name to consistent format: spaces to hyphens, clean up special chars
          const cleanName = packageName
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
          
          // Map image types to numbers
          const imageMap = {
            'main': '1',
            '01': '2', 
            '02': '3',
            '03': '4'
          };
          
          const imageNumber = imageMap[imageType] || '1';
          
          // Try both .jpg and .png extensions (we'll start with .jpg as default)
          const newUrl = `https://cloudrenovation.ca/${cleanName}/${cleanName}-${imageNumber}.jpg`;
          
          console.log('Transforming URL:', url);
          console.log('  Package:', packageName, '→', cleanName);
          console.log('  Image type:', imageType, '→', imageNumber);
          console.log('  Final URL:', newUrl);
          
          return newUrl;
        }
        return url;
      };
      
      return {
        ...pkg,
        IMAGE_MAIN: transformR2Url(pkg.IMAGE_MAIN, pkg.NAME, 'main'),
        IMAGE_01: pkg.IMAGE_01 ? transformR2Url(pkg.IMAGE_01, pkg.NAME, '01') : pkg.IMAGE_01,
        IMAGE_02: pkg.IMAGE_02 ? transformR2Url(pkg.IMAGE_02, pkg.NAME, '02') : pkg.IMAGE_02,
        IMAGE_03: pkg.IMAGE_03 ? transformR2Url(pkg.IMAGE_03, pkg.NAME, '03') : pkg.IMAGE_03,
      };
    });

  const transformBoolean = (value: string | boolean | number): boolean => {
    return value === "TRUE" || value === true || value === 1;
  };

  const transformColorKeys = (item: any) => {
    const colorKeys = Object.keys(item).filter((key) =>
      key.startsWith("COLOR_")
    );
    colorKeys.forEach((key) => {
      if (item[key] && item[key] !== "DEFAULT") {
        item[key] = item[key].trim();
      }
    });
    return item;
  };

  // Utility function to remove missing values (undefined, null, or empty strings)
  const removeMissingValues = (item: any): any => {
    Object.keys(item).forEach((key) => {
      if (
        item[key] === undefined ||
        item[key] === null ||
        (typeof item[key] === "string" && item[key].trim() === "")
      ) {
        delete item[key];
      }
    });
    return item;
  };

  // Transform tiles
  data.tiles = data.tiles.map((tile) => {
    return removeMissingValues(
      transformColorKeys({
        ...tile,
        WALL: transformBoolean(tile.WALL),
        FLOOR: transformBoolean(tile.FLOOR),
        SHOWER_FLOOR: transformBoolean(tile.SHOWER_FLOOR),
        ACCENT: transformBoolean(tile.ACCENT),
      })
    );
  });

  // Transform mirrors
  data.mirrors = data.mirrors.map((mirror) => {
    return removeMissingValues(
      transformColorKeys({
        ...mirror,
        MEDICINE_CABINET: transformBoolean(mirror.MEDICINE_CABINET),
        LED_MIRROR: transformBoolean(mirror.LED_MIRROR),
      })
    );
  });

  // Transform towel bars
  data.towel_bars = data.towel_bars.map((towelBar) => {
    return removeMissingValues(
      transformColorKeys({
        ...towelBar,
        HEATED: transformBoolean(towelBar.HEATED),
      })
    );
  });

  // Transform showers
  data.showers = data.showers.map((shower) => {
    return removeMissingValues(
      transformColorKeys({
        ...shower,
        TUB_SPOUT: transformBoolean(shower.TUB_SPOUT),
        HAND_SHOWER: transformBoolean(shower.HAND_SHOWER),
      })
    );
  });
}
