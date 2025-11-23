// ============================================
// FOAL RIDER - DATABASE TYPES
// ============================================
// Auto-generated types for Supabase tables

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          currency: string
          inventory: number
          is_active: boolean
          category_id: string | null
          image_url: string | null
          slug: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          currency?: string
          inventory?: number
          is_active?: boolean
          category_id?: string | null
          image_url?: string | null
          slug?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          inventory?: number
          is_active?: boolean
          category_id?: string | null
          image_url?: string | null
          slug?: string | null
          created_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string | null
          url: string
          sort_order: number
        }
        Insert: {
          id?: string
          product_id?: string | null
          url: string
          sort_order?: number
        }
        Update: {
          id?: string
          product_id?: string | null
          url?: string
          sort_order?: number
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string | null
          size: string | null
          color: string | null
          fabric_type: string | null
          extra_price: number
          inventory: number
        }
        Insert: {
          id?: string
          product_id?: string | null
          size?: string | null
          color?: string | null
          fabric_type?: string | null
          extra_price?: number
          inventory?: number
        }
        Update: {
          id?: string
          product_id?: string | null
          size?: string | null
          color?: string | null
          fabric_type?: string | null
          extra_price?: number
          inventory?: number
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone: string
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          is_default?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          order_number: string
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal: number
          shipping_cost: number
          tax: number
          discount: number
          total: number
          currency: string
          shipping_address_id: string | null
          shipping_name: string | null
          shipping_phone: string | null
          shipping_address: string | null
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method: string | null
          stripe_payment_intent_id: string | null
          tracking_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          order_number: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal: number
          shipping_cost?: number
          tax?: number
          discount?: number
          total: number
          currency?: string
          shipping_address_id?: string | null
          shipping_name?: string | null
          shipping_phone?: string | null
          shipping_address?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          tracking_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          order_number?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal?: number
          shipping_cost?: number
          tax?: number
          discount?: number
          total?: number
          currency?: string
          shipping_address_id?: string | null
          shipping_name?: string | null
          shipping_phone?: string | null
          shipping_address?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          tracking_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          variant_id: string | null
          product_name: string
          product_description: string | null
          variant_details: Json | null
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          variant_id?: string | null
          product_name: string
          product_description?: string | null
          variant_details?: Json | null
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          variant_id?: string | null
          product_name?: string
          product_description?: string | null
          variant_details?: Json | null
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          variant_id?: string | null
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string | null
          rating: number
          title: string | null
          comment: string | null
          is_verified_purchase: boolean
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          order_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          created_at?: string
        }
      }
    }
  }
}
