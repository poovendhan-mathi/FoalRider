import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerActionClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createProductSchema } from "@/lib/validations/api-schemas";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

// GET - List all products with pagination
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const supabase = await getSupabaseServerActionClient();

    // Parse query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    logger.info("Fetching products", {
      context: "AdminProducts",
      data: { page, limit },
    });

    // Get total count
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Get paginated products
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      logger.error("Error fetching products", error, {
        context: "AdminProducts",
      });
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Fetch categories and merge
    if (products && products.length > 0) {
      const categoryIds = products
        .filter((p) => p.category_id)
        .map((p) => p.category_id);

      if (categoryIds.length > 0) {
        const { data: categories } = await supabase
          .from("categories")
          .select("id, name")
          .in("id", categoryIds);

        const categoryMap = new Map(
          categories?.map((c) => [c.id, c.name]) || []
        );

        products.forEach((product) => {
          if (product.category_id) {
            (product as any).category_name =
              categoryMap.get(product.category_id) || "Uncategorized";
          } else {
            (product as any).category_name = "Uncategorized";
          }
        });
      } else {
        products.forEach((product) => {
          (product as any).category_name = "Uncategorized";
        });
      }
    }

    return NextResponse.json({
      products,
      totalCount: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
      currentPage: page,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Error in products GET", error, {
        context: "AdminProducts",
      });
    } else {
      logger.error("Error in products GET: Unknown error", undefined, {
        context: "AdminProducts",
      });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    logger.info("Creating new product", {
      context: "AdminProducts",
      data: { name: body.name, sku: body.sku },
    });

    // Validate input with Zod
    const validated = createProductSchema.parse(body);

    const supabase = await getSupabaseServerActionClient();

    // Check if SKU already exists
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("sku", validated.sku)
      .single();

    if (existingProduct) {
      logger.warn("Product with SKU already exists", {
        context: "AdminProducts",
        data: { sku: validated.sku },
      });
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name: validated.name,
        description: validated.description,
        sku: validated.sku,
        category_id: validated.category_id,
        price: validated.price,
        stock_quantity: validated.stock_quantity,
        is_active: validated.is_active,
        is_featured: validated.is_featured,
        main_image: validated.main_image,
        images: validated.images || [],
        variants: validated.variants || null,
      })
      .select()
      .single();

    if (error) {
      logger.error("Error creating product", error, {
        context: "AdminProducts",
      });
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    }

    logger.info("Product created successfully", {
      context: "AdminProducts",
      data: { id: product.id, name: product.name },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      logger.warn("Product validation failed", {
        context: "AdminProducts",
        data: { issues: error.issues },
      });
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      logger.error("Error in products POST", error, {
        context: "AdminProducts",
      });
    } else {
      logger.error("Error in products POST: Unknown error", undefined, {
        context: "AdminProducts",
      });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
