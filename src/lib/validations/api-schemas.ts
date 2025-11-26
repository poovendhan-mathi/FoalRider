/**
 * API Request Validation Schemas using Zod
 * All API routes should use these schemas for input validation
 */

import { z } from "zod";

/**
 * Payment Intent Creation Schema
 */
export const createPaymentIntentSchema = z.object({
  amount: z.number().min(50, "Amount must be at least 50"),
  currency: z.string().min(3).max(3).default("inr"),
  metadata: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

/**
 * Product Creation Schema
 */
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required").max(100),
  category_id: z.string().uuid("Invalid category ID"),
  price: z.number().min(0, "Price must be positive"),
  stock_quantity: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  main_image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  variants: z.any().optional(), // Could be more specific based on your schema
});

/**
 * Product Update Schema
 */
export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  sku: z.string().min(1).max(100).optional(),
  category_id: z.string().uuid().optional(),
  price: z.number().min(0).optional(),
  stock_quantity: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  main_image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  variants: z.any().optional(),
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
 * Types exported from schemas
 */
export type CreatePaymentIntentInput = z.infer<
  typeof createPaymentIntentSchema
>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
