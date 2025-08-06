/**
 * CloudReno Data Migration Script
 * Migrates data from JSON file to Supabase database
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

console.log('🔗 Migration Configuration:');
console.log('URL:', SUPABASE_URL);
console.log('Service Key:', SUPABASE_SERVICE_KEY ? 'Present' : 'Missing');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure .env.local contains:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Load JSON data
const dataPath = path.join(__dirname, '../data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('🚀 Starting CloudReno data migration to Supabase...');

// Product type mapping
const PRODUCT_TYPE_MAPPING = {
  'tiles': 'tiles',
  'vanities': 'vanities',
  'tubs': 'tubs',
  'tub_fillers': 'tub_fillers',
  'toilets': 'toilets',
  'showers': 'showers',
  'faucets': 'faucets',
  'shower_glazing': 'shower_glazing',
  'mirrors': 'mirrors',
  'towel_bars': 'towel_bars',
  'toilet_paper_holders': 'toilet_paper_holders',
  'hooks': 'hooks',
  'lighting': 'lighting'
};

/**
 * Migrate products from all categories
 */
async function migrateProducts() {
  console.log('📦 Migrating products...');
  
  const allProducts = [];
  
  // Process each product category
  for (const [category, products] of Object.entries(PRODUCT_TYPE_MAPPING)) {
    if (data[category] && Array.isArray(data[category])) {
      console.log(`  Processing ${data[category].length} ${category}...`);
      
      for (const product of data[category]) {
        // Skip products with missing critical data
        if (!product.SKU || !product.SKU.trim() || !product.NAME || !product.NAME.trim()) {
          console.log(`    ⚠️ Skipping product with missing SKU or NAME:`, product.SKU || 'NO_SKU', product.NAME || 'NO_NAME');
          continue;
        }

        const productData = {
          sku: product.SKU.trim(),
          name: product.NAME.trim(),
          brand: product.BRAND || 'Unknown',
          category: category,
          material: product.MATERIAL || null,
          finish: product.FINISH || null,
          color_ta: product.COLOR_TA || null,
          size: product.SIZE || null,
          description: product.DESCRIPTION || null,
          url: product.URL || null,
          image_main: product.IMAGE_MAIN || null,
          image_01: product.IMAGE_01 || null,
          image_02: product.IMAGE_02 || null,
          image_03: product.IMAGE_03 || null,
          cost_sqf: product.COST_SQF ? parseFloat(product.COST_SQF) : null,
          price_sqf: product.PRICE_SQF ? parseFloat(product.PRICE_SQF) : null,
          cost: product.COST ? parseFloat(product.COST) : null,
          price: product.PRICE ? parseFloat(product.PRICE.toString().replace(/,/g, '')) : null,
          // Tile-specific fields
          wall: product.WALL || false,
          floor: product.FLOOR || false,
          shower_floor: product.SHOWER_FLOOR || false,
          accent: product.ACCENT || false
        };
        
        allProducts.push(productData);
      }
    }
  }
  
  // Insert products in batches
  const batchSize = 100;
  for (let i = 0; i < allProducts.length; i += batchSize) {
    const batch = allProducts.slice(i, i + batchSize);
    const { error } = await supabase.from('products').insert(batch);
    
    if (error) {
      console.error(`Error inserting products batch ${i}-${i + batchSize}:`, error);
    } else {
      console.log(`  ✅ Inserted products batch ${i + 1}-${Math.min(i + batchSize, allProducts.length)}`);
    }
  }
  
  console.log(`✅ Successfully migrated ${allProducts.length} products`);
  return allProducts;
}

/**
 * Migrate brand logos
 */
async function migrateBrandLogos() {
  console.log('🏷️ Migrating brand logos...');
  
  if (!data.logos || !Array.isArray(data.logos)) {
    console.log('  No logos data found, skipping...');
    return;
  }
  
  const logos = data.logos.map(logo => ({
    brand: logo.BRAND,
    logo_url: logo.LOGO
  }));
  
  const { error } = await supabase.from('brand_logos').insert(logos);
  
  if (error) {
    console.error('Error inserting brand logos:', error);
  } else {
    console.log(`✅ Successfully migrated ${logos.length} brand logos`);
  }
}

/**
 * Migrate color references
 */
async function migrateColors() {
  console.log('🎨 Migrating colors...');
  
  if (!data.colors || !Array.isArray(data.colors)) {
    console.log('  No colors data found, skipping...');
    return;
  }
  
  const colors = data.colors.map(color => ({
    code: color.CODE,
    name: color.NAME,
    hex_value: color.HEX
  }));
  
  // Insert colors one by one to handle duplicates
  let successCount = 0;
  for (const color of colors) {
    const { error } = await supabase.from('colors').insert(color);
    if (error) {
      if (!error.message.includes('already exists')) {
        console.log(`⚠️ Warning inserting color ${color.code}:`, error.message.substring(0, 50));
      }
    } else {
      successCount++;
    }
  }
  
  console.log(`✅ Successfully migrated ${successCount} colors (${colors.length - successCount} duplicates skipped)`);
}

/**
 * Migrate packages
 */
async function migratePackages() {
  console.log('📋 Migrating packages...');
  
  if (!data.packages || !Array.isArray(data.packages)) {
    console.log('  No packages data found, skipping...');
    return;
  }
  
  // Get all products for SKU lookup
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, sku');
    
  if (productsError) {
    console.error('Error fetching products for package migration:', productsError);
    return;
  }
  
  const productBySku = {};
  products.forEach(product => {
    productBySku[product.sku] = product.id;
  });
  
  for (const pkg of data.packages) {
    console.log(`  Processing package: ${pkg.NAME}...`);
    
    // Map category to match database enum (database uses capitalized enum values)
    const categoryMap = {
      'Modern': 'Modern',
      'Contemporary': 'Contemporary', 
      'Traditional': 'Traditional',
      'Luxury': 'Luxury'
    };

    // Insert package
    const packageData = {
      name: pkg.NAME,
      category: categoryMap[pkg.CATEGORY] || 'Modern',
      description: pkg.DESCRIPTION,
      vision: pkg.VISION || null,
      image_main: pkg.IMAGE_MAIN,
      image_01: pkg.IMAGE_01,
      image_02: pkg.IMAGE_02,
      image_03: pkg.IMAGE_03,
      wall_tile_multiplier: pkg.WALL_TILE_MULTIPLIER || 1.0
    };
    
    const { data: insertedPackage, error: packageError } = await supabase
      .from('packages')
      .insert(packageData)
      .select()
      .single();
      
    if (packageError) {
      console.error(`Error inserting package ${pkg.NAME}:`, packageError);
      continue;
    }
    
    const packageId = insertedPackage.id;
    
    // Insert universal toggles
    if (pkg.UNIVERSAL_TOGGLES) {
      const togglesData = {
        package_id: packageId,
        bathroom_type: pkg.UNIVERSAL_TOGGLES.bathroomType,
        wall_tile_coverage: pkg.UNIVERSAL_TOGGLES.wallTileCoverage,
        bathroom_size: pkg.UNIVERSAL_TOGGLES.bathroomSize,
        floor_tile_included: pkg.UNIVERSAL_TOGGLES.includedItems?.floorTile || true,
        wall_tile_included: pkg.UNIVERSAL_TOGGLES.includedItems?.wallTile || true,
        shower_floor_tile_included: pkg.UNIVERSAL_TOGGLES.includedItems?.showerFloorTile || true,
        accent_tile_included: pkg.UNIVERSAL_TOGGLES.includedItems?.accentTile || true,
        vanity_included: pkg.UNIVERSAL_TOGGLES.includedItems?.vanity || true,
        tub_included: pkg.UNIVERSAL_TOGGLES.includedItems?.tub || true,
        tub_filler_included: pkg.UNIVERSAL_TOGGLES.includedItems?.tubFiller || true,
        toilet_included: pkg.UNIVERSAL_TOGGLES.includedItems?.toilet || true,
        shower_included: pkg.UNIVERSAL_TOGGLES.includedItems?.shower || true,
        faucet_included: pkg.UNIVERSAL_TOGGLES.includedItems?.faucet || true,
        glazing_included: pkg.UNIVERSAL_TOGGLES.includedItems?.glazing || true,
        mirror_included: pkg.UNIVERSAL_TOGGLES.includedItems?.mirror || true,
        towel_bar_included: pkg.UNIVERSAL_TOGGLES.includedItems?.towelBar || true,
        toilet_paper_holder_included: pkg.UNIVERSAL_TOGGLES.includedItems?.toiletPaperHolder || true,
        hook_included: pkg.UNIVERSAL_TOGGLES.includedItems?.hook || true,
        lighting_included: pkg.UNIVERSAL_TOGGLES.includedItems?.lighting || true
      };
      
      const { error: togglesError } = await supabase
        .from('package_universal_toggles')
        .insert(togglesData);
        
      if (togglesError) {
        console.error(`Error inserting toggles for package ${pkg.NAME}:`, togglesError);
      }
    }
    
    // Insert package products
    const packageProducts = [];
    const skuMappings = {
      'TILES_FLOOR_SKU': 'floor_tile',
      'TILES_WALL_SKU': 'wall_tile', 
      'TILES_SHOWER_FLOOR_SKU': 'shower_floor_tile',
      'TILES_ACCENT_SKU': 'accent_tile',
      'VANITY_SKU': 'vanity',
      'TUB_SKU': 'tub',
      'TUB_FILLER_SKU': 'tub_filler',
      'TOILET_SKU': 'toilet',
      'SHOWER_SKU': 'shower',
      'FAUCET_SKU': 'faucet',
      'GLAZING_SKU': 'glazing',
      'MIRROR_SKU': 'mirror',
      'TOWEL_BAR_SKU': 'towel_bar',
      'TOILET_PAPER_HOLDER_SKU': 'toilet_paper_holder',
      'HOOK_SKU': 'hook',
      'LIGHTING_SKU': 'lighting'
    };
    
    for (const [skuField, productType] of Object.entries(skuMappings)) {
      const sku = pkg[skuField];
      if (sku && sku.trim() && productBySku[sku]) {
        packageProducts.push({
          package_id: packageId,
          product_id: productBySku[sku],
          product_type: productType
        });
      }
    }
    
    if (packageProducts.length > 0) {
      const { error: productsError } = await supabase
        .from('package_products')
        .insert(packageProducts);
        
      if (productsError) {
        console.error(`Error inserting products for package ${pkg.NAME}:`, productsError);
      }
    }
    
    console.log(`    ✅ Package ${pkg.NAME} migrated with ${packageProducts.length} products`);
  }
  
  console.log(`✅ Successfully migrated ${data.packages.length} packages`);
}

/**
 * Main migration function
 */
async function main() {
  try {
    // Test connection
    const { data: testData, error: testError } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (testError) {
      console.error('❌ Failed to connect to Supabase:', testError);
      process.exit(1);
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    // Run migrations in order
    await migrateProducts();
    await migrateBrandLogos();
    await migrateColors();
    await migratePackages();
    
    console.log('🎉 Migration completed successfully!');
    
    // Print summary
    const { data: productCount } = await supabase.from('products').select('count', { count: 'exact', head: true });
    const { data: packageCount } = await supabase.from('packages').select('count', { count: 'exact', head: true });
    
    console.log('\n📊 Migration Summary:');
    console.log(`   Products: ${productCount?.count || 0}`);
    console.log(`   Packages: ${packageCount?.count || 0}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();