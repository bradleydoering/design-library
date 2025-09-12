"use client";

import { useEffect, useState } from 'react';
import { QuoteFormData } from '@/types/quote';
import { mapFormToQuantities } from '@/lib/pricing/form-mapper';
import { RateCardsAPI } from '@/lib/supabase';

export default function DebugUpgradesPage() {
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runDebugTest();
  }, []);

  const runDebugTest = async () => {
    try {
      console.log('=== STARTING DEBUG TEST ===');
      
      // Test data with upgrades
      const testData: QuoteFormData = {
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
          bidet_addon: false,
          smart_mirror: true,
          premium_exhaust_fan: false,
          built_in_niche: true,
          shower_bench: false,
          safety_grab_bars: true,
        }
      };

      console.log('1. Test form data:', testData);

      // Step 1: Check form mapping
      console.log('2. Running form mapping...');
      const { quantities, meta } = mapFormToQuantities(testData);
      console.log('3. Generated quantities:', quantities);

      // Check specific upgrade codes
      const upgradeChecks = [
        { field: 'heated_floors', code: 'HEATED-FLR', enabled: testData.upgrades?.heated_floors },
        { field: 'heated_towel_rack', code: 'HEATED-RACK', enabled: testData.upgrades?.heated_towel_rack },
        { field: 'smart_mirror', code: 'SMART-MIRROR', enabled: testData.upgrades?.smart_mirror },
        { field: 'built_in_niche', code: 'NICHE', enabled: testData.upgrades?.built_in_niche },
        { field: 'safety_grab_bars', code: 'GRAB-BARS', enabled: testData.upgrades?.safety_grab_bars },
      ];

      console.log('4. Upgrade mapping results:');
      upgradeChecks.forEach(({ field, code, enabled }) => {
        const hasQuantity = !!quantities[code];
        console.log(`${field} (${enabled}) -> ${code}: ${hasQuantity ? 'PRESENT' : 'MISSING'}`);
      });

      // Step 2: Check database
      console.log('5. Checking database...');
      const rates = await RateCardsAPI.getRateLines();
      console.log('6. Database loaded, checking upgrade rates...');

      const expectedUpgrades = ['HEATED-FLR', 'HEATED-RACK', 'SMART-MIRROR', 'NICHE', 'GRAB-BARS'];
      const upgradeRatesExists = expectedUpgrades.map(code => ({
        code,
        exists: !!rates[code],
        active: rates[code]?.active,
        price: rates[code]?.base_price || 0
      }));

      console.log('7. Upgrade rates in database:', upgradeRatesExists);

      // Step 3: Missing analysis
      const missingUpgrades = expectedUpgrades.filter(code => !quantities[code]);
      console.log('8. Upgrade codes missing from quantities:', missingUpgrades);

      if (missingUpgrades.length === 0) {
        console.log('✅ ALL UPGRADES PRESENT IN QUANTITIES');
      } else {
        console.log('❌ MISSING UPGRADES:', missingUpgrades);
      }

      setResults({
        testData,
        quantities,
        expectedUpgrades,
        missingUpgrades,
        upgradeRatesExists,
        upgradeChecks
      });

    } catch (err) {
      console.error('Debug test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-offwhite p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-navy mb-6">🔍 Upgrade Debug Test</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-navy mb-6">🔍 Upgrade Debug Test</h1>
        
        {!results ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto mb-4"></div>
            <p className="text-navy">Running debug test...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold mb-4">Test Form Data</h2>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(results.testData.upgrades, null, 2)}
              </pre>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold mb-4">Generated Quantities</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">All Quantities:</h3>
                  <pre className="text-xs bg-gray-100 p-4 rounded">
                    {JSON.stringify(results.quantities, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Upgrade Analysis:</h3>
                  <div className="space-y-2 text-sm">
                    {results.expectedUpgrades.map((code: string) => (
                      <div key={code} className={`p-2 rounded ${results.quantities[code] ? 'bg-green-100' : 'bg-red-100'}`}>
                        <span className="font-mono">{code}</span>: 
                        {results.quantities[code] ? (
                          <span className="text-green-700 ml-2">✅ Present ({results.quantities[code]})</span>
                        ) : (
                          <span className="text-red-700 ml-2">❌ Missing</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold mb-4">Database Rate Cards</h2>
              <div className="space-y-2">
                {results.upgradeRatesExists.map((rate: any) => (
                  <div key={rate.code} className={`p-2 rounded ${rate.exists && rate.active ? 'bg-green-100' : 'bg-red-100'}`}>
                    <span className="font-mono">{rate.code}</span>:
                    {rate.exists ? (
                      rate.active ? (
                        <span className="text-green-700 ml-2">✅ Exists & Active</span>
                      ) : (
                        <span className="text-orange-700 ml-2">⚠️ Exists but Inactive</span>
                      )
                    ) : (
                      <span className="text-red-700 ml-2">❌ Missing from Database</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {results.missingUpgrades.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="font-semibold text-red-900 mb-4">🚨 Issues Found</h2>
                <p className="text-red-800">
                  {results.missingUpgrades.length} upgrade codes are missing from quantities: {results.missingUpgrades.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}