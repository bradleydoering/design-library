"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import CustomerImageGallery from "@/components/customer/CustomerImageGallery";
import CustomerProductList from "@/components/customer/CustomerProductList";
import CustomerQuoteSidebar from "@/components/customer/CustomerQuoteSidebar";

interface QuoteData {
  quote_id: string;
  quote_name: string;
  customer_name: string;
  project_address: string;
  bathroom_type: string;
  floor_sqft: number;
  wet_wall_sqft: number;
  dry_wall_sqft?: number;
  shower_floor_sqft?: number;
  accent_tile_sqft?: number;
  ceiling_height: number;
  vanity_width: number;
  labour_grand_total: number;
  expires_at: string;
}

interface PackageData {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  products: Record<string, any>;
}

interface PackagePricing {
  packageId: string;
  packageName: string;
  subtotal: number;
  total: number;
  breakdown: any;
  isEstimate?: boolean;
}

export default function PackageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const packageId = params.packageId as string;

  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [pricingData, setPricingData] = useState<PackagePricing | null>(null);
  const [universalConfig, setUniversalConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch quote data
        const quoteResponse = await fetch(`/api/customer/quote/${token}`);

        if (quoteResponse.status === 410) {
          router.push(`/customer/quote/${token}`);
          return;
        }

        if (!quoteResponse.ok) {
          throw new Error('Failed to load quote');
        }

        const quote = await quoteResponse.json();
        setQuoteData(quote);

        // Fetch package data
        const packageResponse = await fetch(`/api/packages/${packageId}`);

        if (!packageResponse.ok) {
          throw new Error('Package not found');
        }

        const pkg = await packageResponse.json();
        setPackageData(pkg);

        // Fetch pricing data
        const pricingResponse = await fetch('/api/packages/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: packageId,
            floorSqft: quote.floor_sqft,
            wetWallSqft: quote.wet_wall_sqft,
            dryWallSqft: quote.dry_wall_sqft || 0,
            showerFloorSqft: quote.shower_floor_sqft || 0,
            accentTileSqft: quote.accent_tile_sqft || 0,
            bathroomType: quote.bathroom_type,
            ceilingHeight: quote.ceiling_height,
            vanityWidth: quote.vanity_width
          })
        });

        if (!pricingResponse.ok) {
          throw new Error('Failed to calculate pricing');
        }

        const pricing = await pricingResponse.json();
        setPricingData(pricing);

        // Fetch universal bathroom config for conditional display
        const configResponse = await fetch('/api/universal-config');
        if (configResponse.ok) {
          const config = await configResponse.json();
          setUniversalConfig(config);
        }

      } catch (err) {
        console.error('Error loading package details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load package details');
      } finally {
        setLoading(false);
      }
    };

    if (token && packageId) {
      fetchData();
    }
  }, [token, packageId, router]);

  const handleSelectPackage = async () => {
    if (!quoteData || !packageData || !pricingData) return;

    try {
      setIsSelecting(true);
      setSelectionError(null);

      const response = await fetch('/api/customer/select-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          package_id: packageData.id,
          package_name: packageData.name,
          pricing_snapshot: {
            package_id: packageData.id,
            package_name: packageData.name,
            materials_subtotal: pricingData.total,
            materials_total: pricingData.total,
            labor_total: quoteData.labour_grand_total,
            grand_total: pricingData.total + quoteData.labour_grand_total,
          },
          customer_notes: null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save selection');
      }

      // Navigate to confirmation page
      router.push(`/customer/quote/${token}/complete`);

    } catch (err) {
      console.error('Selection error:', err);
      setSelectionError(err instanceof Error ? err.message : 'Failed to save selection');
    } finally {
      setIsSelecting(false);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Loading package details..." fullScreen />;
  }

  // Error state
  if (error || !quoteData || !packageData || !pricingData) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-navy mb-4">Error Loading Package</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={() => router.push(`/customer/quote/${token}/packages`)}>
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/customer/quote/${token}/packages`)}
                className="mb-2"
              >
                ← Back to Packages
              </Button>
              <h1 className="text-2xl font-bold text-navy">{packageData.name} Package</h1>
              <p className="text-sm text-gray-600">{quoteData.project_address}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 relative lg:mr-[420px]">

          {/* Left Content Area */}
          <div className="space-y-8">
            {/* Image Gallery */}
            <CustomerImageGallery
              images={packageData.images}
              packageName={packageData.name}
            />

            {/* Package Description */}
            {packageData.description && (
              <div className="mt-6">
                <p className="text-gray-600 text-lg leading-relaxed">
                  {packageData.description}
                </p>
              </div>
            )}

            {/* Product List */}
            <CustomerProductList
              products={packageData.products}
              quoteData={quoteData}
              bathroomType={quoteData.bathroom_type}
              universalConfig={universalConfig}
              packageName={packageData.name}
            />
          </div>

          {/* Fixed Right Sidebar */}
          <div className="lg:fixed lg:top-32 lg:right-8 lg:w-[380px] lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto">
            <CustomerQuoteSidebar
              quoteData={quoteData}
              pricing={{
                materialsSubtotal: pricingData.total,
                materialsTotal: pricingData.total,
                laborTotal: quoteData.labour_grand_total,
                grandTotal: pricingData.total + quoteData.labour_grand_total,
                isEstimate: pricingData.isEstimate
              }}
              packageName={packageData.name}
              onSelect={handleSelectPackage}
              isSelecting={isSelecting}
              error={selectionError}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
