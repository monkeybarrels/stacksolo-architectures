# Firebase + PostgreSQL Template

Full-stack application using Firebase Auth for authentication and Cloud SQL PostgreSQL for data storage.

## Architecture

- **Frontend**: React with Vite
- **Backend**: Express API on Cloud Functions
- **Auth**: Firebase Authentication
- **Database**: Cloud SQL PostgreSQL with Drizzle ORM
- **Pattern**: Repository pattern for clean data access

## Quick Start

```bash
# Initialize project
stacksolo init --template firebase-postgres

# Install dependencies
npm install

# Set up database
export DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"
npm run migrate

# Start development
npm run dev
```

## Project Structure

```
├── apps/
│   └── web/                 # React frontend
│       └── src/
│           ├── firebase.ts  # Firebase Auth only
│           ├── contexts/    # Auth context
│           └── components/  # Login, Signup, Dashboard
│
├── functions/
│   └── api/                 # Express API
│       └── src/
│           ├── db/          # Drizzle schema & connection
│           ├── repositories/ # Data access layer
│           └── index.ts     # API routes
│
└── package.json             # Root workspace
```

## Repository Pattern

Each table has its own repository file:

```typescript
// repositories/user.repository.ts
export const userRepository = {
  findById(id: string): Promise<User | null>,
  findByEmail(email: string): Promise<User | null>,
  create(data: NewUser): Promise<User>,
  update(id: string, data: Partial<User>): Promise<User | null>,
  delete(id: string): Promise<boolean>,
  findOrCreate(id: string, email: string): Promise<User>,
};
```

## Database Schema

```sql
-- Users table (linked to Firebase Auth UID)
CREATE TABLE users (
  id VARCHAR(128) PRIMARY KEY,  -- Firebase UID
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Items table (owned by users)
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(128) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check (unauthenticated) |
| GET | `/api/profile` | Get user profile (creates if not exists) |
| PUT | `/api/profile` | Update user profile |
| GET | `/api/items` | List user's items |
| POST | `/api/items` | Create item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL (local or Cloud SQL)
- Firebase project (for Auth)

### Local Development

1. Start PostgreSQL locally or use Cloud SQL proxy
2. Set `DATABASE_URL` environment variable
3. Run migrations: `npm run migrate`
4. Start dev servers: `npm run dev`

The frontend runs at http://localhost:3000 and proxies API requests to http://localhost:8080.

### Adding New Tables

1. Add schema in `functions/api/src/db/schema.ts`
2. Create repository in `functions/api/src/repositories/`
3. Export from `functions/api/src/repositories/index.ts`
4. Generate migration: `npm run generate --prefix functions/api`
5. Run migration: `npm run migrate`

## Deployment

```bash
stacksolo deploy
```

This will:
1. Create Cloud SQL PostgreSQL instance
2. Run database migrations
3. Deploy API to Cloud Functions
4. Deploy frontend to Cloud Storage/CDN