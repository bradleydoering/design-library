"use client";

import { useEffect, useState } from "react";
import { QuoteFormData } from "@/types/quote";
import { calculateQuote, CalculatedQuote } from "@/lib/pricing";
import { mapFormToQuantities } from "@/lib/pricing/form-mapper";

export default function TestUpgradesPage() {
  const [quote, setQuote] = useState<CalculatedQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Test data with all upgrades enabled
  const testFormData: QuoteFormData = {
    bathroom_type: 'tub_shower',
    building_type: 'house',
    year_built: 'post_1980',
    floor_sqft: 30,
    wet_wall_sqft: 50,
    electrical_items: 2,
    vanity_width_in: 48,
    upgrades: {
      heated_floors: true,
      heated_towel_rack: true,
      bidet_addon: true, // Enable all upgrades
      smart_mirror: true,
      premium_exhaust_fan: true,
      built_in_niche: true,
      shower_bench: true,
      safety_grab_bars: true,
    }
  };

  useEffect(() => {
    const testCalculation = async () => {
      try {
        console.log('=== UPGRADE CALCULATION TEST ===');
        
        // Step 1: Check form mapping
        console.log('\n1. Form Data:', testFormData);
        console.log('2. Upgrades in form:', testFormData.upgrades);
        
        const { quantities, meta } = mapFormToQuantities(testFormData);
        console.log('\n3. Generated quantities:', quantities);
        
        // Check which upgrade codes were generated
        const upgradeFields = ['heated_floors', 'heated_towel_rack', 'bidet_addon', 'smart_mirror', 'premium_exhaust_fan', 'built_in_niche', 'shower_bench', 'safety_grab_bars'];
        const expectedCodes = ['HEATED-FLR', 'HEATED-RACK', 'BIDET-ADDON', 'SMART-MIRROR', 'PREMIUM-FAN', 'NICHE', 'BENCH', 'GRAB-BARS'];
        
        console.log('\n4. Upgrade Mapping Check:');
        upgradeFields.forEach((field, index) => {
          const code = expectedCodes[index];
          const isEnabled = testFormData.upgrades?.[field as keyof typeof testFormData.upgrades];
          const hasQuantity = !!quantities[code];
          console.log(`${field} (${isEnabled}) -> ${code}: ${hasQuantity ? quantities[code] : 'MISSING'}`);
        });
        
        // Step 2: Calculate full quote
        console.log('\n5. Calculating full quote...');
        const calculatedQuote = await calculateQuote(testFormData);
        
        console.log('\n6. Final quote line items:');
        calculatedQuote.line_items.forEach(item => {
          console.log(`${item.line_code}: ${item.line_name} (${item.quantity} x $${item.unit_price} + $${item.extended - (item.unit_price * item.quantity)} base) = $${item.extended}`);
        });
        
        // Check which upgrade line items made it through
        const upgradeLineItems = calculatedQuote.line_items.filter(item => 
          expectedCodes.includes(item.line_code)
        );
        
        console.log('\n7. Upgrade line items in final quote:', upgradeLineItems);
        
        if (upgradeLineItems.length === 0) {
          console.log('\n❌ NO UPGRADE LINE ITEMS FOUND IN FINAL QUOTE!');
        } else {
          console.log(`\n✅ Found ${upgradeLineItems.length}/${expectedCodes.length} upgrade line items`);
        }
        
        setQuote(calculatedQuote);
        setDebugInfo({ 
          formData: testFormData, 
          quantities, 
          meta,
          upgradeLineItems: upgradeLineItems.length,
          totalLineItems: calculatedQuote.line_items.length
        });
        
      } catch (err) {
        console.error('Test calculation error:', err);
        setError(err instanceof Error ? err.message : 'Test failed');
      } finally {
        setLoading(false);
      }
    };

    testCalculation();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-navy font-semibold">Testing upgrade calculations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
          <h1 className="text-red-900 font-bold mb-2">Calculation Error</h1>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-navy mb-8">🧪 Upgrade Calculation Test</h1>
        
        {/* Debug Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Summary</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Input Data</h3>
              <p>Bathroom Type: {debugInfo.formData.bathroom_type}</p>
              <p>Building Type: {debugInfo.formData.building_type}</p>
              <p>Floor SqFt: {debugInfo.formData.floor_sqft}</p>
              <p>Wet Wall SqFt: {debugInfo.formData.wet_wall_sqft}</p>
              <p>Electrical Items: {debugInfo.formData.electrical_items}</p>
              <p>All Upgrades: ✅ Enabled</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Results</h3>
              <p>Total Line Items: {debugInfo.totalLineItems}</p>
              <p>Upgrade Line Items: {debugInfo.upgradeLineItems}</p>
              <p>Grand Total: ${quote?.totals.grand_total.toLocaleString()}</p>
              <p className={debugInfo.upgradeLineItems === 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                {debugInfo.upgradeLineItems === 0 ? "❌ UPGRADES MISSING!" : "✅ Upgrades Present"}
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quote Line Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Code</th>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Unit Price</th>
                  <th className="px-3 py-2 text-right">Extended</th>
                  <th className="px-3 py-2 text-center">Type</th>
                </tr>
              </thead>
              <tbody>
                {quote?.line_items.map((item) => {
                  const isUpgrade = ['HEATED-FLR', 'HEATED-RACK', 'BIDET-ADDON', 'SMART-MIRROR', 'PREMIUM-FAN', 'NICHE', 'BENCH', 'GRAB-BARS'].includes(item.line_code);
                  return (
                    <tr key={item.line_code} className={isUpgrade ? "bg-green-50" : ""}>
                      <td className="px-3 py-2 font-mono text-xs">{item.line_code}</td>
                      <td className="px-3 py-2">{item.line_name}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">${item.unit_price}</td>
                      <td className="px-3 py-2 text-right font-medium">${item.extended.toLocaleString()}</td>
                      <td className="px-3 py-2 text-center">
                        {isUpgrade ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">UPGRADE</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">STANDARD</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quote Totals</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Labour Subtotal:</span>
              <span className="font-medium">${quote?.totals.labour_subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Contingency:</span>
              <span className="font-medium">${quote?.totals.contingency.toLocaleString()}</span>
            </div>
            {quote?.totals.condo_uplift! > 0 && (
              <div className="flex justify-between">
                <span>Condo Uplift:</span>
                <span className="font-medium">${quote?.totals.condo_uplift.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>PM Fee:</span>
              <span className="font-medium">${quote?.totals.pm_fee.toLocaleString()}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total:</span>
              <span>${quote?.totals.grand_total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}