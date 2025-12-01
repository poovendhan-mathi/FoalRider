import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerActionClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * Category update schema
 */
const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean(),
});

/**
 * PUT /api/admin/categories/[id]
 * Update a category
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
    const validated = categorySchema.parse(body);

    // Check if category exists
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("id", id)
      .single();

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if slug is unique (excluding current category)
    const { data: slugConflict } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", validated.slug)
      .neq("id", id)
      .single();

    if (slugConflict) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    // Prevent circular parent relationship
    if (validated.parent_id === id) {
      return NextResponse.json(
        { error: "A category cannot be its own parent" },
        { status: 400 }
      );
    }

    // Update category
    const { data: updatedCategory, error } = await supabase
      .from("categories")
      .update({
        name: validated.name,
        slug: validated.slug,
        description: validated.description || null,
        parent_id: validated.parent_id || null,
        is_active: validated.is_active,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      return NextResponse.json(
        { error: "Failed to update category" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      category: updatedCategory,
      message: "Category updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Unexpected error in PUT /api/admin/categories/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete a category
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

    // Check if category exists
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("id", id)
      .single();

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has products
    const { count: productCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (productCount && productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category with ${productCount} product${
            productCount !== 1 ? "s" : ""
          }`,
        },
        { status: 400 }
      );
    }

    // Check if category has children
    const { count: childCount } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("parent_id", id);

    if (childCount && childCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category with ${childCount} subcategor${
            childCount !== 1 ? "ies" : "y"
          }`,
        },
        { status: 400 }
      );
    }

    // Delete category
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      return NextResponse.json(
        { error: "Failed to delete category" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(
      "Unexpected error in DELETE /api/admin/categories/[id]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
