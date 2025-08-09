#!/usr/bin/env node

// Script to update Supabase database with missing tile SKUs for packages
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

const packageUpdates = [
  {
    name: 'Cambie Crest',
    tiles: [
      { product_type: 'floor_tile', sku: 'OV.ET.BON.1224.MT' },
      { product_type: 'wall_tile', sku: 'OV.ET.BON.1224.MT' },
      { product_type: 'shower_floor_tile', sku: 'OV.ET.BON.1224.MT' },
      { product_type: 'accent_tile', sku: 'SO.ST.DRK.0420.CHEV' }
    ]
  },
  {
    name: 'Fairview Luxe',
    tiles: [
      { product_type: 'floor_tile', sku: 'OV.ET.BON.1224.MT' },
      { product_type: 'wall_tile', sku: 'UI.CA.BGE.1224' },
      { product_type: 'shower_floor_tile', sku: 'UI.CA.BGE.1224' }
    ]
  }
];

async function updatePackageTiles() {
  console.log('Starting to update package tiles in Supabase...');

  for (const packageUpdate of packageUpdates) {
    console.log(`\nProcessing package: ${packageUpdate.name}`);
    
    // Get the package ID
    const { data: packages, error: packageError } = await supabase
      .from('packages')
      .select('id')
      .eq('name', packageUpdate.name)
      .single();

    if (packageError || !packages) {
      console.error(`Error finding package ${packageUpdate.name}:`, packageError);
      continue;
    }

    const packageId = packages.id;
    console.log(`Found package ID: ${packageId}`);

    // For each tile type, update or insert the package_products relationship
    for (const tile of packageUpdate.tiles) {
      console.log(`  Processing ${tile.product_type}: ${tile.sku}`);
      
      // First, find the product by SKU
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('sku', tile.sku)
        .single();

      if (productError || !products) {
        console.error(`    Error finding product ${tile.sku}:`, productError);
        console.log(`    Skipping this tile - product may not exist in database`);
        continue;
      }

      const productId = products.id;
      console.log(`    Found product ID: ${productId}`);

      // Check if a relationship already exists
      const { data: existingRelation, error: checkError } = await supabase
        .from('package_products')
        .select('id')
        .eq('package_id', packageId)
        .eq('product_type', tile.product_type)
        .maybeSingle();

      if (checkError) {
        console.error(`    Error checking existing relation:`, checkError);
        continue;
      }

      if (existingRelation) {
        // Update existing relationship
        const { error: updateError } = await supabase
          .from('package_products')
          .update({ product_id: productId })
          .eq('id', existingRelation.id);

        if (updateError) {
          console.error(`    Error updating relation:`, updateError);
        } else {
          console.log(`    ✅ Updated ${tile.product_type} relation`);
        }
      } else {
        // Insert new relationship
        const { error: insertError } = await supabase
          .from('package_products')
          .insert({
            package_id: packageId,
            product_id: productId,
            product_type: tile.product_type
          });

        if (insertError) {
          console.error(`    Error inserting relation:`, insertError);
        } else {
          console.log(`    ✅ Created new ${tile.product_type} relation`);
        }
      }
    }
  }

  console.log('\n✅ Package tile updates completed!');
}

// Run the update
updatePackageTiles().catch(console.error);