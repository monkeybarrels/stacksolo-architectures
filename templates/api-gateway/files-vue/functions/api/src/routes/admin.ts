/**
 * Admin Routes
 * Developer portal API endpoints (requires Firebase Auth)
 */

import { Router } from 'express';
import { kernel } from '@stacksolo/runtime';
import { db } from '../db/index';
import { users, apiKeys, dailyUsage, type NewUser } from '../db/schema';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import * as apiKeyService from '../services/apiKey.service';

const router = Router();

// All admin routes require authentication
router.use(kernel.authMiddleware());

/**
 * Get or create user profile
 */
router.get('/profile', async (req, res) => {
  try {
    const { uid, email } = req.user!;

    let [user] = await db.select().from(users).where(eq(users.id, uid));

    if (!user) {
      const newUser: NewUser = {
        id: uid,
        email: email || '',
        plan: 'free',
      };
      [user] = await db.insert(users).values(newUser).returning();
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * List user's API keys
 */
router.get('/keys', async (req, res) => {
  try {
    const { uid } = req.user!;
    const keys = await apiKeyService.listApiKeys(uid);

    // Don't expose the actual key hash
    const safeKeys = keys.map((key) => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      plan: key.plan,
      rateLimit: key.rateLimit,
      dailyLimit: key.dailyLimit,
      status: key.status,
      description: key.description,
      lastUsedAt: key.lastUsedAt,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
    }));

    res.json({ keys: safeKeys });
  } catch (error: any) {
    console.error('Error listing keys:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create a new API key
 */
router.post('/keys', async (req, res) => {
  try {
    const { uid } = req.user!;
    const { name, description } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const { key, apiKey } = await apiKeyService.createApiKey(uid, name, description);

    // Return the full key only once at creation
    res.status(201).json({
      key, // Full key - only shown once!
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        plan: apiKey.plan,
        rateLimit: apiKey.rateLimit,
        dailyLimit: apiKey.dailyLimit,
        status: apiKey.status,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error creating key:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Revoke an API key
 */
router.delete('/keys/:id', async (req, res) => {
  try {
    const { uid } = req.user!;
    const { id } = req.params;

    const success = await apiKeyService.revokeApiKey(id, uid);

    if (!success) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({ message: 'API key revoked' });
  } catch (error: any) {
    console.error('Error revoking key:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Rotate an API key
 */
router.post('/keys/:id/rotate', async (req, res) => {
  try {
    const { uid } = req.user!;
    const { id } = req.params;

    const result = await apiKeyService.rotateApiKey(id, uid);

    if (!result) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({
      key: result.key, // Full new key - only shown once!
      apiKey: {
        id: result.apiKey.id,
        name: result.apiKey.name,
        keyPrefix: result.apiKey.keyPrefix,
        plan: result.apiKey.plan,
        rateLimit: result.apiKey.rateLimit,
        dailyLimit: result.apiKey.dailyLimit,
        status: result.apiKey.status,
        createdAt: result.apiKey.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error rotating key:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get usage statistics
 */
router.get('/usage', async (req, res) => {
  try {
    const { uid } = req.user!;
    const { days = '30', keyId } = req.query;

    const daysNum = parseInt(days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Get user's API keys
    const userKeys = await db
      .select({ id: apiKeys.id })
      .from(apiKeys)
      .where(eq(apiKeys.userId, uid));

    const keyIds = keyId ? [keyId as string] : userKeys.map((k) => k.id);

    if (keyIds.length === 0) {
      return res.json({ usage: [], summary: { totalRequests: 0, totalErrors: 0 } });
    }

    // Get daily usage
    const usage = await db
      .select()
      .from(dailyUsage)
      .where(and(
        sql`${dailyUsage.apiKeyId} IN (${sql.raw(keyIds.map(id => `'${id}'`).join(','))})`,
        gte(dailyUsage.date, startDateStr)
      ))
      .orderBy(desc(dailyUsage.date));

    // Calculate summary
    const summary = usage.reduce(
      (acc, day) => ({
        totalRequests: acc.totalRequests + day.requestCount,
        totalErrors: acc.totalErrors + day.errorCount,
      }),
      { totalRequests: 0, totalErrors: 0 }
    );

    res.json({ usage, summary });
  } catch (error: any) {
    console.error('Error getting usage:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get available plans
 */
router.get('/plans', (_req, res) => {
  const plans = apiKeyService.getAvailablePlans();
  res.json({ plans });
});

export default router;
