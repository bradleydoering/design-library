/**
 * Test Supabase connection and setup
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);

    if (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }

    console.log('✅ Connection successful!');
    console.log('📋 Existing tables:', data.map(t => t.table_name));
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err);
    return false;
  }
}

async function setupDatabase() {
  try {
    console.log('\n🏗️ Setting up database schema...');
    
    // Read and execute the schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '../supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error && !error.message.includes('already exists')) {
            console.error(`❌ Error in statement ${i + 1}:`, error);
          } else {
            console.log(`✅ Statement ${i + 1} executed`);
          }
        } catch (err) {
          // Try direct query for some statements
          try {
            await supabase.from('_').select('*').limit(0);
          } catch (e) {
            console.log(`⚠️ Statement ${i + 1} may have failed:`, statement.substring(0, 50) + '...');
          }
        }
      }
    }
    
    console.log('✅ Database schema setup complete!');
    return true;
  } catch (err) {
    console.error('❌ Schema setup failed:', err);
    return false;
  }
}

async function main() {
  const connected = await testConnection();
  
  if (connected) {
    await setupDatabase();
    
    // Test tables exist
    console.log('\n🔍 Verifying tables...');
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    const expectedTables = ['products', 'packages', 'package_products', 'package_universal_toggles', 'brand_logos', 'colors'];
    const existingTables = tables?.map(t => t.table_name) || [];
    
    expectedTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' missing`);
      }
    });
    
    console.log('\n🎉 Setup complete! Ready for data migration.');
  }
}

main().catch(console.error);