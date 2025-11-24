import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
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
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createClient();
  const userId = paymentIntent.metadata.userId;
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    console.error('No orderId in payment intent metadata');
    return;
  }

  // Update order status to paid
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      payment_intent_id: paymentIntent.id,
      status: 'processing',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order:', error);
  }

  // Clear user's cart after successful payment
  if (userId && userId !== 'guest') {
    await supabase
      .from('carts')
      .delete()
      .eq('user_id', userId);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createClient();
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) return;

  // Update order status to failed
  await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);
}

async function handleRefund(charge: Stripe.Charge) {
  const supabase = createClient();
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) return;

  // Find order by payment intent ID and update
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('payment_intent_id', paymentIntentId)
    .single();

  if (order) {
    await supabase
      .from('orders')
      .update({
        payment_status: 'refunded',
        status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);
  }
}
