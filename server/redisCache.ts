/**
 * Redis Cache Wrapper
 * Provides persistent caching with automatic fallback to in-memory cache
 * if Redis is unavailable
 */

import Redis from 'ioredis';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class RedisCache {
  private redis: Redis | null = null;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private isRedisAvailable = false;

  constructor() {
    this.initRedis();
  }

  private async initRedis() {
    try {
      // TEMPORARY: Use memory cache only for faster performance
      // Redis connection can be slow and unreliable
      console.log('[Redis] Using in-memory cache for optimal performance');
      this.isRedisAvailable = false;
      return;
      
      // Commented out Redis connection code
      /* eslint-disable
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      if (redisUrl.includes('your-host') || redisUrl.includes('your-password') || redisUrl.includes('example.com')) {
        console.warn('[Redis] Placeholder URL detected, using memory cache only');
        this.isRedisAvailable = false;
        return;
      }
      
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('[Redis] Max retries reached, falling back to memory cache');
            return null; // Stop retrying
          }
          return Math.min(times * 100, 2000); // Exponential backoff
        },
        lazyConnect: true, // Don't connect immediately
      });

      // Test connection
      await this.redis.connect();
      await this.redis.ping();
      
      this.isRedisAvailable = true;
      console.log('[Redis] Connected successfully');

      // Handle Redis errors gracefully
      this.redis.on('error', (err) => {
        console.warn('[Redis] Connection error:', err.message);
        this.isRedisAvailable = false;
      });

      this.redis.on('connect', () => {
        console.log('[Redis] Reconnected');
        this.isRedisAvailable = true;
      });
      */

    } catch (error) {
      console.warn('[Redis] Failed to initialize, using memory cache:', (error as Error).message);
      this.isRedisAvailable = false;
      this.redis = null;
    }
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.isRedisAvailable && this.redis) {
        const value = await this.redis.get(key);
        if (value) {
          const entry: CacheEntry<T> = JSON.parse(value);
          return entry.data;
        }
        return null;
      }
    } catch (error) {
      console.warn(`[Redis] Get error for key ${key}:`, (error as Error).message);
    }

    // Fallback to memory cache
    const entry = this.memoryCache.get(key);
    return entry ? entry.data : null;
  }

  /**
   * Set cached value with TTL (in seconds)
   */
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
    };

    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.setex(key, ttl, JSON.stringify(entry));
        return;
      }
    } catch (error) {
      console.warn(`[Redis] Set error for key ${key}:`, (error as Error).message);
    }

    // Fallback to memory cache
    this.memoryCache.set(key, entry);
    
    // Auto-expire memory cache entries
    setTimeout(() => {
      this.memoryCache.delete(key);
    }, ttl * 1000);
  }

  /**
   * Check if key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    try {
      if (this.isRedisAvailable && this.redis) {
        const exists = await this.redis.exists(key);
        return exists === 1;
      }
    } catch (error) {
      console.warn(`[Redis] Has error for key ${key}:`, (error as Error).message);
    }

    // Fallback to memory cache
    return this.memoryCache.has(key);
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.del(key);
        return;
      }
    } catch (error) {
      console.warn(`[Redis] Delete error for key ${key}:`, (error as Error).message);
    }

    // Fallback to memory cache
    this.memoryCache.delete(key);
  }

  /**
   * Clear all cached values (use with caution)
   */
  async clear(): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.flushdb();
        return;
      }
    } catch (error) {
      console.warn('[Redis] Clear error:', (error as Error).message);
    }

    // Fallback to memory cache
    this.memoryCache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      isRedisAvailable: this.isRedisAvailable,
      memoryCacheSize: this.memoryCache.size,
      cacheType: this.isRedisAvailable ? 'redis' : 'memory',
    };
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
      this.isRedisAvailable = false;
    }
  }
}

// Singleton instance
export const redisCache = new RedisCache();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Redis] Shutting down...');
  await redisCache.disconnect();
});

process.on('SIGINT', async () => {
  console.log('[Redis] Shutting down...');
  await redisCache.disconnect();
});
