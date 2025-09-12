"use client";

import { useEffect, useState } from 'react';
import { QuoteFormData } from '@/types/quote';
import { mapFormToQuantities } from '@/lib/pricing/form-mapper';
import { RateCardsAPI } from '@/lib/supabase';
import { calculateQuote } from '@/lib/pricing';

export default function CalculationDebugPage() {
  const [debug, setDebug] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugCalculation();
  }, []);

  const debugCalculation = async () => {
    try {
      // Sample form data that should trigger many line items
      const sampleFormData: QuoteFormData = {
        bathroom_type: 'walk_in', // Should trigger RECESS
        building_type: 'condo', // Should trigger condo uplift
        year_built: 'pre_1980', // Should trigger ASB-T
        floor_sqft: 50, // Should trigger TILE-FLR, DUMP
        shower_floor_sqft: 12, // Additional floor area
        wet_wall_sqft: 80, // Should trigger SUB-GRB, WPF-KER, TILE-WET
        tile_other_walls: true,
        tile_other_walls_sqft: 40, // Should trigger TILE-DRY
        ceiling_height_ft: 8,
        add_accent_feature: true,
        accent_feature_sqft: 20, // Additional TILE-DRY
        vanity_width_in: 48, // Should trigger VAN
        electrical_items: 3, // Should trigger ELE
        upgrades: {
          heated_floors: true, // Should trigger HEATED-FLR
          heated_towel_rack: true, // Should trigger HEATED-RACK
          bidet_addon: true, // Should trigger BIDET-ADDON
          smart_mirror: true, // Should trigger SMART-MIRROR
          premium_exhaust_fan: true, // Should trigger PREMIUM-FAN
          built_in_niche: true, // Should trigger NICHE
          shower_bench: true, // Should trigger BENCH
          safety_grab_bars: true, // Should trigger GRAB-BARS
        }
      };

      // Step 1: Get quantities mapping
      const { quantities, meta } = mapFormToQuantities(sampleFormData);

      // Step 2: Get rate cards from database
      const rates = await RateCardsAPI.getRateLines();
      const multipliers = await RateCardsAPI.getProjectMultipliers();

      // Step 3: Calculate full quote
      const quote = await calculateQuote(sampleFormData);

      setDebug({
        formData: sampleFormData,
        quantities,
        meta,
        rates,
        multipliers,
        quote,
        expectedLineItems: [
          'DEM', 'PLM', 'ELE', 'TILE-FLR', 'DUMP', 'SUB-GRB', 'WPF-KER', 
          'TILE-WET', 'TILE-DRY', 'VAN', 'RECESS', 'ASB-T', 'HEATED-FLR',
          'HEATED-RACK', 'BIDET-ADDON', 'SMART-MIRROR', 'PREMIUM-FAN',
          'NICHE', 'BENCH', 'GRAB-BARS'
        ]
      });
    } catch (error) {
      console.error('Debug calculation failed:', error);
      setDebug({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-navy font-semibold">Running calculation debug...</p>
        </div>
      </div>
    );
  }

  if (!debug || debug.error) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-navy mb-4">Debug Error</h1>
          <p className="text-gray-700 mb-6">{debug?.error || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  const missingFromQuote = debug.expectedLineItems.filter((code: string) => 
    !debug.quote.line_items.some((item: any) => item.line_code === code)
  );

  const missingFromQuantities = debug.expectedLineItems.filter((code: string) => 
    !debug.quantities[code] || debug.quantities[code] === 0
  );

  const missingFromRates = debug.expectedLineItems.filter((code: string) => 
    !debug.rates[code]
  );

  return (
    <div className="min-h-screen bg-offwhite">
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <h1 className="text-2xl font-bold text-navy">Calculation Debug</h1>
          <p className="text-gray-600">Trace quote calculation process</p>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-navy mb-4">Debug Summary</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-sm text-blue-600">Expected Line Items</div>
                <div className="font-semibold text-blue-900">{debug.expectedLineItems.length}</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-sm text-green-600">Generated Quantities</div>
                <div className="font-semibold text-green-900">{Object.keys(debug.quantities).length}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded">
                <div className="text-sm text-orange-600">Final Line Items</div>
                <div className="font-semibold text-orange-900">{debug.quote.line_items.length}</div>
              </div>
            </div>
          </div>

          {/* Issues Found */}
          {(missingFromQuote.length > 0 || missingFromQuantities.length > 0 || missingFromRates.length > 0) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-900 mb-4">🚨 Issues Found</h2>
              
              {missingFromRates.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-red-800">Missing from Rate Cards Database:</h3>
                  <div className="text-red-700 font-mono text-sm">{missingFromRates.join(', ')}</div>
                </div>
              )}
              
              {missingFromQuantities.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-red-800">Missing from Form Mapping:</h3>
                  <div className="text-red-700 font-mono text-sm">{missingFromQuantities.join(', ')}</div>
                </div>
              )}
              
              {missingFromQuote.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-red-800">Missing from Final Quote:</h3>
                  <div className="text-red-700 font-mono text-sm">{missingFromQuote.join(', ')}</div>
                </div>
              )}
            </div>
          )}

          {/* Generated Quantities */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-navy mb-4">Generated Quantities</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Line Code</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-left py-2">Trigger Logic</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(debug.quantities).map(([code, qty]) => (
                    <tr key={code} className="border-b border-gray-100">
                      <td className="py-2 font-mono">{code}</td>
                      <td className="py-2 text-right">{qty as number}</td>
                      <td className="py-2 text-gray-600 text-xs">
                        {getLogicExplanation(code, debug.formData)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Quote Line Items */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-navy mb-4">Final Quote Line Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Code</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Extended</th>
                  </tr>
                </thead>
                <tbody>
                  {debug.quote.line_items.map((item: any) => (
                    <tr key={item.line_code} className="border-b border-gray-100">
                      <td className="py-2 font-mono">{item.line_code}</td>
                      <td className="py-2">{item.line_name}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">${item.unit_price}</td>
                      <td className="py-2 text-right font-semibold">${item.extended}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function getLogicExplanation(lineCode: string, formData: QuoteFormData): string {
  switch (lineCode) {
    case 'DEM': return 'Always included';
    case 'PLM': return `Plumbing points calculation`;
    case 'ELE': return `electrical_items = ${formData.electrical_items}`;
    case 'ASB-T': return `year_built = ${formData.year_built}`;
    case 'TILE-FLR': return `floor_sqft + shower_floor_sqft = ${(formData.floor_sqft || 0) + (formData.shower_floor_sqft || 0)}`;
    case 'DUMP': return `Matches floor area`;
    case 'SUB-GRB': return `wet_wall_sqft = ${formData.wet_wall_sqft}`;
    case 'WPF-KER': return `wet_wall_sqft = ${formData.wet_wall_sqft}`;
    case 'TILE-WET': return `wet_wall_sqft = ${formData.wet_wall_sqft}`;
    case 'TILE-DRY': return `tile_other_walls + accent_feature = ${(formData.tile_other_walls_sqft || 0) + (formData.accent_feature_sqft || 0)}`;
    case 'VAN': return `vanity_width_in = ${formData.vanity_width_in}`;
    case 'RECESS': return `bathroom_type = ${formData.bathroom_type}`;
    default: 
      if (lineCode.startsWith('HEATED-') || lineCode.startsWith('BIDET-') || lineCode.startsWith('SMART-') || lineCode.startsWith('PREMIUM-') || lineCode.startsWith('GRAB-')) {
        return `Upgrade selected`;
      }
      return 'Unknown logic';
  }
}