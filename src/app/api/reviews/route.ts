import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerActionClient } from "@/lib/supabase/server";
import { z } from "zod";

const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  title: z.string().min(2).max(200),
  content: z.string().min(10).max(2000),
  fit_rating: z.enum(["too_small", "true_to_size", "too_large"]).optional(),
});

/**
 * GET - Fetch reviews for a product
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServerActionClient();

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        title,
        content,
        fit_rating,
        verified_purchase,
        helpful_count,
        created_at,
        profiles:user_id (
          full_name
        )
      `
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    // Transform data to include user_name
    const transformedReviews =
      reviews?.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title || "",
        content: review.content,
        fit: review.fit_rating || "true_to_size",
        verified: review.verified_purchase || false,
        helpful_count: review.helpful_count || 0,
        created_at: review.created_at,
        user_name:
          (review.profiles as { full_name?: string })?.full_name || "Anonymous",
      })) || [];

    return NextResponse.json({ reviews: transformedReviews });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new review
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerActionClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = reviewSchema.parse(body);

    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", validated.product_id)
      .eq("user_id", user.id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Check if user has purchased this product (for verified purchase badge)
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("id, orders!inner(user_id, payment_status)")
      .eq("product_id", validated.product_id)
      .eq("orders.user_id", user.id)
      .eq("orders.payment_status", "paid")
      .limit(1);

    const verifiedPurchase = orderItems && orderItems.length > 0;

    // Insert review
    const { data: review, error: insertError } = await supabase
      .from("reviews")
      .insert({
        product_id: validated.product_id,
        user_id: user.id,
        rating: validated.rating,
        title: validated.title,
        content: validated.content,
        fit_rating: validated.fit_rating,
        verified_purchase: verifiedPurchase,
        helpful_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting review:", insertError);
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500 }
      );
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Reviews POST error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
