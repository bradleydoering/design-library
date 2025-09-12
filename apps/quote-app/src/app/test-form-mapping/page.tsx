"use client";

import { useEffect, useState } from "react";
import { QuoteFormData } from "@/types/quote";
import { mapFormToQuantities } from "@/lib/pricing/form-mapper";

export default function TestFormMappingPage() {
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 Starting form mapping test...');
    
    try {
      const testData: QuoteFormData = {
        bathroom_type: 'tub_shower',
        building_type: 'house',
        year_built: 'post_1980',
        floor_sqft: 30,
        wet_wall_sqft: 50,
        electrical_items: 2,
        vanity_width_in: 48,
        // Essential missing fields from the type
        tile_other_walls: false,
        add_accent_feature: false,
        ceiling_height: 8,
        upgrades: {
          heated_floors: true,
          heated_towel_rack: true,
          bidet_addon: false,
          smart_mirror: true,
          premium_exhaust_fan: false,
          built_in_niche: true,
          shower_bench: false,
          safety_grab_bars: true,
        }
      };

      console.log('✅ Test data created');
      console.log('🔄 Calling mapFormToQuantities...');
      
      const { quantities, meta } = mapFormToQuantities(testData);
      
      console.log('✅ mapFormToQuantities completed');
      console.log('📊 Final quantities:', quantities);
      
      const upgradeQuantities = Object.entries(quantities).filter(([code]) => 
        ['HEATED-FLR', 'HEATED-RACK', 'BIDET-ADDON', 'SMART-MIRROR', 'PREMIUM-FAN', 'NICHE', 'BENCH', 'GRAB-BARS'].includes(code)
      );
      
      console.log('🎯 Upgrade quantities:', upgradeQuantities);
      
      setResults({
        quantities,
        meta,
        upgradeCount: upgradeQuantities.length,
        upgradeQuantities
      });
      
    } catch (err) {
      console.error('❌ Form mapping test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-offwhite p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-navy mb-6">❌ Form Mapping Test Error</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-offwhite p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-navy mb-6">⏳ Form Mapping Test</h1>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto mb-4"></div>
            <p className="text-navy">Testing form mapping...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-navy mb-8">✅ Form Mapping Test Results</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="space-y-2">
              <p>Total quantities generated: <span className="font-bold">{Object.keys(results.quantities).length}</span></p>
              <p>Upgrade quantities found: <span className="font-bold">{results.upgradeCount}</span></p>
              <p className={results.upgradeCount > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                Status: {results.upgradeCount > 0 ? "✅ Upgrades Present" : "❌ No Upgrades"}
              </p>
            </div>
          </div>

          {/* Upgrade Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Upgrade Line Items</h2>
            {results.upgradeQuantities.length > 0 ? (
              <div className="space-y-2">
                {results.upgradeQuantities.map(([code, quantity]: [string, number]) => (
                  <div key={code} className="flex justify-between p-2 bg-green-50 rounded">
                    <span className="font-mono text-sm">{code}</span>
                    <span className="font-bold">{quantity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-600">No upgrade quantities found</p>
            )}
          </div>

          {/* All Quantities */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">All Generated Quantities</h2>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(results.quantities, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}