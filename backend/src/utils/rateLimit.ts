/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse and helps stay within free tier limits.
 * Uses express-rate-limit for IP-based rate limiting.
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for claim submissions
 * 
 * Limits: 10 requests per hour per IP (configurable via env)
 * 
 * This is conservative compared to Google's free tier limit (15 RPM)
 * to prevent accidental quota exhaustion.
 * 
 * Configuration:
 * - RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 1 hour)
 * - RATE_LIMIT_MAX_REQUESTS: Max requests per window (default: 10)
 */
export const claimRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'), // 10 requests
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

/**
 * Rate limiter for authenticated users (future use)
 * 
 * Higher limits for authenticated users (50 requests/hour)
 * Can be applied to protected routes when authentication is implemented
 */
export const authenticatedRateLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: 50, // 50 requests per hour
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
