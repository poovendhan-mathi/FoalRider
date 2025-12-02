import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerActionClient } from "@/lib/supabase/server";
import { z } from "zod";

const featuresSchema = z.object({
  fit: z.string().optional(),
  rise: z.string().optional(),
  leg_style: z.string().optional(),
  closure: z.string().optional(),
  stretch_level: z.string().optional(),
  material: z.string().optional(),
  care_instructions: z.array(z.string()).optional(),
  sustainability: z.string().optional(),
  country_of_origin: z.string().optional(),
  front_rise: z.string().optional(),
  knee_measurement: z.string().optional(),
  leg_opening: z.string().optional(),
  inseam: z.string().optional(),
  model_height: z.string().optional(),
  model_waist: z.string().optional(),
  model_size_worn: z.string().optional(),
  style_notes: z.string().optional(),
});

/**
 * GET - Fetch product features
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const supabase = await getSupabaseServerActionClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch product features
    const { data: features, error } = await supabase
      .from("product_features")
      .select("*")
      .eq("product_id", productId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" - not an error for us
      throw error;
    }

    return NextResponse.json(features || null);
  } catch (error) {
    console.error("Error fetching product features:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update or create product features
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const supabase = await getSupabaseServerActionClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin
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
    const validated = featuresSchema.parse(body);

    // Check if features already exist
    const { data: existing } = await supabase
      .from("product_features")
      .select("id")
      .eq("product_id", productId)
      .single();

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("product_features")
        .update({ ...validated, updated_at: new Date().toISOString() })
        .eq("product_id", productId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("product_features")
        .insert({ ...validated, product_id: productId })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating product features:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
