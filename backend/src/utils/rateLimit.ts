import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for claim submissions
 * Free tier: 10 requests per hour per IP
 */
export const claimRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'),
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for authenticated users (future use)
 */
export const authenticatedRateLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: 50,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
