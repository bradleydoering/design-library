#!/usr/bin/env node

// Script to audit all missing products from JSON packages that aren't in Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function auditMissingProducts() {
  console.log('Auditing missing products from JSON packages...\n');

  // Load JSON data
  let jsonData;
  try {
    const jsonContent = readFileSync('data.json', 'utf-8');
    jsonData = JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error reading data.json:', error.message);
    return;
  }

  // Get all products from Supabase
  const { data: dbProducts, error: dbError } = await supabase
    .from('products')
    .select('sku, category');

  if (dbError) {
    console.error('Error fetching products from database:', dbError);
    return;
  }

  // Create a set of existing SKUs for fast lookup
  const existingSKUs = new Set(dbProducts.map(p => p.sku));
  
  console.log(`Database contains ${existingSKUs.size} products`);
  console.log(`JSON contains ${jsonData.packages.length} packages\n`);

  // Track all missing SKUs by category
  const missingSKUs = {
    tiles: new Set(),
    vanities: new Set(),
    tubs: new Set(),
    tub_fillers: new Set(),
    toilets: new Set(),
    showers: new Set(),
    faucets: new Set(),
    shower_glazing: new Set(),
    mirrors: new Set(),
    towel_bars: new Set(),
    toilet_paper_holders: new Set(),
    hooks: new Set(),
    lighting: new Set()
  };

  // Map SKU field names to categories
  const skuFieldToCategory = {
    'TILES_FLOOR_SKU': 'tiles',
    'TILES_WALL_SKU': 'tiles', 
    'TILES_SHOWER_FLOOR_SKU': 'tiles',
    'TILES_ACCENT_SKU': 'tiles',
    'VANITY_SKU': 'vanities',
    'TUB_SKU': 'tubs',
    'TUB_FILLER_SKU': 'tub_fillers',
    'TOILET_SKU': 'toilets',
    'SHOWER_SKU': 'showers',
    'FAUCET_SKU': 'faucets',
    'GLAZING_SKU': 'shower_glazing',
    'MIRROR_SKU': 'mirrors',
    'TOWEL_BAR_SKU': 'towel_bars',
    'TOILET_PAPER_HOLDER_SKU': 'toilet_paper_holders',
    'HOOK_SKU': 'hooks',
    'LIGHTING_SKU': 'lighting'
  };

  // Process each package
  jsonData.packages.forEach((pkg, index) => {
    console.log(`${index + 1}. ${pkg.NAME}`);
    let packageHasMissing = false;

    // Check all SKU fields
    Object.entries(skuFieldToCategory).forEach(([skuField, category]) => {
      const sku = pkg[skuField];
      if (sku && sku.trim() && !existingSKUs.has(sku)) {
        missingSKUs[category].add(sku);
        console.log(`   ❌ Missing ${category}: ${sku}`);
        packageHasMissing = true;
      }
    });

    // Also check the items object if it exists
    if (pkg.items) {
      const itemFieldToCategory = {
        'floorTile': 'tiles',
        'wallTile': 'tiles',
        'showerFloorTile': 'tiles', 
        'accentTile': 'tiles',
        'vanity': 'vanities',
        'tub': 'tubs',
        'tubFiller': 'tub_fillers',
        'toilet': 'toilets',
        'shower': 'showers',
        'faucet': 'faucets',
        'glazing': 'shower_glazing',
        'mirror': 'mirrors',
        'towelBar': 'towel_bars',
        'toiletPaperHolder': 'toilet_paper_holders',
        'hook': 'hooks',
        'lighting': 'lighting'
      };

      Object.entries(itemFieldToCategory).forEach(([itemField, category]) => {
        const sku = pkg.items[itemField];
        if (sku && sku.trim() && !existingSKUs.has(sku)) {
          missingSKUs[category].add(sku);
          if (!packageHasMissing) {
            console.log(`   ❌ Missing ${category}: ${sku} (from items)`);
            packageHasMissing = true;
          }
        }
      });
    }

    if (!packageHasMissing) {
      console.log('   ✅ All products exist in database');
    }
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('MISSING PRODUCTS SUMMARY');
  console.log('='.repeat(60));

  let totalMissing = 0;
  Object.entries(missingSKUs).forEach(([category, skuSet]) => {
    if (skuSet.size > 0) {
      console.log(`\n${category.toUpperCase()} (${skuSet.size} missing):`);
      Array.from(skuSet).sort().forEach(sku => {
        console.log(`  - ${sku}`);
      });
      totalMissing += skuSet.size;
    }
  });

  console.log(`\n📊 TOTAL MISSING PRODUCTS: ${totalMissing}`);
  
  if (totalMissing > 0) {
    console.log('\n💡 These products need to be added to the Supabase database');
    console.log('   for the packages to display correctly.');
  } else {
    console.log('\n✅ All products from JSON packages exist in the database!');
  }
}

// Run the audit
auditMissingProducts().catch(console.error);