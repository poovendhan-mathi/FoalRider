import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/products/[id]/variants
 * Fetches product variants from the database
 * This is a public endpoint - no authentication required
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServerClient();

    // Fetch product variants
    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("id, size, color, color_hex, color_name, inventory, extra_price")
      .eq("product_id", productId)
      .order("size", { ascending: true });

    if (error) {
      console.error("Error fetching product variants:", error);
      // Don't throw error, just return empty array
      return NextResponse.json({ variants: [] });
    }

    return NextResponse.json({ variants: variants || [] });
  } catch (error) {
    console.error("Error in product variants API:", error);
    return NextResponse.json(
      { error: "Failed to fetch product variants" },
      { status: 500 }
    );
  }
}
