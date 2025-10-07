"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ClientAuthCheck } from "@/components/auth/ClientAuthCheck";
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
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerData, setCustomerData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    project_address: '',
  });

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
    // Show customer form before saving (save to DB only, don't send)
    setShowCustomerForm(true);
  };

  const handleSendToCustomer = () => {
    // Show customer form before sending (save to DB AND send email)
    setShowCustomerForm(true);
  };

  const handleActuallySave = async () => {
    if (!completeQuote) return;

    // Validate customer data
    if (!customerData.customer_name.trim() || !customerData.project_address.trim()) {
      setError('Please fill in customer name and project address');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Create quote in database
      const response = await fetch('/api/quotes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_name: completeQuote.laborQuote.raw_form_data.quote_name || 'Bathroom Renovation',
          customer_name: customerData.customer_name,
          customer_email: customerData.customer_email || null,
          customer_phone: customerData.customer_phone || null,
          project_address: customerData.project_address,
          bathroom_type: completeQuote.laborQuote.raw_form_data.bathroom_type,
          building_type: completeQuote.laborQuote.raw_form_data.building_type,
          year_built: completeQuote.laborQuote.raw_form_data.year_built,
          floor_sqft: completeQuote.laborQuote.calculation_meta.total_floor_sqft,
          wet_wall_sqft: completeQuote.laborQuote.raw_form_data.wet_wall_sqft,
          ceiling_height: completeQuote.laborQuote.raw_form_data.ceiling_height,
          vanity_width: completeQuote.laborQuote.raw_form_data.vanity_width,
          labour_grand_total: completeQuote.pricing.laborTotal,
          labour_subtotal_cents: Math.round(completeQuote.pricing.laborTotal * 100),
          materials_subtotal_cents: Math.round(completeQuote.pricing.materialsTotal * 100),
          grand_total_cents: Math.round(completeQuote.pricing.grandTotal * 100),
          package_id: completeQuote.selectedPackage.id,
          package_name: completeQuote.selectedPackage.name,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Quote save error:', errorData);
        throw new Error(`${errorData.error || 'Failed to save quote'}${errorData.details ? ': ' + errorData.details : ''}${errorData.code ? ' (code: ' + errorData.code + ')' : ''}`);
      }

      const { quote_id } = await response.json();

      // Get the customer token for this quote
      const tokenResponse = await fetch('/api/customer/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_id: quote_id,
          customer_name: customerData.customer_name,
          customer_email: customerData.customer_email,
          customer_phone: customerData.customer_phone,
          project_address: customerData.project_address,
          skip_email: true, // Don't send email yet, just get the token
        })
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error || 'Failed to generate customer link');
      }

      const { token } = await tokenResponse.json();

      // Clear session storage
      sessionStorage.removeItem('contractorQuoteData');
      sessionStorage.removeItem('calculatedLabourQuote');
      sessionStorage.removeItem('completeQuote');

      // Navigate to customer's complete page to collect deposit
      router.push(`/customer/quote/${token}/complete`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save and send quote');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = () => {
    sessionStorage.removeItem('contractorQuoteData');
    sessionStorage.removeItem('calculatedLabourQuote');
    sessionStorage.removeItem('completeQuote');
    router.push('/intake');
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

          {/* Primary Action - Continue to Deposit */}
          <div className="bg-gradient-to-r from-coral/10 to-coral/20 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-navy mb-2">Ready to Collect Deposit</h3>
            <p className="text-gray-600 mb-6">
              Continue to collect the customer deposit and finalize this project
            </p>
            <Button
              onClick={handleSaveQuote}
              disabled={saving}
              className="btn-coral text-lg px-12 py-6"
            >
              {saving ? 'Saving Quote...' : 'Continue to Deposit →'}
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={handleSendToCustomer} variant="outline" size="sm">
              Send to Customer via Email
            </Button>

            <Button onClick={handleCreateNew} variant="outline" size="sm">
              Create New Quote
            </Button>
          </div>

          {/* Quote ID / Reference */}
          <div className="text-center text-gray-500 text-sm">
            Generated on {new Date(completeQuote.completedAt).toLocaleString()}
          </div>
        </div>
      </main>

      {/* Customer Information Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-navy mb-2">Customer Information</h2>
              <p className="text-gray-600 mb-6">Please provide customer details for this quote</p>

              <div className="space-y-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerData.customer_name}
                    onChange={(e) => setCustomerData({ ...customerData, customer_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                    placeholder="Enter customer's full name"
                    required
                  />
                </div>

                {/* Project Address */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Project Address *
                  </label>
                  <textarea
                    value={customerData.project_address}
                    onChange={(e) => setCustomerData({ ...customerData, project_address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral resize-none"
                    placeholder="Enter the complete project address"
                    rows={3}
                    required
                  />
                </div>

                {/* Customer Email */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerData.customer_email}
                    onChange={(e) => setCustomerData({ ...customerData, customer_email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                    placeholder="customer@example.com"
                  />
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerData.customer_phone}
                    onChange={(e) => setCustomerData({ ...customerData, customer_phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowCustomerForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleActuallySave}
                  disabled={!customerData.customer_name.trim() || !customerData.project_address.trim() || saving}
                  className="btn-coral flex-1"
                >
                  {saving ? 'Saving...' : 'Save Quote'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuoteCompletePage() {
  return (
    <ClientAuthCheck>
      <QuoteCompleteContent />
    </ClientAuthCheck>
  );
}