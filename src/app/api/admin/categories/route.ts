import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * Category creation/update schema
 */
const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().default(true),
});

/**
 * GET /api/admin/categories
 * Fetch all categories with product counts
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Verify admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("[Categories API] ========== START ==========");
    console.log("[Categories API] User:", user?.id);
    console.log("[Categories API] Email:", user?.email);
    console.log("[Categories API] Auth Error:", authError);

    if (!user) {
      console.error("[Categories API] No user found - Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("[Categories API] Profile:", profile);
    console.log("[Categories API] Profile Error:", profileError);
    console.log("[Categories API] Profile role:", profile?.role);

    if (profile?.role !== "admin") {
      console.error("[Categories API] User is not admin - Forbidden");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("[Categories API] Fetching categories...");

    // Fetch ALL categories (admin can see inactive too)
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    console.log("[Categories API] Categories result:", {
      count: categories?.length || 0,
      hasError: !!error,
      errorDetails: error,
    });

    if (error) {
      console.error("[Categories API] ❌ ERROR fetching categories:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        {
          error: "Failed to fetch categories",
          details: error.message,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log(
      "[Categories API] ✅ Categories fetched successfully:",
      categories?.length
    );

    // Get product counts for each category
    console.log("[Categories API] Fetching product counts...");
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        const { count, error: countError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id);

        if (countError) {
          console.error(
            `[Categories API] Error counting products for category ${category.id}:`,
            countError
          );
        }

        return {
          ...category,
          product_count: count || 0,
        };
      })
    );

    console.log(
      "[Categories API] ✅ Returning categories with counts:",
      categoriesWithCounts.length
    );
    console.log("[Categories API] ========== END ==========");
    return NextResponse.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error("Unexpected error in GET /api/admin/categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Create a new category
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
    const validated = categorySchema.parse(body);

    // Check if slug already exists
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", validated.slug)
      .single();

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    // Create category
    const { data: newCategory, error } = await supabase
      .from("categories")
      .insert({
        name: validated.name,
        slug: validated.slug,
        description: validated.description || null,
        parent_id: validated.parent_id || null,
        is_active: validated.is_active,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { category: newCategory, message: "Category created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Unexpected error in POST /api/admin/categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
