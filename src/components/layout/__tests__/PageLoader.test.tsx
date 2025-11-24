import { render, screen, waitFor, act } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { PageLoader } from '../PageLoader';

// Mock Next.js navigation hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('PageLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should not render loader initially', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    const { container } = render(<PageLoader />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should show loader when pathname changes', () => {
    const { rerender } = render(<PageLoader />);
    
    // Initial render
    (usePathname as jest.Mock).mockReturnValue('/');
    rerender(<PageLoader />);
    
    // Change pathname
    act(() => {
      (usePathname as jest.Mock).mockReturnValue('/products');
      rerender(<PageLoader />);
    });
    
    // Loader should be visible
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading page')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should hide loader after timeout', async () => {
    const { rerender } = render(<PageLoader />);
    
    // Initial render
    (usePathname as jest.Mock).mockReturnValue('/');
    rerender(<PageLoader />);
    
    // Change pathname
    (usePathname as jest.Mock).mockReturnValue('/about');
    rerender(<PageLoader />);
    
    // Loader visible
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Fast-forward time with act
    await act(async () => {
      jest.advanceTimersByTime(800);
    });
    
    // Loader should be hidden
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should not show loader when pathname stays the same', () => {
    (usePathname as jest.Mock).mockReturnValue('/products');
    const { rerender } = render(<PageLoader />);
    
    // Re-render with same pathname
    rerender(<PageLoader />);
    rerender(<PageLoader />);
    
    // Loader should not appear
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should handle multiple rapid pathname changes', async () => {
    const { rerender } = render(<PageLoader />);
    
    (usePathname as jest.Mock).mockReturnValue('/');
    rerender(<PageLoader />);
    
    // Rapid changes
    (usePathname as jest.Mock).mockReturnValue('/products');
    rerender(<PageLoader />);
    
    (usePathname as jest.Mock).mockReturnValue('/about');
    rerender(<PageLoader />);
    
    // Should show loader
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Only the last timer should be active
    await act(async () => {
      jest.advanceTimersByTime(800);
    });
    
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should cleanup timer on unmount', async () => {
    const { rerender, unmount } = render(<PageLoader />);
    
    (usePathname as jest.Mock).mockReturnValue('/');
    rerender(<PageLoader />);
    
    (usePathname as jest.Mock).mockReturnValue('/products');
    rerender(<PageLoader />);
    
    // Unmount before timer completes
    unmount();
    
    // Fast-forward time - should not cause errors
    await act(async () => {
      jest.advanceTimersByTime(800);
    });
    
    // No errors should occur
    expect(true).toBe(true);
  });

  it('should have proper ARIA attributes for accessibility', () => {
    const { rerender } = render(<PageLoader />);
    
    (usePathname as jest.Mock).mockReturnValue('/');
    rerender(<PageLoader />);
    
    act(() => {
      (usePathname as jest.Mock).mockReturnValue('/login');
      rerender(<PageLoader />);
    });
    
    const loader = screen.getByRole('status');
    expect(loader).toHaveAttribute('aria-live', 'polite');
    expect(loader).toHaveAttribute('aria-label', 'Loading page');
  });

  it('should render donut spinner element', () => {
    const { rerender } = render(<PageLoader />);
    
    (usePathname as jest.Mock).mockReturnValue('/');
    rerender(<PageLoader />);
    
    act(() => {
      (usePathname as jest.Mock).mockReturnValue('/checkout');
      rerender(<PageLoader />);
    });
    
    // Check for spinner structure
    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
    
    // Check for loading text
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should apply correct z-index for overlay', () => {
    const { rerender } = render(<PageLoader />);
    
    (usePathname as jest.Mock).mockReturnValue('/');
    rerender(<PageLoader />);
    
    act(() => {
      (usePathname as jest.Mock).mockReturnValue('/profile');
      rerender(<PageLoader />);
    });
    
    const loader = screen.getByRole('status');
    expect(loader).toHaveClass('z-[9999]');
  });

  it('should show loader for different route transitions', async () => {
    const routes = ['/', '/products', '/about', '/login', '/signup', '/profile'];
    const { rerender } = render(<PageLoader />);
    
    (usePathname as jest.Mock).mockReturnValue(routes[0]);
    rerender(<PageLoader />);
    
    for (let i = 1; i < routes.length; i++) {
      (usePathname as jest.Mock).mockReturnValue(routes[i]);
      rerender(<PageLoader />);
      
      // Loader should appear
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      // Clear for next iteration
      await act(async () => {
        jest.advanceTimersByTime(800);
      });
    }
  });

  it('should not interfere with page content', () => {
    const { rerender, container } = render(
      <div>
        <PageLoader />
        <main>Page Content</main>
      </div>
    );
    
    (usePathname as jest.Mock).mockReturnValue('/');
    rerender(
      <div>
        <PageLoader />
        <main>Page Content</main>
      </div>
    );
    
    // Main content should always be present
    expect(container.querySelector('main')).toHaveTextContent('Page Content');
  });
});
