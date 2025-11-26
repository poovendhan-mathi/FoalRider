import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createProductSchema } from "@/lib/validations/api-schemas";
import { ZodError } from "zod";

// GET - List all products
export async function GET() {
  try {
    await requireAdmin();

    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
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

    return NextResponse.json({ products });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in products GET:", error.message);
    } else {
      console.error("Error in products GET: Unknown error");
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

    // Validate input with Zod
    const validated = createProductSchema.parse(body);

    const supabase = await createClient();

    // Check if SKU already exists
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("sku", validated.sku)
      .single();

    if (existingProduct) {
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
      console.error("Error creating product:", error);
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      console.error("Error in products POST:", error.message);
    } else {
      console.error("Error in products POST: Unknown error");
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
