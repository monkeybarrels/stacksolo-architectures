# App with Admin Panel

A full-stack application template with a user-facing app, admin panel, and Firebase Auth with domain restriction for admin access.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer                           │
│                  (HTTPS + SSL Cert)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /              → Main App (Vue)                            │
│  /api/*         → API Function (Firebase Auth)              │
│  /admin/*       → Admin Panel (Vue + Domain Auth)           │
│  /admin-api/*   → Admin API (Firebase Auth + Domain)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    Firestore    │
                    │   (Shared DB)   │
                    └─────────────────┘
```

## Features

- **User-facing Vue app** with Firebase Authentication
- **Admin panel** with domain-restricted access (only emails from your domain)
- **API function** for user operations (protected by Firebase Auth)
- **Admin API function** with domain middleware (admin-only operations)
- **Shared Firestore database** accessed by both APIs
- **Load balancer** with path-based routing and SSL certificate
- **CDN-enabled** static hosting for both apps

## Structure

```
app-with-admin/
├── apps/
│   ├── web/              # User-facing Vue app
│   └── admin-panel/      # Admin Vue app
├── functions/
│   ├── api/              # Main API (Express)
│   └── admin/            # Admin API (Express + domain restriction)
├── packages/
│   └── shared/           # Shared TypeScript types
├── stack.json            # Stack metadata
└── .stacksolo/
    └── stacksolo.config.json
```

## Quick Start

### 1. Clone the stack

```bash
stacksolo clone app-with-admin my-app
cd my-app
```

### 2. Configure variables

Edit `.stacksolo/stacksolo.config.json` and update:

```json
{
  "project": {
    "name": "my-app",
    "gcpProjectId": "your-gcp-project-id",
    "region": "us-east1"
  }
}
```

### 3. Set admin domains

In the admin function config, set allowed email domains:

```json
{
  "functions": [{
    "name": "admin",
    "env": {
      "ADMIN_DOMAINS": "yourdomain.com,admin.yourdomain.com"
    }
  }]
}
```

### 4. Create Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing GCP project)
3. Enable Authentication → Google provider
4. Get your Firebase config

### 5. Configure Firebase in apps

Create `.env` files for both apps:

**apps/web/.env:**
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_API_BASE_URL=/api
```

**apps/admin-panel/.env:**
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_ADMIN_DOMAINS=yourdomain.com
VITE_ADMIN_API_BASE_URL=/admin-api
```

### 6. Deploy

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Deploy infrastructure
stacksolo deploy
```

## Local Development

```bash
# Start all services locally
stacksolo dev --local
```

This starts:
- Main app at http://localhost:5173
- Admin panel at http://localhost:5174
- API function at http://localhost:8080
- Admin API at http://localhost:8084

## Admin Panel Security

The admin panel uses a two-layer security model:

### Layer 1: Client-Side (Admin Panel)

The admin panel checks the user's email domain before showing content. This is configured via `VITE_ADMIN_DOMAINS` environment variable.

```typescript
// apps/admin-panel/src/services/auth.ts
const allowedDomains = import.meta.env.VITE_ADMIN_DOMAINS?.split(',') || [];
const userDomain = user.email?.split('@')[1];
const authorized = allowedDomains.includes(userDomain);
```

### Layer 2: Server-Side (Admin API)

The admin API validates the domain on every request. This is configured via `ADMIN_DOMAINS` environment variable on the function.

```typescript
// functions/admin/src/index.ts
const ADMIN_DOMAINS = process.env.ADMIN_DOMAINS.split(',');
const domain = decodedToken.email.split('@')[1];
if (!ADMIN_DOMAINS.includes(domain)) {
  return error(res, 403, 'Domain not allowed', 'DOMAIN_NOT_ALLOWED');
}
```

## API Endpoints

### Main API (`/api/*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (public) |
| GET | `/api/profile` | Get current user profile |
| PUT | `/api/profile` | Update current user profile |

### Admin API (`/admin-api/*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin-api/health` | Health check (public) |
| GET | `/admin-api/stats` | Dashboard statistics |
| GET | `/admin-api/users` | List all users |
| GET | `/admin-api/users/:id` | Get single user |
| PUT | `/admin-api/users/:id` | Update user |
| DELETE | `/admin-api/users/:id` | Soft delete user |

## Customization

### Adding new pages to the admin panel

1. Create a new Vue component in `apps/admin-panel/src/pages/`
2. Add the route in `apps/admin-panel/src/router/index.ts`
3. Add navigation link in `apps/admin-panel/src/App.vue`

### Adding new API endpoints

1. Add the endpoint in `functions/api/src/index.ts` or `functions/admin/src/index.ts`
2. Add shared types in `packages/shared/src/index.ts`
3. Rebuild: `npm run build`

### Changing the domain restriction

Update `ADMIN_DOMAINS` in both places:
- `.stacksolo/stacksolo.config.json` → functions → admin → env
- `apps/admin-panel/.env` → `VITE_ADMIN_DOMAINS`

## Deployment Options

### Custom Domain

Update the load balancer config in `.stacksolo/stacksolo.config.json`:

```json
{
  "loadBalancer": {
    "domain": "app.yourdomain.com",
    "enableHttps": true
  }
}
```

### Multiple Admin Domains

Support multiple admin domains by comma-separating them:

```env
ADMIN_DOMAINS=company.com,contractors.company.com,admin.company.com
```

## License

MIT
