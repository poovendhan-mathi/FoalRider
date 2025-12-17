import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  calculateOrderTotals,
  pricingToStripeAmount,
  SupportedCurrency,
  isSupportedCurrency,
} from "@/lib/pricing";
import { checkRateLimit } from "@/lib/rate-limit";

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
  console.log("🔵 Payment Intent API called");

  try {
    // 🔒 SECURITY: Check rate limit (10 requests per minute during testing)
    const rateLimitResult = checkRateLimit(request, 10, 60000);

    if (rateLimitResult.limited) {
      console.log("⚠️ Rate limit hit:", {
        remaining: rateLimitResult.remaining,
        resetTime: new Date(rateLimitResult.resetTime).toISOString(),
      });
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    console.log(
      "✅ Rate limit check passed, remaining:",
      rateLimitResult.remaining
    );

    // Use service role client to bypass RLS for product price validation
    // This is secure because we're on the server and validating prices ourselves
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log("🔍 Getting user session (for order creation)...");
    const regularSupabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await regularSupabase.auth.getUser();
    console.log("👤 User:", user?.id || "anonymous");

    console.log("📥 Parsing request body...");
    const body = await request.json();
    console.log("📦 Request body:", JSON.stringify(body, null, 2));

    // Validate input structure
    console.log("🔍 Validating input schema...");
    const validated = createPaymentIntentSchema.parse(body);
    const targetCurrency = validated.currency as SupportedCurrency;
    console.log("✅ Input validated, currency:", targetCurrency);

    // ============================================
    // STEP 1: FETCH PRODUCT PRICES FROM DATABASE
    // ============================================
    const productIds = validated.items.map((item) => item.productId);

    console.log("🔍 Fetching products from database:", productIds);

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, is_active, inventory")
      .in("id", productIds);

    console.log("📊 Database query result:", {
      productsFound: products?.length || 0,
      requestedCount: productIds.length,
      requestedIds: productIds,
      foundProducts: products?.map((p) => ({
        id: p.id,
        name: p.name,
        is_active: p.is_active,
      })),
      fullProducts: products,
      error: productsError,
      errorDetails: productsError
        ? {
            message: productsError.message,
            code: productsError.code,
            details: productsError.details,
            hint: productsError.hint,
          }
        : null,
    });

    if (productsError) {
      console.error("❌ Database error fetching products:", {
        error: productsError,
        message: productsError.message,
        code: productsError.code,
        details: productsError.details,
        hint: productsError.hint,
        productIds,
      });
      return NextResponse.json(
        {
          error: "Failed to verify product prices",
          details:
            process.env.NODE_ENV === "development"
              ? productsError.message
              : undefined,
        },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      console.error("❌ No products found for IDs:", productIds);
      return NextResponse.json(
        {
          error: "No valid products found",
          details:
            process.env.NODE_ENV === "development"
              ? `Requested ${productIds.length} products, found 0`
              : undefined,
        },
        { status: 400 }
      );
    }

    console.log(`✅ Found ${products.length} products in database`);

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

      // Check inventory if available
      if (product.inventory !== null && product.inventory < item.quantity) {
        validationErrors.push(
          `Insufficient stock for "${product.name}". Available: ${product.inventory}`
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
    console.error("🔴 ERROR in payment intent API:", error);

    if (error instanceof z.ZodError) {
      console.error(
        "❌ Zod validation error:",
        JSON.stringify(error.issues, null, 2)
      );
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      console.error("❌ Stripe error:", {
        type: error.type,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      });
      return NextResponse.json(
        {
          error: "Payment processing error",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    if (error instanceof Error) {
      console.error("❌ Error object:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      return NextResponse.json(
        {
          error: error.message || "Failed to create payment intent",
          details:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
        { status: 500 }
      );
    }

    console.error("❌ Unknown error type:", typeof error, error);
    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        details: "Unknown error type",
      },
      { status: 500 }
    );
  }
}
