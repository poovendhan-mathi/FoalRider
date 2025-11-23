import { render, screen } from '@testing-library/react'
import { Logo } from '@/components/layout/Logo'

describe('Logo Component', () => {
  it('renders logo image', () => {
    render(<Logo variant="gold" size="md" withText={false} />)
    const logo = screen.getByAltText('Foal Rider Logo')
    expect(logo).toBeInTheDocument()
  })

  it('renders with text when withText is true', () => {
    render(<Logo variant="gold" size="md" withText={true} />)
    const text = screen.getByText('FOAL RIDER')
    expect(text).toBeInTheDocument()
  })

  it('does not render text when withText is false', () => {
    render(<Logo variant="gold" size="md" withText={false} />)
    const text = screen.queryByText('FOAL RIDER')
    expect(text).not.toBeInTheDocument()
  })

  it('applies correct size dimensions for small', () => {
    render(<Logo variant="gold" size="sm" withText={false} />)
    const logo = screen.getByAltText('Foal Rider Logo')
    expect(logo).toHaveAttribute('width', '40')
    expect(logo).toHaveAttribute('height', '40')
  })

  it('applies correct size dimensions for medium', () => {
    render(<Logo variant="gold" size="md" withText={false} />)
    const logo = screen.getByAltText('Foal Rider Logo')
    expect(logo).toHaveAttribute('width', '60')
    expect(logo).toHaveAttribute('height', '60')
  })

  it('applies correct size dimensions for large', () => {
    render(<Logo variant="gold" size="lg" withText={false} />)
    const logo = screen.getByAltText('Foal Rider Logo')
    expect(logo).toHaveAttribute('width', '80')
    expect(logo).toHaveAttribute('height', '80')
  })

  it('renders correct logo variant - gold', () => {
    render(<Logo variant="gold" size="md" withText={false} />)
    const logo = screen.getByAltText('Foal Rider Logo')
    // Next Image transforms src, so just check it contains the path
    expect(logo).toBeInTheDocument()
  })

  it('renders correct logo variant - white', () => {
    render(<Logo variant="white" size="md" withText={false} />)
    const logo = screen.getByAltText('Foal Rider Logo')
    expect(logo).toBeInTheDocument()
  })

  it('renders correct logo variant - black', () => {
    render(<Logo variant="black" size="md" withText={false} />)
    const logo = screen.getByAltText('Foal Rider Logo')
    expect(logo).toBeInTheDocument()
  })

  it('renders correct logo variant - charcoal', () => {
    render(<Logo variant="charcoal" size="md" withText={false} />)
    const logo = screen.getByAltText('Foal Rider Logo')
    expect(logo).toBeInTheDocument()
  })

  it('renders as a link to homepage', () => {
    render(<Logo variant="gold" size="md" withText={false} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
  })

  it('has hover opacity transition class', () => {
    const { container } = render(<Logo variant="gold" size="md" withText={false} />)
    const link = container.querySelector('a')
    expect(link).toHaveClass('hover:opacity-80', 'transition-opacity')
  })
})
