import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/products/[id]/features
 * Fetches product features from the database
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

    // Fetch product features
    const { data: features, error } = await supabase
      .from("product_features")
      .select("*")
      .eq("product_id", productId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching product features:", error);
      // Don't throw error, just return null features
      return NextResponse.json({ features: null });
    }

    return NextResponse.json({ features });
  } catch (error) {
    console.error("Error in product features API:", error);
    return NextResponse.json(
      { error: "Failed to fetch product features" },
      { status: 500 }
    );
  }
}
