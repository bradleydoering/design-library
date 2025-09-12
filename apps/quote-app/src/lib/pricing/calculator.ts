import { QuoteFormData } from '@/types/quote';
import { LineItemCalculation, QuoteTotals, CalculatedQuote, RateLine, ProjectMultiplier } from './types';
import { QuantityMap, mapFormToQuantities } from './form-mapper';
import { loadRateLines, loadProjectMultipliers, validateRateCards } from './rate-loader';

/**
 * Calculates line item prices with base price logic
 */
export function calculateLineItems(quantities: QuantityMap, rates: Record<string, RateLine>): LineItemCalculation[] {
  const lineItems: LineItemCalculation[] = [];
  
  console.log('🧮 === calculateLineItems DEBUG ===');
  console.log('📊 Input quantities:', quantities);
  
  // Check specifically for upgrade quantities
  const upgradeQuantities = Object.entries(quantities).filter(([code]) => 
    ['HEATED-FLR', 'HEATED-RACK', 'BIDET-ADDON', 'SMART-MIRROR', 'PREMIUM-FAN', 'NICHE', 'BENCH', 'GRAB-BARS'].includes(code)
  );
  console.log('🎯 Upgrade quantities received:', upgradeQuantities);
  
  console.log('💰 Available rate codes count:', Object.keys(rates).length);
  
  // Check if upgrade rates are available
  const upgradeCodesInRates = ['HEATED-FLR', 'HEATED-RACK', 'BIDET-ADDON', 'SMART-MIRROR', 'PREMIUM-FAN', 'NICHE', 'BENCH', 'GRAB-BARS']
    .filter(code => rates[code]);
  console.log('🔧 Upgrade rates available:', upgradeCodesInRates);
  
  for (const [lineCode, quantity] of Object.entries(quantities)) {
    if (quantity <= 0) {
      console.log(`⏭️ Skipping ${lineCode} (quantity: ${quantity})`);
      continue;
    }
    
    const isUpgrade = ['HEATED-FLR', 'HEATED-RACK', 'BIDET-ADDON', 'SMART-MIRROR', 'PREMIUM-FAN', 'NICHE', 'BENCH', 'GRAB-BARS'].includes(lineCode);
    console.log(`${isUpgrade ? '🎯' : '📦'} Processing ${lineCode}, quantity: ${quantity}`);
    
    const rate = rates[lineCode];
    if (!rate) {
      console.error(`❌ Rate not found for line code: ${lineCode}`);
      console.error('Available rates:', Object.keys(rates).slice(0, 10), '... and', Object.keys(rates).length - 10, 'more');
      throw new Error(`Rate not found for line code: ${lineCode}. Cannot calculate quote.`);
    }
    
    if (isUpgrade) {
      console.log(`🎯 Found upgrade rate for ${lineCode}:`, {
        name: rate.line_name,
        base_price: rate.base_price,
        price_per_unit: rate.price_per_unit,
        active: rate.active
      });
    }
    
    const baseApplied = rate.base_price > 0;
    const unitPrice = rate.price_per_unit;
    const extended = rate.base_price + (unitPrice * quantity);
    
    lineItems.push({
      line_code: lineCode,
      line_name: rate.line_name,
      quantity,
      unit_price: unitPrice,
      base_applied: baseApplied,
      extended,
      unit: rate.unit,
    });
  }
  
  return lineItems.sort((a, b) => a.line_code.localeCompare(b.line_code));
}

/**
 * Calculates quote totals with project multipliers
 */
export function calculateTotals(
  lineItems: LineItemCalculation[], 
  multipliers: Record<string, ProjectMultiplier>,
  formData: QuoteFormData
): QuoteTotals {
  const labourSubtotal = lineItems.reduce((sum, item) => sum + item.extended, 0);
  
  // Apply multipliers based on form data
  const contingency = labourSubtotal * (multipliers['CONTINGENCY']?.default_percent || 0) / 100;
  
  // Condo factor applies if building type is condo
  const condoUplift = formData.building_type === 'condo' 
    ? labourSubtotal * (multipliers['CONDO-FCTR']?.default_percent || 0) / 100
    : 0;
  
  // PM fee applies to sell price (labour + contingency)
  const pmFee = (labourSubtotal + contingency) * (multipliers['PM-FEE']?.default_percent || 0) / 100;
  
  const grandTotal = labourSubtotal + contingency + condoUplift + pmFee;
  
  return {
    labour_subtotal: Math.round(labourSubtotal * 100) / 100,
    contingency: Math.round(contingency * 100) / 100,
    condo_uplift: Math.round(condoUplift * 100) / 100,
    oldhome_uplift: 0, // Now handled as ASB-T line item instead of multiplier
    pm_fee: Math.round(pmFee * 100) / 100,
    grand_total: Math.round(grandTotal * 100) / 100,
  };
}

/**
 * Main calculation function - processes form data into a complete quote
 */
export async function calculateQuote(formData: QuoteFormData): Promise<CalculatedQuote> {
  try {
    // Load rate data from database (fail-loud if missing required codes)
    const rates = await loadRateLines();
    const multipliers = await loadProjectMultipliers();
    
    // Validate we have all required rate codes
    validateRateCards(rates);
    
    // Map form to quantities
    const { quantities, meta } = mapFormToQuantities(formData);
    
    // Calculate line items and totals
    const lineItems = calculateLineItems(quantities, rates);
    const totals = calculateTotals(lineItems, multipliers, formData);
    
    return {
      line_items: lineItems,
      totals,
      raw_form_data: formData,
      calculation_meta: {
        calculated_at: new Date().toISOString(),
        rate_card_version: 'V1-Database', // Now loaded from database
        plumbing_points: meta.plumbing_points,
        electrical_items: meta.electrical_items,
        total_floor_sqft: meta.total_floor_sqft,
      },
    };
    
  } catch (error) {
    // Fail loud - never silently estimate
    console.error('Quote calculation failed:', error);
    throw error;
  }
}