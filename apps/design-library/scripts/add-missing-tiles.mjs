#!/usr/bin/env node

// Script to add missing tile products to Supabase database
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

// Define the missing tiles based on data.json
const missingTiles = [
  {
    sku: 'OV.ET.BON.1224.MT',
    name: 'Eterna Bone 12x24',
    brand: 'Olympia',
    category: 'tiles',
    material: 'Porcelain',
    size: '12x24',
    description: 'Eterna series bone colored tile',
    wall: true,
    floor: true,
    shower_floor: true,
    accent: false,
    price_sqf: 6.50,
    cost_sqf: 3.25,
    image_main: 'https://products.cloudrenos.com/products/ovetbon1224mt.png'
  },
  {
    sku: 'SO.ST.DRK.0420.CHEV',
    name: 'Stone Dark Chevron',
    brand: 'SomerTile',
    category: 'tiles',
    material: 'Stone',
    size: '4x20',
    description: 'Dark stone chevron pattern tile',
    wall: true,
    floor: false,
    shower_floor: false,
    accent: true,
    price_sqf: 12.50,
    cost_sqf: 6.25,
    image_main: 'https://products.cloudrenos.com/products/sostdrk0420chev.png'
  },
  {
    sku: 'UI.CA.BGE.1224',
    name: 'Calacatta Beige 12x24',
    brand: 'Urban',
    category: 'tiles',
    material: 'Porcelain',
    size: '12x24',
    description: 'Calacatta series beige marble-look tile',
    wall: true,
    floor: false,
    shower_floor: true,
    accent: false,
    price_sqf: 8.75,
    cost_sqf: 4.38,
    image_main: 'https://products.cloudrenos.com/products/uicabge1224.png'
  }
];

async function addMissingTiles() {
  console.log('Adding missing tile products to Supabase database...\n');

  for (const tile of missingTiles) {
    console.log(`Processing tile: ${tile.sku}`);
    
    // Check if the tile already exists
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('sku', tile.sku)
      .maybeSingle();

    if (checkError) {
      console.error(`  Error checking if tile exists: ${checkError.message}`);
      continue;
    }

    if (existing) {
      console.log(`  ✅ Tile ${tile.sku} already exists with ID: ${existing.id}`);
      continue;
    }

    // Insert the new tile
    const { data: newTile, error: insertError } = await supabase
      .from('products')
      .insert({
        sku: tile.sku,
        name: tile.name,
        brand: tile.brand,
        category: tile.category,
        material: tile.material,
        size: tile.size,
        description: tile.description,
        wall: tile.wall,
        floor: tile.floor,
        shower_floor: tile.shower_floor,
        accent: tile.accent,
        price_sqf: tile.price_sqf,
        cost_sqf: tile.cost_sqf,
        image_main: tile.image_main
      })
      .select()
      .single();

    if (insertError) {
      console.error(`  ❌ Error inserting tile ${tile.sku}: ${insertError.message}`);
    } else {
      console.log(`  ✅ Successfully added tile ${tile.sku} with ID: ${newTile.id}`);
    }
  }

  console.log('\n✅ Finished adding missing tiles!');
}

// Run the script
addMissingTiles().catch(console.error);