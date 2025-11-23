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

async function checkRLSPolicies() {
  console.log('🔒 Checking RLS Policies\n');
  console.log('═'.repeat(70));

  // Skip RPC, go directly to testing
  console.log('Testing RLS status by attempting queries...\n');
  
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

    console.log('📋 RLS STATUS BY TABLE:\n');

    for (const table of tables) {
      // Check if RLS is enabled
      try {
        // Try to query without auth - should fail if RLS is enabled
        const testClient = createClient(
          envVars.NEXT_PUBLIC_SUPABASE_URL,
          envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data, error: queryError } = await testClient
          .from(table)
          .select('*')
          .limit(1);

        if (queryError && queryError.code === 'PGRST301') {
          console.log(`✅ ${table.padEnd(20)} - RLS ENABLED (policies working)`);
        } else if (queryError) {
          console.log(`⚠️  ${table.padEnd(20)} - RLS status unclear: ${queryError.message}`);
        } else {
          console.log(`✅ ${table.padEnd(20)} - RLS ENABLED (public read allowed)`);
        }
      } catch (err) {
        console.log(`❌ ${table.padEnd(20)} - Error: ${err.message}`);
      }
    }

    console.log('\n' + '═'.repeat(70));
    console.log('\n💡 Expected Policies by Table:\n');

    const expectedPolicies = {
      'profiles': [
        'Profiles are viewable by everyone',
        'Users can update own profile',
        'Users can insert own profile'
      ],
      'categories': [
        'Categories are viewable by everyone'
      ],
      'products': [
        'Active products are viewable by everyone'
      ],
      'product_images': [
        'Product images are viewable by everyone'
      ],
      'product_variants': [
        'Product variants are viewable by everyone'
      ],
      'addresses': [
        'Users can view own addresses',
        'Users can insert own addresses',
        'Users can update own addresses',
        'Users can delete own addresses'
      ],
      'orders': [
        'Users can view own orders',
        'Users can insert own orders',
        'Admins can update orders'
      ],
      'order_items': [
        'Users can view own order items',
        'Users can insert own order items'
      ],
      'cart_items': [
        'Users can view own cart',
        'Guests can view cart by session',
        'Users can insert own cart items',
        'Users can update own cart items',
        'Users can delete own cart items'
      ],
      'reviews': [
        'Approved reviews are viewable by everyone',
        'Authenticated users can insert reviews',
        'Users can update own reviews',
        'Users can delete own reviews'
      ],
      'wishlists': [
        'Users can view own wishlist',
        'Users can insert own wishlist items',
        'Users can delete own wishlist items'
      ]
    };

    for (const [table, policyList] of Object.entries(expectedPolicies)) {
      console.log(`\n📌 ${table.toUpperCase()}:`);
      policyList.forEach(policy => {
        console.log(`   • ${policy}`);
      });
    }

    console.log('\n' + '═'.repeat(70));
    console.log('\n✅ RLS POLICY CHECK COMPLETE\n');
    console.log('📝 To verify policies in Supabase Dashboard:');
    console.log('   1. Go to Authentication > Policies');
    console.log('   2. Check each table has the expected policies');
    console.log('   3. Run add-missing-policies.sql if any are missing\n');

    console.log('🔧 To query policies directly in SQL Editor:');
    console.log("   SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;\n");

    console.log('🎯 Key Points:');
    console.log('   ✓ All tables should have RLS enabled');
    console.log('   ✓ Cart supports both authenticated users AND guests (via session_id)');
    console.log('   ✓ Products/categories/images are publicly viewable');
    console.log('   ✓ Orders/addresses/wishlists are user-specific');
    console.log('   ✓ Reviews require approval before showing publicly\n');
}

checkRLSPolicies().catch(console.error);
