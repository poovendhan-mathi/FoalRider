# 📄 GitHub Copilot Instructions — Next.js Project Guidelines

> **Purpose**: This document defines the standards for coding, structure, testing, security, and automated code review for the FoalRider e-commerce project.  
> **Audience**: GitHub Copilot, AI assistants, and all contributors.

---

## 0 - Do not unnecessary document files

- ** Do not create any documentation files unless explicitly asked to do so. **
- ** Only create documentation files when there is a specific request for documentation. **

## 🚀 1. Technology Standards

### Core Framework

- **Use Next.js App Router** (`app/` directory) — no Pages Router
- **TypeScript everywhere** — all files must be `.ts` or `.tsx`
- **Prefer React Server Components** by default

### Client Components Usage

Use `'use client'` **only** when required for:

- `useState`, `useEffect`, `useContext`
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`window`, `document`, `localStorage`)
- Third-party libraries requiring client-side rendering

### Built-in Next.js Features

Always use Next.js built-ins over third-party alternatives:

- ✅ `next/link` for navigation
- ✅ `next/image` for optimized images
- ✅ Route Handlers (`app/api/.../route.ts`) for API routes
- ✅ Metadata API for SEO
- ✅ `fetch()` with caching & revalidation options

---

## 📁 2. Project Structure Rules

### Directory Organization

```
app/          → Pages, layouts, route groups, loading/error states
components/   → Shared UI components (reusable across pages)
lib/          → Utilities, helpers, server functions
services/     → Business logic and data interactions
contexts/     → React Context providers (client-side state)
hooks/        → Custom React hooks
types/        → TypeScript type definitions
```

### Separation of Concerns

| Layer                | Location                       | Responsibility                                |
| -------------------- | ------------------------------ | --------------------------------------------- |
| **UI Layer**         | `components/`                  | Presentation, styling, user interaction       |
| **Business Logic**   | `services/`                    | Data transformation, validation, calculations |
| **Data Fetching**    | Server Components, `services/` | API calls, database queries                   |
| **State Management** | `contexts/`, `hooks/`          | Client-side state, user preferences           |

---

## 🧠 3. Coding Best Practices

### Component Design

- ✅ **Write reusable, pure components** — avoid side effects in render
- ✅ **Single Responsibility Principle** — each component does one thing well
- ✅ **Keep components small** — max 200 lines; extract sub-components
- ✅ **Props over state** — prefer controlled components

### Async Operations

- ✅ **Use `async/await`** instead of callbacks or `.then()`
- ✅ **Error handling** — always wrap async operations in try-catch
- ❌ **No floating promises** — always await or handle returned promises

### Code Quality

- ✅ **Avoid deep nesting** — max 3 levels; extract helper functions
- ✅ **TypeScript types required** — all exports, props, and parameters
- ✅ **Named exports preferred** — easier to refactor and import
- ✅ **Consistent naming** — camelCase for variables, PascalCase for components

---

## 📦 4. API Route Guidelines

### Route Handler Structure

All API routes must be located at: `app/api/<route>/route.ts`

### Required Components

Every API route **must** include:

1. **Input Validation** — use Zod for schema validation
2. **Error Handling** — try-catch with meaningful error messages
3. **Correct HTTP Status Codes** — 200, 201, 400, 401, 404, 500, etc.
4. **Data Sanitization** — clean user input before processing

### Example Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = schema.parse(body);

    // Process data
    const result = await processData(validated);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 🎨 5. UI & Styling Standards

### Styling Framework

- **Primary**: Tailwind CSS utility classes
- **Component Library**: shadcn/ui (pre-built, customizable components)
- **Custom CSS**: Only when Tailwind is insufficient

### Tailwind Best Practices

```tsx
// ✅ Good — utility classes
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg">
  Click me
</button>

// ❌ Bad — inline styles
<button style={{ padding: '8px 16px', backgroundColor: 'blue' }}>
  Click me
</button>
```

### Accessibility Requirements

- ✅ **Semantic HTML** — use `<button>`, `<nav>`, `<main>`, `<article>`, etc.
- ✅ **ARIA attributes** — `aria-label`, `aria-describedby`, `role`, etc.
- ✅ **Keyboard navigation** — all interactive elements must be keyboard accessible
- ✅ **Color contrast** — maintain WCAG AA standards (4.5:1 minimum)
- ✅ **Focus indicators** — visible focus states for all interactive elements

### Component Guidelines

- Use shadcn/ui components: `Button`, `Card`, `Input`, `Dialog`, etc.
- Customize via Tailwind classes, not by modifying component source
- Maintain consistent spacing using Tailwind's spacing scale

---

## ⚡ 6. Performance Optimization

### Image Optimization

```tsx
// ✅ Always use next/image
import Image from "next/image";

<Image
  src="/product.jpg"
  alt="Product"
  width={500}
  height={300}
  priority={false} // Only true for above-the-fold images
/>;
```

### Code Splitting

```tsx
// ✅ Dynamic imports for heavy components
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // Disable SSR if component uses browser APIs
});
```

### Rendering Strategy

- **Prefer Static Rendering** — generate at build time when possible
- **Use ISR** — Incremental Static Regeneration for semi-dynamic content
- **Client-side only when necessary** — user-specific data, real-time updates

### Data Fetching

```tsx
// Fresh data (no cache)
fetch(url, { cache: "no-store" });

// Cached data with revalidation
fetch(url, { next: { revalidate: 3600 } }); // 1 hour

// Static data (cached indefinitely)
fetch(url, { cache: "force-cache" });
```

### React Performance

- ✅ **Use memoization sparingly** — only for expensive calculations
- ✅ **`useMemo`** — cache expensive computed values
- ✅ **`useCallback`** — cache function references passed to child components
- ❌ **Don't over-optimize** — measure first, optimize only if needed

---

## 🔐 7. Security Guidelines

### Environment Variables

```typescript
// ✅ Server-side only (no NEXT_PUBLIC_ prefix)
process.env.DATABASE_URL;
process.env.STRIPE_SECRET_KEY;
process.env.SUPABASE_SERVICE_ROLE_KEY;

// ⚠️ Client-side exposed (use carefully)
process.env.NEXT_PUBLIC_SUPABASE_URL;
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
```

### Input Validation & Sanitization

- ✅ **Validate all inputs** — use Zod, Yup, or similar
- ✅ **Sanitize user data** — prevent XSS, SQL injection
- ✅ **Whitelist over blacklist** — define what's allowed, not what's forbidden
- ❌ **Never trust client data** — always validate on server

### Security Checklist

- [ ] Secrets never exposed to client
- [ ] All user inputs validated
- [ ] SQL queries use parameterized statements
- [ ] CORS properly configured
- [ ] Rate limiting on API routes
- [ ] Authentication/authorization on protected routes
- [ ] Error messages don't leak sensitive information
- [ ] HTTPS enforced in production

### Error Handling

```typescript
// ❌ Bad — leaks implementation details
catch (error) {
  return { error: error.message };  // May expose database structure
}

// ✅ Good — generic error message
catch (error) {
  console.error('Database error:', error);  // Log internally
  return { error: "An error occurred. Please try again." };
}
```

---

## 🧪 8. Testing Requirements

### Testing Framework

- **Unit Tests**: Jest or Vitest
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright (optional for critical flows)

### Test Coverage Requirements

Write tests for:

- ✅ **Utility functions** — 100% coverage for pure functions
- ✅ **Server functions** — API routes, data fetching, business logic
- ✅ **Critical components** — checkout, payment, authentication
- ✅ **Custom hooks** — all custom React hooks

### Testing Best Practices

```typescript
// Example utility test
import { formatPrice } from "@/lib/currency";

describe("formatPrice", () => {
  it("should format price in INR", () => {
    expect(formatPrice(1000, "INR")).toBe("₹1,000");
  });

  it("should handle zero values", () => {
    expect(formatPrice(0, "USD")).toBe("$0.00");
  });
});
```

### Mocking Guidelines

- ✅ **Mock external dependencies** — API calls, database queries
- ✅ **Mock environment variables** — use test-specific values
- ✅ **Mock browser APIs** — localStorage, fetch, window, etc.
- ❌ **Don't mock implementation details** — test behavior, not internals

---

## 📚 9. Documentation Standards

### Code Documentation

All exported functions must have TSDoc/JSDoc comments:

```typescript
/**
 * Formats a price value with the specified currency
 *
 * @param price - The numeric price value
 * @param currency - The currency code (e.g., 'INR', 'USD')
 * @returns Formatted price string with currency symbol
 *
 * @example
 * formatPrice(1000, 'INR') // Returns "₹1,000"
 */
export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(price);
}
```

### Documentation Requirements

- ✅ **Function purpose** — what it does
- ✅ **Parameters** — types and descriptions
- ✅ **Return value** — type and description
- ✅ **Example usage** — practical code example
- ✅ **Edge cases** — special behaviors or limitations

### README Updates

Update `README.md` when:

- Architecture changes
- New major features added
- Setup/installation process changes
- Environment variables added or modified

### Module Documentation

Each service/lib module should include:

- Purpose of the module
- Key functions/classes
- Usage examples
- Dependencies

---

## 🤖 10. GitHub Copilot Instructions

### General Rules

When generating code, GitHub Copilot must:

- ✅ **Use TypeScript** — all code must be strongly typed
- ✅ **Follow Next.js 16+ conventions** — App Router, Server Components by default
- ✅ **Use Tailwind CSS** — no inline styles or CSS modules
- ✅ **Use Next.js navigation** — `useRouter()` from `next/navigation`, never `window.location`
- ✅ **Prefer Server Components** — only use `'use client'` when necessary
- ✅ **Follow project structure** — respect the established folder hierarchy

### Code Style Standards

- ✅ **ESLint + Prettier compliant** — no linting errors allowed
- ✅ **DRY principle** — avoid duplicate logic and repeated utilities
- ✅ **Modular code** — small, reusable, composable functions
- ✅ **Named exports** — avoid default exports except for page components
- ✅ **Consistent formatting** — 2-space indentation, single quotes

### Prohibited Practices

- ❌ **No `any` types** — use proper TypeScript types or `unknown`
- ❌ **No `console.log` in production** — use proper logging library
- ❌ **No hardcoded values** — use constants or environment variables
- ❌ **No unused imports** — clean up imports before committing
- ❌ **No magic numbers** — use named constants

---

## 🧰 11. Commit Message Standards

### Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| Type       | Description             | Example                                     |
| ---------- | ----------------------- | ------------------------------------------- |
| `feat`     | New feature             | `feat(cart): add guest checkout support`    |
| `fix`      | Bug fix                 | `fix(auth): resolve session timeout issue`  |
| `refactor` | Code restructuring      | `refactor(products): extract filter logic`  |
| `perf`     | Performance improvement | `perf(images): optimize product thumbnails` |
| `docs`     | Documentation           | `docs(readme): update setup instructions`   |
| `style`    | Code formatting         | `style(components): fix linting errors`     |
| `test`     | Testing                 | `test(cart): add unit tests for addToCart`  |
| `chore`    | Maintenance             | `chore(deps): update dependencies`          |

### Commit Message Examples

**Good commit messages:**

```
feat(checkout): add Stripe payment integration

- Implemented payment intent creation
- Added webhook handler for payment events
- Updated order status on successful payment

Closes #123
```

```
fix(products): resolve category filtering bug

- Fixed query to include child categories
- Added null check for category_id
- Updated test cases

Fixes #456
```

**Bad commit messages:**

```
❌ fixed stuff
❌ updates
❌ WIP
❌ asdfasdf
```

### Commit Best Practices

- ✅ **Use imperative mood** — "add" not "added" or "adds"
- ✅ **Keep subject line short** — max 72 characters
- ✅ **Include context in body** — explain why, not what
- ✅ **Reference issues** — use "Fixes #123" or "Closes #456"
- ✅ **One logical change per commit** — atomic commits

---

📝 12. Code Review Assistant Workflow (Chat Instruction)

When a user types: “Do code review”
The assistant must follow this workflow:

Step 1 — Show Two Review Options

Review new code changes only

Review the entire project

Step 2 — Perform the Code Review

The assistant must evaluate the code based on:

✔ Categories

Best practices (Next.js, TypeScript, React)

Security concerns

Performance & optimization

Maintainability

Correctness & logic

Error handling & validation

✔ Severity Levels

Critical — security flaw / broken logic / unsafe behavior

High — major performance or architectural issues

Medium — maintainability or structure problems

Low — minor styling or readability improvements

Each issue must include:

Title

Severity

Why it matters

Recommendation

Step 3 — After Review, Provide Fix Options

Show choices:

Fix all issues

Fix only Critical

Fix Critical + High

Fix Medium only

Fix selected specific issue

Skip fixing

Based on the option selected:

Modify the code directly (diff or updated code)

Follow Next.js & TypeScript best practices

Step 4 — Commit Workflow

After applying fixes:

Ask:

“Do you want to proceed with commit?”

If yes:

Generate a meaningful Conventional Commit message.

Include summary + bullet points.

Confirm commit completed.

Example:

refactor: apply performance optimizations to homepage

- Replaced client component with server component
- Added cached fetch with proper revalidation
- Reduced bundle size by removing unused imports
