import { QuoteFormData } from '@/types/quote';

export interface QuantityMap {
  [line_code: string]: number;
}

export interface CalculationMeta {
  plumbing_points: number;
  electrical_items: number;
  total_floor_sqft: number;
  wet_wall_sqft: number;
  dry_wall_sqft: number;
  accent_feature_sqft: number;
}

/**
 * Maps form data to line item quantities based on CloudReno's adapted V1 pricing rules
 */
export function mapFormToQuantities(formData: QuoteFormData): { quantities: QuantityMap; meta: CalculationMeta } {
  const quantities: QuantityMap = {};
  
  // Calculate derived values
  const totalFloorSqft = (formData.floor_sqft || 0) + (formData.shower_floor_sqft || 0);
  const wetWallSqft = formData.wet_wall_sqft || 0;
  const dryWallSqft = formData.tile_other_walls ? (formData.tile_other_walls_sqft || 0) : 0;
  const accentFeatureSqft = formData.add_accent_feature ? (formData.accent_feature_sqft || 0) : 0;
  
  // Calculate plumbing points: +3 for shower pan/tub, +1 per sink, +1 per shower set, +1 per toilet
  let plumbingPoints = 0;
  if (formData.bathroom_type !== 'powder') {
    plumbingPoints += 3; // shower pan/tub
    plumbingPoints += 1; // shower set (for walk_in, tub_shower)
  }
  plumbingPoints += 1; // sink (all types have sinks)
  if (formData.bathroom_type !== 'walk_in') {
    plumbingPoints += 1; // toilet (all except walk_in showers)
  }
  
  // Always add baseline items
  quantities['DEM'] = 1; // Always demolition
  if (plumbingPoints > 0) quantities['PLM'] = plumbingPoints;
  if (formData.electrical_items > 0) quantities['ELE'] = formData.electrical_items;
  
  // Floor tiling (combine main floor + shower floor)
  if (totalFloorSqft > 0) {
    quantities['TILE-FLR'] = totalFloorSqft;
    quantities['DUMP'] = totalFloorSqft; // Disposal matches floor area
  }
  
  // Wet walls (shower/tub areas)
  if (wetWallSqft > 0) {
    quantities['SUB-GRB'] = wetWallSqft;    // Backerboard
    quantities['WPF-KER'] = wetWallSqft;    // Waterproofing 
    quantities['TILE-WET'] = wetWallSqft;   // Wet wall tiling
  }
  
  // Dry wall tiling (combine regular dry walls + accent features)
  const totalDryWallTileSqft = dryWallSqft + accentFeatureSqft;
  if (totalDryWallTileSqft > 0) {
    quantities['TILE-DRY'] = totalDryWallTileSqft;
  }
  
  // Vanity installation
  if (formData.vanity_width_in && formData.vanity_width_in > 0) {
    quantities['VAN'] = 1;
  }
  
  // Walk-in shower recess
  if (formData.bathroom_type === 'walk_in') {
    quantities['RECESS'] = 1;
  }
  
  // Asbestos testing for pre-1980 homes
  if (formData.year_built === 'pre_1980') {
    quantities['ASB-T'] = 1;
  }
  
  // Optional upgrades mapping
  if (formData.upgrades?.heated_floors) quantities['HEATED-FLR'] = 1;
  if (formData.upgrades?.heated_towel_rack) quantities['HEATED-RACK'] = 1;
  if (formData.upgrades?.bidet_addon) quantities['BIDET-ADDON'] = 1;
  if (formData.upgrades?.smart_mirror) quantities['SMART-MIRROR'] = 1;
  if (formData.upgrades?.premium_exhaust_fan) quantities['PREMIUM-FAN'] = 1;
  if (formData.upgrades?.built_in_niche) quantities['NICHE'] = 1;
  if (formData.upgrades?.shower_bench) quantities['BENCH'] = 1;
  if (formData.upgrades?.safety_grab_bars) quantities['GRAB-BARS'] = 1;
  
  const meta: CalculationMeta = {
    plumbing_points: plumbingPoints,
    electrical_items: formData.electrical_items || 0,
    total_floor_sqft: totalFloorSqft,
    wet_wall_sqft: wetWallSqft,
    dry_wall_sqft: dryWallSqft,
    accent_feature_sqft: accentFeatureSqft,
  };
  
  return { quantities, meta };
}