#!/usr/bin/env node

// Script to find tiles with similar SKUs in Supabase
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

async function findSimilarTiles() {
  console.log('Finding similar tiles in Supabase database...\n');

  for (const sku of targetSKUs) {
    console.log(`Searching for tiles similar to ${sku}:`);
    
    // Extract parts of the SKU to search for patterns
    const skuParts = sku.split('.');
    const brand = skuParts[0];
    
    // Search by brand prefix
    const { data: brandTiles, error: brandError } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'tiles')
      .ilike('sku', `${brand}.%`)
      .limit(5);

    if (brandError) {
      console.log(`  Error searching by brand: ${brandError.message}`);
    } else if (brandTiles && brandTiles.length > 0) {
      console.log(`  Found ${brandTiles.length} tiles with brand ${brand}:`);
      brandTiles.forEach(tile => {
        console.log(`    - ${tile.sku}: ${tile.name} (${tile.material || 'No material'})`);
      });
    } else {
      console.log(`  No tiles found with brand ${brand}`);
    }

    // Search for partial matches
    if (skuParts.length > 2) {
      const partialSku = `${skuParts[0]}.${skuParts[1]}`;
      const { data: partialTiles, error: partialError } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'tiles')
        .ilike('sku', `${partialSku}%`)
        .limit(5);

      if (!partialError && partialTiles && partialTiles.length > 0) {
        console.log(`  Found ${partialTiles.length} tiles with pattern ${partialSku}*:`);
        partialTiles.forEach(tile => {
          console.log(`    - ${tile.sku}: ${tile.name}`);
        });
      }
    }
    
    console.log('');
  }

  // Show some general tile patterns to understand SKU structure
  console.log('Sample of tile SKU patterns in database:');
  const { data: sampleTiles, error: sampleError } = await supabase
    .from('products')
    .select('sku, name, material, brand')
    .eq('category', 'tiles')
    .limit(20);

  if (!sampleError && sampleTiles) {
    sampleTiles.forEach(tile => {
      console.log(`  ${tile.sku}: ${tile.name} | ${tile.brand} | ${tile.material || 'No material'}`);
    });
  }
}

findSimilarTiles().catch(console.error);