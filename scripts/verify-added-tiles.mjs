#!/usr/bin/env node

// Script to verify the tiles were actually added to the database
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

async function verifyAddedTiles() {
  console.log('Verifying tiles were added to database...\n');

  const targetSKUs = ['OV.ET.BON.1224.MT', 'UI.CA.BGE.1224', 'SO.ST.DRK.0420.CHEV'];

  // Check each SKU individually
  for (const sku of targetSKUs) {
    console.log(`🔍 Searching for ${sku}:`);
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .maybeSingle();

    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
    } else if (product) {
      console.log(`  ✅ Found: ID ${product.id}`);
      console.log(`     Name: ${product.name}`);
      console.log(`     Brand: ${product.brand}`);
      console.log(`     Category: ${product.category}`);
      console.log(`     Created: ${product.created_at}`);
      console.log(`     Updated: ${product.updated_at}`);
    } else {
      console.log(`  ❌ Not found in database`);
    }
  }

  // Check recent additions to the products table
  console.log('\n📋 Recent products added to database (last 10):');
  const { data: recentProducts, error: recentError } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (recentError) {
    console.log(`Error: ${recentError.message}`);
  } else {
    recentProducts?.forEach(product => {
      console.log(`  ${product.sku}: ${product.name} (${product.category}) - ${product.created_at}`);
    });
  }

  // Check if there are any products with similar SKU patterns
  console.log('\n🔍 Checking for similar SKU patterns:');
  const similarPatterns = ['OV.ET.%', 'UI.CA.%', 'SO.ST.%'];
  
  for (const pattern of similarPatterns) {
    const { data: similar, error: similarError } = await supabase
      .from('products')
      .select('sku, name, category')
      .ilike('sku', pattern)
      .limit(5);

    if (!similarError && similar && similar.length > 0) {
      console.log(`  Pattern ${pattern}: Found ${similar.length} matches`);
      similar.forEach(p => console.log(`    - ${p.sku}: ${p.name}`));
    } else {
      console.log(`  Pattern ${pattern}: No matches`);
    }
  }

  // Total count of products
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log(`\n📊 Total products in database: ${count}`);
  }
}

// Run the verification
verifyAddedTiles().catch(console.error);