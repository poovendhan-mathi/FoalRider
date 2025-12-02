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

// Default settings (used as fallback)
const DEFAULT_SETTINGS = {
  store_name: "FoalRider",
  store_email: "support@foalrider.com",
  store_phone: "+91 1234567890",
  store_address: "123 Main Street, City, State, Country",
  currency: "INR" as const,
  tax_rate: 18,
  shipping_fee: 50,
  free_shipping_threshold: 2000,
  enable_notifications: true,
  enable_reviews: true,
  enable_wishlist: true,
  maintenance_mode: false,
};

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
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Try to fetch from database
    const { data: settingsRows, error: settingsError } = await supabase
      .from("store_settings")
      .select("key, value");

    if (settingsError) {
      console.error("Error fetching settings from database:", settingsError);
      // Fall back to default settings
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    // Convert rows to object
    const settings: Record<string, unknown> = { ...DEFAULT_SETTINGS };

    if (settingsRows && settingsRows.length > 0) {
      for (const row of settingsRows) {
        try {
          // Parse JSONB value - handle both string and already-parsed values
          let value = row.value;
          if (typeof value === "string") {
            value = JSON.parse(value);
          }
          settings[row.key] = value;
        } catch {
          console.error(`Failed to parse setting ${row.key}`);
        }
      }
    }

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
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = settingsSchema.parse(body);

    // Update each setting in the database
    const updates = Object.entries(validated).filter(
      ([, value]) => value !== undefined
    );

    for (const [key, value] of updates) {
      const { error: upsertError } = await supabase
        .from("store_settings")
        .upsert(
          {
            key,
            value: JSON.stringify(value),
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );

      if (upsertError) {
        console.error(`Failed to update setting ${key}:`, upsertError);
      }
    }

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
