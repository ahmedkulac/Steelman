import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

/**
 * Initialize Redis client
 */
export async function initRedis(): Promise<void> {
  // Skip Redis if explicitly disabled
  if (process.env.REDIS_ENABLED === 'false') {
    console.log('ℹ️  Redis disabled via REDIS_ENABLED=false');
    return;
  }

  if (redisClient) {
    return;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: false, // Don't auto-reconnect
        connectTimeout: 2000, // 2 second timeout
      },
    });

    redisClient.on('error', (err) => {
      console.warn('⚠️  Redis error (caching disabled):', err.message);
      redisClient = null;
    });

    // Set a timeout for connection
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), 2000)
    );

    await Promise.race([connectPromise, timeoutPromise]);
    console.log('✅ Redis connected');
  } catch (error: any) {
    console.warn(
      '⚠️  Redis connection failed, caching disabled:',
      error.message || error
    );
    redisClient = null;
    // Don't throw - app should work without Redis
  }
}

/**
 * Get cached value
 */
export async function getCache(key: string): Promise<string | null> {
  if (!redisClient) {
    return null;
  }

  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

/**
 * Set cached value with TTL
 */
export async function setCache(
  key: string,
  value: string,
  ttlSeconds: number = 604800
): Promise<void> {
  // Default TTL: 7 days (604800 seconds)
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.setEx(key, ttlSeconds, value);
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
