import { render, screen } from '@testing-library/react'
import { Button, buttonVariants } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('applies default variant styles', () => {
    render(<Button>Default Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('applies destructive variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive', 'text-white')
  })

  it('applies outline variant styles', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border', 'bg-background')
  })

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
  })

  it('applies ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-accent')
  })

  it('applies link variant styles', () => {
    render(<Button variant="link">Link</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-primary', 'underline-offset-4')
  })

  it('applies default size', () => {
    render(<Button>Default Size</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-9', 'px-4', 'py-2')
  })

  it('applies small size', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-8')
  })

  it('applies large size', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-10')
  })

  it('applies icon size', () => {
    render(<Button size="icon" aria-label="Icon button">X</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('size-9')
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('handles disabled state', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  it('handles onClick event', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    const button = screen.getByRole('button')
    button.click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('forwards additional props', () => {
    render(<Button type="submit" name="submit-btn">Submit</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('name', 'submit-btn')
  })

  it('has focus-visible ring styles', () => {
    render(<Button>Focus Test</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('focus-visible:ring-ring/50')
  })
})

describe('buttonVariants', () => {
  it('generates correct class names for default variant', () => {
    const classes = buttonVariants({ variant: 'default' })
    expect(classes).toContain('bg-primary')
    expect(classes).toContain('text-primary-foreground')
  })

  it('generates correct class names for outline variant', () => {
    const classes = buttonVariants({ variant: 'outline' })
    expect(classes).toContain('border')
    expect(classes).toContain('bg-background')
  })

  it('generates correct class names for large size', () => {
    const classes = buttonVariants({ size: 'lg' })
    expect(classes).toContain('h-10')
  })

  it('generates correct class names with combined variants', () => {
    const classes = buttonVariants({ variant: 'destructive', size: 'sm' })
    expect(classes).toContain('bg-destructive')
    expect(classes).toContain('h-8')
  })
})
