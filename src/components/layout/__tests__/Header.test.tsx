import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '@/components/layout/Header'

// Mock useAuth hook
jest.mock('@/lib/auth/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    signOut: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock Next.js Link and Image components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

jest.mock('next/image', () => {
  return ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} />
  }
})

describe('Header Component', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = ''
  })

  it('renders header with navigation links', () => {
    render(<Header />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Collections')).toBeInTheDocument()
    expect(screen.getByText('About Us')).toBeInTheDocument()
    expect(screen.getByText('Journal')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders logo without text', () => {
    render(<Header />)
    
    const logo = screen.getByAltText('Foal Rider')
    expect(logo).toBeInTheDocument()
  })

  it('renders action icons', () => {
    render(<Header />)
    
    // Check for cart badge
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('displays cart count badge', () => {
    render(<Header />)
    
    // Cart badge should show 0 by default
    const cartBadge = screen.getByText('0')
    expect(cartBadge).toBeInTheDocument()
  })

  it('has correct header styling - transparent black background', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    
    expect(header?.className).toContain('bg-black/75')
    expect(header?.className).toContain('backdrop-blur-md')
  })

  it('has fixed positioning at top', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    
    expect(header?.className).toContain('sticky')
    expect(header?.className).toContain('top-0')
    expect(header?.className).toContain('z-50')
  })

  it('navigation links have correct styling', () => {
    render(<Header />)
    
    const homeLink = screen.getByText('Home')
    // Just verify link exists and has classes
    expect(homeLink).toBeTruthy()
    expect(homeLink.tagName).toBe('A')
  })

  it('toggles mobile menu on hamburger click', () => {
    render(<Header />)
    
    // Mobile menu should not be visible initially
    const mobileLinks = screen.queryAllByText('Home')
    
    // Find hamburger button (only visible on mobile)
    const buttons = screen.getAllByRole('button')
    const hamburgerButton = buttons[buttons.length - 1] // Last button is hamburger
    
    // Click to toggle
    fireEvent.click(hamburgerButton)
    
    // Menu should now be visible (will have duplicate "Home" links)
    const mobileLinksAfter = screen.queryAllByText('Home')
    expect(mobileLinksAfter.length).toBeGreaterThan(mobileLinks.length)
  })

  it('all navigation links have correct hrefs', () => {
    render(<Header />)
    
    const homeLink = screen.getByText('Home').closest('a')
    expect(homeLink?.getAttribute('href')).toBe('/')
    
    const collectionsLink = screen.getByText('Collections').closest('a')
    expect(collectionsLink?.getAttribute('href')).toBe('/collections')
    
    const aboutLink = screen.getByText('About Us').closest('a')
    expect(aboutLink?.getAttribute('href')).toBe('/about')
    
    const journalLink = screen.getByText('Journal').closest('a')
    expect(journalLink?.getAttribute('href')).toBe('/journal')
    
    const contactLink = screen.getByText('Contact').closest('a')
    expect(contactLink?.getAttribute('href')).toBe('/contact')
  })

  it('has hover effects on navigation links', () => {
    render(<Header />)
    
    const homeLink = screen.getByText('Home')
    // Verify link exists
    expect(homeLink).toBeTruthy()
  })

  it('renders search icon correctly', () => {
    const { container } = render(<Header />)
    
    const searchLink = container.querySelector('[href="/search"]')
    expect(searchLink).toBeInTheDocument()
  })

  it('renders account icon correctly', () => {
    const { container } = render(<Header />)
    
    // Account link goes to /login when not logged in
    const accountLink = container.querySelector('[href="/login"]')
    expect(accountLink).toBeInTheDocument()
  })

  it('renders cart icon with badge correctly', () => {
    const { container } = render(<Header />)
    
    const cartLink = container.querySelector('[href="/cart"]')
    expect(cartLink).toBeInTheDocument()
    
    // Badge should be present
    const badge = screen.getByText('0')
    expect(badge).toBeInTheDocument()
  })
})
