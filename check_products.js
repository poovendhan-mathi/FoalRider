const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProducts() {
  console.log('🔍 Checking products in database...\n');
  
  const { data, error, count } = await supabase
    .from('products')
    .select('id, name, price, is_active, stock_quantity', { count: 'exact' })
    .limit(5);
  
  if (error) {
    console.error('❌ Error fetching products:', error);
    return;
  }
  
  console.log(`✅ Total products in database: ${count}`);
  console.log('\n📦 Sample products:');
  console.table(data);
}

checkProducts();
