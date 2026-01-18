/**
 * API Key Authentication Middleware
 * Validates API keys from X-API-Key header
 */

import { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../services/apiKey.service';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide an API key via the X-API-Key header',
    });
  }

  validateApiKey(apiKey)
    .then((key) => {
      if (!key) {
        return res.status(401).json({
          error: 'Invalid API key',
          message: 'The provided API key is invalid, expired, or revoked',
        });
      }

      // Attach key info to request
      req.apiKey = {
        id: key.id,
        userId: key.userId,
        plan: key.plan,
        rateLimit: key.rateLimit,
        dailyLimit: key.dailyLimit,
      };

      next();
    })
    .catch((err) => {
      console.error('API key validation error:', err);
      res.status(500).json({
        error: 'Authentication error',
        message: 'Failed to validate API key',
      });
    });
}
