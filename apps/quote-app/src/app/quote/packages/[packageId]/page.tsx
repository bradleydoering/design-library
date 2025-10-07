"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ClientAuthCheck } from "@/components/auth/ClientAuthCheck";
import CustomerImageGallery from "@/components/customer/CustomerImageGallery";
import CustomerProductList from "@/components/customer/CustomerProductList";
import { CalculatedQuote } from "@/lib/pricing";

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

function ContractorPackageDetailContent() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.packageId as string;

  const [laborQuote, setLaborQuote] = useState<CalculatedQuote | null>(null);
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [pricingData, setPricingData] = useState<PackagePricing | null>(null);
  const [universalConfig, setUniversalConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get labor quote from session storage
        const storedQuote = sessionStorage.getItem('calculatedLabourQuote');
        if (!storedQuote) {
          setError('No labor quote found. Please calculate a quote first.');
          router.push('/quote/calculate');
          return;
        }

        const quote: CalculatedQuote = JSON.parse(storedQuote);
        setLaborQuote(quote);

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
            floorSqft: quote.calculation_meta.total_floor_sqft,
            wetWallSqft: quote.raw_form_data.wet_wall_sqft,
            dryWallSqft: quote.raw_form_data.tile_other_walls_sqft || 0,
            showerFloorSqft: quote.raw_form_data.shower_floor_sqft || 0,
            accentTileSqft: quote.raw_form_data.accent_feature_sqft || 0,
            bathroomType: quote.raw_form_data.bathroom_type,
            vanityWidth: quote.raw_form_data.vanity_width_in
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

    if (packageId) {
      fetchData();
    }
  }, [packageId, router]);

  const handleSelectPackage = async () => {
    if (!laborQuote || !packageData || !pricingData) return;

    try {
      setIsSelecting(true);

      // Store complete quote data
      const completeQuote = {
        laborQuote,
        selectedPackage: packageData,
        pricing: {
          packageId: packageData.id,
          materialsSubtotal: pricingData.total,
          materialsTotal: pricingData.total,
          laborTotal: laborQuote.totals.grand_total,
          grandTotal: pricingData.total + laborQuote.totals.grand_total,
          isEstimate: pricingData.isEstimate
        },
        completedAt: new Date().toISOString()
      };

      sessionStorage.setItem('completeQuote', JSON.stringify(completeQuote));

      // Navigate to confirmation page
      router.push('/quote/complete');

    } catch (err) {
      console.error('Selection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save selection');
    } finally {
      setIsSelecting(false);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Loading package details..." fullScreen />;
  }

  // Error state
  if (error || !laborQuote || !packageData || !pricingData) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-navy mb-4">Error Loading Package</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={() => router.push('/quote/packages')}>
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  // Transform laborQuote to match customer QuoteData interface
  const quoteData = {
    quote_id: '',
    quote_name: laborQuote.raw_form_data.quote_name || '',
    customer_name: laborQuote.raw_form_data.customer_name || '',
    project_address: laborQuote.raw_form_data.project_address || '',
    bathroom_type: laborQuote.raw_form_data.bathroom_type,
    floor_sqft: laborQuote.calculation_meta.total_floor_sqft,
    wet_wall_sqft: laborQuote.raw_form_data.wet_wall_sqft,
    dry_wall_sqft: laborQuote.raw_form_data.tile_other_walls_sqft,
    shower_floor_sqft: laborQuote.raw_form_data.shower_floor_sqft,
    accent_tile_sqft: laborQuote.raw_form_data.accent_feature_sqft,
    vanity_width: laborQuote.raw_form_data.vanity_width_in,
    labour_grand_total: laborQuote.totals.grand_total,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

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
                onClick={() => router.push('/quote/packages')}
                className="mb-2"
              >
                ← Back to Packages
              </Button>
              <h1 className="text-2xl font-bold text-navy">{packageData.name} Package</h1>
              <p className="text-sm text-gray-600">{quoteData.project_address || 'Bathroom Renovation'}</p>
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
            {/* Pricing Summary Card */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 space-y-6">
              {/* Package Name */}
              <div>
                <h3 className="text-lg font-bold text-navy">{packageData.name}</h3>
                {pricingData.isEstimate && (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                    Estimated Pricing
                  </span>
                )}
              </div>

              {/* Quote Details Section */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Bathroom Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-navy capitalize">
                      {quoteData.bathroom_type.replace('_', ' ')}
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
                      ${quoteData.labour_grand_total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-600">
                      Materials{pricingData.isEstimate ? ' (Est.)' : ''}:
                    </span>
                    <span className="font-medium text-navy">
                      ${pricingData.total.toLocaleString()}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-base font-semibold text-navy">Total Project Cost:</span>
                      <span className="text-2xl font-bold text-coral">
                        ${(pricingData.total + quoteData.labour_grand_total).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {pricingData.isEstimate && (
                    <p className="text-xs text-blue-600 italic mt-2">
                      Custom design package - final pricing determined after material selection
                    </p>
                  )}
                </div>
              </div>

              {/* Select Button */}
              <div className="border-t border-gray-200 pt-4">
                <Button
                  className="w-full btn-coral text-lg py-6"
                  onClick={handleSelectPackage}
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ContractorPackageDetailPage() {
  return (
    <ClientAuthCheck>
      <ContractorPackageDetailContent />
    </ClientAuthCheck>
  );
}
