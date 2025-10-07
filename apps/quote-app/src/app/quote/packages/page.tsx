"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalculatedQuote } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ClientAuthCheck } from "@/components/auth/ClientAuthCheck";
import Image from "next/image";

interface DesignPackage {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  items: {
    floorTile: string;
    wallTile: string;
    showerFloorTile: string;
    accentTile: string;
    vanity: string;
    tub: string;
    toilet: string;
    shower: string;
    faucet: string;
    mirror: string;
    lighting: string;
  };
}

interface PackagePricing {
  packageId: string;
  materialsSubtotal: number;
  materialsTotal: number;
  laborTotal: number;
  grandTotal: number;
  isEstimate?: boolean;
}

function PackageSelectionContent() {
  const router = useRouter();
  const [laborQuote, setLaborQuote] = useState<CalculatedQuote | null>(null);
  const [packages, setPackages] = useState<DesignPackage[]>([]);
  const [packagePricing, setPackagePricing] = useState<Map<string, PackagePricing>>(new Map());
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get labor quote from session storage
        const storedQuote = sessionStorage.getItem('calculatedLabourQuote');
        if (!storedQuote) {
          setError('No labor quote found. Please calculate a quote first.');
          return;
        }

        const parsedQuote: CalculatedQuote = JSON.parse(storedQuote);
        setLaborQuote(parsedQuote);

        // Fetch available packages via local API proxy
        const packagesResponse = await fetch('/api/packages');
        if (!packagesResponse.ok) {
          throw new Error('Failed to fetch design packages');
        }

        const packagesData = await packagesResponse.json();

        // Transform packages to our interface
        const transformedPackages: DesignPackage[] = packagesData.packages?.map((pkg: any) => ({
          id: pkg.ID,
          name: pkg.NAME,
          description: pkg.DESCRIPTION,
          image: pkg.IMAGE_MAIN,
          category: pkg.CATEGORY,
          items: {
            floorTile: pkg.items?.floorTile || pkg.TILES_FLOOR_SKU,
            wallTile: pkg.items?.wallTile || pkg.TILES_WALL_SKU,
            showerFloorTile: pkg.items?.showerFloorTile || pkg.TILES_SHOWER_FLOOR_SKU,
            accentTile: pkg.items?.accentTile || pkg.TILES_ACCENT_SKU,
            vanity: pkg.items?.vanity || pkg.VANITY_SKU,
            tub: pkg.items?.tub || pkg.TUB_SKU,
            toilet: pkg.items?.toilet || pkg.TOILET_SKU,
            shower: pkg.items?.shower || pkg.SHOWER_SKU,
            faucet: pkg.items?.faucet || pkg.FAUCET_SKU,
            mirror: pkg.items?.mirror || pkg.MIRROR_SKU,
            lighting: pkg.items?.lighting || pkg.LIGHTING_SKU,
          }
        })) || [];

        // Sort packages: custom design templates always at the bottom
        const sortedPackages = transformedPackages.sort((a, b) => {
          const aIsCustom = a.name.toLowerCase().includes('custom design');
          const bIsCustom = b.name.toLowerCase().includes('custom design');

          if (aIsCustom && !bIsCustom) return 1;  // a goes to bottom
          if (!aIsCustom && bIsCustom) return -1; // b goes to bottom
          return 0; // maintain original order for others
        });

        setPackages(sortedPackages);

        // Calculate pricing for each package
        await calculatePackagePricing(sortedPackages, parsedQuote);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const calculatePackagePricing = async (packages: DesignPackage[], laborQuote: CalculatedQuote) => {
    setLoadingPricing(true);
    const pricingMap = new Map<string, PackagePricing>();

    try {
      // Calculate pricing for each package
      for (const pkg of packages) {
        try {
          const pricingResponse = await fetch('/api/packages/pricing', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              packageId: pkg.id,
              floorSqft: laborQuote.calculation_meta.total_floor_sqft,
              wetWallSqft: laborQuote.raw_form_data.wet_wall_sqft,
              dryWallSqft: laborQuote.raw_form_data.tile_other_walls_sqft,
              showerFloorSqft: laborQuote.raw_form_data.shower_floor_sqft,
              accentTileSqft: laborQuote.raw_form_data.accent_feature_sqft,
              bathroomType: laborQuote.raw_form_data.bathroom_type,
              ceilingHeight: laborQuote.raw_form_data.ceiling_height,
              vanityWidth: laborQuote.raw_form_data.vanity_width
            })
          });

          if (pricingResponse.ok) {
            const pricingData = await pricingResponse.json();

            const packagePricing: PackagePricing = {
              packageId: pkg.id,
              materialsSubtotal: pricingData.subtotal || 0,
              materialsTotal: pricingData.total || 0,
              laborTotal: laborQuote.totals.grand_total,
              grandTotal: (pricingData.total || 0) + laborQuote.totals.grand_total
            };

            pricingMap.set(pkg.id, packagePricing);
          }
        } catch (err) {
          console.warn(`Failed to calculate pricing for package ${pkg.name}:`, err);
          // Set default pricing if calculation fails
          pricingMap.set(pkg.id, {
            packageId: pkg.id,
            materialsSubtotal: 0,
            materialsTotal: 0,
            laborTotal: laborQuote.totals.grand_total,
            grandTotal: laborQuote.totals.grand_total
          });
        }
      }

      setPackagePricing(pricingMap);
    } finally {
      setLoadingPricing(false);
    }
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackageId(packageId);
  };

  const handleContinueWithPackage = () => {
    if (!selectedPackageId || !laborQuote) return;

    const selectedPackage = packages.find(p => p.id === selectedPackageId);
    const pricing = packagePricing.get(selectedPackageId);

    if (!selectedPackage || !pricing) return;

    // Store complete quote data
    const completeQuote = {
      laborQuote,
      selectedPackage,
      pricing,
      completedAt: new Date().toISOString()
    };

    sessionStorage.setItem('completeQuote', JSON.stringify(completeQuote));

    // Navigate to final quote summary
    router.push('/quote/complete');
  };

  const handleSendToCustomer = () => {
    // If no package selected, show message
    if (!selectedPackageId || !laborQuote) {
      alert('Please select a design package first.');
      return;
    }

    // If package is selected, go to complete page (same as Continue button)
    handleContinueWithPackage();
  };


  if (loading) {
    return <LoadingSpinner message="Loading design packages..." fullScreen />;
  }

  if (error || !laborQuote) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-navy mb-4">Loading Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={() => router.push('/quote/calculate')} className="btn-coral">
            Back to Quote
          </Button>
        </div>
      </div>
    );
  }

  const selectedPricing = selectedPackageId ? packagePricing.get(selectedPackageId) : null;

  return (
    <div className="min-h-screen bg-offwhite pb-32">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container-custom py-4">
          <h1 className="text-2xl font-bold text-navy">Select Design Package</h1>
          <div className="mt-2 space-y-1">
            <p className="text-gray-600">
              <span className="font-semibold">Labor Total:</span> <span className="text-coral">${laborQuote.totals.grand_total.toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-500">
              Floor: {laborQuote.calculation_meta.total_floor_sqft} sq ft
              {" • "}Wet Walls: {laborQuote.raw_form_data.wet_wall_sqft} sq ft
              {laborQuote.raw_form_data.tile_other_walls_sqft && ` • Dry Walls: ${laborQuote.raw_form_data.tile_other_walls_sqft} sq ft`}
              {laborQuote.raw_form_data.shower_floor_sqft && ` • Shower Floor: ${laborQuote.raw_form_data.shower_floor_sqft} sq ft`}
            </p>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-7xl mx-auto">

          {loadingPricing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-blue-700">Calculating package pricing based on your bathroom dimensions...</span>
              </div>
            </div>
          )}

          {/* Package Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {packages.map((pkg) => {
              const pricing = packagePricing.get(pkg.id);
              const isSelected = selectedPackageId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl ${
                    isSelected ? 'ring-2 ring-coral border-coral' : ''
                  }`}
                  onClick={() => handlePackageSelect(pkg.id)}
                >
                  {/* Package Image */}
                  <div className="aspect-[4/3] relative bg-gray-100">
                    {pkg.image ? (
                      <Image
                        src={pkg.image}
                        alt={pkg.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        quality={75}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Package Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-navy mb-2">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pkg.description}</p>
                    )}

                    {/* Pricing */}
                    {pricing ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-gray-500">
                            Materials{pricing.isEstimate ? ' (Est.)' : ''}:
                          </span>
                          <span className="text-base font-semibold text-navy">
                            ${pricing.materialsTotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 border-t">
                          <span className="text-sm font-medium text-navy">Total Project:</span>
                          <span className="text-lg font-bold text-coral">
                            ${pricing.grandTotal.toLocaleString()}
                          </span>
                        </div>
                        {pricing.isEstimate && (
                          <p className="text-xs text-blue-600 italic">
                            Custom design - final pricing determined after material selection
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400">Calculating...</div>
                    )}

                    {/* See Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/quote/packages/${pkg.id}`);
                      }}
                      className="mt-3 w-full py-2 text-sm text-navy border border-gray-300 hover:border-navy hover:bg-gray-50 transition-colors rounded"
                    >
                      See Details →
                    </button>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="mt-3 text-coral text-sm font-semibold text-center">
                        ✓ Selected
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Footer with Summary and Actions */}
          {selectedPricing && (
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
              <div className="container-custom py-4">
                <div className="max-w-7xl mx-auto">
                  {/* Complete Quote Summary */}
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-navy mb-3">Complete Quote Summary</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Selected Package</p>
                        <p className="font-semibold text-navy">
                          {packages.find(p => p.id === selectedPackageId)?.name}
                        </p>
                      </div>
                      <div className="flex justify-between md:justify-start md:gap-8">
                        <div>
                          <p className="text-sm text-gray-600">Labor</p>
                          <p className="font-semibold">${selectedPricing.laborTotal.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Materials</p>
                          <p className="font-semibold">${selectedPricing.materialsTotal.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Project Cost</p>
                        <p className="text-2xl font-bold text-coral">${selectedPricing.grandTotal.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end">
                    <Button onClick={() => router.back()} variant="outline" size="sm">
                      ← Back
                    </Button>
                    <Button onClick={handleSendToCustomer} variant="outline" size="sm">
                      Send to Customer
                    </Button>
                    <Button
                      className="btn-coral"
                      size="sm"
                      onClick={handleContinueWithPackage}
                    >
                      Continue →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Footer - No Selection */}
          {!selectedPricing && (
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
              <div className="container-custom py-4">
                <div className="max-w-7xl mx-auto flex gap-3 justify-between items-center">
                  <Button onClick={() => router.back()} variant="outline" size="sm">
                    ← Back to Labor Quote
                  </Button>
                  <p className="text-gray-500 text-sm">Select a package to continue</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function PackageSelectionPage() {
  return (
    <ClientAuthCheck>
      <PackageSelectionContent />
    </ClientAuthCheck>
  );
}