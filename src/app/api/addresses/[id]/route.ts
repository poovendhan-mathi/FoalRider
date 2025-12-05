import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateAddressSchema = z.object({
  full_name: z.string().min(2, "Full name is required").optional(),
  phone: z.string().min(10, "Valid phone number is required").optional(),
  address_line1: z.string().min(5, "Address is required").optional(),
  address_line2: z.string().optional().nullable(),
  city: z.string().min(2, "City is required").optional(),
  state: z.string().min(2, "State is required").optional(),
  postal_code: z.string().min(5, "Postal code is required").optional(),
  country: z.string().optional(),
  is_default: z.boolean().optional(),
});

/**
 * GET - Fetch a specific address by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: address, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Error in address GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update an existing address
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: existingAddress, error: fetchError } = await supabase
      .from("addresses")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = updateAddressSchema.parse(body);

    // If setting as default, unset other defaults
    if (validated.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .neq("id", id);
    }

    const { data: address, error } = await supabase
      .from("addresses")
      .update(validated)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating address:", error);
      return NextResponse.json(
        { error: "Failed to update address" },
        { status: 500 }
      );
    }

    return NextResponse.json({ address });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error in address PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove an address
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership before deletion
    const { data: existingAddress, error: fetchError } = await supabase
      .from("addresses")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const { error } = await supabase.from("addresses").delete().eq("id", id);

    if (error) {
      console.error("Error deleting address:", error);
      return NextResponse.json(
        { error: "Failed to delete address" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in address DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
