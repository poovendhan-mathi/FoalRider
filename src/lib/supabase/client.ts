import { createBrowserClient } from "@supabase/ssr";

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: false, // Token refresh handled by orchestrator
        detectSessionInUrl: true,
        flowType: "pkce",
        storage: {
          getItem: (key) => {
            // Read from cookie
            if (typeof document === "undefined") return null;
            const cookies = document.cookie.split("; ");
            const cookie = cookies.find((c) => c.startsWith(`${key}=`));
            return cookie?.split("=")[1] ?? null;
          },
          setItem: (key, value) => {
            if (typeof document === "undefined") return;
            document.cookie = `${key}=${value}; path=/`;
          },
          removeItem: (key) => {
            if (typeof document === "undefined") return;
            document.cookie = `${key}=; max-age=0; path=/`;
          },
        },
      },
      global: {
        headers: {
          "x-client-info": "nextjs-client",
        },
      },
    }
  );

  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}
