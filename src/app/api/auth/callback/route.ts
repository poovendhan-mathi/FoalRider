import { getSupabaseServerActionClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await getSupabaseServerActionClient();

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Email verification error:", error);
        return NextResponse.redirect(
          `${origin}/login?error=verification_failed&message=${encodeURIComponent(
            error.message
          )}`
        );
      }

      // Success - redirect to profile or home
      return NextResponse.redirect(`${origin}/profile?verified=true`);
    } catch (error) {
      console.error("Callback error:", error);
      return NextResponse.redirect(`${origin}/login?error=verification_failed`);
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
