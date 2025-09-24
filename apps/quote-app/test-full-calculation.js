// Full calculation chain test
import { supabase, RateCardsAPI } from './src/lib/supabase.js';
import { mapFormToQuantities } from './src/lib/pricing/form-mapper.js';
import { calculateLineItems, calculateTotals } from './src/lib/pricing/calculator.js';

const testData = {
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

async function testFullCalculation() {
  console.log('=== FULL CALCULATION TEST ===');
  
  try {
    // Step 1: Form Mapping
    console.log('\n1. Form Mapping:');
    const { quantities, meta } = mapFormToQuantities(testData);
    console.log('Generated quantities:', quantities);
    
    const expectedUpgrades = ['HEATED-FLR', 'HEATED-RACK', 'SMART-MIRROR', 'NICHE', 'GRAB-BARS'];
    const upgradesInQuantities = expectedUpgrades.filter(code => quantities[code]);
    console.log('Upgrades in quantities:', upgradesInQuantities);
    console.log('Missing upgrades:', expectedUpgrades.filter(code => !quantities[code]));
    
    // Step 2: Database Load
    console.log('\n2. Database Load:');
    const rates = await RateCardsAPI.getRateLines();
    const multipliers = await RateCardsAPI.getProjectMultipliers();
    
    console.log('Total rate lines loaded:', Object.keys(rates).length);
    console.log('Rate lines for upgrades:');
    expectedUpgrades.forEach(code => {
      const rate = rates[code];
      if (rate) {
        console.log(`  ${code}: ${rate.line_name} - $${rate.base_price} + $${rate.price_per_unit}/${rate.unit} (active: ${rate.active})`);
      } else {
        console.log(`  ${code}: NOT FOUND`);
      }
    });
    
    // Step 3: Line Item Calculation
    console.log('\n3. Line Item Calculation:');
    const lineItems = calculateLineItems(quantities, rates);
    console.log('Generated line items:', lineItems.map(item => ({
      code: item.line_code,
      name: item.line_name,
      quantity: item.quantity,
      extended: item.extended
    })));
    
    const upgradeLineItems = lineItems.filter(item => expectedUpgrades.includes(item.line_code));
    console.log('Upgrade line items:', upgradeLineItems);
    
    // Step 4: Final Totals
    console.log('\n4. Final Totals:');
    const totals = calculateTotals(lineItems, multipliers, testData);
    console.log('Totals:', totals);
    
    // Step 5: Summary
    console.log('\n5. SUMMARY:');
    console.log(`Form mapping generated ${expectedUpgrades.length} upgrades`);
    console.log(`Database has ${expectedUpgrades.filter(code => rates[code]).length} upgrade rates`);
    console.log(`Final quote has ${upgradeLineItems.length} upgrade line items`);
    
    if (upgradeLineItems.length === 0) {
      console.log('\n❌ PROBLEM IDENTIFIED: No upgrade line items in final calculation!');
      
      // Check each step
      console.log('\nDEBUG EACH STEP:');
      expectedUpgrades.forEach(code => {
        const hasQuantity = !!quantities[code];
        const hasRate = !!rates[code];
        const isActive = rates[code]?.active;
        const inLineItems = lineItems.some(item => item.line_code === code);
        
        console.log(`${code}: quantity=${hasQuantity}, rate=${hasRate}, active=${isActive}, lineItem=${inLineItems}`);
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testFullCalculation();