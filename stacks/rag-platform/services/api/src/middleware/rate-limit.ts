/**
 * Rate Limiting Middleware
 *
 * Simple in-memory rate limiter with sliding window.
 * For production, consider using Redis for distributed rate limiting.
 */

import type { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis for production/multi-instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

/**
 * Create rate limit middleware
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    keyGenerator = defaultKeyGenerator,
    skip,
  } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    // Check if should skip
    if (skip && skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
      // Create new entry
      entry = {
        count: 1,
        resetAt: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    } else {
      // Increment count
      entry.count++;
    }

    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - entry.count);
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    // Check if over limit
    if (entry.count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        error: message,
        retryAfter: resetSeconds,
      });
    }

    next();
  };
}

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.ip || req.socket.remoteAddress || 'unknown';
  return `rate-limit:${ip}`;
}

/**
 * Key generator by IP + path
 */
export function keyByIpAndPath(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.ip || req.socket.remoteAddress || 'unknown';
  return `rate-limit:${ip}:${req.path}`;
}

/**
 * Key generator by user ID (from auth header or body)
 */
export function keyByUserId(req: Request): string {
  const userId = req.body?.userId || req.headers['x-user-id'] || 'anonymous';
  return `rate-limit:user:${userId}`;
}

/**
 * Key generator by bot ID + IP
 */
export function keyByBotAndIp(req: Request): string {
  const botId = req.params.botId || req.body?.botId || 'unknown';
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.ip || req.socket.remoteAddress || 'unknown';
  return `rate-limit:bot:${botId}:${ip}`;
}

// Preset configurations
export const rateLimitPresets = {
  // Standard API rate limit: 100 requests per minute
  standard: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 100,
  }),

  // Chat rate limit: 20 messages per minute
  chat: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 20,
    keyGenerator: keyByBotAndIp,
    message: 'Too many messages. Please wait a moment before sending more.',
  }),

  // Upload rate limit: 10 uploads per hour
  upload: rateLimit({
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    message: 'Upload limit reached. Please try again later.',
  }),

  // Strict rate limit: 10 requests per minute (for sensitive operations)
  strict: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: 'Rate limit exceeded for this operation.',
  }),
};
