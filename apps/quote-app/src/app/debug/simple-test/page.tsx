"use client";

import { useEffect, useState } from 'react';
import { QuoteFormData } from '@/types/quote';
import { calculateQuote } from '@/lib/pricing';

export default function SimpleTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testCalculation();
  }, []);

  const testCalculation = async () => {
    try {
      // Minimal test data
      const testData: QuoteFormData = {
        bathroom_type: 'tub_shower',
        building_type: 'house', 
        year_built: 'pre_1980', // Should trigger ASB-T
        floor_sqft: 30,
        wet_wall_sqft: 50,
        electrical_items: 2,
        vanity_width_in: 48, // Should trigger VAN
        upgrades: {
          heated_floors: true, // Should trigger HEATED-FLR
          heated_towel_rack: false,
          bidet_addon: false,
          smart_mirror: false,
          premium_exhaust_fan: false,
          built_in_niche: false,
          shower_bench: false,
          safety_grab_bars: false,
        }
      };

      console.log('Testing with form data:', testData);
      
      const quote = await calculateQuote(testData);
      
      console.log('Quote result:', quote);
      
      setResult({
        success: true,
        formData: testData,
        quote,
        expectedItems: ['DEM', 'PLM', 'ELE', 'TILE-FLR', 'DUMP', 'SUB-GRB', 'WPF-KER', 'TILE-WET', 'VAN', 'ASB-T', 'HEATED-FLR'],
        actualItems: quote.line_items.map((item: any) => item.line_code)
      });
      
    } catch (error) {
      console.error('Test failed:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-navy font-semibold">Running simple test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-navy mb-6">Simple Calculation Test</h1>
        
        {result.success ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-green-800 font-semibold mb-2">✅ Calculation Successful</h2>
              <p className="text-green-700">Total: ${result.quote.totals.grand_total}</p>
              <p className="text-green-700">Line Items: {result.quote.line_items.length}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Expected vs Actual Line Items</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Expected ({result.expectedItems.length}):</h4>
                  <div className="bg-blue-50 p-3 rounded">
                    {result.expectedItems.map((code: string) => (
                      <div key={code} className={`text-sm font-mono ${result.actualItems.includes(code) ? 'text-green-700' : 'text-red-700'}`}>
                        {result.actualItems.includes(code) ? '✅' : '❌'} {code}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-green-900 mb-2">Actual ({result.actualItems.length}):</h4>
                  <div className="bg-green-50 p-3 rounded">
                    {result.actualItems.map((code: string) => (
                      <div key={code} className="text-sm font-mono text-green-700">
                        ✅ {code}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Missing Line Items</h3>
              {result.expectedItems.filter((code: string) => !result.actualItems.includes(code)).map((code: string) => (
                <div key={code} className="text-red-700 font-mono text-sm">❌ {code}</div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Full Quote Details</h3>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(result.quote, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold mb-2">❌ Calculation Failed</h2>
            <p className="text-red-700">{result.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}