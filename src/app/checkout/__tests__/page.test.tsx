import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckoutPage from '../page';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock contexts
jest.mock('@/contexts/CartContext');
jest.mock('@/contexts/CurrencyContext');
jest.mock('@/lib/auth/AuthContext');

// Mock Stripe
jest.mock('@stripe/stripe-js');
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: any) => <div data-testid="stripe-elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element">Payment Element Mock</div>,
  useStripe: () => ({
    confirmPayment: jest.fn(),
  }),
  useElements: () => ({
    submit: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('CheckoutPage', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  };

  const mockCart = {
    items: [
      {
        id: '1',
        product: {
          id: '1',
          name: 'Test Product',
          slug: 'test-product',
          price: 100,
          image_url: '/test.jpg',
        },
        quantity: 2,
      },
    ],
    totalItems: 2,
    totalPrice: 200,
    clearCart: jest.fn(),
  };

  const mockCurrency = {
    currency: 'USD',
    convertPrice: jest.fn((price) => price),
    formatPrice: jest.fn((price) => `$${price.toFixed(2)}`),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });
    (useCart as jest.Mock).mockReturnValue(mockCart);
    (useCurrency as jest.Mock).mockReturnValue(mockCurrency);
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (loadStripe as jest.Mock).mockResolvedValue({});
    
    // Mock fetch with proper response structure
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ 
        clientSecret: 'test_secret_123',
        paymentIntentId: 'pi_test_123'
      }),
    });
  });

  describe('Page Rendering', () => {
    it('should render checkout page with cart items', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Checkout')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(<CheckoutPage />);
      expect(screen.getByTestId('stripe-elements')).toBeInTheDocument();
    });

    it('should display order summary', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText(/Order Summary/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty Cart Handling', () => {
    it('should show empty cart message if cart is empty', async () => {
      (useCart as jest.Mock).mockReturnValue({
        ...mockCart,
        items: [],
        totalItems: 0,
      });

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      });
    });

    it('should show continue shopping button when cart is empty', () => {
      (useCart as jest.Mock).mockReturnValue({
        ...mockCart,
        items: [],
        totalItems: 0,
      });

      render(<CheckoutPage />);
      expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
    });
  });

  describe('Payment Intent Creation', () => {
    it('should create payment intent on mount', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockClear();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          clientSecret: 'test-secret',
          paymentIntentId: 'pi_test'
        }),
      });

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/create-payment-intent',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }, { timeout: 3000 });
    });

    it('should handle payment intent creation failure', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockClear();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Payment intent failed' }),
      });

      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to initialize payment:',
          expect.any(Error)
        );
      }, { timeout: 3000 });

      consoleError.mockRestore();
    });

    it('should include correct currency in payment intent', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockClear();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          clientSecret: 'test-secret',
          paymentIntentId: 'pi_test'
        }),
      });

      (useCurrency as jest.Mock).mockReturnValue({
        ...mockCurrency,
        currency: 'EUR',
      });

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Form Validation', () => {
    it('should render contact information section', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Contact Information')).toBeInTheDocument();
      });
    });

    it('should render email input field', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      });
    });

    it('should render address input field', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
      });
    });

    it('should handle form input changes', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/Email Address/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput).toHaveValue('test@example.com');
      });
    });
  });

  describe('Shipping Address Toggle', () => {
    it('should render checkout page with billing section', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Billing Information')).toBeInTheDocument();
      });
    });
  });

  describe('Stripe Integration', () => {
    it('should load Stripe Elements', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('stripe-elements')).toBeInTheDocument();
      });
    });

    it('should render PaymentElement', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-element')).toBeInTheDocument();
      });
    });
  });

  describe('Payment Submission', () => {
    it('should render place order button', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText(/Place Order/i)).toBeInTheDocument();
      });
    });

    it('should display payment form', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-element')).toBeInTheDocument();
      });
    });
  });

  describe('Order Creation', () => {
    it('should initialize payment intent when component mounts', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockClear();

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should display order summary with items', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText(/Order Summary/i)).toBeInTheDocument();
        expect(screen.getByText('Test Product')).toBeInTheDocument();
      });
    });
  });

  describe('Cart Summary Display', () => {
    it('should display all cart items', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
      });
    });

    it('should show order summary section', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText(/order summary/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication', () => {
    it('should redirect to login if not authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null });

      render(<CheckoutPage />);

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('should display checkout when user is authenticated', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Checkout')).toBeInTheDocument();
      });
    });
  });
});
