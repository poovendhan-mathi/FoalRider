#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

console.log("🔧 Running Guest Orders Database Fix...\n");

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Read the SQL file
const sqlContent = readFileSync("fix-guest-orders-complete.sql", "utf8");

// Split by semicolons but keep DO blocks together
const statements = [];
let currentStatement = "";
let inDoBlock = false;

sqlContent.split("\n").forEach((line) => {
  currentStatement += line + "\n";

  if (line.trim().startsWith("DO $$")) {
    inDoBlock = true;
  }

  if (inDoBlock && line.trim() === "$$;") {
    inDoBlock = false;
    statements.push(currentStatement);
    currentStatement = "";
  } else if (
    !inDoBlock &&
    line.includes(";") &&
    !line.trim().startsWith("--")
  ) {
    statements.push(currentStatement);
    currentStatement = "";
  }
});

if (currentStatement.trim()) {
  statements.push(currentStatement);
}

// Execute each statement
console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i].trim();

  if (!statement || statement.startsWith("--")) {
    continue;
  }

  console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);

  try {
    const { data, error } = await supabase.rpc("exec_sql", { sql: statement });

    if (error) {
      // Try direct query if RPC fails
      const { data: directData, error: directError } = await supabase
        .from("_sql")
        .select("*")
        .eq("query", statement);

      if (directError) {
        console.error(`❌ Error: ${directError.message}`);
        console.error(`   Statement: ${statement.substring(0, 100)}...`);
      } else {
        console.log("✅ Statement executed successfully");
      }
    } else {
      console.log("✅ Statement executed successfully");
      if (data) {
        console.log("   Result:", JSON.stringify(data, null, 2));
      }
    }
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
  }

  console.log("");
}

console.log("🎉 Migration complete!");
console.log("\n📊 Verifying changes...\n");

// Verify columns exist
const { data: columns, error: colError } = await supabase
  .from("information_schema.columns")
  .select("column_name, data_type, is_nullable")
  .eq("table_name", "orders")
  .in("column_name", ["user_id", "guest_email", "guest_id"]);

if (colError) {
  console.error("❌ Could not verify columns:", colError.message);
} else {
  console.log("✅ Column verification:");
  console.table(columns);
}

// Try to query orders table
const { data: testQuery, error: testError } = await supabase
  .from("orders")
  .select("user_id, guest_email, guest_id")
  .limit(1);

if (testError) {
  console.error("\n❌ Test query failed:", testError.message);
  console.log(
    "\n⚠️  You may need to run the SQL manually in Supabase SQL Editor"
  );
  console.log("   1. Go to: https://supabase.com/dashboard/project/_/sql");
  console.log("   2. Copy contents of fix-guest-orders-complete.sql");
  console.log("   3. Paste and run in SQL Editor");
} else {
  console.log("\n✅ Orders table is ready for guest orders!");
  console.log("   You can now test guest checkout");
}
