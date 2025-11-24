import {
  getUserCart,
  getGuestCart,
  addToUserCart,
  addToGuestCart,
  updateCartQuantity,
  removeFromCart,
  clearUserCart,
  clearGuestCart,
  syncGuestCart,
} from '../cart';
import { createClient } from '../client';

// Mock Supabase client
jest.mock('../client', () => ({
  createClient: jest.fn(),
}));

describe('Cart Functions', () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Create chainable mock
    const createChainableMock = () => ({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    });

    mockSupabase = createChainableMock();
    
    // Ensure all methods return the mock object for chaining
    Object.keys(mockSupabase).forEach(key => {
      if (key !== 'maybeSingle' && typeof mockSupabase[key] === 'function') {
        mockSupabase[key].mockReturnValue(mockSupabase);
      }
    });

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserCart', () => {
    it('should fetch user cart successfully', async () => {
      const mockData = [
        {
          id: '1',
          user_id: 'user-123',
          product_id: 'prod-1',
          quantity: 2,
          product: {
            id: 'prod-1',
            name: 'Test Product',
            price: 1000,
          },
        },
      ];

      mockSupabase.order.mockResolvedValue({ data: mockData, error: null });

      const result = await getUserCart('user-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('cart_items');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(result).toEqual(mockData);
    });

    it('should return empty array on error', async () => {
      mockSupabase.order.mockResolvedValue({ data: null, error: new Error('Database error') });

      const result = await getUserCart('user-123');

      expect(result).toEqual([]);
    });

    it('should handle null data', async () => {
      mockSupabase.order.mockResolvedValue({ data: null, error: null });

      const result = await getUserCart('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('getGuestCart', () => {
    it('should fetch guest cart successfully', async () => {
      const mockData = [
        {
          id: '1',
          session_id: 'session-123',
          product_id: 'prod-1',
          quantity: 1,
          product: {
            id: 'prod-1',
            name: 'Guest Product',
            price: 500,
          },
        },
      ];

      mockSupabase.order.mockResolvedValue({ data: mockData, error: null });

      const result = await getGuestCart('session-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('cart_items');
      expect(mockSupabase.eq).toHaveBeenCalledWith('session_id', 'session-123');
      expect(result).toEqual(mockData);
    });

    it('should filter by date (30 days)', async () => {
      mockSupabase.order.mockResolvedValue({ data: [], error: null });

      await getGuestCart('session-123');

      expect(mockSupabase.gte).toHaveBeenCalled();
    });
  });

  describe('addToUserCart', () => {
    it('should add new item to cart', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockSupabase.insert.mockResolvedValue({ error: null });

      const result = await addToUserCart('user-123', 'prod-1', 2);

      expect(mockSupabase.insert).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should update existing item quantity', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: { id: 'cart-1', quantity: 1 },
        error: null,
      });
      mockSupabase.update.mockResolvedValue({ error: null });

      const result = await addToUserCart('user-123', 'prod-1', 2);

      expect(mockSupabase.update).toHaveBeenCalledWith({ quantity: 3 });
      expect(result).toBe(true);
    });

    it('should handle errors', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockSupabase.insert.mockResolvedValue({ error: new Error('Insert failed') });

      const result = await addToUserCart('user-123', 'prod-1', 1);

      expect(result).toBe(false);
    });
  });

  describe('addToGuestCart', () => {
    it('should add item to guest cart', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockSupabase.insert.mockResolvedValue({ error: null });

      const result = await addToGuestCart('session-123', 'prod-1', 1);

      expect(mockSupabase.insert).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should merge quantities for existing items', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: { id: 'cart-1', quantity: 2 },
        error: null,
      });
      mockSupabase.update.mockResolvedValue({ error: null });

      const result = await addToGuestCart('session-123', 'prod-1', 3);

      expect(mockSupabase.update).toHaveBeenCalledWith({ quantity: 5 });
      expect(result).toBe(true);
    });
  });

  describe('updateCartQuantity', () => {
    it('should update quantity when greater than 0', async () => {
      mockSupabase.update.mockResolvedValue({ error: null });

      const result = await updateCartQuantity('cart-1', 5);

      expect(mockSupabase.update).toHaveBeenCalledWith({ quantity: 5 });
      expect(result).toBe(true);
    });

    it('should delete item when quantity is 0', async () => {
      mockSupabase.delete.mockResolvedValue({ error: null });

      const result = await updateCartQuantity('cart-1', 0);

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle negative quantities by deleting', async () => {
      mockSupabase.delete.mockResolvedValue({ error: null });

      const result = await updateCartQuantity('cart-1', -1);

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      mockSupabase.delete.mockResolvedValue({ error: null });

      const result = await removeFromCart('cart-1');

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'cart-1');
      expect(result).toBe(true);
    });

    it('should handle errors', async () => {
      mockSupabase.delete.mockResolvedValue({ error: new Error('Delete failed') });

      const result = await removeFromCart('cart-1');

      expect(result).toBe(false);
    });
  });

  describe('clearUserCart', () => {
    it('should clear all user cart items', async () => {
      mockSupabase.delete.mockResolvedValue({ error: null });

      const result = await clearUserCart('user-123');

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(result).toBe(true);
    });
  });

  describe('clearGuestCart', () => {
    it('should clear all guest cart items', async () => {
      mockSupabase.delete.mockResolvedValue({ error: null });

      const result = await clearGuestCart('session-123');

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('session_id', 'session-123');
      expect(result).toBe(true);
    });
  });

  describe('syncGuestCart', () => {
    it('should sync guest cart to user cart', async () => {
      const guestItems = [
        { product_id: 'prod-1', quantity: 2, variant_id: null },
        { product_id: 'prod-2', quantity: 1, variant_id: null },
      ];

      mockSupabase.select.mockResolvedValueOnce({
        data: guestItems,
        error: null,
      });

      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      mockSupabase.insert.mockResolvedValue({ error: null });
      mockSupabase.delete.mockResolvedValue({ error: null });

      const result = await syncGuestCart('session-123', 'user-123');

      expect(result).toBe(true);
      expect(mockSupabase.insert).toHaveBeenCalledTimes(2);
      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it('should merge quantities for existing items', async () => {
      const guestItems = [{ product_id: 'prod-1', quantity: 2, variant_id: null }];
      const userItems = [
        { product_id: 'prod-1', variant_id: null, id: 'cart-1', quantity: 3 },
      ];

      mockSupabase.select.mockResolvedValueOnce({
        data: guestItems,
        error: null,
      });

      mockSupabase.select.mockResolvedValueOnce({
        data: userItems,
        error: null,
      });

      mockSupabase.update.mockResolvedValue({ error: null });
      mockSupabase.delete.mockResolvedValue({ error: null });

      const result = await syncGuestCart('session-123', 'user-123');

      expect(mockSupabase.update).toHaveBeenCalledWith({ quantity: 5 });
      expect(result).toBe(true);
    });

    it('should handle empty guest cart', async () => {
      mockSupabase.select.mockResolvedValue({ data: [], error: null });

      const result = await syncGuestCart('session-123', 'user-123');

      expect(result).toBe(true);
      expect(mockSupabase.insert).not.toHaveBeenCalled();
    });

    it('should handle null guest items', async () => {
      mockSupabase.select.mockResolvedValue({ data: null, error: null });

      const result = await syncGuestCart('session-123', 'user-123');

      expect(result).toBe(true);
    });
  });
});
