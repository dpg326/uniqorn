/**
 * Simple in-memory rate limiter for API routes
 * Prevents abuse by limiting requests per IP address
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

export function rateLimit(config: RateLimitConfig) {
  return {
    check: (identifier: string): { success: boolean; remaining: number; resetTime: number } => {
      const now = Date.now();
      const entry = rateLimitMap.get(identifier);

      if (!entry || now > entry.resetTime) {
        // New window
        const resetTime = now + config.interval;
        rateLimitMap.set(identifier, { count: 1, resetTime });
        return { success: true, remaining: config.maxRequests - 1, resetTime };
      }

      if (entry.count >= config.maxRequests) {
        // Rate limit exceeded
        return { success: false, remaining: 0, resetTime: entry.resetTime };
      }

      // Increment count
      entry.count++;
      return { success: true, remaining: config.maxRequests - entry.count, resetTime: entry.resetTime };
    }
  };
}

// Helper to get client IP from request
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}
