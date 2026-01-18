/**
 * API Key Service
 * Handles key generation, validation, and management
 */

import { createHash, randomBytes } from 'crypto';
import { db } from '../db/index';
import { apiKeys, users, type ApiKey, type NewApiKey } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Plan limits
const PLAN_LIMITS = {
  free: {
    rateLimit: 100, // per minute
    dailyLimit: 1000,
    maxKeys: 2,
  },
  pro: {
    rateLimit: 1000,
    dailyLimit: 50000,
    maxKeys: 10,
  },
  business: {
    rateLimit: 10000,
    dailyLimit: -1, // unlimited
    maxKeys: 50,
  },
};

/**
 * Generate a new API key
 * Format: gw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */
function generateApiKey(): { key: string; hash: string; prefix: string } {
  const prefix = 'gw_';
  const randomPart = randomBytes(24).toString('base64url');
  const key = prefix + randomPart;
  const hash = createHash('sha256').update(key).digest('hex');

  return {
    key,
    hash,
    prefix: key.substring(0, 12), // First 12 chars for identification
  };
}

/**
 * Hash an API key for storage/lookup
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Create a new API key for a user
 */
export async function createApiKey(
  userId: string,
  name: string,
  description?: string
): Promise<{ key: string; apiKey: ApiKey }> {
  // Get user's plan
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const plan = user?.plan || 'free';
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

  // Check max keys limit
  const existingKeys = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), eq(apiKeys.status, 'active')));

  if (existingKeys.length >= limits.maxKeys) {
    throw new Error(`Maximum ${limits.maxKeys} active API keys allowed for ${plan} plan`);
  }

  // Generate new key
  const { key, hash, prefix } = generateApiKey();
  const keyId = randomBytes(16).toString('hex');

  const newKey: NewApiKey = {
    id: keyId,
    userId,
    name,
    keyHash: hash,
    keyPrefix: prefix,
    plan,
    rateLimit: limits.rateLimit,
    dailyLimit: limits.dailyLimit,
    status: 'active',
    description,
  };

  const [apiKey] = await db.insert(apiKeys).values(newKey).returning();

  // Return the actual key (only time it's visible)
  return { key, apiKey };
}

/**
 * Validate an API key and return its details
 */
export async function validateApiKey(key: string): Promise<ApiKey | null> {
  const hash = hashApiKey(key);

  const [apiKey] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hash), eq(apiKeys.status, 'active')));

  if (!apiKey) {
    return null;
  }

  // Check if expired
  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
    await db.update(apiKeys).set({ status: 'expired' }).where(eq(apiKeys.id, apiKey.id));
    return null;
  }

  // Update last used timestamp
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, apiKey.id));

  return apiKey;
}

/**
 * List API keys for a user (without revealing the actual keys)
 */
export async function listApiKeys(userId: string): Promise<ApiKey[]> {
  return db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(desc(apiKeys.createdAt));
}

/**
 * Get a single API key by ID
 */
export async function getApiKey(keyId: string, userId: string): Promise<ApiKey | null> {
  const [apiKey] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));

  return apiKey || null;
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(keyId: string, userId: string): Promise<boolean> {
  const result = await db
    .update(apiKeys)
    .set({ status: 'revoked' })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));

  return (result.rowCount ?? 0) > 0;
}

/**
 * Rotate an API key (revoke old, create new with same settings)
 */
export async function rotateApiKey(
  keyId: string,
  userId: string
): Promise<{ key: string; apiKey: ApiKey } | null> {
  // Get existing key
  const existing = await getApiKey(keyId, userId);
  if (!existing) {
    return null;
  }

  // Revoke old key
  await revokeApiKey(keyId, userId);

  // Create new key with same settings
  const { key, hash, prefix } = generateApiKey();
  const newKeyId = randomBytes(16).toString('hex');

  const newKey: NewApiKey = {
    id: newKeyId,
    userId,
    name: existing.name,
    keyHash: hash,
    keyPrefix: prefix,
    plan: existing.plan,
    rateLimit: existing.rateLimit,
    dailyLimit: existing.dailyLimit,
    status: 'active',
    description: existing.description,
    expiresAt: existing.expiresAt,
  };

  const [apiKey] = await db.insert(apiKeys).values(newKey).returning();

  return { key, apiKey };
}

/**
 * Update API key limits (for plan upgrades)
 */
export async function updateApiKeyLimits(
  keyId: string,
  plan: string
): Promise<ApiKey | null> {
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

  const [updated] = await db
    .update(apiKeys)
    .set({
      plan,
      rateLimit: limits.rateLimit,
      dailyLimit: limits.dailyLimit,
    })
    .where(eq(apiKeys.id, keyId))
    .returning();

  return updated || null;
}

/**
 * Get plan limits
 */
export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
}

/**
 * Get all available plans
 */
export function getAvailablePlans() {
  return Object.entries(PLAN_LIMITS).map(([name, limits]) => ({
    name,
    ...limits,
  }));
}
