// Direct test of form mapping logic
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

console.log('=== DIRECT TEST ===');
console.log('1. Test form data upgrades:', testData.upgrades);

// Simulate the mapping logic
const quantities = {};

console.log('\n2. Testing upgrade conditions:');

// Manual test of each condition
console.log('heated_floors:', testData.upgrades?.heated_floors, '→', testData.upgrades?.heated_floors ? 'HEATED-FLR = 1' : 'skipped');
console.log('heated_towel_rack:', testData.upgrades?.heated_towel_rack, '→', testData.upgrades?.heated_towel_rack ? 'HEATED-RACK = 1' : 'skipped');
console.log('bidet_addon:', testData.upgrades?.bidet_addon, '→', testData.upgrades?.bidet_addon ? 'BIDET-ADDON = 1' : 'skipped');
console.log('smart_mirror:', testData.upgrades?.smart_mirror, '→', testData.upgrades?.smart_mirror ? 'SMART-MIRROR = 1' : 'skipped');
console.log('premium_exhaust_fan:', testData.upgrades?.premium_exhaust_fan, '→', testData.upgrades?.premium_exhaust_fan ? 'PREMIUM-FAN = 1' : 'skipped');
console.log('built_in_niche:', testData.upgrades?.built_in_niche, '→', testData.upgrades?.built_in_niche ? 'NICHE = 1' : 'skipped');
console.log('shower_bench:', testData.upgrades?.shower_bench, '→', testData.upgrades?.shower_bench ? 'BENCH = 1' : 'skipped');
console.log('safety_grab_bars:', testData.upgrades?.safety_grab_bars, '→', testData.upgrades?.safety_grab_bars ? 'GRAB-BARS = 1' : 'skipped');

// Apply the actual logic
if (testData.upgrades?.heated_floors) quantities['HEATED-FLR'] = 1;
if (testData.upgrades?.heated_towel_rack) quantities['HEATED-RACK'] = 1;
if (testData.upgrades?.bidet_addon) quantities['BIDET-ADDON'] = 1;
if (testData.upgrades?.smart_mirror) quantities['SMART-MIRROR'] = 1;
if (testData.upgrades?.premium_exhaust_fan) quantities['PREMIUM-FAN'] = 1;
if (testData.upgrades?.built_in_niche) quantities['NICHE'] = 1;
if (testData.upgrades?.shower_bench) quantities['BENCH'] = 1;
if (testData.upgrades?.safety_grab_bars) quantities['GRAB-BARS'] = 1;

console.log('\n3. Final quantities for upgrades:');
Object.entries(quantities).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

console.log('\n4. Expected upgrade codes:', ['HEATED-FLR', 'HEATED-RACK', 'SMART-MIRROR', 'NICHE', 'GRAB-BARS']);
console.log('5. Generated upgrade codes:', Object.keys(quantities));
console.log('6. Missing:', ['HEATED-FLR', 'HEATED-RACK', 'SMART-MIRROR', 'NICHE', 'GRAB-BARS'].filter(code => !quantities[code]));