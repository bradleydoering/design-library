#!/usr/bin/env node

// Script to check the specific tile fields in the database
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

async function checkTileFields() {
  console.log('Checking tile-specific fields in database...\n');

  const targetSKUs = ['OV.ET.BON.1224.MT', 'UI.CA.BGE.1224', 'SO.ST.DRK.0420.CHEV'];

  for (const sku of targetSKUs) {
    console.log(`🔍 ${sku}:`);
    
    const { data: tile, error } = await supabase
      .from('products')
      .select('sku, name, brand, category, wall, floor, shower_floor, accent, material, size, description')
      .eq('sku', sku)
      .single();

    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
    } else {
      console.log(`  Name: ${tile.name}`);
      console.log(`  Category: ${tile.category}`);
      console.log(`  Wall: ${tile.wall}`);
      console.log(`  Floor: ${tile.floor}`);
      console.log(`  Shower Floor: ${tile.shower_floor}`);
      console.log(`  Accent: ${tile.accent}`);
      console.log(`  Material: ${tile.material}`);
      console.log(`  Size: ${tile.size}`);
      console.log('');
    }
  }

  // Show a working example for comparison
  console.log('📋 For comparison, here\'s a working tile:');
  const { data: workingTile, error: workingError } = await supabase
    .from('products')
    .select('sku, name, brand, category, wall, floor, shower_floor, accent, material, size')
    .eq('category', 'tiles')
    .not('wall', 'is', null)
    .limit(1)
    .single();

  if (!workingError && workingTile) {
    console.log(`  SKU: ${workingTile.sku}`);
    console.log(`  Name: ${workingTile.name}`);
    console.log(`  Wall: ${workingTile.wall}`);
    console.log(`  Floor: ${workingTile.floor}`);
    console.log(`  Shower Floor: ${workingTile.shower_floor}`);
    console.log(`  Accent: ${workingTile.accent}`);
  }
}

// Run the check
checkTileFields().catch(console.error);