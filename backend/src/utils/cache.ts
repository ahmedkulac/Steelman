/**
 * Cache Utility
 * 
 * Provides multi-tier caching functionality for AI responses:
 * 1. Redis cache (if available) - persistent, shared across instances
 * 2. In-memory cache (fallback) - fast, local to this instance
 * 
 * Features:
 * - Optional Redis connection (can be disabled via REDIS_ENABLED=false)
 * - Automatic in-memory fallback if Redis unavailable
 * - 7-day default TTL for cached responses
 * - Cache statistics and monitoring
 */

import { createClient } from 'redis';

// Singleton Redis client instance
let redisClient: ReturnType<typeof createClient> | null = null;

/**
 * In-memory cache fallback
 * Used when Redis is unavailable or disabled
 */
interface CacheEntry {
  value: string;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

// Cache statistics
let cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  redisHits: 0,
  memoryHits: 0,
};

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    ...cacheStats,
    memoryCacheSize: memoryCache.size,
    redisEnabled: redisClient !== null,
  };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats() {
  cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    redisHits: 0,
    memoryHits: 0,
  };
}

/**
 * Clean expired entries from memory cache
 */
function cleanMemoryCache() {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt < now) {
      memoryCache.delete(key);
    }
  }
}

// Clean memory cache every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanMemoryCache, 5 * 60 * 1000);
}

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
    if (process.env.NODE_ENV === 'development') {
      console.log('ℹ️  Redis disabled via REDIS_ENABLED=false - using in-memory cache');
    }
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
      console.warn('⚠️  Redis error (falling back to memory cache):', err.message);
      redisClient = null; // Disable Redis, use memory cache
    });

    // Set connection timeout to prevent hanging
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), 2000)
    );

    // Race connection vs timeout
    await Promise.race([connectPromise, timeoutPromise]);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Redis connected - using Redis + memory cache');
    }
  } catch (error: unknown) {
    // Log warning but don't throw - app works without Redis
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.warn(
      '⚠️  Redis connection failed, using in-memory cache only:',
      errorMessage
    );
    redisClient = null;
  }
}

/**
 * Get cached value by key
 * 
 * Tries Redis first, then falls back to in-memory cache.
 * 
 * @param key - Cache key
 * @returns Cached value as string, or null if not found/unavailable
 */
export async function getCache(key: string): Promise<string | null> {
  // Try Redis first if available
  if (redisClient) {
    try {
      const value = await redisClient.get(key);
      if (value) {
        cacheStats.hits++;
        cacheStats.redisHits++;
        return value;
      }
    } catch (error) {
      // Fall through to memory cache on Redis error
      if (process.env.NODE_ENV === 'development') {
        console.warn('Redis get error, falling back to memory cache:', error);
      }
    }
  }

  // Fallback to in-memory cache
  const memoryEntry = memoryCache.get(key);
  if (memoryEntry) {
    // Check if expired
    if (memoryEntry.expiresAt > Date.now()) {
      cacheStats.hits++;
      cacheStats.memoryHits++;
      return memoryEntry.value;
    } else {
      // Remove expired entry
      memoryCache.delete(key);
    }
  }

  cacheStats.misses++;
  return null;
}

/**
 * Set cached value with TTL
 * 
 * Stores in both Redis (if available) and in-memory cache.
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
  cacheStats.sets++;

  // Store in Redis if available
  if (redisClient) {
    try {
      await redisClient.setEx(key, ttlSeconds, value);
    } catch (error) {
      // Continue to memory cache even if Redis fails
      if (process.env.NODE_ENV === 'development') {
        console.warn('Redis set error, using memory cache only:', error);
      }
    }
  }

  // Always store in memory cache as fallback/backup
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memoryCache.set(key, { value, expiresAt });

  // Limit memory cache size (keep last 1000 entries)
  if (memoryCache.size > 1000) {
    // Remove oldest entries (simple FIFO)
    const entries = Array.from(memoryCache.entries());
    entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    const toRemove = entries.slice(0, memoryCache.size - 1000);
    toRemove.forEach(([key]) => memoryCache.delete(key));
  }
}

/**
 * Delete cached value by key
 * 
 * Removes from both Redis and memory cache.
 * 
 * @param key - Cache key to delete
 */
export async function deleteCache(key: string): Promise<void> {
  // Delete from Redis if available
  if (redisClient) {
    try {
      await redisClient.del(key);
    } catch (error) {
      // Continue to memory cache deletion
    }
  }

  // Delete from memory cache
  memoryCache.delete(key);
}

/**
 * Clear all cached values
 * 
 * Clears both Redis and memory cache.
 */
export async function clearCache(): Promise<void> {
  // Clear Redis if available
  if (redisClient) {
    try {
      await redisClient.flushAll();
    } catch (error) {
      // Continue to memory cache clearing
    }
  }

  // Clear memory cache
  memoryCache.clear();
  resetCacheStats();
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
  // Clear memory cache on shutdown
  memoryCache.clear();
}
