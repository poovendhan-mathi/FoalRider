import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client with service role key - bypasses RLS
// Only use in secure server-side contexts!
export const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Export a function to get the admin client
export function createClient() {
  return supabaseAdmin;
}

