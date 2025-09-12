"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuoteFormData } from "@/types/quote";
import { calculateQuote, CalculatedQuote } from "@/lib/pricing";
import { mapFormToQuantities } from "@/lib/pricing/form-mapper";
import { Button } from "@/components/ui/button";

export default function QuoteCalculatePage() {
  const router = useRouter();
  const [quote, setQuote] = useState<CalculatedQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const loadAndCalculateQuote = async () => {
      try {
        // Get form data from session storage
        const storedData = sessionStorage.getItem('contractorQuoteData');
        if (!storedData) {
          setError('No quote data found. Please start over.');
          return;
        }

        const formData: QuoteFormData = JSON.parse(storedData);
        
        // Debug: Check what quantities are generated
        const { quantities, meta } = mapFormToQuantities(formData);
        console.log('Form data:', formData);
        console.log('Generated quantities:', quantities);
        console.log('Meta data:', meta);
        
        // Calculate the quote (now async)
        const calculatedQuote = await calculateQuote(formData);
        console.log('Final quote:', calculatedQuote);
        
        setQuote(calculatedQuote);
        setDebugInfo({ formData, quantities, meta });
        
      } catch (err) {
        console.error('Quote calculation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to calculate quote');
      } finally {
        setLoading(false);
      }
    };

    loadAndCalculateQuote();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-navy font-semibold">Calculating your quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-navy mb-4">Calculation Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={() => router.push('/')} className="btn-coral">
            Start New Quote
          </Button>
        </div>
      </div>
    );
  }

  const handleStartNewQuote = () => {
    sessionStorage.removeItem('contractorQuoteData');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <h1 className="text-2xl font-bold text-navy">Labor Quote Calculation</h1>
          <p className="text-gray-600">Detailed breakdown of labor costs</p>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Quote Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-navy">Quote Summary</h2>
              <div className="text-right">
                <div className="text-sm text-gray-600">Calculated on</div>
                <div className="font-semibold">{new Date(quote.calculation_meta.calculated_at).toLocaleString()}</div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Project Type</div>
                <div className="font-semibold capitalize">{quote.raw_form_data.bathroom_type?.replace('_', ' ')}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Building Type</div>
                <div className="font-semibold capitalize">{quote.raw_form_data.building_type}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Floor Area</div>
                <div className="font-semibold">{quote.calculation_meta.total_floor_sqft} sq ft</div>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Labor Subtotal:</span>
                  <span className="font-semibold">${quote.totals.labour_subtotal.toLocaleString()}</span>
                </div>
                
                {quote.totals.contingency > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Contingency (2%):</span>
                    <span>+${quote.totals.contingency.toLocaleString()}</span>
                  </div>
                )}
                
                {quote.totals.condo_uplift > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Condo Factor:</span>
                    <span>+${quote.totals.condo_uplift.toLocaleString()}</span>
                  </div>
                )}
                
                {quote.totals.oldhome_uplift > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Pre-1980 Factor:</span>
                    <span>+${quote.totals.oldhome_uplift.toLocaleString()}</span>
                  </div>
                )}
                
                {quote.totals.pm_fee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Project Management Fee:</span>
                    <span>+${quote.totals.pm_fee.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-coral">
                  <span>Grand Total:</span>
                  <span>${quote.totals.grand_total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-navy mb-6">Detailed Line Items</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Item</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Qty</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">Unit Price</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.line_items.map((item) => (
                    <tr key={item.line_code} className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        <div className="font-semibold text-navy">{item.line_name}</div>
                        <div className="text-sm text-gray-600">Code: {item.line_code}</div>
                      </td>
                      <td className="text-center py-3 px-2">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="text-right py-3 px-2">
                        {item.base_applied && <div className="text-sm text-gray-600">Base included</div>}
                        ${item.unit_price.toLocaleString()}/{item.unit}
                      </td>
                      <td className="text-right py-3 px-2 font-semibold">
                        ${item.extended.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Debug Info (remove in production) */}
          {debugInfo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-yellow-900 mb-4">🔍 Debug Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Generated Quantities ({Object.keys(debugInfo.quantities).length}):</h3>
                  <div className="bg-yellow-100 p-3 rounded text-sm">
                    {Object.entries(debugInfo.quantities).map(([code, qty]) => (
                      <div key={code} className="font-mono">
                        {code}: {qty as number}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Quote Line Items ({quote?.line_items.length}):</h3>
                  <div className="bg-yellow-100 p-3 rounded text-sm">
                    {quote?.line_items.map((item) => (
                      <div key={item.line_code} className="font-mono">
                        {item.line_code}: ${item.extended}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Missing from Quote:</h3>
                <div className="bg-red-100 p-3 rounded text-sm">
                  {Object.keys(debugInfo.quantities).filter(code => 
                    !quote?.line_items.some(item => item.line_code === code)
                  ).map(code => (
                    <div key={code} className="font-mono text-red-700">
                      ❌ {code}: {debugInfo.quantities[code]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={handleStartNewQuote} variant="outline">
              Calculate Another Quote
            </Button>
            <Button className="btn-coral">
              Save Quote & Continue
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}