/* eslint-disable @next/next/no-img-element */
import { Trash, ArrowRightLeft } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { calculateTilePrice } from "@/app/components/Customize";
import { BATHROOM_SIZES_SQFT } from "@/lib/utils";

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
};

const TILE_ITEM_TYPES = [
  "floorTile",
  "wallTile",
  "showerFloorTile",
  "accentTile",
];

export default function ProductList({
  name,
  customizations,
  materials,
  selectedSize,
  onCustomize,
  onSwap,
  onOpenDetail,
  removedItems,
  onRestoreItem,
}: Props) {
  const logos = useMemo(() => {
    return (materials.logos || []).reduce(
      (acc: Record<string, string>, logo: any) => {
        acc[logo.BRAND] = logo.LOGO;
        return acc;
      },
      {}
    );
  }, [materials.logos]);

  const sortedCustomEntries = useMemo(() => {
    return Object.entries(customizations)
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
  }, [customizations]);

  const handleRemoveItem = (itemType: string, item: any) => {
    onCustomize(itemType, null);
  };

  const handleRestoreItem = (itemType: string) => {
    onRestoreItem(itemType);
  };

  return (
    <section>
      <div className="mb-6 flex items-center gap-2 justify-between mt-10">
        <h4 className="text-3xl font-regular mb-2">Product List</h4>
        <p className="text-sm text-gray-600">Products in {name} package</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedCustomEntries.map(([itemType, item]) => {
          const isRemoved = !item;
          const currentItem = isRemoved ? removedItems[itemType] : item;
          const logo =
            logos[currentItem?.BRAND] || currentItem?.BRAND || "KOHLER.";
          const itemImage = currentItem?.image;
          const formattedType = itemType
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str: string) => str.toUpperCase())
            .trim();

          return (
            <div key={itemType}>
              <div className="mb-2 font-regular text-xs text-gray-400">
                {formattedType}
              </div>
              <div
                className="border-[6px] border-[#F6F7F9] h-[180px] relative cursor-pointer"
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
                    <div className="bg-[#F6F7F9] border-2 border-[#E9E9E9] px-4 py-2">
                      <span className="text-gray-800 font-semibold">
                        + Tap to add {formattedType.toLowerCase()}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex">
                  <div className="w-2/5 h-[150px] p-4 pr-1 flex items-center justify-center overflow-y-auto">
                    <Image
                      src={itemImage}
                      alt={
                        currentItem?.NAME ||
                        currentItem?.COLLECTION ||
                        currentItem?.SKU ||
                        formattedType
                      }
                      className={`w-full h-auto object-contain ${
                        !itemType.toLowerCase().includes("tile")
                          ? ""
                          : ""
                      }`}
                      width={300}
                      height={300}
                    />
                  </div>
                  <div className="w-3/5 p-4 pl-1">
                    <div className="space-y-2">
                      <div className="text-sm font-bold text-gray-500">
                        {logo && (
                          <img
                            src={logo}
                            alt={currentItem?.BRAND || "KOHLER."}
                            className="max-h-[20px] w-auto h-auto filter grayscale"
                          />
                        )}
                      </div>
                      <div className="font-medium text-sm">
                        <span className="truncate capitalize">
                          {currentItem?.NAME
                            ? currentItem.NAME.length > 15
                              ? (
                                  currentItem.NAME.charAt(0).toUpperCase() +
                                  currentItem.NAME.slice(1).toLowerCase()
                                ).slice(0, 15) + "..."
                              : currentItem.NAME.charAt(0).toUpperCase() +
                                currentItem.NAME.slice(1).toLowerCase()
                            : "<Product Name Missing>"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 h-[40px] line-clamp-2">
                        <span>
                          {currentItem?.DESCRIPTION
                            ? currentItem.DESCRIPTION.length > 60
                              ? currentItem.DESCRIPTION.slice(0, 60) + "..."
                              : currentItem.DESCRIPTION
                            : "<Description Missing>"}
                        </span>
                      </div>
                    </div>
                    {!isRemoved && (
                      <div
                        className="flex gap-2 mt-2 justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            handleRemoveItem(itemType, currentItem)
                          }
                          className="p-2 border border-[#E9E9E9]"
                        >
                          <Trash className="w-4 h-4 text-[#6B6B6B]" />
                        </button>
                        <button
                          onClick={() => onSwap(itemType)}
                          className="p-2 bg-[#EFEADF]"
                        >
                          <ArrowRightLeft className="w-4 h-4 text-[#6B6B6B]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
