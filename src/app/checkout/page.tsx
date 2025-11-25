"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Lock, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getStripe,
  createPaymentIntent,
  toStripeAmount,
} from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/client";

// Payment Form Component
function CheckoutForm({
  formData,
  total,
  currency,
  onSuccess,
}: {
  formData: any;
  total: number;
  currency: string;
  onSuccess: (orderId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Payment system not loaded");
      return;
    }

    setLoading(true);

    try {
      // Submit form to validate
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: formData.address,
                city: formData.city,
                state: formData.state,
                postal_code: formData.zipCode,
                country: formData.country === "India" ? "IN" : "US",
              },
            },
          },
        },
      });

      if (error) {
        setLoading(false);
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log(
          "✅ Payment succeeded, creating order...",
          paymentIntent.id
        );

        // Payment successful - create order in database
        const supabase = createClient();

        // Get current user (may be null for guests)
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        const userId = currentUser?.id || null;
        const isGuest = !userId;

        // Generate guest ID for tracking
        const guestId = isGuest
          ? `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          : null;

        console.log("🔍 Debug - Is Guest:", isGuest);
        console.log("🔍 Debug - User ID:", userId);
        console.log("🔍 Debug - Guest ID:", guestId);
        console.log("🔍 Debug - Form Data:", formData);

        const orderData = {
          user_id: userId,
          guest_id: guestId,
          guest_email: isGuest ? formData.email : null,
          total_amount: total,
          currency: currency,
          payment_status: "pending", // Will be updated to 'paid' by webhook
          payment_intent_id: paymentIntent.id,
          status: "pending", // Will be updated to 'processing' by webhook
          shipping_address: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
            phone: formData.phone,
          },
          email: formData.email,
        };

        console.log("📦 Inserting order:", JSON.stringify(orderData, null, 2));

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert(orderData)
          .select()
          .single();

        if (orderError) {
          console.error("❌ Order creation error:", orderError);
          console.error("❌ Error code:", orderError.code);
          console.error("❌ Error message:", orderError.message);
          console.error("❌ Error details:", orderError.details);
          console.error("❌ Error hint:", orderError.hint);

          // Check if it's a missing column error
          if (
            orderError.message?.includes("guest_email") ||
            orderError.message?.includes("guest_id")
          ) {
            toast.error(
              "Database not configured for guest orders. Please run setup-guest-orders.sql in Supabase."
            );
          } else {
            toast.error(
              "Payment succeeded but failed to create order. Please contact support with reference: " +
                paymentIntent.id
            );
          }
          setLoading(false);
          return;
        }

        console.log("✅ Order created successfully:", order.id);
        toast.success("Payment successful! Redirecting...");

        // Small delay to ensure state updates
        setTimeout(() => {
          onSuccess(order.id);
        }, 500);
      } else {
        console.log("⚠️ Payment status:", paymentIntent?.status);
        toast.warning("Payment is being processed...");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Lock className="h-5 w-5 text-green-600" />
          Secure Payment
        </h2>
        <div className="mt-4">
          <PaymentElement
            options={{
              layout: {
                type: "tabs",
                defaultCollapsed: false,
              },
            }}
          />
        </div>
      </Card>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-[#C5A572] hover:bg-[#B89968] cursor-pointer"
        disabled={!stripe || !elements || loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay Now
          </>
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        Your payment information is encrypted and secure
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Use ref to track if payment intent is already being created
  const paymentIntentCreated = useRef(false);

  const [formData, setFormData] = useState({
    userId: user?.id || "",
    email: user?.email || "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phone: "",
  });

  // Auto-fill from profile
  useEffect(() => {
    async function loadProfileData() {
      if (!user) return;

      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        return;
      }

      if (profile) {
        const nameParts = profile.full_name?.split(" ") || [];
        setFormData((prev) => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          phone: profile.phone || prev.phone,
          email: profile.email || prev.email,
        }));
      }
    }

    loadProfileData();
  }, [user]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 2000 ? 0 : 200;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  // Initialize Stripe (only once)
  useEffect(() => {
    setStripePromise(getStripe());
  }, []);

  // Create payment intent - with proper duplicate prevention
  const initializePayment = useCallback(async () => {
    // Prevent duplicate creation
    if (paymentIntentCreated.current || isInitializing || clientSecret) {
      console.log(
        "⚠️ Payment intent already created or in progress, skipping..."
      );
      return;
    }

    setIsInitializing(true);
    paymentIntentCreated.current = true;

    try {
      console.log("💰 Creating payment intent for amount:", total, currency);
      const stripeAmount = toStripeAmount(total, currency);
      const { clientSecret: secret, paymentIntentId: id } =
        await createPaymentIntent(stripeAmount, currency, {
          userId: user?.id || "guest",
          items: totalItems,
        });

      console.log("✅ Payment intent created:", id);
      setClientSecret(secret);
      setPaymentIntentId(id);
    } catch (error) {
      console.error("❌ Failed to initialize payment:", error);
      toast.error("Failed to initialize payment. Please try again.");
      // Reset on error so user can retry
      paymentIntentCreated.current = false;
    } finally {
      setIsInitializing(false);
    }
  }, [total, currency, user?.id, totalItems, clientSecret, isInitializing]);

  // Trigger payment intent creation only once when ready
  useEffect(() => {
    if (totalItems > 0 && !clientSecret && !isInitializing) {
      initializePayment();
    }
  }, [totalItems, clientSecret, isInitializing, initializePayment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentSuccess = (orderId: string) => {
    console.log("🎉 handlePaymentSuccess called with orderId:", orderId);
    try {
      clearCart();
      console.log("✅ Cart cleared");

      const successUrl = `/checkout/success?order_id=${orderId}`;
      console.log("🔄 Redirecting to:", successUrl);

      router.push(successUrl);
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("❌ Error in handlePaymentSuccess:", error);
      toast.error("Redirect failed. Order ID: " + orderId);
    }
  };

  // Empty cart check
  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center max-w-md mx-auto">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Add some products to your cart before checking out
            </p>
            <Button
              size="lg"
              className="bg-[#C5A572] hover:bg-[#B89968] cursor-pointer"
              onClick={() => router.push("/products")}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="John"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Doe"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+91 98765 43210"
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="123 Main Street"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Mumbai"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      placeholder="Maharashtra"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      placeholder="400001"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      placeholder="India"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment with Stripe Elements */}
            {clientSecret && stripePromise && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#C5A572",
                      colorBackground: "#ffffff",
                      colorText: "#1a1a1a",
                      colorDanger: "#df1b41",
                      fontFamily: "Montserrat, sans-serif",
                      spacingUnit: "4px",
                      borderRadius: "8px",
                    },
                  },
                }}
              >
                <CheckoutForm
                  formData={formData}
                  total={total}
                  currency={currency}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            )}

            {!clientSecret && (
              <Card className="p-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#C5A572]" />
                  <span className="ml-3 text-gray-600">
                    Initializing secure payment...
                  </span>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      <Image
                        src={
                          item.product.image_url ||
                          "/assets/images/product-placeholder.jpg"
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-[#C5A572]">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-[#C5A572]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Secured by Stripe Payment Processing
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
