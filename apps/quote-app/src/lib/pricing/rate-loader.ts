import { RateLine, ProjectMultiplier } from './types';
import { RateCardsAPI } from '../supabase';

// Load rate lines from Supabase database
export async function loadRateLines(): Promise<Record<string, RateLine>> {
  try {
    return await RateCardsAPI.getRateLines();
  } catch (error) {
    console.error('Failed to load rate lines from database:', error);
    throw error; // Fail loud - don't provide fallback
  }
}

// Load project multipliers from Supabase database
export async function loadProjectMultipliers(): Promise<Record<string, ProjectMultiplier>> {
  try {
    return await RateCardsAPI.getProjectMultipliers();
  } catch (error) {
    console.error('Failed to load project multipliers from database:', error);
    throw error; // Fail loud - don't provide fallback
  }
}

// Required rate codes for fail-loud validation (only codes that are always present)
export const REQUIRED_RATE_CODES = [
  'DEM', 'PLM', 'ELE', 'SUB-GRB', 'WPF-KER', 'TILE-WET', 'TILE-DRY', 'TILE-FLR', 'DUMP'
];

export function validateRateCards(rates: Record<string, RateLine>): void {
  const missingCodes = REQUIRED_RATE_CODES.filter(code => !rates[code] || !rates[code].active);
  
  if (missingCodes.length > 0) {
    throw new Error(`Missing required rate codes: ${missingCodes.join(', ')}. Cannot calculate quote.`);
  }
}