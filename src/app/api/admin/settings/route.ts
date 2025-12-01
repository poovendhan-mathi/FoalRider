import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerActionClient } from "@/lib/supabase/server";
import { z } from "zod";

const settingsSchema = z.object({
  store_name: z.string().min(1).max(100).optional(),
  store_email: z.string().email().optional(),
  store_phone: z.string().optional(),
  store_address: z.string().optional(),
  currency: z.enum(["INR", "USD"]).optional(),
  tax_rate: z.number().min(0).max(100).optional(),
  shipping_fee: z.number().min(0).optional(),
  free_shipping_threshold: z.number().min(0).optional(),
  enable_notifications: z.boolean().optional(),
  enable_reviews: z.boolean().optional(),
  enable_wishlist: z.boolean().optional(),
  maintenance_mode: z.boolean().optional(),
});

// GET - Fetch current settings
export async function GET() {
  try {
    const supabase = await getSupabaseServerActionClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // For now, return default settings (can be stored in database later)
    const settings = {
      store_name: "FoalRider",
      store_email: "support@foalrider.com",
      store_phone: "+91 1234567890",
      store_address: "123 Main Street, City, State, Country",
      currency: "INR",
      tax_rate: 18,
      shipping_fee: 50,
      free_shipping_threshold: 1000,
      enable_notifications: true,
      enable_reviews: true,
      enable_wishlist: true,
      maintenance_mode: false,
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerActionClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = settingsSchema.parse(body);

    // In a real app, you would save to database
    // For now, just return the updated settings
    console.log("Settings updated:", validated);

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: validated,
    });
  } catch (error) {
    console.error("Settings PUT error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid settings data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
