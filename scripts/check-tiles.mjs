#!/usr/bin/env node

// Script to check what tile products exist in Supabase
import { createClient } from '@supabase/supabase-js';
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

const targetSKUs = [
  'OV.ET.BON.1224.MT',
  'SO.ST.DRK.0420.CHEV',
  'UI.CA.BGE.1224'
];

async function checkTiles() {
  console.log('Checking tile products in Supabase database...\n');

  // First check if any tiles exist at all
  const { data: allTiles, error: allTilesError } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'tiles')
    .limit(10);

  if (allTilesError) {
    console.error('Error fetching tiles:', allTilesError);
    return;
  }

  console.log(`Total sample of tiles in database: ${allTiles?.length || 0}`);
  if (allTiles && allTiles.length > 0) {
    console.log('Sample tiles:');
    allTiles.slice(0, 5).forEach(tile => {
      console.log(`  - ${tile.sku}: ${tile.name} (${tile.brand})`);
    });
    console.log('');
  }

  // Check for our specific target SKUs
  for (const sku of targetSKUs) {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .maybeSingle();

    if (error) {
      console.log(`❌ ${sku}: Error - ${error.message}`);
    } else if (product) {
      console.log(`✅ ${sku}: Found - ${product.name} (${product.brand})`);
    } else {
      console.log(`❌ ${sku}: Not found in database`);
    }
  }

  // Count total products by category
  const { data: productData, error: countError } = await supabase
    .from('products')
    .select('category');

  let counts = {};
  if (!countError && productData) {
    const categoryCount = {};
    productData.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });
    counts = categoryCount;
  }

  if (countError) {
    console.error('Error counting products:', countError);
  } else {
    console.log('\nProduct counts by category:');
    Object.entries(counts || {}).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
  }
}

checkTiles().catch(console.error);