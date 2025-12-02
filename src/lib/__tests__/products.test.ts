import {
  getFeaturedProducts,
  getProductImageUrl,
  formatPrice,
} from "@/lib/products";

// Mock Supabase server client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Import for mocking
import { createClient } from "@/lib/supabase/server";

describe("Product Utilities", () => {
  describe("getFeaturedProducts", () => {
    const mockProducts = [
      {
        id: 1,
        name: "Classic Denim Jacket",
        slug: "classic-denim-jacket",
        description: "Timeless denim jacket",
        price: 12999,
        inventory: 50,
        image_url: "https://example.com/jacket.jpg",
        product_images: [
          { url: "https://example.com/jacket-main.jpg", alt: "Jacket" },
        ],
        is_featured: true,
        is_active: true,
      },
      {
        id: 2,
        name: "Slim Fit Jeans",
        slug: "slim-fit-jeans",
        description: "Comfortable slim fit",
        price: 8999,
        inventory: 30,
        image_url: null,
        product_images: [],
        is_featured: true,
        is_active: true,
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("fetches featured products successfully", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({
        data: mockProducts,
        error: null,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit,
      });

      (createClient as jest.Mock).mockReturnValue({
        from: mockFrom,
      });

      const result = await getFeaturedProducts(2);

      expect(result).toEqual(mockProducts);
      expect(mockFrom).toHaveBeenCalledWith("products");
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("is_active", true);
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(mockLimit).toHaveBeenCalledWith(2);
    });

    it("uses default limit of 6 when not specified", async () => {
      const mockLimit = jest.fn().mockResolvedValue({
        data: mockProducts,
        error: null,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: mockLimit,
      });

      (createClient as jest.Mock).mockReturnValue({
        from: mockFrom,
      });

      await getFeaturedProducts();

      expect(mockLimit).toHaveBeenCalledWith(6);
    });

    it("returns empty array on database error", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      });

      (createClient as jest.Mock).mockReturnValue({
        from: mockFrom,
      });

      const result = await getFeaturedProducts();

      expect(result).toEqual([]);
    });
  });

  describe("getProductImageUrl", () => {
    it("returns product_images[0].url when available", () => {
      const product = {
        product_images: [
          { url: "https://example.com/image1.jpg", alt: "Image 1" },
          { url: "https://example.com/image2.jpg", alt: "Image 2" },
        ],
        image_url: "https://example.com/fallback.jpg",
      };

      const result = getProductImageUrl(product);
      expect(result).toBe("https://example.com/image1.jpg");
    });

    it("returns image_url when product_images is empty", () => {
      const product = {
        product_images: [],
        image_url: "https://example.com/fallback.jpg",
      };

      const result = getProductImageUrl(product);
      expect(result).toBe("https://example.com/fallback.jpg");
    });

    it("returns placeholder when no images available", () => {
      const product = {
        product_images: [],
        image_url: null,
      };

      const result = getProductImageUrl(product);
      expect(result).toBe("/assets/images/product-placeholder.svg");
    });

    it("returns placeholder when product_images is undefined", () => {
      const product = {
        image_url: null,
      };

      const result = getProductImageUrl(product);
      expect(result).toBe("/assets/images/product-placeholder.svg");
    });

    it("returns placeholder when image_url is null and product_images empty", () => {
      const product = {
        product_images: [],
        image_url: null,
      };

      const result = getProductImageUrl(product);
      expect(result).toBe("/assets/images/product-placeholder.svg");
    });
  });

  describe("formatPrice", () => {
    it("formats INR price correctly", () => {
      const result = formatPrice(12999, "INR");
      expect(result).toBe("₹12,999.00");
    });

    it("formats USD price correctly", () => {
      const result = formatPrice(12999, "USD");
      expect(result).toBe("$12,999.00");
    });

    it("formats EUR price correctly", () => {
      const result = formatPrice(12999, "EUR");
      expect(result).toBe("€12,999.00");
    });

    it("handles zero price", () => {
      const result = formatPrice(0, "INR");
      expect(result).toBe("₹0.00");
    });

    it("handles large prices", () => {
      const result = formatPrice(999999, "INR");
      expect(result).toBe("₹999,999.00");
    });

    it("rounds to 2 decimal places", () => {
      const result = formatPrice(12950, "INR");
      expect(result).toBe("₹12,950.00");
    });

    it("defaults to USD when currency not specified", () => {
      const result = formatPrice(12999);
      expect(result).toBe("$12,999.00");
    });

    it("handles negative prices", () => {
      const result = formatPrice(-12999, "INR");
      expect(result).toBe("-₹12,999.00");
    });
  });
});
