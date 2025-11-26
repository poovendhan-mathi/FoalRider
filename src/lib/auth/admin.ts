import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Server-side admin authentication check
 * Use this in admin pages to verify user has admin role
 */
export async function requireAdmin() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error in requireAdmin:", authError);
      redirect("/login?redirect=/admin&error=auth_failed");
    }

    if (!user) {
      redirect("/login?redirect=/admin");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error in requireAdmin:", profileError);
      redirect("/login?redirect=/admin&error=profile_not_found");
    }

    if (profile?.role !== "admin") {
      redirect("/?error=unauthorized"); // Redirect non-admins to home
    }

    return { user, profile };
  } catch (error) {
    console.error("Unexpected error in requireAdmin:", error);
    redirect("/login?redirect=/admin&error=server_error");
  }
}

/**
 * Check if user is admin (client-side)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return profile?.role === "admin";
  } catch (error) {
    console.error("Unexpected error in isAdmin:", error);
    return false;
  }
}
