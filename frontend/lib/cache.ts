/**
 * Frontend Cache Utility
 * 
 * Provides client-side caching for claim results using localStorage.
 * Reduces API calls and improves user experience by showing cached results instantly.
 * 
 * Features:
 * - localStorage-based caching
 * - Automatic expiration (30 days default - increased for better retention)
 * - Smart cache size management (only cleans up when necessary)
 * - Preserves recent entries even when storage is full
 * - Stores original claim text for better recovery
 * - Cache statistics
 * 
 * Cache Retention Improvements:
 * - Increased TTL from 7 to 30 days
 * - Increased max cache size from 50 to 100 entries
 * - Less aggressive cleanup (only when cache reaches 90% capacity)
 * - Smart cleanup preserves most recent entries
 * - Cleanup runs max once per hour (not on every page load)
 * - Better error handling for quota exceeded scenarios
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  cachedAt: number;
  originalClaim?: string; // Store original claim text for recovery and better UX
}

const CACHE_PREFIX = 'fact_checker_';
const DEFAULT_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds (increased from 7)
const MAX_CACHE_SIZE = 100; // Maximum number of cached items (increased from 50)
const CLEANUP_THRESHOLD = 0.9; // Clean up when cache reaches 90% of max size

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
      originalClaim: claim, // Store original claim text for better recovery
    };

    localStorage.setItem(key, JSON.stringify(entry));
    
    // Dispatch custom event to notify components of cache update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cacheUpdated'));
    }
    
    // Only clean up if cache is approaching max size (less aggressive)
    const stats = getCacheStats();
    if (stats.entries >= MAX_CACHE_SIZE * CLEANUP_THRESHOLD) {
      cleanupCache(false); // Only remove expired entries, not force cleanup
    }
  } catch (error) {
    // Handle quota exceeded or other localStorage errors
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Cache is full - try smarter cleanup: remove only expired + oldest entries
      console.warn('localStorage quota exceeded, attempting smart cleanup...');
      
      // First, try removing only expired entries
      cleanupCache(false);
      
      // Check if we still have space
      const stats = getCacheStats();
      if (stats.entries >= MAX_CACHE_SIZE) {
        // Still full, remove oldest non-expired entries (but keep at least 20 most recent)
        cleanupCacheSmart(MAX_CACHE_SIZE - 20);
      }
      
      // Try again
      try {
        const key = generateCacheKey(claim);
        const expiresAt = Date.now() + ttlMs;
        const entry: CacheEntry<T> = {
          data,
          expiresAt,
          cachedAt: Date.now(),
          originalClaim: claim,
        };
        localStorage.setItem(key, JSON.stringify(entry));
        
        // Dispatch custom event to notify components of cache update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cacheUpdated'));
        }
      } catch (retryError) {
        // Still failed, log error but don't crash
        console.error('Failed to cache claim result after cleanup:', retryError);
        // Notify user if possible (could add toast notification here)
      }
    } else {
      // Other errors - log but don't crash
      console.error('Error caching claim:', error);
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
 * @param force - If true, remove entries even if not expired (DEPRECATED - use cleanupCacheSmart instead)
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
    
    // Remove expired entries (always remove expired, regardless of force flag)
    cacheEntries.forEach((entry) => {
      if (entry.expiresAt < now) {
        localStorage.removeItem(entry.key);
      }
    });

    // If force is true, this is deprecated behavior - use cleanupCacheSmart instead
    // But we'll still handle it for backward compatibility
    if (force) {
      // Remove all entries (this is too aggressive, but kept for compatibility)
      cacheEntries.forEach((entry) => {
        localStorage.removeItem(entry.key);
      });
      return;
    }

    // If still too many entries, remove oldest ones (but keep recent ones)
    const remainingEntries = cacheEntries
      .filter((entry) => entry.expiresAt >= now)
      .sort((a, b) => a.cachedAt - b.cachedAt);

    if (remainingEntries.length > MAX_CACHE_SIZE) {
      const toRemove = remainingEntries.slice(0, remainingEntries.length - MAX_CACHE_SIZE);
      toRemove.forEach((entry) => {
        localStorage.removeItem(entry.key);
      });
    }
  } catch (error) {
    // Log cleanup errors but don't crash
    console.error('Error during cache cleanup:', error);
  }
}

/**
 * Smart cleanup that removes oldest entries while preserving recent ones
 * 
 * @param targetSize - Target number of entries to keep (default: MAX_CACHE_SIZE)
 */
function cleanupCacheSmart(targetSize: number = MAX_CACHE_SIZE): void {
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
    
    // Separate expired and valid entries
    const expiredEntries = cacheEntries.filter(entry => entry.expiresAt < now);
    const validEntries = cacheEntries.filter(entry => entry.expiresAt >= now);
    
    // Remove expired entries
    expiredEntries.forEach(entry => {
      localStorage.removeItem(entry.key);
    });

    // If we still have too many valid entries, remove oldest ones
    if (validEntries.length > targetSize) {
      const sorted = validEntries.sort((a, b) => a.cachedAt - b.cachedAt);
      const toRemove = sorted.slice(0, sorted.length - targetSize);
      toRemove.forEach(entry => {
        localStorage.removeItem(entry.key);
      });
    }
  } catch (error) {
    console.error('Error during smart cache cleanup:', error);
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

/**
 * Get all cached claims
 * 
 * @returns Array of cached claim entries with metadata
 */
export function getAllCachedClaims<T>(): Array<{
  claim: string;
  data: T;
  cachedAt: number;
  expiresAt: number;
}> {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    const claims: Array<{
      claim: string;
      data: T;
      cachedAt: number;
      expiresAt: number;
    }> = [];

    cacheKeys.forEach((key) => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry<T> = JSON.parse(cached);
          
          // Only include non-expired entries
          if (entry.expiresAt >= Date.now()) {
            // Use stored original claim text if available, otherwise fall back to content field
            const claimText = entry.originalClaim || (entry.data as any)?.content || 'Unknown claim';
            
            claims.push({
              claim: claimText,
              data: entry.data,
              cachedAt: entry.cachedAt,
              expiresAt: entry.expiresAt,
            });
          }
        }
      } catch (error) {
        // Skip invalid entries
      }
    });

    // Sort by cachedAt (newest first)
    return claims.sort((a, b) => b.cachedAt - a.cachedAt);
  } catch (error) {
    return [];
  }
}

// Clean up expired entries on load (but don't be too aggressive)
// Only run cleanup once per session to avoid performance issues
if (typeof window !== 'undefined') {
  // Use a flag to prevent multiple cleanups in the same session
  const CLEANUP_KEY = `${CACHE_PREFIX}_last_cleanup`;
  const LAST_CLEANUP = localStorage.getItem(CLEANUP_KEY);
  const ONE_HOUR = 60 * 60 * 1000;
  
  // Only cleanup if we haven't done it in the last hour
  if (!LAST_CLEANUP || Date.now() - parseInt(LAST_CLEANUP) > ONE_HOUR) {
    cleanupCache(false); // Only remove expired entries, not force cleanup
    localStorage.setItem(CLEANUP_KEY, Date.now().toString());
  }
}
