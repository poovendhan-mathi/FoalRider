import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

// Mark this route as dynamic to prevent static generation during build
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Webhook error:", error.message);
      return NextResponse.json(
        { error: error.message || "Webhook handler failed" },
        { status: 400 }
      );
    }
    console.error("Webhook error: Unknown error occurred");
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createClient();
  const userId = paymentIntent.metadata.userId;

  console.log("🎉 Webhook: Payment succeeded for intent:", paymentIntent.id);

  // Find order by payment_intent_id
  const { data: order, error: findError } = await supabase
    .from("orders")
    .select("id, user_id")
    .eq("payment_intent_id", paymentIntent.id)
    .single();

  if (findError || !order) {
    console.error(
      "❌ Webhook: Order not found for payment intent:",
      paymentIntent.id,
      findError
    );
    return;
  }

  console.log("📦 Webhook: Found order:", order.id);

  // Update order status to paid
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "processing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (error) {
    console.error("❌ Webhook: Error updating order:", error);
  } else {
    console.log("✅ Webhook: Order updated to paid:", order.id);
  }

  // Clear user's cart after successful payment
  const cartUserId = order.user_id || userId;
  if (cartUserId && cartUserId !== "guest") {
    const { error: cartError } = await supabase
      .from("carts")
      .delete()
      .eq("user_id", cartUserId);

    if (cartError) {
      console.error("❌ Webhook: Error clearing cart:", cartError);
    } else {
      console.log("✅ Webhook: Cart cleared for user:", cartUserId);
    }
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createClient();

  console.log("❌ Webhook: Payment failed for intent:", paymentIntent.id);

  // Find order by payment_intent_id
  const { data: order, error: findError } = await supabase
    .from("orders")
    .select("id")
    .eq("payment_intent_id", paymentIntent.id)
    .single();

  if (findError || !order) {
    console.error(
      "❌ Webhook: Order not found for failed payment:",
      paymentIntent.id
    );
    return;
  }

  // Update order status to failed
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "failed",
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (error) {
    console.error("❌ Webhook: Error updating failed order:", error);
  } else {
    console.log("✅ Webhook: Order marked as failed:", order.id);
  }
}

async function handleRefund(charge: Stripe.Charge) {
  const supabase = createClient();
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) return;

  // Find order by payment intent ID and update
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("payment_intent_id", paymentIntentId)
    .single();

  if (order) {
    await supabase
      .from("orders")
      .update({
        payment_status: "refunded",
        status: "refunded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);
  }
}
