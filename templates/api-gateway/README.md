# API Gateway Template

API monetization platform with API key management, rate limiting, usage tracking, and a developer portal.

## Features

- **API Key Management** - Create, revoke, rotate API keys
- **Rate Limiting** - Per-key limits with Redis-backed counters
- **Usage Tracking** - Track API calls, aggregate usage stats
- **Tiered Plans** - Free, Pro, Business with different limits
- **Developer Portal** - Dashboard to manage keys and view usage
- **Firebase Auth** - Secure admin access

## Quick Start

```bash
# Create project from template
stacksolo init --template api-gateway

# Install dependencies
cd my-api-gateway
npm install

# Start local development
stacksolo dev
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Developer Portal                      │
│                     (Vue 3 + Pinia)                      │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      API Gateway                         │
│                                                          │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Auth    │  │ Rate Limit  │  │ Usage Tracking   │   │
│  │Middleware│──│  Middleware │──│   Middleware     │   │
│  └──────────┘  └──────┬──────┘  └────────┬─────────┘   │
│                       │                   │             │
│                       ▼                   ▼             │
│               ┌───────────────┐  ┌───────────────────┐  │
│               │    Redis      │  │   PostgreSQL      │  │
│               │ (Rate Limits) │  │ (Keys, Usage)     │  │
│               └───────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
├── apps/web/                    # Vue 3 Developer Portal
│   └── src/
│       ├── components/
│       │   ├── ApiKeyCard.vue   # Key display with copy
│       │   ├── UsageChart.vue   # Usage visualization
│       │   └── PlanCard.vue     # Plan comparison
│       ├── stores/
│       │   ├── auth.ts          # Firebase auth
│       │   └── apiKeys.ts       # API key management
│       ├── pages/
│       │   ├── Dashboard.vue    # Overview
│       │   ├── ApiKeys.vue      # Key management
│       │   ├── Usage.vue        # Usage analytics
│       │   └── Plans.vue        # Upgrade plans
│       └── lib/
│           ├── firebase.ts
│           └── api.ts

├── functions/api/               # Express API
│   └── src/
│       ├── middleware/
│       │   ├── apiKey.ts        # API key validation
│       │   ├── rateLimit.ts     # Redis rate limiting
│       │   └── usage.ts         # Usage tracking
│       ├── services/
│       │   ├── redis.service.ts # Rate limit counters
│       │   └── apiKey.service.ts# Key generation/validation
│       ├── db/
│       │   ├── index.ts         # Drizzle connection
│       │   └── schema.ts        # Tables
│       ├── repositories/
│       │   ├── apiKey.repository.ts
│       │   └── usage.repository.ts
│       └── routes/
│           ├── admin.ts         # Portal endpoints
│           └── gateway.ts       # Public API endpoints

└── stacksolo.config.json
```

## Database Schema

```typescript
// API Keys
export const apiKeys = pgTable('api_keys', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  keyHash: varchar('key_hash', { length: 64 }).notNull(),  // SHA-256 hash
  keyPrefix: varchar('key_prefix', { length: 8 }).notNull(), // First 8 chars for identification
  plan: varchar('plan', { length: 50 }).notNull().default('free'),
  rateLimit: integer('rate_limit').notNull().default(100),  // requests per minute
  dailyLimit: integer('daily_limit').notNull().default(1000),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Usage Records
export const usageRecords = pgTable('usage_records', {
  id: serial('id').primaryKey(),
  apiKeyId: varchar('api_key_id', { length: 64 }).notNull(),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  statusCode: integer('status_code').notNull(),
  responseTimeMs: integer('response_time_ms'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
```

## API Endpoints

### Admin Endpoints (Requires Firebase Auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/keys | List user's API keys |
| POST | /api/admin/keys | Create new API key |
| DELETE | /api/admin/keys/:id | Revoke API key |
| POST | /api/admin/keys/:id/rotate | Rotate API key |
| GET | /api/admin/usage | Get usage statistics |
| GET | /api/admin/plans | Get available plans |

### Gateway Endpoints (Requires API Key)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/health | Health check |
| * | /api/v1/* | Your proxied API endpoints |

## Rate Limiting

Rate limits are enforced using Redis with a sliding window algorithm:

```typescript
// Middleware checks limits before processing request
const result = await rateLimiter.check(apiKeyId, {
  limit: apiKey.rateLimit,      // requests per minute
  dailyLimit: apiKey.dailyLimit // requests per day
});

if (!result.allowed) {
  return res.status(429).json({
    error: 'Rate limit exceeded',
    retryAfter: result.retryAfter
  });
}
```

## Plans

| Plan | Rate Limit | Daily Limit | Features |
|------|------------|-------------|----------|
| Free | 100/min | 1,000/day | Basic access |
| Pro | 1,000/min | 50,000/day | Priority support |
| Business | 10,000/min | Unlimited | SLA, custom limits |

## Development

```bash
# Start everything locally
stacksolo dev

# Redis will run in Docker via the dev environment
# PostgreSQL via Cloud SQL Proxy or local Docker

# Test API key creation
curl -X POST http://localhost:3000/api/admin/keys \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Test Key"}'

# Test rate-limited endpoint
curl http://localhost:3000/api/v1/health \
  -H "X-API-Key: YOUR_API_KEY"
```

## Deployment

```bash
stacksolo deploy
```

Creates:
- Cloud Functions API
- Cloud SQL PostgreSQL
- Memorystore Redis
- Cloud Storage for frontend
- Load balancer with SSL

## Environment Variables

For local development, create `.env.local`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## Customization

### Adding Protected Endpoints

Create your business logic in `routes/gateway.ts`:

```typescript
router.get('/v1/data', apiKeyMiddleware, rateLimitMiddleware, async (req, res) => {
  // Your API logic here
  const data = await yourService.getData();
  res.json(data);
});
```

### Custom Rate Limit Rules

Modify `middleware/rateLimit.ts` for custom rules per endpoint:

```typescript
const ENDPOINT_LIMITS = {
  '/v1/expensive': { multiplier: 10 },  // Costs 10x normal rate
  '/v1/cheap': { multiplier: 0.1 },     // Costs 0.1x normal rate
};
```
