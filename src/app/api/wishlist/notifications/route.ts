import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updatePreferencesSchema = z.object({
  product_id: z.string().uuid(),
  notify_on_sale: z.boolean().optional(),
  notify_on_restock: z.boolean().optional(),
});

/**
 * PATCH /api/wishlist/notifications
 * Update notification preferences for a wishlist item
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updatePreferencesSchema.parse(body);

    const { data, error } = await supabase
      .from("wishlists")
      .update({
        notify_on_sale: validated.notify_on_sale,
        notify_on_restock: validated.notify_on_restock,
      })
      .eq("user_id", user.id)
      .eq("product_id", validated.product_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating wishlist preferences:", error);
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error in wishlist notifications API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wishlist/notifications
 * Get all wishlist items with notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("wishlists")
      .select(
        `
        id,
        product_id,
        notify_on_sale,
        notify_on_restock,
        price_at_add,
        created_at,
        product:products(id, name, slug, price, image_url)
      `
      )
      .eq("user_id", user.id)
      .or("notify_on_sale.eq.true,notify_on_restock.eq.true");

    if (error) {
      console.error("Error fetching wishlist notifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in wishlist notifications GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
