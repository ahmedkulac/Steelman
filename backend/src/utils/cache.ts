import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

/**
 * Initialize Redis client
 */
export async function initRedis(): Promise<void> {
  if (redisClient) {
    return;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch (error) {
    console.warn('⚠️  Redis connection failed, caching disabled:', error);
    redisClient = null;
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
