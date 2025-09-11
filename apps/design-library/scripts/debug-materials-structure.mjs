#!/usr/bin/env node

// Script to debug how materials are structured and why tiles aren't found
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

// Map database category names to the expected property names
const CATEGORY_MAP = {
  'tiles': 'tiles',
  'Tiles': 'tiles', // Handle both lowercase and capitalized
  'vanities': 'vanities',
  'Vanities': 'vanities',
  'tubs': 'tubs',
  'Tubs': 'tubs',
  'tub_fillers': 'tub_fillers',
  'Tub_fillers': 'tub_fillers',
  'toilets': 'toilets',
  'Toilets': 'toilets',
  'showers': 'showers',
  'Showers': 'showers',
  'faucets': 'faucets',
  'Faucets': 'faucets',
  'shower_glazing': 'shower_glazing',
  'Shower_glazing': 'shower_glazing',
  'mirrors': 'mirrors',
  'Mirrors': 'mirrors',
  'towel_bars': 'towel_bars',
  'Towel_bars': 'towel_bars',
  'toilet_paper_holders': 'toilet_paper_holders',
  'Toilet_paper_holders': 'toilet_paper_holders',
  'hooks': 'hooks',
  'Hooks': 'hooks',
  'lighting': 'lighting',
  'Lighting': 'lighting'
};

async function debugMaterialsStructure() {
  console.log('Debugging materials structure and tile lookup...\n');

  // First, let's see how the materials data is structured from Supabase
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('category, name');

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return;
  }

  console.log(`Total products in database: ${productsData.length}`);

  // Transform products by category (simulating what getMaterials does)
  const data = {
    packages: [],
    logos: [],
    colors: [],
    tiles: [],
    vanities: [],
    tubs: [],
    tub_fillers: [],
    toilets: [],
    showers: [],
    faucets: [],
    shower_glazing: [],
    mirrors: [],
    towel_bars: [],
    toilet_paper_holders: [],
    hooks: [],
    lighting: []
  };

  // Transform products by category
  productsData?.forEach((product) => {
    const categoryKey = CATEGORY_MAP[product.category];
    if (categoryKey && data[categoryKey]) {
      // Transform database product to match the expected interface
      const transformedProduct = {
        SKU: product.sku,
        NAME: product.name,
        BRAND: product.brand,
        MATERIAL: product.material,
        FINISH: product.finish,
        COLOR_TA: product.color_ta,
        SIZE: product.size,
        DESCRIPTION: product.description,
        URL: product.url,
        IMAGE_MAIN: product.image_main,
        IMAGE_01: product.image_01,
        IMAGE_02: product.image_02,
        IMAGE_03: product.image_03,
        COST_SQF: product.cost_sqf?.toString(),
        PRICE_SQF: product.price_sqf?.toString(),
        COST: product.cost?.toString(),
        PRICE: product.price?.toString(),
      };

      // Add category-specific fields
      if (product.category === 'tiles') {
        transformedProduct.WALL = product.wall ? "TRUE" : "FALSE";
        transformedProduct.FLOOR = product.floor ? "TRUE" : "FALSE";
        transformedProduct.SHOWER_FLOOR = product.shower_floor ? "TRUE" : "FALSE";
        transformedProduct.ACCENT = product.accent ? "TRUE" : "FALSE";
        transformedProduct.COLLECTION = product.material || 'Unknown';
        transformedProduct.SPECS = product.description || '';
      }

      data[categoryKey].push(transformedProduct);
    }
  });

  // Apply data transformations (like the actual getMaterials function does)
  applyDataTransformations(data);

  console.log(`\nTiles in materials.tiles array: ${data.tiles.length}`);

  // Check for our specific missing SKUs
  const missingSKUs = ['OV.ET.BON.1224.MT', 'UI.CA.BGE.1224', 'SO.ST.DRK.0420.CHEV'];
  
  console.log('\n🔍 Checking for missing SKUs in tiles array:');
  missingSKUs.forEach(sku => {
    const found = data.tiles.find(tile => tile.SKU?.toLowerCase() === sku.toLowerCase());
    if (found) {
      console.log(`✅ ${sku}: Found - ${found.NAME} (${found.BRAND})`);
      console.log(`   Transformed fields:`, {
        SKU: found.SKU,
        NAME: found.NAME,
        BRAND: found.BRAND,
        WALL: found.WALL,
        FLOOR: found.FLOOR,
        SHOWER_FLOOR: found.SHOWER_FLOOR,
        ACCENT: found.ACCENT
      });
    } else {
      console.log(`❌ ${sku}: Not found in materials.tiles array`);
      
      // Check if it exists in raw database with different SKU format
      const rawProduct = productsData.find(p => 
        p.sku?.toLowerCase() === sku.toLowerCase() && p.category === 'tiles'
      );
      
      if (rawProduct) {
        console.log(`   🔍 But found in raw database:`, {
          sku: rawProduct.sku,
          name: rawProduct.name,
          category: rawProduct.category,
          brand: rawProduct.brand
        });
      } else {
        console.log(`   ❌ Also not found in raw database`);
      }
    }
  });

  // Show sample of what IS in the tiles array
  console.log('\n📋 Sample of tiles that ARE in materials.tiles array:');
  data.tiles.slice(0, 10).forEach(tile => {
    console.log(`  ${tile.SKU}: ${tile.NAME} (${tile.BRAND})`);
  });

  console.log('\n🎯 This will help identify why the frontend can\'t find the tiles.');
}

// Apply existing data transformations (copied from materials.ts)
function applyDataTransformations(data) {
  const transformBoolean = (value) => {
    return value === "TRUE" || value === true || value === 1;
  };

  const transformColorKeys = (item) => {
    const colorKeys = Object.keys(item).filter((key) =>
      key.startsWith("COLOR_")
    );
    colorKeys.forEach((key) => {
      if (item[key] && item[key] !== "DEFAULT") {
        item[key] = item[key].trim();
      }
    });
    return item;
  };

  const removeMissingValues = (item) => {
    Object.keys(item).forEach((key) => {
      if (
        item[key] === undefined ||
        item[key] === null ||
        (typeof item[key] === "string" && item[key].trim() === "")
      ) {
        delete item[key];
      }
    });
    return item;
  };

  // Transform tiles
  data.tiles = data.tiles.map((tile) => {
    return removeMissingValues(
      transformColorKeys({
        ...tile,
        WALL: transformBoolean(tile.WALL),
        FLOOR: transformBoolean(tile.FLOOR),
        SHOWER_FLOOR: transformBoolean(tile.SHOWER_FLOOR),
        ACCENT: transformBoolean(tile.ACCENT),
      })
    );
  });
}

// Run the debug
debugMaterialsStructure().catch(console.error);