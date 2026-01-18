/**
 * Rate Limiting Middleware
 * Uses Redis sliding window for rate limiting
 */

import { Request, Response, NextFunction } from 'express';
import { checkRateLimit, checkDailyLimit } from '../services/redis.service';

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required for rate limiting',
    });
  }

  const { id: keyId, rateLimit, dailyLimit } = req.apiKey;

  Promise.all([
    checkRateLimit(keyId, rateLimit, 60), // 60 second window
    dailyLimit > 0 ? checkDailyLimit(keyId, dailyLimit) : { allowed: true, remaining: -1, resetAt: 0 },
  ])
    .then(([minuteResult, dailyResult]) => {
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': String(rateLimit),
        'X-RateLimit-Remaining': String(minuteResult.remaining),
        'X-RateLimit-Reset': String(Math.ceil(minuteResult.resetAt / 1000)),
      });

      if (dailyLimit > 0) {
        res.set({
          'X-RateLimit-Daily-Limit': String(dailyLimit),
          'X-RateLimit-Daily-Remaining': String(dailyResult.remaining),
        });
      }

      // Check minute rate limit
      if (!minuteResult.allowed) {
        res.set('Retry-After', String(minuteResult.retryAfter));
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit is ${rateLimit} requests per minute.`,
          retryAfter: minuteResult.retryAfter,
          resetAt: new Date(minuteResult.resetAt).toISOString(),
        });
      }

      // Check daily limit
      if (!dailyResult.allowed) {
        res.set('Retry-After', String(dailyResult.retryAfter));
        return res.status(429).json({
          error: 'Daily limit exceeded',
          message: `Daily request limit of ${dailyLimit} reached.`,
          retryAfter: dailyResult.retryAfter,
          resetAt: new Date(dailyResult.resetAt).toISOString(),
        });
      }

      next();
    })
    .catch((err) => {
      console.error('Rate limit check error:', err);
      // Fail open - allow request if Redis is down
      next();
    });
}
