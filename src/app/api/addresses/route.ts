import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const addressSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address_line1: z.string().min(5, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postal_code: z.string().min(5, "Postal code is required"),
  country: z.string().default("India"),
  is_default: z.boolean().default(false),
});

/**
 * GET - Fetch all addresses for the logged-in user
 */
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: addresses, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching addresses:", error);
      return NextResponse.json(
        { error: "Failed to fetch addresses" },
        { status: 500 }
      );
    }

    return NextResponse.json({ addresses: addresses || [] });
  } catch (error) {
    console.error("Error in addresses GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new address for the logged-in user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = addressSchema.parse(body);

    // If this address is set as default, unset other defaults
    if (validated.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { data: address, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        ...validated,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating address:", error);
      return NextResponse.json(
        { error: "Failed to create address" },
        { status: 500 }
      );
    }

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error in addresses POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
