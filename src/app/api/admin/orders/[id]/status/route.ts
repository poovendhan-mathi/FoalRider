import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { updateOrderStatusSchema } from "@/lib/validations/api-schemas";
import { ZodError } from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    await requireAdmin();

    // Await params in Next.js 16
    const { id } = await params;

    const body = await request.json();

    // Validate input with Zod
    const validated = updateOrderStatusSchema.parse(body);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("orders")
      .update({
        status: validated.status,
        tracking_number: validated.tracking_number,
        notes: validated.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      console.error("Error in order status update:", error.message);
    } else {
      console.error("Error in order status update: Unknown error");
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
