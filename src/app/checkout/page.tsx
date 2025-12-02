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
import { useAuth } from "@/contexts/AuthProvider";
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
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Payment Form Component
function CheckoutForm({
  formData,
  total,
  subtotal,
  shipping,
  tax,
  currency,
  items,
  onSuccess,
  validateForm,
}: {
  formData: any;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  currency: string;
  items: any[];
  onSuccess: (orderId: string) => void;
  validateForm: () => boolean;
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

    // Validate form data before payment
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      // Submit form to validate
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setLoading(false);
        toast.error(submitError.message);
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
        toast.error(error.message || "Payment failed");
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log(
          "✅ Payment succeeded, creating order...",
          paymentIntent.id
        );

        try {
          // Payment successful - create order in database
          const supabase = getSupabaseBrowserClient();

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

          // Generate unique order number
          const orderNumber = `ORD-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)
            .toUpperCase()}`;

          const orderData = {
            user_id: userId,
            guest_id: guestId,
            guest_email: isGuest ? formData.email : null,
            email: formData.email, // Database has 'email' field
            order_number: orderNumber, // REQUIRED field
            subtotal: subtotal, // REQUIRED field
            shipping_cost: shipping, // Match schema
            tax: tax, // Match schema
            total_amount: total, // Database uses total_amount NOT total!
            currency: currency,
            payment_status: "paid", // Set to paid immediately
            payment_intent_id: paymentIntent.id, // Database uses payment_intent_id NOT stripe_payment_intent_id!
            status: "processing", // Set to processing immediately
            customer_name: `${formData.firstName} ${formData.lastName}`,
            customer_email: formData.email,
            customer_phone: formData.phone,
            shipping_name: `${formData.firstName} ${formData.lastName}`,
            shipping_phone: formData.phone,
            shipping_address: JSON.stringify({
              firstName: formData.firstName,
              lastName: formData.lastName,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: formData.country,
              phone: formData.phone,
            }),
          };

          console.log(
            "📦 Inserting order:",
            JSON.stringify(orderData, null, 2)
          );

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

            // Don't keep loading spinner forever
            setLoading(false);

            // Check if it's a missing column error
            if (
              orderError.message?.includes("guest_email") ||
              orderError.message?.includes("guest_id") ||
              orderError.message?.includes("customer_name") ||
              orderError.message?.includes("customer_email")
            ) {
              toast.error(
                "Database not configured properly. Please contact support.",
                { duration: 5000 }
              );
            } else {
              toast.error(
                "Payment succeeded but failed to create order. Please contact support with reference: " +
                  paymentIntent.id,
                { duration: 5000 }
              );
            }
            return;
          }

          console.log("✅ Order created successfully:", order.id);

          // Create order items
          console.log("📦 Creating order items for", items.length, "products");
          const orderItems = items.map((item) => ({
            order_id: order.id,
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price, // Database uses 'price' NOT 'unit_price'!
            subtotal: item.product.price * item.quantity, // Database uses 'subtotal' NOT 'total_price'!
          }));

          const { error: orderItemsError } = await supabase
            .from("order_items")
            .insert(orderItems);

          if (orderItemsError) {
            console.error("⚠️ Order items creation error:", orderItemsError);
            console.error(
              "⚠️ Full error object:",
              JSON.stringify(orderItemsError, null, 2)
            );
            console.error("⚠️ Error message:", orderItemsError.message);
            console.error("⚠️ Error code:", orderItemsError.code);
            console.error("⚠️ Error details:", orderItemsError.details);
            console.error("⚠️ Error hint:", orderItemsError.hint);
            console.error(
              "⚠️ Attempted to insert:",
              JSON.stringify(orderItems, null, 2)
            );
            // Don't fail the whole order if items fail - order is already created
            toast.warning("Order created but some details may be missing");
          } else {
            console.log("✅ Order items created successfully");
          }

          // Immediately redirect - don't wait
          onSuccess(order.id);
        } catch (orderCreationError) {
          console.error(
            "❌ Exception during order creation:",
            orderCreationError
          );
          setLoading(false);
          toast.error(
            "Payment succeeded but order creation failed. Reference: " +
              paymentIntent.id,
            { duration: 5000 }
          );
        }
      } else {
        console.log("⚠️ Payment status:", paymentIntent?.status);
        toast.warning("Payment is being processed...");
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ Payment error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";
      toast.error(errorMessage);
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
  const { formatPrice, currency, convertPrice } = useCurrency();
  const { state } = useAuth();
  const user = state.user;
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

  // Form validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill from profile
  useEffect(() => {
    async function loadProfileData() {
      if (!user) return;

      const supabase = getSupabaseBrowserClient();
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

  // Calculate totals - prices are stored in INR in database
  // formatPrice() will convert to selected currency automatically
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 2000 ? 0 : 200; // Free shipping over ₹2000
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  // For Stripe: Convert from INR to selected currency
  const totalInSelectedCurrency = convertPrice(total);

  console.log("💰 Checkout calculations:", {
    currency,
    totalINR: total,
    totalConverted: totalInSelectedCurrency,
    note: "Display uses formatPrice (auto-converts), Stripe uses converted amount",
  });

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
      console.log(
        "💰 Creating payment intent for amount:",
        totalInSelectedCurrency,
        currency
      );
      const stripeAmount = toStripeAmount(totalInSelectedCurrency, currency);
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
  }, [
    totalInSelectedCurrency,
    currency,
    user?.id,
    totalItems,
    clientSecret,
    isInitializing,
  ]);

  // Trigger payment intent creation only once when ready
  useEffect(() => {
    if (totalItems > 0 && !clientSecret && !isInitializing) {
      initializePayment();
    }
  }, [totalItems, clientSecret, isInitializing, initializePayment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@") || !formData.email.includes(".")) {
      newErrors.email = "Please enter a valid email address";
    }

    // Name validation
    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName || !formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Phone validation
    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Address validation
    if (!formData.address || !formData.address.trim()) {
      newErrors.address = "Street address is required";
    }
    if (!formData.city || !formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state || !formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.zipCode || !formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentSuccess = useCallback(
    (orderId: string) => {
      console.log("🎉 handlePaymentSuccess called with orderId:", orderId);

      if (!orderId) {
        console.error("❌ No orderId provided to handlePaymentSuccess");
        toast.error("Order ID missing. Please contact support.");
        return;
      }

      try {
        // Clear cart first
        clearCart();
        console.log("✅ Cart cleared");

        // Show success message
        toast.success("Order placed successfully!");

        // Redirect immediately
        const successUrl = `/checkout/success?order_id=${orderId}`;
        console.log("🔄 Redirecting to:", successUrl);

        router.push(successUrl);
      } catch (error) {
        console.error("❌ Error in handlePaymentSuccess:", error);
        toast.error("Redirect failed. Your order ID: " + orderId);

        // Try alternative navigation
        window.location.href = `/checkout/success?order_id=${orderId}`;
      }
    },
    [clearCart, router]
  );

  // Empty cart check
  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-24">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#C5A572]/10 flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-[#C5A572] stroke-[1.5]" />
            </div>
            <h2 className="font-['Playfair_Display'] text-2xl font-semibold mb-4 text-black">
              Your cart is empty
            </h2>
            <p className="font-['Montserrat'] text-[#4B5563] mb-8">
              Add some products to your cart before checking out
            </p>
            <Button
              size="lg"
              variant="gold"
              className="font-['Montserrat'] cursor-pointer"
              onClick={() => router.push("/products")}
            >
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-['Playfair_Display'] text-4xl font-bold mb-8 text-black">
          Checkout
        </h1>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
          {/* Order Summary - First on Mobile, Right on Desktop */}
          <div className="order-1 lg:order-2 lg:col-span-1">
            <Card className="p-6 lg:sticky lg:top-24 rounded-2xl border-[#E5E5E5]">
              <h2 className="font-['Playfair_Display'] text-xl font-bold mb-6 text-black">
                Order Summary
              </h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-[#F8F6F3]">
                      <Image
                        src={
                          item.product.image_url ||
                          "/assets/images/product-placeholder.svg"
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="grow min-w-0">
                      <p className="font-['Montserrat'] text-sm font-medium truncate text-black">
                        {item.product.name}
                      </p>
                      <p className="font-['Montserrat'] text-sm text-[#9CA3AF]">
                        Qty: {item.quantity}
                      </p>
                      <p className="font-['Montserrat'] text-sm font-semibold text-[#C5A572]">
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

          {/* Left Column: Contact & Shipping - Second on Mobile, Left on Desktop */}
          <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
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
                    className={`mt-1 ${
                      errors.email
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
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
                      className={`mt-1 ${
                        errors.firstName
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.firstName}
                      </p>
                    )}
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
                      className={`mt-1 ${
                        errors.lastName
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.lastName}
                      </p>
                    )}
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
                    className={`mt-1 ${
                      errors.phone
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
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
                    className={`mt-1 ${
                      errors.address
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.address}
                    </p>
                  )}
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
                      className={`mt-1 ${
                        errors.city
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                    )}
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
                      className={`mt-1 ${
                        errors.state
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.state}
                      </p>
                    )}
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
                      className={`mt-1 ${
                        errors.zipCode
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.zipCode}
                      </p>
                    )}
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
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  currency={currency}
                  items={items}
                  onSuccess={handlePaymentSuccess}
                  validateForm={validateForm}
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
        </div>
      </div>
    </div>
  );
}
