/* eslint-disable @next/next/no-img-element */
import { Trash, ArrowRightLeft } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

type Props = {
  name: string;
  customizations: Record<string, any>;
  materials: any;
  selectedSize: "small" | "normal" | "large";
  onCustomize: (itemType: string, newItem: any) => void;
  onSwap: (itemType: string) => void;
  onOpenDetail: (item: any, itemType: string) => void;
  removedItems: Record<string, any>;
  onRestoreItem: (itemType: string) => void;
  bathroomType?: string;
  wallTileCoverage?: string;
};

const TILE_ITEM_TYPES = [
  "floorTile",
  "wallTile", 
  "showerFloorTile",
  "accentTile",
];

// Category display names mapping
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

export default function SimpleProductList({
  name,
  customizations,
  materials,
  selectedSize,
  onCustomize,
  onSwap,
  onOpenDetail,
  removedItems,
  onRestoreItem,
  bathroomType = "Walk-in Shower",
  wallTileCoverage = "Floor to ceiling",
}: Props) {
  // All item visibility is now handled by database configuration only
  // The Customize component filters items before passing them here
  // so we don't need any additional filtering logic

  const sortedCustomEntries = useMemo(() => {
    return Object.entries(customizations)
      // No filtering needed - database configuration handles item inclusion
      .map(([itemType, item]) => {
        if (item) {
          const image =
            item.IMAGE_MAIN ||
            item.IMAGE_01 ||
            item.IMAGE_02 ||
            item.IMAGE_03 ||
            "/item-missing.svg";
          return [itemType, { ...item, image }];
        }
        return [itemType, item];
      })
      .sort(([a], [b]) => {
        const order = TILE_ITEM_TYPES;
        return order.indexOf(a) - order.indexOf(b);
      });
  }, [customizations, bathroomType, wallTileCoverage]);

  const handleRemoveItem = (itemType: string, item: any) => {
    onCustomize(itemType, null);
  };

  const handleRestoreItem = (itemType: string) => {
    onRestoreItem(itemType);
  };

  return (
    <section>
      <div className="mb-6 flex items-center gap-2 justify-between mt-10">
        <h4 className="text-3xl font-regular mb-2">Products Included</h4>
        <p className="text-sm text-gray-600">Items in {name} package</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {sortedCustomEntries.map(([itemType, item]) => {
          const isRemoved = !item;
          const currentItem = isRemoved ? removedItems[itemType] : item;
          const itemImage = currentItem?.image;
          const categoryName = CATEGORY_NAMES[itemType] || itemType;

          return (
            <div key={itemType}>
              <div
                className="border-[6px] border-[#F6F7F9] h-[200px] relative cursor-pointer bg-white hover:shadow-md transition-shadow"
                onClick={() => {
                  if (currentItem) {
                    onOpenDetail(currentItem, itemType);
                  }
                }}
              >
                {isRemoved && (
                  <div
                    className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer bg-gray-50/80 backdrop-blur-[2px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestoreItem(itemType);
                    }}
                  >
                    <div className="bg-[#F6F7F9] border-2 border-[#E9E9E9] px-3 py-2">
                      <span className="text-gray-800 font-semibold text-sm">
                        + Add {categoryName}
                      </span>
                    </div>
                  </div>
                )}

                {/* Product Image */}
                <div className="h-[160px] p-4 flex items-center justify-center">
                  <Image
                    src={itemImage || "/item-missing.svg"}
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

                {/* Action Buttons */}
                {!isRemoved && (
                  <div
                    className="absolute top-2 right-2 flex gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleRemoveItem(itemType, currentItem)}
                      className="p-1 bg-white/80 backdrop-blur-sm border border-[#E9E9E9] hover:bg-red-50"
                      title="Remove item"
                    >
                      <Trash className="w-3 h-3 text-[#6B6B6B]" />
                    </button>
                    <button
                      onClick={() => onSwap(itemType)}
                      className="p-1 bg-[#EFEADF]/80 backdrop-blur-sm hover:bg-[#E5E0D5]"
                      title="Swap item"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-[#6B6B6B]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}