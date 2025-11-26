/**
 * Simple in-memory rate limiting for API routes
 *
 * For production with multiple instances, consider:
 * - Redis-based rate limiting
 * - Upstash Rate Limit
 * - Vercel Edge Config
 */

import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store (resets on server restart)
const rateLimitStore: Map<string, RateLimitRecord> = new Map();

/**
 * Clean up expired entries periodically
 */
function cleanup() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);

/**
 * Get unique identifier for rate limiting
 */
function getIdentifier(req: NextRequest): string {
  // Try to get IP address
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";

  return ip;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  req: NextRequest,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute default
): { limited: boolean; remaining: number; resetTime: number } {
  const identifier = getIdentifier(req);
  const now = Date.now();

  const record = rateLimitStore.get(identifier);

  if (!record || record.resetTime < now) {
    // Create new record
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      limited: false,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count++;

  return {
    limited: false,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Rate limit middleware wrapper for API routes
 *
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   async (request) => {
 *     // Your handler logic
 *     return NextResponse.json({ success: true });
 *   },
 *   { maxRequests: 5, windowMs: 60000 }
 * );
 * ```
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { maxRequests?: number; windowMs?: number } = {}
) {
  const { maxRequests = 10, windowMs = 60000 } = options;

  return async (req: NextRequest) => {
    const { limited, remaining, resetTime } = checkRateLimit(
      req,
      maxRequests,
      windowMs
    );

    if (limited) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(resetTime).toISOString(),
          },
        }
      );
    }

    // Call original handler
    const response = await handler(req);

    // Add rate limit headers to response
    response.headers.set("X-RateLimit-Limit", maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set(
      "X-RateLimit-Reset",
      new Date(resetTime).toISOString()
    );

    return response;
  };
}

/**
 * Example usage:
 *
 * // In your API route file
 * import { withRateLimit } from '@/lib/rate-limit';
 *
 * export const POST = withRateLimit(
 *   async (request: NextRequest) => {
 *     // Your API logic here
 *     return NextResponse.json({ success: true });
 *   },
 *   { maxRequests: 5, windowMs: 60000 } // 5 requests per minute
 * );
 *
 * // Or use default limits (10 requests per minute)
 * export const GET = withRateLimit(async (request: NextRequest) => {
 *   // Your API logic
 * });
 */
