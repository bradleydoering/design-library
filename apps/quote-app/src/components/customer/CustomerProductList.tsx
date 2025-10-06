"use client";

import Image from "next/image";

interface Product {
  sku: string;
  name: string;
  category: string;
  price_retail: number;
  price_cost: number;
  image?: string | null;
}

interface QuoteData {
  floor_sqft: number;
  wet_wall_sqft: number;
  dry_wall_sqft?: number;
  shower_floor_sqft?: number;
  accent_tile_sqft?: number;
  bathroom_type: string;
}

interface CustomerProductListProps {
  products: Record<string, Product | undefined>;
  quoteData: QuoteData;
  bathroomType: string;
  universalConfig: any;
  packageName: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  floorTile: "Floor Tile",
  wallTile: "Wall Tile",
  showerFloorTile: "Shower Floor Tile",
  accentTile: "Accent Tile",
  vanity: "Vanity",
  tub: "Bathtub",
  tubFiller: "Tub Filler",
  toilet: "Toilet",
  shower: "Shower",
  faucet: "Faucet",
  glazing: "Shower Glazing",
  mirror: "Mirror",
  towelBar: "Towel Bar",
  toiletPaperHolder: "Toilet Paper Holder",
  hook: "Hook",
  lighting: "Lighting",
};

const TILE_ITEM_TYPES = [
  "floorTile",
  "wallTile",
  "showerFloorTile",
  "accentTile",
];

export default function CustomerProductList({
  products,
  quoteData,
  bathroomType,
  universalConfig,
  packageName
}: CustomerProductListProps) {

  // Helper to determine if item should be included based on bathroom type
  const shouldIncludeItem = (itemType: string): boolean => {
    if (universalConfig && universalConfig.bathroomTypes) {
      // Map database bathroom_type (snake_case) to universal config ID (kebab-case)
      const typeMap: Record<string, string> = {
        'walk_in': 'walk-in-shower',
        'tub_shower': 'tub-and-shower',
        'tub_only': 'bathtub',
        'powder': 'sink-and-toilet'
      };

      const configId = typeMap[bathroomType] || bathroomType;

      const bathroomTypeConfig = universalConfig.bathroomTypes.find(
        (bt: any) => bt.id === configId
      );

      if (bathroomTypeConfig && bathroomTypeConfig.includedItems) {
        return bathroomTypeConfig.includedItems[itemType] === true;
      }
    }

    return true; // Conservative fallback
  };

  // Get square footage for tile items
  const getTileSquareFootage = (itemType: string): number => {
    switch (itemType) {
      case 'floorTile':
        return quoteData.floor_sqft;
      case 'wallTile':
        return (quoteData.wet_wall_sqft || 0) + (quoteData.dry_wall_sqft || 0);
      case 'showerFloorTile':
        return quoteData.shower_floor_sqft || 0;
      case 'accentTile':
        return quoteData.accent_tile_sqft || 0;
      default:
        return 0;
    }
  };

  // Filter and sort products for display
  const displayProducts = Object.entries(products)
    .filter(([itemType, product]) => {
      if (!product) return false;

      const isIncluded = shouldIncludeItem(itemType);
      const isTile = TILE_ITEM_TYPES.includes(itemType);
      const sqft = isTile ? getTileSquareFootage(itemType) : 0;

      // For tiles, only show if has square footage AND is included
      if (isTile && sqft === 0) return false;

      // Show all included items
      return isIncluded;
    })
    .map(([itemType, product]) => ({
      itemType,
      product: product!,
      categoryName: CATEGORY_NAMES[itemType] || itemType,
      image: product!.image || "/item-missing.svg"
    }))
    .sort((a, b) => {
      // Sort tiles first, then fixtures
      const aIsTile = TILE_ITEM_TYPES.includes(a.itemType);
      const bIsTile = TILE_ITEM_TYPES.includes(b.itemType);

      if (aIsTile && !bIsTile) return -1;
      if (!aIsTile && bIsTile) return 1;

      // Within tiles, maintain order
      if (aIsTile && bIsTile) {
        return TILE_ITEM_TYPES.indexOf(a.itemType) - TILE_ITEM_TYPES.indexOf(b.itemType);
      }

      return 0;
    });

  return (
    <section>
      <div className="mb-6 flex items-center gap-2 justify-between mt-10">
        <h4 className="text-3xl font-regular mb-2">Products Included</h4>
        <p className="text-sm text-gray-600">Items in {packageName} package</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {displayProducts.map(({ itemType, product, categoryName, image }) => (
          <div key={itemType}>
            <div className="border-[6px] border-[#F6F7F9] h-[200px] relative bg-white hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="h-[160px] p-4 flex items-center justify-center">
                <Image
                  src={image}
                  alt={categoryName}
                  className="w-full h-full object-contain"
                  width={160}
                  height={160}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = "/item-missing.svg";
                  }}
                />
              </div>

              {/* Category Name */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-2">
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-800">
                    {categoryName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
