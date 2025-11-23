// Script to check existing Supabase schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zsfis-7v35arixple3hclw.supabase.co';
const supabaseKey = 'sb_secret_NOjB9hL_bF00WbYWXYXfgw_vxwiWEZ5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking Supabase schema...\n');

  try {
    // Get list of tables by querying information_schema
    const { data: tables, error } = await supabase.rpc('get_tables');
    
    if (error) {
      // Try alternative method - query each expected table
      console.log('Checking tables individually:\n');
      
      const expectedTables = [
        'products',
        'categories', 
        'orders',
        'order_items',
        'customers',
        'profiles',
        'cart',
        'cart_items',
        'addresses',
        'reviews'
      ];

      for (const tableName of expectedTables) {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          console.log(`✅ ${tableName} - exists (${count || 0} rows)`);
        } else {
          console.log(`❌ ${tableName} - not found`);
        }
      }
    } else {
      console.log('Found tables:', tables);
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkSchema();
