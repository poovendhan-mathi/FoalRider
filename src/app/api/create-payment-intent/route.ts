import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServerActionClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  calculateOrderTotals,
  pricingToStripeAmount,
  SupportedCurrency,
  isSupportedCurrency,
} from "@/lib/pricing";

// Mark this route as dynamic to prevent static generation during build
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// ============================================
// INPUT VALIDATION SCHEMA
// ============================================

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(100),
});

const createPaymentIntentSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
  currency: z.string().refine(isSupportedCurrency, {
    message: "Unsupported currency",
  }),
});

// ============================================
// SECURE PAYMENT INTENT CREATION
// ============================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerActionClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();

    // Validate input structure
    const validated = createPaymentIntentSchema.parse(body);
    const targetCurrency = validated.currency as SupportedCurrency;

    // ============================================
    // STEP 1: FETCH PRODUCT PRICES FROM DATABASE
    // ============================================
    const productIds = validated.items.map((item) => item.productId);

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, is_active, stock_quantity")
      .in("id", productIds);

    if (productsError) {
      console.error("❌ Database error fetching products:", productsError);
      return NextResponse.json(
        { error: "Failed to verify product prices" },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "No valid products found" },
        { status: 400 }
      );
    }

    // ============================================
    // STEP 2: VALIDATE ALL PRODUCTS EXIST AND ARE ACTIVE
    // ============================================
    const productMap = new Map(products.map((p) => [p.id, p]));
    const validationErrors: string[] = [];

    for (const item of validated.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        validationErrors.push(`Product ${item.productId} not found`);
        continue;
      }

      if (!product.is_active) {
        validationErrors.push(
          `Product "${product.name}" is no longer available`
        );
        continue;
      }

      if (
        product.stock_quantity !== null &&
        product.stock_quantity < item.quantity
      ) {
        validationErrors.push(
          `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}`
        );
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Product validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // ============================================
    // STEP 3: CALCULATE TOTALS FROM DATABASE PRICES
    // ============================================
    let subtotalInCents = 0;
    const orderItems: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
    }> = [];

    for (const item of validated.items) {
      const product = productMap.get(item.productId)!;
      const itemTotal = product.price * item.quantity;
      subtotalInCents += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    // Calculate shipping, tax, and total using centralized pricing
    const totals = calculateOrderTotals(subtotalInCents);

    console.log("🔒 Server-calculated totals (USD cents):", {
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
    });

    // ============================================
    // STEP 4: CONVERT TO TARGET CURRENCY FOR STRIPE
    // ============================================
    const stripeAmount = pricingToStripeAmount(totals.total, targetCurrency);

    console.log("💳 Stripe amount:", {
      originalCents: totals.total,
      targetCurrency,
      stripeAmount,
    });

    // Validate minimum amount for Stripe (50 cents minimum for most currencies)
    const minimumAmount = targetCurrency === "INR" ? 50 : 50; // 50 cents/paise minimum
    if (stripeAmount < minimumAmount) {
      return NextResponse.json(
        { error: `Order total is below minimum amount` },
        { status: 400 }
      );
    }

    // ============================================
    // STEP 5: CREATE PAYMENT INTENT
    // ============================================
    const idempotencyKey = `${
      user?.id || "guest"
    }_${stripeAmount}_${Date.now()}`;

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(stripeAmount),
        currency: targetCurrency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: user?.id || "guest",
          subtotal: totals.subtotal.toString(),
          shipping: totals.shipping.toString(),
          tax: totals.tax.toString(),
          totalUsdCents: totals.total.toString(),
          itemCount: validated.items.length.toString(),
          // Store item details for verification
          items: JSON.stringify(
            orderItems.map((i) => ({
              id: i.productId,
              qty: i.quantity,
              price: i.price,
            }))
          ),
        },
      },
      {
        idempotencyKey,
      }
    );

    console.log("✅ Payment intent created:", paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      // Return calculated totals so frontend can display them
      totals: {
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        stripeAmount,
        currency: targetCurrency,
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      console.error("❌ Stripe error:", error.message);
      return NextResponse.json(
        { error: "Payment processing error" },
        { status: 500 }
      );
    }

    if (error instanceof Error) {
      console.error("❌ Create payment intent error:", error.message);
      return NextResponse.json(
        { error: "Failed to create payment intent" },
        { status: 500 }
      );
    }

    console.error("❌ Unknown error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
