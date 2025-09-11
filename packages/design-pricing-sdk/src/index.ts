// Main SDK interface for design pricing
export { priceDesign } from './pricing-engine';
export { getDefaultDesign, DEFAULT_DESIGNS } from './default-designs';
export * from './types';

// Version info
export const SDK_VERSION = "1.0.0";
export const CATALOG_VERSION = "1.0.0";

// Re-export main function for convenience
import { priceDesign as _priceDesign } from './pricing-engine';
import { getDefaultDesign as _getDefaultDesign } from './default-designs';
import { DesignConfig, MaterialsDatabase, UniversalConfig, PricingResult, DefaultDesignLevel } from './types';

/**
 * Price a design configuration
 * @param config - Design configuration object
 * @param materials - Materials database 
 * @param universalConfig - Optional universal configuration
 * @returns Promise<PricingResult> - Pricing result with subtotal, items, and metadata
 */
export const calculatePrice = async (
  config: DesignConfig,
  materials: MaterialsDatabase,
  universalConfig?: UniversalConfig
): Promise<PricingResult> => {
  return _priceDesign(config, materials, universalConfig);
};

/**
 * Get a default design configuration for a given price level
 * @param level - 'budget' | 'mid' | 'high'
 * @returns DefaultDesignLevel - Default configuration for the level
 */
export const getDefault = (level: 'budget' | 'mid' | 'high'): DefaultDesignLevel => {
  return _getDefaultDesign(level);
};

// Default export for convenience
export default {
  calculatePrice,
  getDefault,
  priceDesign: _priceDesign,
  getDefaultDesign: _getDefaultDesign,
  SDK_VERSION,
  CATALOG_VERSION
};