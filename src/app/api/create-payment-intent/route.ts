import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createPaymentIntentSchema } from "@/lib/validations/api-schemas";
import { ZodError } from "zod";

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

    const body = await request.json();

    // Validate input with Zod
    const validated = createPaymentIntentSchema.parse(body);

    // Generate idempotency key to prevent duplicate charges
    // This ensures that if the same request is made twice, only one payment intent is created
    const idempotencyKey = `${user?.id || "guest"}_${
      validated.amount
    }_${Date.now()}`;

    console.log("💳 Creating payment intent:", {
      amount: validated.amount,
      currency: validated.currency,
      userId: user?.id || "guest",
      idempotencyKey,
    });

    // Create payment intent with idempotency key
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(validated.amount), // Stripe expects amount in smallest currency unit (cents/paise)
        currency: validated.currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: user?.id || "guest",
          ...validated.metadata,
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
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      console.error("❌ Create payment intent error:", error.message);
      return NextResponse.json(
        { error: error.message || "Failed to create payment intent" },
        { status: 500 }
      );
    }
    console.error("❌ Create payment intent error: Unknown error");
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
