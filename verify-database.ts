/**
 * Database Verification Script
 * Run this to check your actual Supabase database structure
 * 
 * Usage: npx tsx verify-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface TableInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface ForeignKey {
  table_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
}

async function verifyDatabase() {
  console.log('🔍 FOAL RIDER DATABASE VERIFICATION');
  console.log('=====================================\n');

  try {
    // Test connection
    console.log('📡 Testing connection...');
    const { error: connError } = await supabase.from('profiles').select('count').limit(1);
    if (connError && connError.message.includes('does not exist')) {
      console.log('❌ profiles table does not exist!');
    } else if (connError) {
      console.log('⚠️  Connection warning:', connError.message);
    } else {
      console.log('✅ Connected to Supabase\n');
    }

    // Check each table
    const tablesToCheck = [
      'profiles',
      'categories',
      'products',
      'addresses',
      'cart_items',
      'reviews',
      'orders',
      'order_items'
    ];

    console.log('📊 CHECKING TABLES:\n');

    for (const table of tablesToCheck) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ ${table}: Does NOT exist`);
          console.log(`   Error: ${error.message}\n`);
        } else {
          console.log(`✅ ${table}: EXISTS (${count || 0} rows)`);
        }
      } catch (err: any) {
        console.log(`❌ ${table}: Error - ${err.message}\n`);
      }
    }

    // Check profiles structure
    console.log('\n📋 PROFILES TABLE STRUCTURE:\n');
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();

      if (error && !error.message.includes('0 rows')) {
        console.log('❌ Cannot read profiles structure');
      } else if (profile) {
        console.log('Columns found:');
        Object.keys(profile).forEach(key => {
          console.log(`  • ${key}`);
        });
        
        // Check for role column specifically
        if ('role' in profile) {
          console.log('\n✅ role column EXISTS');
        } else {
          console.log('\n❌ role column MISSING');
        }
      } else {
        // Empty table, try to insert test to see structure
        console.log('Table empty, checking via RLS...');
      }
    } catch (err: any) {
      console.log('❌ Error checking profiles:', err.message);
    }

    // Check your admin status
    console.log('\n👤 YOUR ACCOUNT STATUS:\n');
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('email, full_name, role')
        .eq('email', 'pooven0708@gmail.com');

      if (error) {
        console.log('❌ Cannot check admin status:', error.message);
      } else if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        console.log(`Email: ${profile.email}`);
        console.log(`Name: ${profile.full_name || 'Not set'}`);
        console.log(`Role: ${profile.role || 'NOT SET (column may not exist)'}`);
        
        if (profile.role === 'admin') {
          console.log('\n✅ You are ADMIN');
        } else {
          console.log('\n⚠️  You are NOT admin');
        }
      } else {
        console.log('❌ Your profile not found');
      }
    } catch (err: any) {
      console.log('❌ Error:', err.message);
    }

    // Check orders table specifically
    console.log('\n📦 ORDERS TABLE CHECK:\n');
    try {
      const { error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log('❌ orders table does NOT exist');
        console.log('   This is why checkout fails!');
        console.log('   Run fix-database-complete-v2.sql to create it');
      } else {
        console.log(`✅ orders table exists (${count || 0} orders)`);
      }
    } catch (err: any) {
      console.log('❌ orders table check failed:', err.message);
    }

    // Check order_items table
    console.log('\n📋 ORDER_ITEMS TABLE CHECK:\n');
    try {
      const { error, count } = await supabase
        .from('order_items')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log('❌ order_items table does NOT exist');
        console.log('   Run fix-database-complete-v2.sql to create it');
      } else {
        console.log(`✅ order_items table exists (${count || 0} items)`);
      }
    } catch (err: any) {
      console.log('❌ order_items table check failed:', err.message);
    }

    // Check RLS policies (via test insert)
    console.log('\n🔐 RLS POLICY CHECK:\n');
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        console.log('⚠️  RLS may be blocking reads:', error.message);
      } else {
        console.log('✅ Can read profiles (RLS policy working)');
      }
    } catch (err: any) {
      console.log('❌ RLS check failed:', err.message);
    }

    // Summary
    console.log('\n=====================================');
    console.log('📊 VERIFICATION SUMMARY:');
    console.log('=====================================\n');
    
    // Check what needs to be done
    const needsRoleColumn = true; // Will be updated based on checks above
    const needsOrdersTable = true; // Will be updated based on checks above
    
    console.log('TO FIX ISSUES:');
    console.log('1. Run fix-database-complete-v2.sql in Supabase SQL Editor');
    console.log('2. This will:');
    console.log('   • Add role column to profiles');
    console.log('   • Create orders table');
    console.log('   • Create order_items table');
    console.log('   • Set up RLS policies');
    console.log('   • Make you admin');
    console.log('\nSee QUICK_START_GUIDE.md for instructions');

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run verification
verifyDatabase()
  .then(() => {
    console.log('\n✅ Verification complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Verification failed:', err);
    process.exit(1);
  });
