// Save test data to sessionStorage to test the actual quote flow
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

console.log('Test data to save:', JSON.stringify(testData, null, 2));
console.log('Run this in browser console:');
console.log(`sessionStorage.setItem('contractorQuoteData', '${JSON.stringify(testData)}');`);
console.log('Then navigate to: http://localhost:3333/quote/calculate');