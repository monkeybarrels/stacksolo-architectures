# Firebase Auth API

Authentication middleware and profile endpoint that syncs Firebase Auth users to PostgreSQL.

## Usage

```bash
stacksolo add firebase-auth-api
```

## What's Included

- `functions/auth/src/index.ts` - Express API with auth middleware
- `functions/auth/src/db/schema.ts` - Users table schema (Drizzle)
- Profile endpoint that auto-creates users on first login

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /auth/profile | Yes | Get or create user profile |
| PUT | /auth/profile | Yes | Update user profile |

## How It Works

1. Frontend sends Firebase ID token in `Authorization: Bearer <token>` header
2. Middleware verifies token with Firebase Admin SDK
3. On first request, user is auto-created in PostgreSQL
4. Subsequent requests return the stored profile

## Requires

- A PostgreSQL database in your config
- Firebase project configured

## Customization

Add fields to the user schema in `db/schema.ts`:

```typescript
export const users = pgTable('users', {
  id: varchar('id', { length: 128 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  // Add your fields here
  plan: varchar('plan', { length: 50 }).default('free'),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```
