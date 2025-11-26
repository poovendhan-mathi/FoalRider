import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * Reorder schema
 */
const reorderSchema = z.object({
  categoryOrders: z.array(
    z.object({
      id: z.string().uuid(),
      display_order: z.number().int().min(0),
      parent_id: z.string().uuid().optional().nullable(),
    })
  ),
});

/**
 * POST /api/admin/categories/reorder
 * Reorder categories after drag-and-drop
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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
    const validated = reorderSchema.parse(body);

    // Update all categories in a transaction-like manner
    const updates = validated.categoryOrders.map(async (item) => {
      return supabase
        .from("categories")
        .update({
          display_order: item.display_order,
          parent_id: item.parent_id || null,
        })
        .eq("id", item.id);
    });

    const results = await Promise.all(updates);

    // Check for errors
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      console.error("Error reordering categories:", errors);
      return NextResponse.json(
        { error: "Failed to reorder some categories" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Categories reordered successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error(
      "Unexpected error in POST /api/admin/categories/reorder:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
