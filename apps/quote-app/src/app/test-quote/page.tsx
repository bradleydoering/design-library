"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuoteFormData } from '@/types/quote';

export default function TestQuotePage() {
  const router = useRouter();

  useEffect(() => {
    // Create comprehensive test data
    const testData: QuoteFormData = {
      bathroom_type: 'walk_in', // Should trigger RECESS
      building_type: 'condo', // Should trigger condo uplift
      year_built: 'pre_1980', // Should trigger ASB-T
      floor_sqft: 40,
      shower_floor_sqft: 12,
      wet_wall_sqft: 60,
      tile_other_walls: true,
      tile_other_walls_sqft: 30,
      ceiling_height_ft: 8,
      add_accent_feature: true,
      accent_feature_sqft: 15,
      vanity_width_in: 48, // Should trigger VAN
      electrical_items: 4, // Should trigger ELE
      upgrades: {
        heated_floors: true, // Should trigger HEATED-FLR
        heated_towel_rack: true, // Should trigger HEATED-RACK
        bidet_addon: true, // Should trigger BIDET-ADDON
        smart_mirror: false,
        premium_exhaust_fan: true, // Should trigger PREMIUM-FAN
        built_in_niche: true, // Should trigger NICHE
        shower_bench: true, // Should trigger BENCH
        safety_grab_bars: true, // Should trigger GRAB-BARS
      }
    };

    // Store in sessionStorage
    sessionStorage.setItem('contractorQuoteData', JSON.stringify(testData));
    
    // Redirect to calculate page
    router.push('/quote/calculate');
  }, [router]);

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
        <p className="text-navy font-semibold">Setting up test quote...</p>
      </div>
    </div>
  );
}