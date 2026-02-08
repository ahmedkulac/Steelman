/**
 * Redis Cache Utility
 * 
 * Provides caching functionality for AI responses to reduce API costs and improve performance.
 * Gracefully handles Redis unavailability - app works fine without caching.
 * 
 * Features:
 * - Optional Redis connection (can be disabled via REDIS_ENABLED=false)
 * - Automatic fallback if Redis unavailable
 * - 7-day default TTL for cached responses
 */

import { createClient } from 'redis';

// Singleton Redis client instance
let redisClient: ReturnType<typeof createClient> | null = null;

/**
 * Initialize Redis client connection
 * 
 * This function:
 * - Checks if Redis is explicitly disabled
 * - Attempts to connect with timeout
 * - Handles errors gracefully (app continues without cache)
 * - Sets up error handlers
 * 
 * @returns Promise that resolves when connection is established or skipped
 */
export async function initRedis(): Promise<void> {
  // Skip Redis if explicitly disabled in environment
  if (process.env.REDIS_ENABLED === 'false') {
    console.log('ℹ️  Redis disabled via REDIS_ENABLED=false');
    return;
  }

  // Return early if already connected
  if (redisClient) {
    return;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    // Create Redis client with connection settings
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: false, // Don't auto-reconnect (fail fast)
        connectTimeout: 2000, // 2 second connection timeout
      },
    });

    // Handle Redis errors gracefully
    redisClient.on('error', (err) => {
      console.warn('⚠️  Redis error (caching disabled):', err.message);
      redisClient = null; // Disable caching on error
    });

    // Set connection timeout to prevent hanging
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), 2000)
    );

    // Race connection vs timeout
    await Promise.race([connectPromise, timeoutPromise]);
    console.log('✅ Redis connected');
  } catch (error: any) {
    // Log warning but don't throw - app works without Redis
    console.warn(
      '⚠️  Redis connection failed, caching disabled:',
      error.message || error
    );
    redisClient = null;
  }
}

/**
 * Get cached value by key
 * 
 * @param key - Cache key
 * @returns Cached value as string, or null if not found/unavailable
 */
export async function getCache(key: string): Promise<string | null> {
  // Return null if Redis not available
  if (!redisClient) {
    return null;
  }

  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error('Redis get error:', error);
    return null; // Fail gracefully
  }
}

/**
 * Set cached value with TTL
 * 
 * @param key - Cache key
 * @param value - Value to cache (string)
 * @param ttlSeconds - Time to live in seconds (default: 7 days)
 */
export async function setCache(
  key: string,
  value: string,
  ttlSeconds: number = 604800 // Default: 7 days
): Promise<void> {
  // Return early if Redis not available
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.setEx(key, ttlSeconds, value);
  } catch (error) {
    console.error('Redis set error:', error);
    // Fail silently - caching is optional
  }
}

/**
 * Close Redis connection gracefully
 * 
 * Call this on application shutdown to clean up connections
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
