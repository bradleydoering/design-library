import Image from "next/image";
import { X, ArrowRightLeft, FileSearch } from "lucide-react";
import { processItemColors } from "../utils/colorProcessing";
import { calculatePriceBracket } from "@/app/utils/calculatePriceBracket";
import ImageCarousel from "@/app/components/ImageCarousel";

type ProductDetailModalProps = {
  selectedItem: any;
  availableItems: any[];
  onClose: () => void;
  onUseProduct?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  logos: Record<string, string>;
  colors: Record<string, { name: string; hex: string }>;
  onColorChange: (sku: string) => void;
};

export default function ProductDetailModal({
  selectedItem,
  availableItems,
  onClose,
  onUseProduct,
  onAction,
  actionLabel,
  logos,
  colors,
  onColorChange,
}: ProductDetailModalProps) {
  const allImages = [
    selectedItem.image,
    ...Array.from({ length: 10 }, (_, i) => selectedItem[`IMAGE_0${i + 1}`]),
  ].filter(Boolean);

  const availableColors = processItemColors(selectedItem, colors);
  // Use the available colors in their original order.
  const swatches = availableColors;

  const priceIndicator = calculatePriceBracket(
    selectedItem.PRICE || selectedItem.PRICE_SQF,
    availableItems.filter((item) => item.TYPE === selectedItem.TYPE)
  );

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full md:w-1/4 bg-gray-50 p-4 md:p-3 flex-shrink-0 overflow-y-auto relative">
          <div className="relative w-full h-[400px] mb-4 flex items-center justify-center">
            <ImageCarousel images={allImages} />
            {selectedItem.BRAND && (
              <div className="absolute top-2 md:top-4 left-2 md:left-4">
                <Image
                  src={logos[selectedItem.BRAND] || "/placeholder.png"}
                  alt={selectedItem.BRAND}
                  width={80}
                  height={24}
                  className="object-contain md:w-[80px] md:h-[30px] grayscale"
                />
              </div>
            )}
            {/* {allImages.length >= 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/4 flex items-center gap-[10px]">
                {allImages.map((_, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className="relative w-2 h-2 cursor-pointer"
                  >
                    <div className="absolute w-2 h-2 rounded-full bg-gray-200" />
                  </div>
                ))}
                {allImages.length > 1 && (
                  <div
                    className="absolute w-5 h-2 rounded-full bg-gray-400 transition-all duration-500 ease-in-out"
                    style={{
                      left: `calc(${selectedImageIndex} * 20px)`,
                      transform: "translateX(-6px)",
                    }}
                  />
                )}
              </div>
            )} */}
          </div>
        </div>
        <div className="w-full md:w-3/4 p-6 md:p-12 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-3xl font-normal mb-2">{selectedItem.NAME}</h2>
          <p className="text-gray-600 mb-8">
            {selectedItem.subtitle || "Product details"}
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-regular bg-gray-100 rounded-full h-10 px-4 py-4 flex items-center justify-center">
              {Array(priceIndicator.length)
                .fill(0)
                .map((_, i) => (
                  <Image
                    key={i}
                    src="/icons/dollar-bold.png"
                    alt="$"
                    width={9}
                    height={9}
                    className="inline mx-[2px] opacity-60"
                  />
                ))}
            </span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar user-select-none">
              {swatches.map((cObj) => (
                <div
                  key={cObj.key}
                  onClick={() => {
                    if (!cObj.isSelected) {
                      const colorItemSku = selectedItem[cObj.key];
                      onColorChange(colorItemSku);
                    }
                  }}
                  className={`rounded-full flex-shrink-0 flex items-center px-4 py-3 gap-2 whitespace-nowrap ${
                    cObj.isSelected
                      ? "bg-gray-100"
                      : "bg-white border border-gray-200 cursor-pointer hover:bg-gray-50"
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: cObj.color }}
                  />
                  <span className="text-sm">{cObj.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-lg mb-4">Description</h3>
            <p className="text-gray-600 leading-relaxed max-h-[72px] overflow-y-auto">
              {selectedItem.DESCRIPTION}
            </p>
          </div>
          <div className="flex items-center gap-4 mb-8">
            {selectedItem.SPECS && (
              <a
                href={selectedItem.SPECS}
                download
                className="text-gray-600 flex items-center gap-2 hover:text-gray-800 transition-colors"
              >
                <FileSearch className="w-4 h-4" />
                <span className="text-sm underline">Download specs</span>
              </a>
            )}
          </div>
          <div className="mt-auto flex justify-end">
            <button
              onClick={onAction ?? onUseProduct}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-[#2d332c] rounded-lg text-white hover:bg-[#1f231f] transition-colors"
            >
              <ArrowRightLeft className="w-5 h-5" />
              <span className="font-medium text-sm">
                {actionLabel ?? "Use this product"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
