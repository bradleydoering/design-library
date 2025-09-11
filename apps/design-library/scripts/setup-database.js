/**
 * Direct database setup using Supabase client
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🏗️ Setting up CloudReno database schema...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSchema() {
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '../supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Executing database schema...');
    
    // Execute the schema using SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: schema 
    });
    
    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('📋 Trying direct SQL execution...');
      
      // Split schema into individual statements
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      console.log(`📄 Found ${statements.length} SQL statements to execute`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
            
            // Use direct query for DDL statements
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({ sql: statement })
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              if (!errorText.includes('already exists')) {
                console.log(`⚠️ Warning on statement ${i + 1}: ${errorText.substring(0, 100)}...`);
              } else {
                console.log(`✅ Statement ${i + 1} completed (already exists)`);
              }
            } else {
              console.log(`✅ Statement ${i + 1} executed successfully`);
            }
          } catch (err) {
            console.log(`⚠️ Error on statement ${i + 1}:`, err.message.substring(0, 100) + '...');
          }
        }
      }
    } else {
      console.log('✅ Schema executed successfully via exec_sql');
    }
    
    // Verify tables were created
    console.log('\n🔍 Verifying table creation...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
      return false;
    }
    
    const expectedTables = ['products', 'packages', 'package_products', 'package_universal_toggles', 'brand_logos', 'colors'];
    const existingTables = tables?.map(t => t.table_name) || [];
    
    console.log('\n📋 Table verification:');
    expectedTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`✅ ${table}`);
      } else {
        console.log(`❌ ${table} - MISSING`);
      }
    });
    
    const allTablesExist = expectedTables.every(table => existingTables.includes(table));
    
    if (allTablesExist) {
      console.log('\n🎉 Database schema setup complete!');
      console.log('📋 Next step: Run the migration script to populate data');
      console.log('💻 Command: node scripts/migrate-to-supabase.js');
    } else {
      console.log('\n⚠️ Some tables are missing. You may need to run the schema manually in Supabase dashboard.');
    }
    
    return allTablesExist;
    
  } catch (error) {
    console.error('❌ Schema setup failed:', error);
    console.log('\n📋 Manual setup alternative:');
    console.log('1. Go to Supabase dashboard SQL Editor');
    console.log('2. Copy and paste the contents of supabase-schema.sql');
    console.log('3. Click Run to execute');
    return false;
  }
}

async function main() {
  // Test connection first
  try {
    const { data, error } = await supabase.from('information_schema.tables').select('count').limit(1);
    if (error) {
      console.error('❌ Connection test failed:', error);
      return;
    }
    console.log('✅ Connected to Supabase successfully');
  } catch (err) {
    console.error('❌ Connection error:', err);
    return;
  }
  
  // Execute schema
  const success = await executeSchema();
  
  if (success) {
    console.log('\n🚀 Ready for data migration!');
  }
}

main().catch(console.error);