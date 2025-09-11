#!/usr/bin/env node

// Script to debug tile transformation step by step
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

async function debugTileTransformation() {
  console.log('Debugging tile transformation step by step...\n');

  const { data: tiles, error } = await supabase
    .from('products')
    .select('*')
    .in('sku', ['OV.ET.BON.1224.MT', 'UI.CA.BGE.1224', 'SO.ST.DRK.0420.CHEV']);

  if (error) {
    console.error('Error fetching tiles:', error);
    return;
  }

  tiles.forEach(tile => {
    console.log(`🔍 Processing ${tile.sku}:`);
    console.log(`  Raw database values:`);
    console.log(`    wall: ${tile.wall} (type: ${typeof tile.wall})`);
    console.log(`    floor: ${tile.floor} (type: ${typeof tile.floor})`);
    console.log(`    shower_floor: ${tile.shower_floor} (type: ${typeof tile.shower_floor})`);
    console.log(`    accent: ${tile.accent} (type: ${typeof tile.accent})`);

    // Transform like transformDatabaseProduct does
    const transformedStep1 = {
      SKU: tile.sku,
      NAME: tile.name,
      BRAND: tile.brand,
      WALL: tile.wall ? "TRUE" : "FALSE",
      FLOOR: tile.floor ? "TRUE" : "FALSE", 
      SHOWER_FLOOR: tile.shower_floor ? "TRUE" : "FALSE",
      ACCENT: tile.accent ? "TRUE" : "FALSE"
    };

    console.log(`  After transformDatabaseProduct:`);
    console.log(`    WALL: ${transformedStep1.WALL} (type: ${typeof transformedStep1.WALL})`);
    console.log(`    FLOOR: ${transformedStep1.FLOOR} (type: ${typeof transformedStep1.FLOOR})`);
    console.log(`    SHOWER_FLOOR: ${transformedStep1.SHOWER_FLOOR} (type: ${typeof transformedStep1.SHOWER_FLOOR})`);
    console.log(`    ACCENT: ${transformedStep1.ACCENT} (type: ${typeof transformedStep1.ACCENT})`);

    // Transform like transformBoolean does
    const transformBoolean = (value) => {
      console.log(`    transformBoolean(${value}) [type: ${typeof value}] = ${value === "TRUE" || value === true || value === 1}`);
      return value === "TRUE" || value === true || value === 1;
    };

    console.log(`  After transformBoolean:`);
    const finalWall = transformBoolean(transformedStep1.WALL);
    const finalFloor = transformBoolean(transformedStep1.FLOOR);
    const finalShowerFloor = transformBoolean(transformedStep1.SHOWER_FLOOR);
    const finalAccent = transformBoolean(transformedStep1.ACCENT);

    console.log(`    WALL: ${finalWall}`);
    console.log(`    FLOOR: ${finalFloor}`);
    console.log(`    SHOWER_FLOOR: ${finalShowerFloor}`);
    console.log(`    ACCENT: ${finalAccent}`);
    console.log('');
  });
}

// Run the debug
debugTileTransformation().catch(console.error);