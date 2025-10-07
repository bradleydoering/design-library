"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface QuoteData {
  floor_sqft: number;
  wet_wall_sqft: number;
  dry_wall_sqft?: number;
  shower_floor_sqft?: number;
  bathroom_type: string;
}

interface PackagePricing {
  materialsSubtotal: number;
  materialsTotal: number;
  laborTotal: number;
  grandTotal: number;
  isEstimate?: boolean;
}

interface CustomerQuoteSidebarProps {
  quoteData: QuoteData;
  pricing: PackagePricing;
  packageName: string;
  onSelect: () => void;
  isSelecting: boolean;
  error?: string | null;
}

export default function CustomerQuoteSidebar({
  quoteData,
  pricing,
  packageName,
  onSelect,
  isSelecting,
  error
}: CustomerQuoteSidebarProps) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Format bathroom type for display
  const formatBathroomType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'walk_in': 'Walk-in Shower',
      'tub_shower': 'Tub & Shower',
      'tub_only': 'Bathtub',
      'powder': 'Powder Room'
    };
    return typeMap[type] || type;
  };

  // Sidebar content component (reused for desktop and mobile)
  const SidebarContent = () => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 space-y-6">
      {/* Package Name */}
      <div>
        <h3 className="text-lg font-bold text-navy">{packageName}</h3>
        {pricing.isEstimate && (
          <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
            Estimated Pricing
          </span>
        )}
      </div>

      {/* Quote Details Section */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Your Bathroom Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium text-navy">
              {formatBathroomType(quoteData.bathroom_type)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Floor Area:</span>
            <span className="font-medium text-navy">{quoteData.floor_sqft} sq ft</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Wall Area:</span>
            <span className="font-medium text-navy">
              {(quoteData.wet_wall_sqft || 0) + (quoteData.dry_wall_sqft || 0)} sq ft
            </span>
          </div>
          {quoteData.shower_floor_sqft && quoteData.shower_floor_sqft > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Shower Floor:</span>
              <span className="font-medium text-navy">{quoteData.shower_floor_sqft} sq ft</span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Breakdown Section */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Pricing Summary</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-baseline">
            <span className="text-gray-600">Labor:</span>
            <span className="font-medium text-navy">
              ${pricing.laborTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-gray-600">
              Materials{pricing.isEstimate ? ' (Est.)' : ''}:
            </span>
            <span className="font-medium text-navy">
              ${pricing.materialsTotal.toLocaleString()}
            </span>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-baseline">
              <span className="text-base font-semibold text-navy">Total Project Cost:</span>
              <span className="text-2xl font-bold text-coral">
                ${pricing.grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {pricing.isEstimate && (
            <p className="text-xs text-blue-600 italic mt-2">
              Custom design package - final pricing determined after material selection
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Select Button */}
      <div className="border-t border-gray-200 pt-4">
        <Button
          className="w-full btn-coral text-lg py-6"
          onClick={onSelect}
          disabled={isSelecting}
        >
          {isSelecting ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              Selecting Package...
            </span>
          ) : (
            'Select This Package'
          )}
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">
          You'll review your selection before finalizing
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile/tablet */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Bottom Button - Visible on mobile/tablet only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="w-full bg-coral hover:bg-coral/90 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-between"
        >
          <span className="text-lg">View Quote Details</span>
          <span className="text-xl font-bold">${pricing.grandTotal.toLocaleString()}</span>
        </button>
      </div>

      {/* Mobile Sidebar Modal */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileSidebar(false)}
          />

          {/* Modal Content */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
            {/* Close Button */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-navy">Quote Details</h3>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="p-6">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
