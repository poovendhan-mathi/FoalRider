/**
 * API Request Validation Schemas using Zod
 * All API routes should use these schemas for input validation
 *
 * IMPORTANT: All prices in this application are stored in PAISE (smallest currency unit)
 * 1 INR = 100 paise
 * Example: ₹1,000 is stored as 100000 paise
 */

import { z } from "zod";

/**
 * Minimum amount for payment intents (in paise)
 * Stripe requires minimum 50 for INR
 */
const MIN_PAYMENT_AMOUNT_PAISE = 50;

/**
 * Maximum reasonable price for a single product (in paise)
 * ₹10,00,000 = 10000000 paise
 */
const MAX_PRODUCT_PRICE_PAISE = 10000000;

/**
 * Payment Intent Creation Schema
 * @property amount - Amount in PAISE (smallest currency unit). Min 50 paise.
 * @property currency - 3-letter currency code (default: "inr")
 * @property metadata - Optional key-value metadata for the payment
 */
export const createPaymentIntentSchema = z.object({
  amount: z
    .number()
    .int("Amount must be a whole number (paise)")
    .min(
      MIN_PAYMENT_AMOUNT_PAISE,
      `Amount must be at least ${MIN_PAYMENT_AMOUNT_PAISE} paise`
    ),
  currency: z.string().min(3).max(3).toLowerCase().default("inr"),
  metadata: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

/**
 * Product Creation Schema
 * @property price - Product price in PAISE (smallest currency unit). Must be positive.
 */
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().optional().nullable(),
  sku: z.string().min(1, "SKU is required").max(100),
  category_id: z.string().uuid("Invalid category ID"),
  price: z
    .number()
    .int("Price must be a whole number (paise)")
    .min(1, "Price must be at least 1 paise")
    .max(
      MAX_PRODUCT_PRICE_PAISE,
      `Price cannot exceed ${MAX_PRODUCT_PRICE_PAISE} paise (₹${
        MAX_PRODUCT_PRICE_PAISE / 100
      })`
    ),
  stock_quantity: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  main_image: z.string().url().optional().nullable().or(z.literal("")),
  images: z.array(z.string().url()).optional().nullable(),
  variants: z.any().optional().nullable(), // Could be more specific based on your schema
});

/**
 * Product Update Schema
 * @property price - Product price in PAISE (smallest currency unit). Must be positive if provided.
 */
export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  sku: z.string().min(1).max(100).optional(),
  category_id: z.string().uuid().optional(),
  price: z
    .number()
    .int("Price must be a whole number (paise)")
    .min(1, "Price must be at least 1 paise")
    .max(
      MAX_PRODUCT_PRICE_PAISE,
      `Price cannot exceed ${MAX_PRODUCT_PRICE_PAISE} paise`
    )
    .optional(),
  stock_quantity: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  main_image: z.string().url().optional().nullable().or(z.literal("")),
  images: z.array(z.string().url()).optional().nullable(),
  variants: z.any().optional().nullable(),
});

/**
 * Order Status Update Schema
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  tracking_number: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Order Item Schema
 * @property price - Price per unit in PAISE
 * @property subtotal - Total price (price * quantity) in PAISE
 */
export const orderItemSchema = z.object({
  order_id: z.string().uuid("Invalid order ID"),
  product_id: z.string().uuid("Invalid product ID").optional().nullable(),
  variant_id: z.string().uuid("Invalid variant ID").optional().nullable(),
  product_name: z.string().min(1, "Product name is required"),
  product_description: z.string().optional().nullable(),
  variant_details: z.any().optional().nullable(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z
    .number()
    .int("Price must be a whole number (paise)")
    .min(1, "Price must be at least 1 paise"),
  subtotal: z
    .number()
    .int("Price must be a whole number (paise)")
    .min(1, "Subtotal must be at least 1 paise"),
});

/**
 * Create Order Schema
 * @property subtotal - Order subtotal in PAISE
 * @property shipping_cost - Shipping cost in PAISE
 * @property tax - Tax amount in PAISE
 * @property discount - Discount amount in PAISE
 * @property total_amount - Total order amount in PAISE
 */
export const createOrderSchema = z.object({
  email: z.string().email("Valid email is required"),
  subtotal: z.number().int().min(0),
  shipping_cost: z.number().int().min(0).default(0),
  tax: z.number().int().min(0).default(0),
  discount: z.number().int().min(0).default(0),
  total_amount: z.number().int().min(1, "Total amount must be positive"),
  currency: z.string().min(3).max(3).default("INR"),
  customer_name: z.string().min(1, "Customer name is required"),
  customer_email: z.string().email("Valid email is required"),
  customer_phone: z.string().optional(),
  shipping_address: z.string().min(1, "Shipping address is required"),
});

/**
 * Price validation helper
 * Use this to validate any price input in paise
 */
export const priceInPaiseSchema = z
  .number()
  .int("Price must be a whole number (no decimals - use paise)")
  .min(0, "Price cannot be negative")
  .max(
    MAX_PRODUCT_PRICE_PAISE,
    `Price cannot exceed ₹${MAX_PRODUCT_PRICE_PAISE / 100}`
  );

/**
 * Types exported from schemas
 */
export type CreatePaymentIntentInput = z.infer<
  typeof createPaymentIntentSchema
>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
