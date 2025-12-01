import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerActionClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * Customer update schema
 */
const updateCustomerSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional(),
});

/**
 * PUT /api/admin/customers/[id]
 * Update customer details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validated = updateCustomerSchema.parse(body);

    // Update profile
    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({
        full_name: validated.full_name,
        phone: validated.phone,
        email: validated.email,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer:", error);
      return NextResponse.json(
        { error: "Failed to update customer" },
        { status: 500 }
      );
    }

    // Update auth email if provided
    if (validated.email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        id,
        { email: validated.email }
      );

      if (authError) {
        console.error("Error updating auth email:", authError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      customer: updatedProfile,
      message: "Customer updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Unexpected error in PUT /api/admin/customers/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/customers/[id]
 * Delete a customer account
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if customer has orders
    const { count: orderCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id);

    if (orderCount && orderCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete customer with ${orderCount} order${
            orderCount !== 1 ? "s" : ""
          }. Consider deactivating instead.`,
        },
        { status: 400 }
      );
    }

    // Delete auth user (this will cascade to profile via RLS/triggers)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      console.error("Error deleting customer:", authError);
      return NextResponse.json(
        { error: "Failed to delete customer" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error(
      "Unexpected error in DELETE /api/admin/customers/[id]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
