#!/usr/bin/env node

// Script to test if tiles are now loading properly from Supabase
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

async function testTileLoading() {
  console.log('Testing tile loading from Supabase database...\n');

  const testPackages = ['Cambie Crest', 'Fairview Luxe'];

  for (const packageName of testPackages) {
    console.log(`🔍 Testing ${packageName}:`);
    
    // Get package with all its products
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select(`
        *,
        package_products(*, products(*))
      `)
      .eq('name', packageName)
      .single();

    if (packageError) {
      console.log(`  ❌ Error fetching package: ${packageError.message}`);
      continue;
    }

    console.log(`  📦 Package ID: ${packageData.id}`);
    console.log(`  🔗 Package has ${packageData.package_products?.length || 0} product relationships`);

    // Check tile products specifically
    const tileTypes = ['floor_tile', 'wall_tile', 'shower_floor_tile', 'accent_tile'];
    let foundTiles = 0;
    let totalExpectedTiles = 0;

    tileTypes.forEach(tileType => {
      const relationship = packageData.package_products?.find(pp => pp.product_type === tileType);
      
      if (packageName === 'Cambie Crest') {
        // Cambie Crest should have all 4 tile types
        totalExpectedTiles++;
        if (relationship && relationship.products) {
          console.log(`  ✅ ${tileType}: ${relationship.products.sku} - ${relationship.products.name}`);
          foundTiles++;
        } else {
          console.log(`  ❌ ${tileType}: Not found`);
        }
      } else if (packageName === 'Fairview Luxe') {
        // Fairview Luxe should have floor_tile, wall_tile, and shower_floor_tile (no accent_tile)
        if (tileType !== 'accent_tile') {
          totalExpectedTiles++;
          if (relationship && relationship.products) {
            console.log(`  ✅ ${tileType}: ${relationship.products.sku} - ${relationship.products.name}`);
            foundTiles++;
          } else {
            console.log(`  ❌ ${tileType}: Not found`);
          }
        }
      }
    });

    console.log(`  📊 Found ${foundTiles}/${totalExpectedTiles} expected tiles\n`);
  }

  // Test the materials loading function (simulating what the app does)
  console.log('🔄 Testing materials loading function...');
  
  const { data: materialsTest, error: materialsError } = await supabase
    .from('packages')
    .select(`
      *,
      package_products(*, products(*))
    `)
    .order('name');

  if (materialsError) {
    console.log(`❌ Error in materials loading: ${materialsError.message}`);
  } else {
    const cambiePackage = materialsTest.find(pkg => pkg.name === 'Cambie Crest');
    const fairviewPackage = materialsTest.find(pkg => pkg.name === 'Fairview Luxe');
    
    console.log('✅ Materials loading successful');
    console.log(`📦 Cambie Crest products: ${cambiePackage?.package_products?.length || 0}`);
    console.log(`📦 Fairview Luxe products: ${fairviewPackage?.package_products?.length || 0}`);
  }

  console.log('\n🎯 Test completed! Check the package pages in your browser to verify tiles are displaying.');
}

// Run the test
testTileLoading().catch(console.error);