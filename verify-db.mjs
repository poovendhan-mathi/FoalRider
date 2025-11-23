import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env.local file
const envFile = readFileSync('.env.local', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function verifyDatabase() {
  console.log('🔍 Verifying Supabase Database Structure\n');
  console.log('═'.repeat(60));

  const tables = [
    'profiles',
    'categories',
    'products',
    'product_images',
    'product_variants',
    'addresses',
    'orders',
    'order_items',
    'cart_items',
    'reviews',
    'wishlists'
  ];

  let allGood = true;
  const results = [];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table.padEnd(20)} - ERROR: ${error.message}`);
        allGood = false;
        results.push({ table, status: 'error', count: 0, error: error.message });
      } else {
        console.log(`✅ ${table.padEnd(20)} - ${count || 0} rows`);
        results.push({ table, status: 'ok', count: count || 0 });

        // Get sample row to show columns
        if (count > 0) {
          const { data: sample } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (sample && sample.length > 0) {
            const columns = Object.keys(sample[0]);
            console.log(`   📋 Columns: ${columns.slice(0, 5).join(', ')}${columns.length > 5 ? '...' : ''}`);
          }
        }
      }
    } catch (err) {
      console.log(`❌ ${table.padEnd(20)} - EXCEPTION: ${err.message}`);
      allGood = false;
      results.push({ table, status: 'exception', count: 0, error: err.message });
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 SUMMARY\n');

  const existing = results.filter(r => r.status === 'ok');
  const missing = results.filter(r => r.status !== 'ok');

  console.log(`✅ Existing tables: ${existing.length}/${tables.length}`);
  existing.forEach(r => console.log(`   - ${r.table} (${r.count} rows)`));

  if (missing.length > 0) {
    console.log(`\n❌ Missing/Error tables: ${missing.length}`);
    missing.forEach(r => console.log(`   - ${r.table}: ${r.error}`));
  }

  // Check for improvements
  console.log('\n🔍 CHECKING DATABASE IMPROVEMENTS:\n');

  if (existing.find(r => r.table === 'products')) {
    const { data: productSample } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productSample && productSample[0]) {
      const columns = Object.keys(productSample[0]);
      
      const improvements = {
        'updated_at': columns.includes('updated_at') ? '✅' : '❌',
        'view_count': columns.includes('view_count') ? '✅' : '❌',
        'purchase_count': columns.includes('purchase_count') ? '✅' : '❌',
        'search_vector': columns.includes('search_vector') ? '✅' : '❌',
      };

      console.log('Products table enhancements:');
      Object.entries(improvements).forEach(([key, status]) => {
        console.log(`   ${status} ${key}`);
      });
    }
  }

  if (existing.find(r => r.table === 'product_images')) {
    const { data: imageSample } = await supabase
      .from('product_images')
      .select('*')
      .limit(1);

    if (imageSample && imageSample[0]) {
      const columns = Object.keys(imageSample[0]);
      
      const improvements = {
        'alt_text': columns.includes('alt_text') ? '✅' : '❌',
        'is_primary': columns.includes('is_primary') ? '✅' : '❌',
        'image_type': columns.includes('image_type') ? '✅' : '❌',
      };

      console.log('\nProduct Images table enhancements:');
      Object.entries(improvements).forEach(([key, status]) => {
        console.log(`   ${status} ${key}`);
      });
    }
  }

  if (existing.find(r => r.table === 'cart_items')) {
    const { data: cartSample } = await supabase
      .from('cart_items')
      .select('*')
      .limit(1);

    if (cartSample !== null) {
      const columns = cartSample.length > 0 ? Object.keys(cartSample[0]) : [];
      
      console.log('\nCart Items table enhancements:');
      console.log(`   ${columns.includes('session_id') ? '✅' : '❌'} session_id (guest cart support)`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  
  if (allGood) {
    console.log('\n🎉 DATABASE VERIFICATION COMPLETE - ALL TABLES FOUND!');
  } else {
    console.log('\n⚠️  DATABASE VERIFICATION COMPLETE - SOME ISSUES FOUND');
    console.log('Run the migration scripts in Supabase SQL Editor to fix missing tables.');
  }

  console.log('\n📝 Next Steps:');
  if (missing.length > 0) {
    console.log('   1. Run supabase-migration-phase2.sql in Supabase SQL Editor');
  }
  if (existing.find(r => r.table === 'products' && r.count === 0)) {
    console.log('   2. Run seed-products.sql to add sample products');
  }
  if (!existing.find(r => r.table === 'wishlists')) {
    console.log('   3. Optional: Run supabase-migration-improvements.sql for enhanced features');
  }
  console.log('   4. Configure RLS policies with supabase-rls-policies.sql');
}

verifyDatabase().catch(console.error);
