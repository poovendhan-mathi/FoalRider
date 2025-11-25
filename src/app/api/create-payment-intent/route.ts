import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

// Mark this route as dynamic to prevent static generation during build
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { amount, currency = "inr", metadata } = await request.json();

    // Validate amount
    if (!amount || amount < 50) {
      // Minimum 50 cents/paise
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Generate idempotency key to prevent duplicate charges
    // This ensures that if the same request is made twice, only one payment intent is created
    const idempotencyKey = `${user?.id || "guest"}_${amount}_${Date.now()}`;

    console.log("💳 Creating payment intent:", {
      amount,
      currency,
      userId: user?.id || "guest",
      idempotencyKey,
    });

    // Create payment intent with idempotency key
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(amount), // Stripe expects amount in smallest currency unit (cents/paise)
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: user?.id || "guest",
          ...metadata,
        },
      },
      {
        idempotencyKey, // Prevents duplicate charges
      }
    );

    console.log("✅ Payment intent created:", paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("❌ Create payment intent error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
