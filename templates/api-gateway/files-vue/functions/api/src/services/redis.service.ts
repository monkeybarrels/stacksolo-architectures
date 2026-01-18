/**
 * Redis Service
 * Handles rate limiting with sliding window algorithm
 */

import Redis from 'ioredis';

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'localhost';
    redis = new Redis({
      host: redisUrl,
      port: 6379,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }
  return redis;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check rate limit using sliding window algorithm
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const client = getRedis();
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Use a sorted set with timestamp scores
  const rateLimitKey = `ratelimit:${key}`;

  // Remove old entries outside the window
  await client.zremrangebyscore(rateLimitKey, 0, windowStart);

  // Count current requests in window
  const count = await client.zcard(rateLimitKey);

  if (count >= limit) {
    // Get the oldest entry to calculate retry-after
    const oldest = await client.zrange(rateLimitKey, 0, 0, 'WITHSCORES');
    const oldestTime = oldest.length > 1 ? parseInt(oldest[1]) : now;
    const retryAfter = Math.ceil((oldestTime + windowSeconds * 1000 - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestTime + windowSeconds * 1000,
      retryAfter: Math.max(1, retryAfter),
    };
  }

  // Add new request
  await client.zadd(rateLimitKey, now, `${now}:${Math.random()}`);

  // Set expiry on the key
  await client.expire(rateLimitKey, windowSeconds + 10);

  return {
    allowed: true,
    remaining: limit - count - 1,
    resetAt: now + windowSeconds * 1000,
  };
}

/**
 * Check daily limit
 */
export async function checkDailyLimit(key: string, limit: number): Promise<RateLimitResult> {
  const client = getRedis();
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = `daily:${key}:${today}`;

  const count = await client.incr(dailyKey);

  // Set expiry to end of day (24 hours max)
  if (count === 1) {
    await client.expire(dailyKey, 86400);
  }

  if (count > limit) {
    // Calculate seconds until midnight UTC
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    const retryAfter = Math.ceil((tomorrow.getTime() - now.getTime()) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAt: tomorrow.getTime(),
      retryAfter,
    };
  }

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  return {
    allowed: true,
    remaining: limit - count,
    resetAt: tomorrow.getTime(),
  };
}

/**
 * Get current usage count for a key
 */
export async function getUsageCount(key: string, windowSeconds: number = 60): Promise<number> {
  const client = getRedis();
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const rateLimitKey = `ratelimit:${key}`;

  await client.zremrangebyscore(rateLimitKey, 0, windowStart);
  return client.zcard(rateLimitKey);
}

/**
 * Get daily usage count
 */
export async function getDailyUsageCount(key: string): Promise<number> {
  const client = getRedis();
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = `daily:${key}:${today}`;

  const count = await client.get(dailyKey);
  return count ? parseInt(count) : 0;
}

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
