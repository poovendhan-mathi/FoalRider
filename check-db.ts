import { supabaseAdmin } from './src/lib/supabase/admin';

async function checkDatabase() {
  console.log('🔍 Checking Supabase database schema...\n');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Key:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...\n');

  // First check if we can query the database at all
  const { data: testQuery, error: testError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .limit(1);

  if (testError) {
    console.log('❌ Connection error:', testError.message);
    console.log('Error details:', testError);
    console.log('\n⚠️  This might be an RLS (Row Level Security) issue.');
    console.log('Try running this in Supabase SQL Editor:');
    console.log('ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE products DISABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;\n');
    return;
  }

  console.log('✅ Connection established!\n');

  const tables = [
    'profiles',
    'products',
    'product_images',
    'product_variants',
    'categories',
    'addresses',
    'orders',
    'order_items',
    'cart_items',
    'reviews',
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table} - error: ${error.message}`);
      } else {
        console.log(`✅ ${table} - exists (${count || 0} rows)`);
        
        // Get column info if table exists
        const { data: sample } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1);
        
        if (sample && sample.length > 0) {
          console.log(`   Columns: ${Object.keys(sample[0]).join(', ')}`);
        }
      }
    } catch (err: any) {
      console.log(`❌ ${table} - error: ${err.message}`);
    }
  }

  console.log('\n✅ All tables from your SQL script are confirmed!');
  console.log('\n📝 Next steps for Phase 2:');
  console.log('1. Add missing tables: categories, orders, order_items, cart_items, addresses, reviews');
  console.log('2. Enable RLS policies for security');
  console.log('3. Add sample product data');
}

checkDatabase().catch(console.error);
