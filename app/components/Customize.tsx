"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import ProductList from "@/app/components/ProductList";
import PackageConfiguration from "@/app/components/PackageConfiguration";
import PackageDownloadModal from "@/app/components/PackageDownloadModal";
import { mapItemTypeToMaterialKey, BATHROOM_SIZES_SQFT } from "@/lib/utils";
import SwapModeView from "@/app/components/SwapModeView";
import { Package } from "../types";
import ProductDetailModal from "@/app/components/ProductDetailModal";
import ImageCarousel from "./ImageCarousel";

type CustomizeProps = {
  selectedPackage: Package;
  materials: any;
};

type ItemTypes = keyof Package["items"];

const TILE_ITEM_TYPES = [
  "floorTile",
  "wallTile",
  "showerFloorTile",
  "accentTile",
];

// Helper to clean and parse price values (e.g. "$100" → 100)
function parsePriceValue(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  const cleaned = value.toString().replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Computes the price of a tile item based on its price per square foot and area.
export function calculateTilePrice(
  item: any,
  itemType: string,
  sizeKey: "small" | "normal" | "large"
) {
  const sqft =
    BATHROOM_SIZES_SQFT[sizeKey][
      itemType as keyof (typeof BATHROOM_SIZES_SQFT)[typeof sizeKey]
    ];
  const priceSqf = parsePriceValue(item.PRICE_SQF);
  return priceSqf * sqft;
}

// Sums prices from all items in the customizations – using tile calculation for tile items.
function calculateTilePriceFromCustomizations(
  customItems: Record<string, any>,
  sizeKey: "small" | "normal" | "large"
) {
  let total = 0;
  for (const [itemType, item] of Object.entries(customItems)) {
    if (!item) continue;
    if (TILE_ITEM_TYPES.includes(itemType)) {
      total += calculateTilePrice(item, itemType, sizeKey);
    } else {
      total += parsePriceValue(item.PRICE);
    }
  }
  return total;
}

type BathroomConfiguration = {
  size: "small" | "normal" | "large";
  type: string;
  dryAreaTiles: string;
};

export type PackageDownloadData = {
  packageName: string;
  packageDescription: string;
  images: string[];
  configuration: BathroomConfiguration;
  selectedMaterials: Array<{
    type: string;
    name: string;
    description: string;
    image: string;
    brand: string;
    sku: string;
  }>;
  totalPrice: number;
};

export default function Customize({
  selectedPackage,
  materials,
}: CustomizeProps) {
  const [customizations, setCustomizations] = useState<Record<string, any>>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedSize, setSelectedSize] = useState<
    "small" | "normal" | "large"
  >("normal");
  const [selectedImage, setSelectedImage] = useState(
    selectedPackage.image || ""
  );
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [swapItemType, setSwapItemType] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const hasShownToast = useRef(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);
  const [modalItemType, setModalItemType] = useState<string | null>(null);
  const [removedItems, setRemovedItems] = useState<Record<string, any>>({});
  const [availableItemsForModal, setAvailableItemsForModal] = useState<any[]>(
    []
  );
  const [bathroomConfig, setBathroomConfig] = useState<BathroomConfiguration>({
    size: "normal",
    type: "Sink & Toilet",
    dryAreaTiles: "None",
  });
  const [detailModalSource, setDetailModalSource] = useState<"list" | "other">(
    "other"
  );
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  const downloadData = useMemo<PackageDownloadData>(() => {
    const selectedMaterials = Object.entries(customizations)
      .filter(([_, item]) => item !== null)
      .map(([type, item]) => ({
        type: type.replace(/([A-Z])/g, " $1").trim(),
        name: item.NAME || "Unknown",
        description: item.DESCRIPTION || "",
        image:
          item.IMAGE_MAIN ||
          item.IMAGE_01 ||
          item.IMAGE_02 ||
          item.IMAGE_03 ||
          "/item-missing.svg",
        brand: item.BRAND || "Unknown",
        sku: item.SKU || "",
      }));

    return {
      packageName: selectedPackage.name,
      packageDescription: selectedPackage.description,
      images: [
        selectedPackage.image,
        ...(selectedPackage.additionalImages || []),
      ].filter(Boolean),
      configuration: bathroomConfig,
      selectedMaterials,
      totalPrice,
    };
  }, [selectedPackage, customizations, bathroomConfig, totalPrice]);

  const handleOpenDetail = (
    item: any,
    itemType: string,
    source: "list" | "other" = "other"
  ) => {
    const matKey = mapItemTypeToMaterialKey(itemType as ItemTypes);
    const itemsList = materials[matKey] || [];
    const image =
      item.IMAGE_MAIN ||
      item.IMAGE_01 ||
      item.IMAGE_02 ||
      item.IMAGE_03 ||
      "/item-missing.svg";

    setSelectedDetailItem({ ...item, image });
    setModalItemType(itemType);
    setShowDetailModal(true);
    setDetailModalSource(source);
    setAvailableItemsForModal(itemsList);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedDetailItem(null);
    setModalItemType(null);
  };

  const handleColorChange = (colorItemSku: string) => {
    if (!modalItemType) return;
    const matKey = mapItemTypeToMaterialKey(modalItemType as ItemTypes);
    const list = materials[matKey] || [];
    const newItem = list.find(
      (m: any) => m.SKU?.toLowerCase() === colorItemSku.toLowerCase()
    );
    if (newItem) {
      const image =
        newItem.IMAGE_MAIN ||
        newItem.IMAGE_01 ||
        newItem.IMAGE_02 ||
        newItem.IMAGE_03 ||
        "/item-missing.svg";
      const updatedItem = {
        ...newItem,
        image,
        BRAND: newItem.BRAND || selectedDetailItem?.BRAND,
        DESCRIPTION: newItem.DESCRIPTION || selectedDetailItem?.DESCRIPTION,
      };
      setSelectedDetailItem(updatedItem);
    }
  };

  const handleUseProduct = () => {
    if (!selectedDetailItem || !modalItemType) return;
    if (isSwapMode && swapItemType) {
      handleSelectSwap(selectedDetailItem.SKU);
    } else {
      handleCustomization(modalItemType, selectedDetailItem);
    }
    handleCloseDetail();
  };

  useEffect(() => {
    if (!selectedPackage || !materials) return;

    const initial: Record<string, any> = {};
    const missing: Array<{ type: string; sku: string; name?: string }> = [];

    Object.entries(selectedPackage.items).forEach(([itemType, sku]) => {
      if (!sku) return;
      const matKey = mapItemTypeToMaterialKey(itemType as ItemTypes);
      const list = materials[matKey] || [];
      const found = list.find(
        (m: any) => m.SKU?.toLowerCase() === sku.toLowerCase()
      );

      if (found) {
        initial[itemType] = found;
      } else {
        const formattedType = itemType
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
        missing.push({
          type: formattedType,
          sku,
          name: selectedPackage.itemNames?.[itemType as ItemTypes] || "",
        });
      }
    });

    if (missing.length > 0 && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error(
        <div className="container mx-auto">
          <div className="flex justify-between items-start">
            <p className="font-semibold text-red-800 mb-2">
              Package includes missing materials (cannot locate them by SKU)
            </p>
            <button
              onClick={() => toast.dismiss()}
              className="text-red-800 hover:text-red-900 p-1"
            >
              ✕
            </button>
          </div>
          <ul className="space-y-1.5">
            {missing.map((item, idx) => (
              <li key={idx} className="text-sm">
                <span className="font-medium">{item.type}</span>
                {item.name && (
                  <span className="text-gray-700"> - {item.name}</span>
                )}
                <br />
                <span className="text-gray-600 text-xs">SKU: {item.sku}</span>
              </li>
            ))}
          </ul>
        </div>,
        {
          duration: Infinity,
          position: "top-center",
          style: {
            background: "#FEF2F2",
            color: "#991B1B",
            padding: "16px",
            borderRadius: "8px",
            width: "100%",
            maxWidth: "992px",
            top: "100px",
          },
        }
      );
    }

    setCustomizations(initial);
  }, [selectedPackage, materials]);

  useEffect(() => {
    setTotalPrice(
      calculateTilePriceFromCustomizations(customizations, selectedSize)
    );
  }, [customizations, selectedSize]);

  const handleCustomization = (itemType: string, newItem: any) => {
    setCustomizations((prev) => {
      if (newItem === null) {
        if (Object.values(prev).filter(Boolean).length <= 1) {
          toast.error("Must keep at least one item in the package.");
          return prev;
        }
        setRemovedItems((current) => ({
          ...current,
          [itemType]: prev[itemType],
        }));
        return { ...prev, [itemType]: null };
      }
      setRemovedItems((current) => {
        const { [itemType]: _, ...rest } = current;
        return rest;
      });
      return { ...prev, [itemType]: newItem };
    });
  };

  const handleRestoreItem = (itemType: string) => {
    const itemToRestore = removedItems[itemType];
    if (itemToRestore) {
      handleCustomization(itemType, itemToRestore);
    }
  };

  const startSwapMode = (itemType: string) => {
    setSwapItemType(itemType);
    setIsSwapMode(true);
  };

  const endSwapMode = () => {
    setSwapItemType(null);
    setIsSwapMode(false);
  };

  const handleSelectSwap = (sku: string) => {
    if (!swapItemType) return;
    const matKey = mapItemTypeToMaterialKey(swapItemType);
    const list = materials[matKey] || [];
    const newItem = list.find(
      (m: any) => m.SKU?.toLowerCase() === sku.toLowerCase()
    );
    if (newItem) {
      handleCustomization(swapItemType, newItem);
    }
  };

  const handleDownload = () => setShowModal(true);

  const handleSizeChange = (size: "small" | "normal" | "large") => {
    setSelectedSize(size);
    setBathroomConfig((prev) => ({ ...prev, size }));
  };

  const handleTypeChange = (type: string) => {
    setBathroomConfig((prev) => ({ ...prev, type }));
  };

  const handleDryAreaTilesChange = (config: string) => {
    setBathroomConfig((prev) => ({ ...prev, dryAreaTiles: config }));
  };

  // Update reference images when package changes
  useEffect(() => {
    const images = [
      selectedPackage.image,
      ...(selectedPackage.additionalImages || []),
    ].filter(Boolean);
    setReferenceImages(images.map((img) => img + "?hd=1"));
  }, [selectedPackage]);

  const handleThumbnailClick = (idx: number) => {
    // Reorder images to put the clicked image first
    const newImages = [...referenceImages];
    const [clickedImage] = newImages.splice(idx, 1);
    newImages.unshift(clickedImage);
    setReferenceImages(newImages);
  };

  return (
    <>
      {isSwapMode ? (
        <div className="pt-28">
          <SwapModeView
            itemType={swapItemType}
            customizations={customizations}
            materials={materials}
            selectedPackage={selectedPackage}
            totalPrice={totalPrice}
            selectedSize={selectedSize}
            onSelect={handleSelectSwap}
            onCancel={endSwapMode}
            onDownload={() => setShowModal(true)}
            onOpenDetail={(item) => handleOpenDetail(item, swapItemType!)}
          />
        </div>
      ) : (
        <div className={showModal ? "blur-sm brightness-75" : ""}>
          <div className="container mx-auto pt-36 px-4 lg:px-0">
            <div className="text-left mb-8 max-w-[500px]">
              <h3 className="text-3xl font-regular mb-2">
                {selectedPackage.name} Package
              </h3>
              <p className="text-gray-600 pt-2">
                {selectedPackage.description}
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 relative">
              <div className="space-y-6 mb-12">
                <section>
                  <div className="mb-3">
                    <ImageCarousel
                      images={referenceImages}
                      className="w-full h-[350px] object-cover rounded-[20px]"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {referenceImages.map((img: string, idx: number) => (
                      <Image
                        key={idx}
                        src={img}
                        alt={`${selectedPackage.name} view ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-[10px] cursor-pointer"
                        onClick={() => handleThumbnailClick(idx)}
                        width={80}
                        height={80}
                      />
                    ))}
                  </div>
                </section>
                <ProductList
                  name={selectedPackage.name}
                  customizations={customizations}
                  materials={materials}
                  selectedSize={selectedSize}
                  onCustomize={handleCustomization}
                  onSwap={startSwapMode}
                  onOpenDetail={(item, itemType) =>
                    handleOpenDetail(item, itemType, "list")
                  }
                  removedItems={removedItems}
                  onRestoreItem={handleRestoreItem}
                />
              </div>
              <PackageConfiguration
                totalPrice={totalPrice}
                selectedPackage={selectedPackage}
                selectedSize={selectedSize}
                onSizeChange={handleSizeChange}
                selectedType={bathroomConfig.type}
                onTypeChange={handleTypeChange}
                selectedTileConfig={bathroomConfig.dryAreaTiles}
                onTileConfigChange={handleDryAreaTilesChange}
                onDownload={handleDownload}
              />
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedDetailItem && (
        <ProductDetailModal
          key={selectedDetailItem.SKU}
          selectedItem={selectedDetailItem}
          availableItems={availableItemsForModal}
          logos={
            materials.logos?.reduce(
              (acc: Record<string, string>, logo: any) => {
                acc[logo.BRAND] = logo.LOGO;
                return acc;
              },
              {}
            ) || {}
          }
          colors={
            materials.colors?.reduce(
              (
                acc: Record<string, { name: string; hex: string }>,
                color: any
              ) => {
                acc[`COLOR_${color.CODE}`] = {
                  name: color.NAME,
                  hex: color.HEX,
                };
                return acc;
              },
              {}
            ) || {}
          }
          onClose={handleCloseDetail}
          onColorChange={handleColorChange}
          {...(detailModalSource === "list"
            ? {
                actionLabel: "Swap",
                onAction: () => {
                  if (modalItemType) {
                    startSwapMode(modalItemType);
                    handleCloseDetail();
                  }
                },
              }
            : { onUseProduct: handleUseProduct })}
        />
      )}

      <PackageDownloadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={downloadData}
      />
    </>
  );
}
