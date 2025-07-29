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

const CACHE_KEY = "materials-data";
const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 minutes (milliseconds)

export async function getMaterials(): Promise<MaterialsData> {
  // Check cache first
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    const isExpired = Date.now() - timestamp > CACHE_EXPIRATION;

    if (!isExpired) {
      console.log("Using cached materials data");
      return data;
    }
  }

  // Fetch fresh data if cache missing or expired
  let response: Response | undefined;

  try {
    response = await fetch(`/api/data?v=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = (await response.json()) as MaterialsData;

    // Helper function to transform package items:
    const trimPackageSkus = (pkg: PackageItem): PackageItem => {
      // Iterate over keys so any field with "_SKU" gets trimmed.
      Object.keys(pkg).forEach((key) => {
        if (
          key.includes("_SKU") &&
          typeof pkg[key as keyof PackageItem] === "string"
        ) {
          pkg[key as keyof PackageItem] =
            pkg[key as keyof PackageItem]?.trim() || "";
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
      .filter((pkg) => pkg.IMAGE_MAIN && pkg.IMAGE_MAIN.trim() !== "");

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

    // Store in cache with timestamp
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );

    return data;
  } catch (error: any) {
    if (error.message?.includes("high demand") || response?.status === 429) {
      throw new Error(
        "The service is temporarily unavailable due to high demand. Please try again in a minute."
      );
    }
    console.error("Failed to fetch materials:", error);
    throw new Error("Failed to load materials data. Please try again later.");
  }
}
