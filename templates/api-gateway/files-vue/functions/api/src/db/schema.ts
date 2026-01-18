/**
 * Database Schema
 */

import { pgTable, varchar, integer, timestamp, serial, text, boolean, index } from 'drizzle-orm/pg-core';

// Users - synced from Firebase Auth
export const users = pgTable('users', {
  id: varchar('id', { length: 128 }).primaryKey(), // Firebase UID
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  plan: varchar('plan', { length: 50 }).notNull().default('free'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
});

// API Keys
export const apiKeys = pgTable(
  'api_keys',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    keyHash: varchar('key_hash', { length: 64 }).notNull(), // SHA-256 hash
    keyPrefix: varchar('key_prefix', { length: 12 }).notNull(), // First chars for identification
    plan: varchar('plan', { length: 50 }).notNull().default('free'),
    rateLimit: integer('rate_limit').notNull().default(100), // requests per minute
    dailyLimit: integer('daily_limit').notNull().default(1000),
    status: varchar('status', { length: 20 }).notNull().default('active'), // active, revoked, expired
    description: text('description'),
    lastUsedAt: timestamp('last_used_at'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('api_keys_user_id_idx').on(table.userId),
    index('api_keys_key_hash_idx').on(table.keyHash),
    index('api_keys_key_prefix_idx').on(table.keyPrefix),
  ]
);

// Usage Records - individual API calls
export const usageRecords = pgTable(
  'usage_records',
  {
    id: serial('id').primaryKey(),
    apiKeyId: varchar('api_key_id', { length: 64 })
      .notNull()
      .references(() => apiKeys.id, { onDelete: 'cascade' }),
    endpoint: varchar('endpoint', { length: 255 }).notNull(),
    method: varchar('method', { length: 10 }).notNull(),
    statusCode: integer('status_code').notNull(),
    responseTimeMs: integer('response_time_ms'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (table) => [
    index('usage_records_api_key_idx').on(table.apiKeyId),
    index('usage_records_timestamp_idx').on(table.timestamp),
  ]
);

// Daily Usage Aggregates
export const dailyUsage = pgTable(
  'daily_usage',
  {
    id: serial('id').primaryKey(),
    apiKeyId: varchar('api_key_id', { length: 64 })
      .notNull()
      .references(() => apiKeys.id, { onDelete: 'cascade' }),
    date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
    requestCount: integer('request_count').notNull().default(0),
    errorCount: integer('error_count').notNull().default(0),
    avgResponseTimeMs: integer('avg_response_time_ms'),
  },
  (table) => [
    index('daily_usage_api_key_date_idx').on(table.apiKeyId, table.date),
  ]
);

// Types for inserts
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type UsageRecord = typeof usageRecords.$inferSelect;
export type NewUsageRecord = typeof usageRecords.$inferInsert;
export type DailyUsage = typeof dailyUsage.$inferSelect;
export type NewDailyUsage = typeof dailyUsage.$inferInsert;
