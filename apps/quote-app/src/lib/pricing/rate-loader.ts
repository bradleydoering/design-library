import { RateLine, ProjectMultiplier } from './types';

// For now, load from static CSV data - later this will come from Supabase
export function loadRateLines(): Record<string, RateLine> {
  // This matches our updated CSV structure
  const rates: RateLine[] = [
    { line_code: 'DEM', line_name: 'Demolition (per bathroom)', unit: 'unit', base_price: 1107.0, price_per_unit: 0.0 },
    { line_code: 'PLM', line_name: 'Plumbing rough-in/fixture points', unit: 'point', base_price: 0.0, price_per_unit: 307.5 },
    { line_code: 'ELE', line_name: 'Electrical items', unit: 'item', base_price: 0.0, price_per_unit: 184.5 },
    { line_code: 'SUB-GRB', line_name: 'Backerboard / Greenboard install (wet areas)', unit: 'sqft', base_price: 184.5, price_per_unit: 3.69 },
    { line_code: 'DRY', line_name: 'Drywall & repair (dry areas)', unit: 'sqft', base_price: 369.0, price_per_unit: 3.69 },
    { line_code: 'WPF-KER', line_name: 'Waterproofing (Kerdi system)', unit: 'sqft', base_price: 246.0, price_per_unit: 4.92 },
    { line_code: 'TILE-WET', line_name: 'Tile setting & grout — shower/wet walls', unit: 'sqft', base_price: 369.0, price_per_unit: 12.3 },
    { line_code: 'TILE-DRY', line_name: 'Tile setting & grout — dry walls', unit: 'sqft', base_price: 0.0, price_per_unit: 12.3 },
    { line_code: 'TILE-FLR', line_name: 'Tile setting & grout — floor', unit: 'sqft', base_price: 123.0, price_per_unit: 12.3 },
    { line_code: 'PAINT', line_name: 'Painting (walls/ceiling)', unit: 'sqft', base_price: 246.0, price_per_unit: 3.69 },
    { line_code: 'VAN', line_name: 'Vanity install (up to 48")', unit: 'unit', base_price: 264.45, price_per_unit: 0.0 },
    { line_code: 'GLASS', line_name: 'Shower glass install (fixed/door)', unit: 'unit', base_price: 492.0, price_per_unit: 0.0 },
    { line_code: 'NICHE', line_name: 'Built‑in niche / recessed med cabinet', unit: 'unit', base_price: 369.0, price_per_unit: 0.0 },
    { line_code: 'BENCH', line_name: 'Shower bench build & tile', unit: 'unit', base_price: 600.0, price_per_unit: 0.0 },
    { line_code: 'RECESS', line_name: 'Recess subfloor for walk‑in shower', unit: 'unit', base_price: 492.0, price_per_unit: 0.0 },
    { line_code: 'DUMP', line_name: 'Disposal & dumping', unit: 'sqft', base_price: 184.5, price_per_unit: 3.69 },
    { line_code: 'HEATED-FLR', line_name: 'Heated floors installation', unit: 'unit', base_price: 800.0, price_per_unit: 0.0 },
    { line_code: 'HEATED-RACK', line_name: 'Heated towel rack installation', unit: 'unit', base_price: 350.0, price_per_unit: 0.0 },
    { line_code: 'BIDET-ADDON', line_name: 'Bidet attachment installation', unit: 'unit', base_price: 250.0, price_per_unit: 0.0 },
    { line_code: 'SMART-MIRROR', line_name: 'Smart mirror installation', unit: 'unit', base_price: 450.0, price_per_unit: 0.0 },
    { line_code: 'PREMIUM-FAN', line_name: 'Premium exhaust fan installation', unit: 'unit', base_price: 300.0, price_per_unit: 0.0 },
    { line_code: 'GRAB-BARS', line_name: 'Safety grab bars installation', unit: 'unit', base_price: 180.0, price_per_unit: 0.0 },
  ];

  return rates.reduce((acc, rate) => {
    acc[rate.line_code] = rate;
    return acc;
  }, {} as Record<string, RateLine>);
}

export function loadProjectMultipliers(): Record<string, ProjectMultiplier> {
  const multipliers: ProjectMultiplier[] = [
    { code: 'CONTINGENCY', name: 'Contingency on labour subtotal', basis: 'percent_of_labour', default_percent: 2.0 },
    { code: 'PM-FEE', name: 'Project management fee on sell price (editable)', basis: 'percent_of_sell', default_percent: 0.0 },
    { code: 'CONDO-FCTR', name: 'Condo/logistics factor (elevator, parking)', basis: 'percent_of_labour', default_percent: 0.0 },
    { code: 'OLDHOME-ASB', name: 'Pre‑1980 asbestos handling factor', basis: 'percent_of_labour', default_percent: 0.0 },
  ];

  return multipliers.reduce((acc, mult) => {
    acc[mult.code] = mult;
    return acc;
  }, {} as Record<string, ProjectMultiplier>);
}

// Required rate codes for fail-loud validation
export const REQUIRED_RATE_CODES = [
  'DEM', 'PLM', 'ELE', 'SUB-GRB', 'WPF-KER', 'TILE-WET', 'TILE-DRY', 'TILE-FLR', 
  'DUMP', 'VAN', 'RECESS', 'NICHE', 'BENCH'
];

export function validateRateCards(rates: Record<string, RateLine>): void {
  const missingCodes = REQUIRED_RATE_CODES.filter(code => !rates[code] || !rates[code].active);
  
  if (missingCodes.length > 0) {
    throw new Error(`Missing required rate codes: ${missingCodes.join(', ')}. Cannot calculate quote.`);
  }
}