"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import SimpleProductList from "./SimpleProductList";
import PackageConfiguration from "./PackageConfiguration";
import PackageDownloadModal from "./PackageDownloadModal";
import { mapItemTypeToMaterialKey, BATHROOM_SIZES_SQFT } from "../../lib/utils";
import SwapModeView from "./SwapModeView";
import { Package } from "../types";
import ProductDetailModal from "./ProductDetailModal";
import ImageCarousel from "./ImageCarousel";
import { BathroomConfig } from "@/lib/useBathroomConfig";

type CustomizeProps = {
  selectedPackage: Package;
  materials: any;
  onBack?: () => void;
  bathroomConfig?: BathroomConfig;
  setBathroomConfig?: (config: BathroomConfig) => void;
  isApplying?: boolean;
  squareFootageConfig?: any;
  universalConfig?: any;
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
  sizeKey: "small" | "normal" | "large",
  wallTileCoverage: "None" | "Half way up" | "Floor to ceiling" = "Floor to ceiling",
  bathroomType: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet" = "Walk-in Shower",
  customSquareFootageConfig?: any
) {
  let sqft: number;
  
  // Use custom config if provided, otherwise fall back to default
  const sqftConfig = customSquareFootageConfig || BATHROOM_SIZES_SQFT;
  
  if (itemType === "wallTile") {
    // Handle wall tile with coverage options and bathroom type
    const wallTileConfig = sqftConfig[sizeKey].wallTile[bathroomType];
    switch (wallTileCoverage) {
      case "None":
        sqft = wallTileConfig.none;
        break;
      case "Half way up":
        sqft = wallTileConfig.halfwayUp;
        break;
      case "Floor to ceiling":
        sqft = wallTileConfig.floorToCeiling;
        break;
      default:
        sqft = wallTileConfig.floorToCeiling;
    }
  } else {
    // Handle other tile types normally
    sqft = sqftConfig[sizeKey][itemType as keyof (typeof sqftConfig)[typeof sizeKey]] as number;
  }
  
  const priceSqf = parsePriceValue(item.PRICE_SQF);
  return priceSqf * sqft;
}

// Sums prices from all items in the customizations – using tile calculation for tile items.
function calculateTilePriceFromCustomizations(
  customItems: Record<string, any>,
  sizeKey: "small" | "normal" | "large",
  bathroomType: string = "Walk-in Shower",
  wallTileCoverage: string = "Floor to ceiling",
  customSquareFootageConfig?: any,
  universalConfig?: any
) {
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
        console.log(`DB CONFIG (Customize): ${bathroomType} -> ${itemType} = ${shouldInclude}`);
        return shouldInclude;
      }
    }

    // If no database config, default to including all items (safe fallback)
    console.warn(`CRITICAL (Customize): No database configuration found for ${bathroomType}, defaulting to include ${itemType}. universalConfig = ${universalConfig ? 'exists' : 'NULL'}`);
    return true;
  };

  let total = 0;
  for (const [itemType, item] of Object.entries(customItems)) {
    if (!item || !shouldIncludeInPricing(itemType)) continue;
    
    if (TILE_ITEM_TYPES.includes(itemType)) {
      total += calculateTilePrice(item, itemType, sizeKey, wallTileCoverage as any, bathroomType as any, customSquareFootageConfig);
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
  bathroomConfig: propBathroomConfig,
  setBathroomConfig: propSetBathroomConfig,
  isApplying = false,
  squareFootageConfig,
  universalConfig
}: CustomizeProps) {
  const [customizations, setCustomizations] = useState<Record<string, any>>({});
  const [totalPrice, setTotalPrice] = useState(0);
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
  // Use props for bathroom config or fall back to local state
  const [localBathroomConfig, setLocalBathroomConfig] = useState<BathroomConfiguration>({
    size: "normal",
    type: "Sink & Toilet", 
    dryAreaTiles: "None",
  });

  // Convert between the two different bathroom config formats
  const bathroomConfig = propBathroomConfig ? {
    size: propBathroomConfig.size,
    type: propBathroomConfig.type,
    dryAreaTiles: propBathroomConfig.wallTileCoverage
  } : localBathroomConfig;

  const setBathroomConfig = (config: BathroomConfiguration) => {
    if (propSetBathroomConfig) {
      // Convert back to the prop format and call prop setter
      propSetBathroomConfig({
        size: config.size,
        type: config.type as any,
        wallTileCoverage: config.dryAreaTiles as any
      });
    } else {
      setLocalBathroomConfig(config);
    }
  };
  const [detailModalSource, setDetailModalSource] = useState<"list" | "other">(
    "other"
  );
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [validatedImages, setValidatedImages] = useState<string[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);

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

      // Check if this item should be included based on database configuration
      const shouldIncludeItem = (itemType: string): boolean => {
        if (universalConfig && universalConfig.bathroomTypes && bathroomConfig) {
          const bathroomTypeConfig = universalConfig.bathroomTypes.find(
            (bt: any) => bt.name === bathroomConfig.type
          );
          
          if (bathroomTypeConfig && bathroomTypeConfig.includedItems) {
            const shouldInclude = bathroomTypeConfig.includedItems[itemType] || false;
            console.log(`CUSTOMIZE INIT: ${bathroomConfig.type} -> ${itemType} = ${shouldInclude}`);
            return shouldInclude;
          }
        }
        
        // If no database config, include all items (safe fallback)
        console.warn(`CUSTOMIZE INIT: No database configuration found for ${bathroomConfig?.type}, defaulting to include ${itemType}`);
        return true;
      };

      if (!shouldIncludeItem(itemType)) {
        console.log(`CUSTOMIZE INIT: Excluding ${itemType} from initial customizations`);
        return;
      }
      
      // First try to use productData directly (includes images)
      let productData = null;
      try {
        productData = selectedPackage.productData?.[itemType as keyof typeof selectedPackage.productData];
      } catch (error) {
        console.error('Error accessing productData:', error);
        productData = null;
      }
      
      if (productData) {
        // Transform database product to match expected format
        const transformedProduct = {
          SKU: productData.sku,
          NAME: productData.name,
          BRAND: productData.brand,
          IMAGE_MAIN: productData.image_main,
          IMAGE_01: productData.image_01,
          IMAGE_02: productData.image_02,
          IMAGE_03: productData.image_03,
          DESCRIPTION: productData.description,
          PRICE: productData.price?.toString(),
          PRICE_SQF: productData.price_sqf?.toString(),
          COST: productData.cost?.toString(),
          COST_SQF: productData.cost_sqf?.toString(),
          URL: productData.url,
          // Add category-specific fields
          ...(productData.category === 'tiles' && {
            WALL: productData.wall ? "TRUE" : "FALSE",
            FLOOR: productData.floor ? "TRUE" : "FALSE",
            SHOWER_FLOOR: productData.shower_floor ? "TRUE" : "FALSE",
            ACCENT: productData.accent ? "TRUE" : "FALSE",
            COLLECTION: productData.material || 'Unknown',
            SPECS: productData.description || '',
            SIZE: productData.size,
            MATERIAL: productData.material
          })
        };
        initial[itemType] = transformedProduct;
      } else {
        // Fallback to original SKU lookup
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
            width: "100%",
            maxWidth: "992px",
            top: "100px",
          },
        }
      );
    }

    setCustomizations(initial);
  }, [selectedPackage, materials, universalConfig, bathroomConfig]);

  useEffect(() => {
    setTotalPrice(
      calculateTilePriceFromCustomizations(
        customizations, 
        bathroomConfig.size, 
        bathroomConfig.type,
        bathroomConfig.dryAreaTiles,
        squareFootageConfig,
        universalConfig
      )
    );
  }, [customizations, bathroomConfig.size, bathroomConfig.type, bathroomConfig.dryAreaTiles, squareFootageConfig, universalConfig]);

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
    setBathroomConfig({ ...bathroomConfig, size });
  };

  const handleTypeChange = (type: string) => {
    setBathroomConfig({ ...bathroomConfig, type });
  };

  const handleDryAreaTilesChange = (config: string) => {
    setBathroomConfig({ ...bathroomConfig, dryAreaTiles: config });
  };

  // Validate image URLs by testing if they load
  const validateImageUrl = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(true); // Always assume valid on server-side
        return;
      }
      const img = new window.Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      // Timeout after 3 seconds for faster loading
      setTimeout(() => resolve(false), 3000);
    });
  };

  // Update reference images when package changes
  useEffect(() => {
    const validateImages = async () => {
      setImagesLoading(true);
      const allImages = [
        selectedPackage.image,
        ...(selectedPackage.additionalImages || []),
      ].filter(Boolean);
      
      setReferenceImages(allImages); // Set immediately for UI
      
      // Validate each image
      const validationResults = await Promise.all(
        allImages.map(url => validateImageUrl(url))
      );
      
      // Filter to only valid images
      const validImages = allImages.filter((_, index) => validationResults[index]);
      
      if (validImages.length > 0) {
        setValidatedImages(validImages);
      } else {
        // If no images are valid, show a placeholder
        setValidatedImages(['/item-missing.svg']);
      }
      
      setCurrentImageIndex(0);
      setImagesLoading(false);
    };
    
    validateImages();
  }, [selectedPackage]);

  const handleThumbnailClick = (idx: number) => {
    // Just update the current image index - don't reorder the array!
    setCurrentImageIndex(idx);
  };

  const handleCarouselSelect = (index: number) => {
    // Handle selection from the carousel component
    setCurrentImageIndex(index);
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
            selectedSize={bathroomConfig.size}
            onSelect={handleSelectSwap}
            onCancel={endSwapMode}
            onDownload={() => setShowModal(true)}
            onOpenDetail={(item) => handleOpenDetail(item, swapItemType!)}
          />
        </div>
      ) : (
        <div className={showModal ? "blur-sm brightness-75" : ""}>
          <div className="container mx-auto pt-36 px-4 lg:px-0 max-w-7xl">
            <div className="text-left mb-8 max-w-[500px]">
              <h3 className="text-3xl font-regular mb-2">
                {selectedPackage.name} Package
              </h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 relative lg:mr-[420px]">
              <div className="space-y-8 mb-12 lg:pr-4">
                <section>
                  <div className="mb-3">
                    {imagesLoading ? (
                      <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                          <p className="text-gray-600">Loading images...</p>
                        </div>
                      </div>
                    ) : (
                      <ImageCarousel
                        images={validatedImages}
                        initialIndex={currentImageIndex}
                        onSelect={handleCarouselSelect}
                        className="w-full h-[500px] object-cover"
                      />
                    )}
                  </div>
                  {!imagesLoading && validatedImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                      {validatedImages.map((img: string, idx: number) => (
                        <Image
                          key={idx}
                          src={img}
                          alt={`${selectedPackage.name} view ${idx + 1}`}
                          className={`w-full h-24 object-cover cursor-pointer border-2 transition-all ${
                            idx === currentImageIndex 
                              ? 'border-coral ring-2 ring-coral/30' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleThumbnailClick(idx)}
                          width={96}
                          height={96}
                          onError={(e) => {
                            // Hide thumbnail if it fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Package Description */}
                  <div className="mt-6 mb-8">
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {selectedPackage.description}
                    </p>
                  </div>
                </section>
                <SimpleProductList
                  name={selectedPackage.name}
                  customizations={customizations}
                  materials={materials}
                  selectedSize={bathroomConfig.size}
                  onCustomize={handleCustomization}
                  onSwap={startSwapMode}
                  onOpenDetail={(item, itemType) =>
                    handleOpenDetail(item, itemType, "list")
                  }
                  removedItems={removedItems}
                  onRestoreItem={handleRestoreItem}
                  bathroomType={bathroomConfig.type}
                  wallTileCoverage={bathroomConfig.dryAreaTiles}
                />
              </div>
              <div className="lg:fixed lg:top-32 lg:right-8 lg:w-[380px] lg:z-10 lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto">
                <PackageConfiguration
                totalPrice={totalPrice}
                selectedPackage={selectedPackage}
                selectedSize={bathroomConfig.size}
                onSizeChange={handleSizeChange}
                selectedType={bathroomConfig.type}
                onTypeChange={handleTypeChange}
                selectedTileConfig={bathroomConfig.dryAreaTiles}
                onTileConfigChange={handleDryAreaTilesChange}
                onDownload={handleDownload}
                isApplying={isApplying}
              />
              </div>            </div>
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
