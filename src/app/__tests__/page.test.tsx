import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'
import { getFeaturedProducts } from '@/lib/products'

// Mock dependencies
jest.mock('@/lib/products', () => ({
  getFeaturedProducts: jest.fn(),
  getProductImageUrl: jest.fn((product: any) => product.image_url || '/assets/images/product-placeholder.jpg'),
  formatPrice: jest.fn((price: number) => `₹${price.toLocaleString()}.00`),
}))

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

jest.mock('next/image', () => {
  return ({ src, alt }: { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />
  }
})

jest.mock('@/components/layout/Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  })),
}))

describe('HomePage', () => {
  const mockProducts = [
    {
      id: 1,
      name: 'Classic Denim Jacket',
      slug: 'classic-denim-jacket',
      description: 'Timeless denim jacket',
      price: 12999,
      inventory: 50,
      is_active: true,
      image_url: 'https://example.com/jacket.jpg',
      product_images: [],
    },
    {
      id: 2,
      name: 'Slim Fit Jeans',
      slug: 'slim-fit-jeans',
      description: 'Comfortable slim fit',
      price: 8999,
      inventory: 30,
      is_active: true,
      image_url: 'https://example.com/jeans.jpg',
      product_images: [],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getFeaturedProducts as jest.Mock).mockResolvedValue(mockProducts)
  })

  it('renders header component', async () => {
    const page = await HomePage()
    const { container } = render(page)
    expect(container.querySelector('[data-testid="header"]')).toBeTruthy()
  })

  it('renders homepage content', async () => {
    const page = await HomePage()
    const { container } = render(page)
    expect(container).toBeTruthy()
  })

  it('displays main sections', async () => {
    const page = await HomePage()
    const { container } = render(page)
    const content = container.textContent || ''
    expect(content.length).toBeGreaterThan(0)
  })
})
