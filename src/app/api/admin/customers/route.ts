import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerActionClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * Customer creation schema
 */
const customerSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().nullable(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * GET /api/admin/customers
 * Fetch all customers
 */
export async function GET() {
  try {
    const supabase = await getSupabaseServerActionClient();

    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch customers
    const { data: customers, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, phone, created_at, role")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customers:", error);
      return NextResponse.json(
        { error: "Failed to fetch customers" },
        { status: 500 }
      );
    }

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Unexpected error in GET /api/admin/customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/customers
 * Create a new customer account
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerActionClient();

    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const validated = customerSchema.parse(body);

    // Create auth user (using admin API)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: validated.email,
        password: validated.password,
        email_confirm: true,
        user_metadata: {
          full_name: validated.full_name,
        },
      });

    if (authError || !authData.user) {
      console.error("Error creating auth user:", authError);
      return NextResponse.json(
        { error: authError?.message || "Failed to create customer account" },
        { status: 400 }
      );
    }

    // Create profile (trigger should handle this, but let's ensure)
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: authData.user.id,
      email: validated.email,
      full_name: validated.full_name,
      phone: validated.phone || null,
      role: "customer",
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Try to delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to create customer profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        customer: {
          id: authData.user.id,
          email: validated.email,
          full_name: validated.full_name,
          phone: validated.phone,
        },
        message: "Customer created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Unexpected error in POST /api/admin/customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
