"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestRealFlowPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('🚀 Setting up test data and redirecting to real quote flow...');
    
    const testData = {
      bathroom_type: 'tub_shower',
      building_type: 'house',
      year_built: 'post_1980',
      floor_sqft: 30,
      wet_wall_sqft: 50,
      electrical_items: 2,
      vanity_width_in: 48,
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

    // Save test data to sessionStorage
    console.log('💾 Saving test data to sessionStorage:', testData);
    sessionStorage.setItem('contractorQuoteData', JSON.stringify(testData));
    
    // Redirect to calculate page after a short delay
    console.log('🔄 Redirecting to quote/calculate...');
    setTimeout(() => {
      router.push('/quote/calculate');
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-navy mb-2">Setting up test data...</h1>
        <p className="text-gray-600">Redirecting to quote calculation...</p>
      </div>
    </div>
  );
}