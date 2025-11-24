import { render, screen, waitFor, act } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import { useAuth } from '@/lib/auth/AuthContext';
import * as cartFunctions from '@/lib/supabase/cart';

// Mock dependencies
jest.mock('@/lib/auth/AuthContext');
jest.mock('@/lib/supabase/cart');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Test component to access cart context
function TestComponent() {
  const cart = useCart();
  
  return (
    <div>
      <div data-testid="total-items">{cart.totalItems}</div>
      <div data-testid="total-price">{cart.totalPrice}</div>
      <div data-testid="loading">{cart.loading.toString()}</div>
      <button onClick={() => cart.addToCart({
        id: 'prod-1',
        name: 'Test Product',
        slug: 'test-product',
        price: 1000,
        inventory: 10,
        is_active: true,
        category_id: 'cat-1',
        image_url: '/test.jpg',
        description: null,
        created_at: new Date().toISOString(),
      }, 2)}>Add to Cart</button>
    </div>
  );
}

describe('CartContext', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Guest User Cart', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({ user: null });
      (window.localStorage.getItem as jest.Mock).mockReturnValue('session-123');
      (cartFunctions.getGuestCart as jest.Mock).mockResolvedValue([]);
    });

    it('should generate session ID for guest users', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(window.localStorage.setItem).toHaveBeenCalledWith(
          'cart_session_id',
          expect.stringContaining('guest_')
        );
      });
    });

    it('should load guest cart on mount', async () => {
      const mockCart = [
        {
          id: 'cart-1',
          session_id: 'session-123',
          user_id: null,
          product_id: 'prod-1',
          quantity: 2,
          variant_id: null,
          created_at: new Date().toISOString(),
          product: {
            id: 'prod-1',
            name: 'Test Product',
            price: 1000,
            slug: 'test-product',
            image_url: '/test.jpg',
            category_id: 'cat-1',
            inventory: 10,
          },
        },
      ];

      (cartFunctions.getGuestCart as jest.Mock).mockResolvedValue(mockCart);

      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('2');
        expect(screen.getByTestId('total-price')).toHaveTextContent('2000');
      });
    });

    it('should add item to guest cart', async () => {
      (cartFunctions.getGuestCart as jest.Mock).mockResolvedValue([]);
      (cartFunctions.addToGuestCart as jest.Mock).mockResolvedValue(true);

      const { getByText } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        getByText('Add to Cart').click();
      });

      await waitFor(() => {
        expect(cartFunctions.addToGuestCart).toHaveBeenCalledWith(
          'session-123',
          'prod-1',
          2
        );
      });
    });
  });

  describe('Authenticated User Cart', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
      (cartFunctions.getUserCart as jest.Mock).mockResolvedValue([]);
    });

    it('should load user cart on mount', async () => {
      const mockCart = [
        {
          id: 'cart-1',
          user_id: 'user-123',
          session_id: null,
          product_id: 'prod-1',
          quantity: 3,
          variant_id: null,
          created_at: new Date().toISOString(),
          product: {
            id: 'prod-1',
            name: 'User Product',
            price: 1500,
            slug: 'user-product',
            image_url: '/user.jpg',
            category_id: 'cat-1',
            inventory: 5,
          },
        },
      ];

      (cartFunctions.getUserCart as jest.Mock).mockResolvedValue(mockCart);

      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('3');
        expect(screen.getByTestId('total-price')).toHaveTextContent('4500');
      });
    });

    it('should add item to user cart', async () => {
      (cartFunctions.getUserCart as jest.Mock).mockResolvedValue([]);
      (cartFunctions.addToUserCart as jest.Mock).mockResolvedValue(true);

      const { getByText } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        getByText('Add to Cart').click();
      });

      await waitFor(() => {
        expect(cartFunctions.addToUserCart).toHaveBeenCalledWith(
          'user-123',
          'prod-1',
          2
        );
      });
    });

    it('should sync guest cart on user login', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('session-123');
      (cartFunctions.syncGuestCart as jest.Mock).mockResolvedValue(true);
      (cartFunctions.getUserCart as jest.Mock).mockResolvedValue([]);

      const { rerender } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      // Simulate user login
      (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
      
      rerender(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(cartFunctions.syncGuestCart).toHaveBeenCalledWith(
          'session-123',
          'user-123'
        );
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({ user: null });
      (window.localStorage.getItem as jest.Mock).mockReturnValue('session-123');
    });

    it('should handle cart loading errors gracefully', async () => {
      (cartFunctions.getGuestCart as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('0');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should handle add to cart failures', async () => {
      const { toast } = require('sonner');
      (cartFunctions.getGuestCart as jest.Mock).mockResolvedValue([]);
      (cartFunctions.addToGuestCart as jest.Mock).mockResolvedValue(false);

      const { getByText } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        getByText('Add to Cart').click();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to add to cart');
      });
    });
  });

  describe('Cart Operations', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({ user: null });
      (window.localStorage.getItem as jest.Mock).mockReturnValue('session-123');
    });

    it('should filter out items with deleted products', async () => {
      const mockCart = [
        {
          id: 'cart-1',
          session_id: 'session-123',
          user_id: null,
          product_id: 'prod-1',
          quantity: 2,
          variant_id: null,
          created_at: new Date().toISOString(),
          product: null, // Deleted product
        },
        {
          id: 'cart-2',
          session_id: 'session-123',
          user_id: null,
          product_id: 'prod-2',
          quantity: 1,
          variant_id: null,
          created_at: new Date().toISOString(),
          product: {
            id: 'prod-2',
            name: 'Valid Product',
            price: 500,
            slug: 'valid-product',
            image_url: '/valid.jpg',
            category_id: 'cat-1',
            inventory: 10,
          },
        },
      ];

      (cartFunctions.getGuestCart as jest.Mock).mockResolvedValue(mockCart);

      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        // Should only count valid product
        expect(screen.getByTestId('total-items')).toHaveTextContent('1');
        expect(screen.getByTestId('total-price')).toHaveTextContent('500');
      });
    });
  });

  it('should throw error when useCart is used outside CartProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCart must be used within a CartProvider');

    consoleSpy.mockRestore();
  });
});
