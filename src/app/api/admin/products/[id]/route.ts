import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerActionClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { updateProductSchema } from "@/lib/validations/api-schemas";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const supabase = await getSupabaseServerActionClient();

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !product) {
      logger.warn("Product not found", {
        context: "AdminProductDetail",
        data: { id },
      });
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Error in product GET", error, {
        context: "AdminProductDetail",
      });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();

    logger.info("Updating product", {
      context: "AdminProductDetail",
      data: { id, name: body.name },
    });

    // Validate input with Zod
    const validated = updateProductSchema.parse(body);

    const supabase = await getSupabaseServerActionClient();

    const { data: product, error } = await supabase
      .from("products")
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating product", error, {
        context: "AdminProductDetail",
        data: { id },
      });
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    logger.info("Product updated successfully", {
      context: "AdminProductDetail",
      data: { id: product.id },
    });

    return NextResponse.json({ product });
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      logger.warn("Product update validation failed", {
        context: "AdminProductDetail",
        data: { issues: error.issues },
      });
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      logger.error("Error in product PUT", error, {
        context: "AdminProductDetail",
      });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete product (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    logger.info("Deleting product (soft delete)", {
      context: "AdminProductDetail",
      data: { id },
    });

    const supabase = await getSupabaseServerActionClient();

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from("products")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      logger.error("Error deleting product", error, {
        context: "AdminProductDetail",
        data: { id },
      });
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }

    logger.info("Product deleted successfully", {
      context: "AdminProductDetail",
      data: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Error in product DELETE", error, {
        context: "AdminProductDetail",
      });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
