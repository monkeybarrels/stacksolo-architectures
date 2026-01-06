A high-performance API with Redis caching for fast response times.

## What's Included

- **Cloud Run** - Hosts the Node.js API with automatic scaling
- **Memorystore Redis** - Managed Redis instance for caching
- **Load Balancer** - Routes traffic to the API

## Use Cases

- REST APIs with high read traffic
- Session storage
- Rate limiting
- Real-time leaderboards
- Pub/sub messaging

## Prerequisites

- GCP project with billing enabled
- `gcloud` CLI authenticated
- Node.js 18+ installed

## Getting Started

1. Copy the config to your project
2. Update `YOUR_GCP_PROJECT_ID` with your actual project ID
3. Run `stacksolo scaffold` to generate the API boilerplate
4. Implement your API endpoints
5. Run `stacksolo deploy` to deploy

## Redis Connection

The `REDIS_URL` environment variable is automatically set from the Memorystore Redis instance. Use `ioredis` or `redis` npm packages to connect.

```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

## Caching Patterns

### Cache-Aside
```javascript
async function getUser(id) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await db.users.findById(id);
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user));
  return user;
}
```

## Scaling

- Default 1GB is suitable for most use cases
- Upgrade to STANDARD_HA tier for high availability
- Consider Redis Cluster for > 16GB data