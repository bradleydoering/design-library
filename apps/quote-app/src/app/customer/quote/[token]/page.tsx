"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface QuoteData {
  quote_id: string;
  quote_name: string;
  customer_name: string;
  project_address: string;
  bathroom_type: string;
  building_type: string;
  year_built: string;
  floor_sqft: number;
  wet_wall_sqft: number;
  vanity_width: number;
  labour_grand_total: number;
  created_at: string;
  expires_at: string;
}

export default function CustomerQuotePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchQuoteData = async () => {
      try {
        const response = await fetch(`/api/customer/quote/${params.token}`);

        if (response.status === 410) {
          setIsExpired(true);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load quote');
        }

        const data = await response.json();
        setQuoteData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quote');
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteData();
  }, [params.token]);

  if (loading) {
    return <LoadingSpinner message="Loading your quote..." fullScreen />;
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <div className="text-amber-500 text-5xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-navy mb-4">Quote Expired</h1>
          <p className="text-gray-700 mb-6">
            This quote link has expired. Please contact us for a new quote.
          </p>
          <a
            href="https://cloudrenovation.ca/contact"
            className="inline-block px-6 py-3 bg-coral text-white rounded-lg hover:bg-coral/90 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    );
  }

  if (error || !quoteData) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-navy mb-4">Error Loading Quote</h1>
          <p className="text-gray-700 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <h1 className="text-3xl font-bold text-navy">Your Bathroom Renovation Quote</h1>
          <p className="text-gray-600 mt-2">
            Hello {quoteData.customer_name}! Here's your personalized quote.
          </p>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Quote Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-navy mb-6">Quote Summary</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-navy mb-3">Project Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{quoteData.project_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bathroom Type:</span>
                    <span className="font-medium capitalize">{quoteData.bathroom_type?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Building Type:</span>
                    <span className="font-medium capitalize">{quoteData.building_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year Built:</span>
                    <span className="font-medium">{quoteData.year_built}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-navy mb-3">Dimensions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Floor Area:</span>
                    <span className="font-medium">{quoteData.floor_sqft} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wet Wall Area:</span>
                    <span className="font-medium">{quoteData.wet_wall_sqft} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vanity Width:</span>
                    <span className="font-medium">{quoteData.vanity_width}"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Labor Cost */}
          <div className="bg-gradient-to-r from-coral/10 to-coral/20 rounded-lg p-8 text-center">
            <div className="text-sm text-gray-600 mb-2">Estimated Labor Cost</div>
            <div className="text-5xl font-bold text-coral mb-2">
              ${quoteData.labour_grand_total.toLocaleString()}
            </div>
            <div className="text-gray-600">
              Professional installation and labor
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-navy mb-4">
              Choose Your Design Package
            </h2>
            <p className="text-gray-600 mb-6">
              Browse our curated design packages to see materials and complete project costs
            </p>
            <Button
              onClick={() => router.push(`/customer/quote/${params.token}/packages`)}
              className="btn-coral text-lg px-8 py-6"
            >
              Browse Design Packages →
            </Button>
          </div>

          {/* Quote Expiry Notice */}
          <div className="text-center text-sm text-gray-500">
            <p>This quote expires on {new Date(quoteData.expires_at).toLocaleDateString()}</p>
            <p className="mt-1">Quote created on {new Date(quoteData.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
