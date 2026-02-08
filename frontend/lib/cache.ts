/**
 * Frontend Cache Utility
 * 
 * Provides client-side caching for claim results using localStorage.
 * Reduces API calls and improves user experience by showing cached results instantly.
 * 
 * Features:
 * - localStorage-based caching
 * - Automatic expiration (7 days default)
 * - Cache size management
 * - Cache statistics
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  cachedAt: number;
}

const CACHE_PREFIX = 'fact_checker_';
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const MAX_CACHE_SIZE = 50; // Maximum number of cached items

/**
 * Generate cache key from claim content
 * Uses simple hash of the claim text
 */
function generateCacheKey(claim: string): string {
  // Simple hash function
  let hash = 0;
  const normalizedClaim = claim.trim().toLowerCase();
  for (let i = 0; i < normalizedClaim.length; i++) {
    const char = normalizedClaim.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `${CACHE_PREFIX}${Math.abs(hash).toString(36)}`;
}

/**
 * Get cached claim result
 * 
 * @param claim - The claim text to look up
 * @returns Cached result or null if not found/expired
 */
export function getCachedClaim<T>(claim: string): T | null {
  if (typeof window === 'undefined') {
    return null; // SSR safety
  }

  try {
    const key = generateCacheKey(claim);
    const cached = localStorage.getItem(key);
    
    if (!cached) {
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(cached);
    
    // Check if expired
    if (entry.expiresAt < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    // Invalid cache entry, remove it
    const key = generateCacheKey(claim);
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Cache claim result
 * 
 * @param claim - The claim text
 * @param data - The result data to cache
 * @param ttlMs - Time to live in milliseconds (default: 7 days)
 */
export function setCachedClaim<T>(
  claim: string,
  data: T,
  ttlMs: number = DEFAULT_TTL
): void {
  if (typeof window === 'undefined') {
    return; // SSR safety
  }

  try {
    const key = generateCacheKey(claim);
    const expiresAt = Date.now() + ttlMs;
    
    const entry: CacheEntry<T> = {
      data,
      expiresAt,
      cachedAt: Date.now(),
    };

    localStorage.setItem(key, JSON.stringify(entry));
    
    // Clean up old entries if cache is too large
    cleanupCache();
  } catch (error) {
    // Handle quota exceeded or other localStorage errors
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Cache is full, remove oldest entries
      cleanupCache(true);
      // Try again
      try {
        const key = generateCacheKey(claim);
        const expiresAt = Date.now() + ttlMs;
        const entry: CacheEntry<T> = {
          data,
          expiresAt,
          cachedAt: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(entry));
      } catch (retryError) {
        // Still failed, give up
        console.warn('Failed to cache claim result:', retryError);
      }
    }
  }
}

/**
 * Remove cached claim
 * 
 * @param claim - The claim text to remove from cache
 */
export function removeCachedClaim(claim: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const key = generateCacheKey(claim);
    localStorage.removeItem(key);
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Clear all cached claims
 */
export function clearCache(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Clean up expired and old cache entries
 * 
 * @param force - If true, remove entries even if not expired
 */
function cleanupCache(force = false): void {
  try {
    const keys = Object.keys(localStorage);
    const cacheEntries: Array<{ key: string; cachedAt: number; expiresAt: number }> = [];

    // Collect all cache entries
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry<unknown> = JSON.parse(cached);
            cacheEntries.push({
              key,
              cachedAt: entry.cachedAt,
              expiresAt: entry.expiresAt,
            });
          }
        } catch (error) {
          // Invalid entry, remove it
          localStorage.removeItem(key);
        }
      }
    });

    const now = Date.now();
    
    // Remove expired entries
    cacheEntries.forEach((entry) => {
      if (force || entry.expiresAt < now) {
        localStorage.removeItem(entry.key);
      }
    });

    // If still too many entries, remove oldest ones
    const remainingEntries = cacheEntries
      .filter((entry) => !force && entry.expiresAt >= now)
      .sort((a, b) => a.cachedAt - b.cachedAt);

    if (remainingEntries.length > MAX_CACHE_SIZE) {
      const toRemove = remainingEntries.slice(0, remainingEntries.length - MAX_CACHE_SIZE);
      toRemove.forEach((entry) => {
        localStorage.removeItem(entry.key);
      });
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  entries: number;
} {
  if (typeof window === 'undefined') {
    return { size: 0, entries: 0 };
  }

  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    let totalSize = 0;

    cacheKeys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    });

    return {
      size: totalSize,
      entries: cacheKeys.length,
    };
  } catch (error) {
    return { size: 0, entries: 0 };
  }
}

// Clean up expired entries on load
if (typeof window !== 'undefined') {
  cleanupCache();
}
