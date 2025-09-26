"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { CalculatedQuote } from "@/lib/pricing";
import Image from "next/image";

interface CompleteQuoteData {
  laborQuote: CalculatedQuote;
  selectedPackage: {
    id: string;
    name: string;
    description: string;
    image: string;
    category: string;
  };
  pricing: {
    packageId: string;
    materialsSubtotal: number;
    materialsTotal: number;
    laborTotal: number;
    grandTotal: number;
  };
  completedAt: string;
}

function QuoteCompleteContent() {
  const router = useRouter();
  const [completeQuote, setCompleteQuote] = useState<CompleteQuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCompleteQuote = async () => {
      try {
        const storedQuote = sessionStorage.getItem('completeQuote');
        if (!storedQuote) {
          setError('No complete quote found. Please start over.');
          return;
        }

        const parsedQuote: CompleteQuoteData = JSON.parse(storedQuote);
        setCompleteQuote(parsedQuote);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quote');
      } finally {
        setLoading(false);
      }
    };

    loadCompleteQuote();
  }, []);

  const handleSaveQuote = async () => {
    if (!completeQuote) return;

    try {
      setSaving(true);

      // TODO: Implement quote saving to database
      // This would include:
      // 1. Create quote record with labor data
      // 2. Add package selection record
      // 3. Store pricing snapshot

      // For now, just clear session storage and navigate
      sessionStorage.removeItem('contractorQuoteData');
      sessionStorage.removeItem('calculatedLabourQuote');
      sessionStorage.removeItem('completeQuote');

      // Navigate to dashboard
      router.push('/dashboard?saved=true');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = () => {
    sessionStorage.removeItem('contractorQuoteData');
    sessionStorage.removeItem('calculatedLabourQuote');
    sessionStorage.removeItem('completeQuote');
    router.push('/');
  };

  const handleSendToCustomer = () => {
    // TODO: Implement customer sharing functionality
    alert('Customer sharing feature coming soon!');
  };

  if (loading) {
    return <LoadingSpinner message="Loading complete quote..." fullScreen />;
  }

  if (error || !completeQuote) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-navy mb-4">Quote Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={() => router.push('/quote/packages')} className="btn-coral">
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <h1 className="text-2xl font-bold text-navy">Complete Renovation Quote</h1>
          <p className="text-gray-600">
            Labor + Materials = Total Project Cost
          </p>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Total Cost Highlight */}
          <div className="bg-gradient-to-r from-coral/10 to-coral/20 rounded-lg p-8 text-center">
            <div className="text-sm text-gray-600 mb-2">Complete Renovation Cost</div>
            <div className="text-5xl font-bold text-coral mb-2">
              ${completeQuote.pricing.grandTotal.toLocaleString()}
            </div>
            <div className="text-gray-600">
              Labor: ${completeQuote.pricing.laborTotal.toLocaleString()} +
              Materials: ${completeQuote.pricing.materialsTotal.toLocaleString()}
            </div>
          </div>

          {/* Quote Breakdown */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* Labor Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-navy mb-4">Labor Quote</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Project Type:</span>
                  <span className="font-semibold capitalize">
                    {completeQuote.laborQuote.raw_form_data.bathroom_type?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Floor Area:</span>
                  <span className="font-semibold">
                    {completeQuote.laborQuote.calculation_meta.total_floor_sqft} sq ft
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Wet Wall Area:</span>
                  <span className="font-semibold">
                    {completeQuote.laborQuote.raw_form_data.wet_wall_sqft} sq ft
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Labor Total:</span>
                  <span className="text-coral">${completeQuote.pricing.laborTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Package Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-navy mb-4">Selected Package</h2>

              <div className="space-y-4">
                {/* Package Image & Info */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 relative bg-gray-100 rounded">
                    {completeQuote.selectedPackage.image ? (
                      <Image
                        src={completeQuote.selectedPackage.image}
                        alt={completeQuote.selectedPackage.name}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-navy">{completeQuote.selectedPackage.name}</h3>
                    <p className="text-sm text-gray-600">{completeQuote.selectedPackage.description}</p>
                  </div>
                </div>

                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Materials Total:</span>
                  <span className="text-coral">${completeQuote.pricing.materialsTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-navy mb-6">Project Details</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-navy">Bathroom Configuration</h3>
                <div className="text-sm space-y-1">
                  <div>Type: {completeQuote.laborQuote.raw_form_data.bathroom_type?.replace('_', ' ')}</div>
                  <div>Building: {completeQuote.laborQuote.raw_form_data.building_type}</div>
                  <div>Year: {completeQuote.laborQuote.raw_form_data.year_built}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-navy">Dimensions</h3>
                <div className="text-sm space-y-1">
                  <div>Floor: {completeQuote.laborQuote.calculation_meta.total_floor_sqft} sq ft</div>
                  <div>Wet Walls: {completeQuote.laborQuote.raw_form_data.wet_wall_sqft} sq ft</div>
                  <div>Ceiling: {completeQuote.laborQuote.raw_form_data.ceiling_height}'</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-navy">Materials Package</h3>
                <div className="text-sm space-y-1">
                  <div>Package: {completeQuote.selectedPackage.name}</div>
                  <div>Category: {completeQuote.selectedPackage.category}</div>
                  <div>Selected: {new Date(completeQuote.completedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={handleCreateNew} variant="outline">
              Create New Quote
            </Button>

            <Button onClick={handleSendToCustomer} variant="outline">
              Send to Customer
            </Button>

            <Button
              onClick={handleSaveQuote}
              disabled={saving}
              className="btn-coral"
            >
              {saving ? 'Saving Quote...' : 'Save Complete Quote'}
            </Button>
          </div>

          {/* Quote ID / Reference */}
          <div className="text-center text-gray-500 text-sm">
            Generated on {new Date(completeQuote.completedAt).toLocaleString()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function QuoteCompletePage() {
  return (
    <ProtectedRoute>
      <QuoteCompleteContent />
    </ProtectedRoute>
  );
}