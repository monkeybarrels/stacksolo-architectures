# Firebase App Template

Full-stack app with Firebase Authentication and Firestore database.

## What's Included

- **Frontend (React + Vite)**
  - Login/Signup forms with email/password
  - Google Sign-In
  - Protected routes
  - Auth context for state management
  - Auto-connect to Firebase emulators in dev

- **Backend (Cloud Function)**
  - Express API with authenticated endpoints
  - Uses `@stacksolo/runtime` for auth middleware
  - Firestore integration
  - Example CRUD operations

## Usage

```bash
# Initialize with this template
stacksolo init --template firebase-app

# Install dependencies
npm run install:all

# Start local development (uses Firebase emulators)
stacksolo dev

# Deploy to GCP
stacksolo deploy
```

## Project Structure

```
your-project/
├── .stacksolo/
│   └── stacksolo.config.json
├── apps/
│   └── web/                 # React frontend
│       ├── src/
│       │   ├── firebase.ts  # Firebase config + emulator detection
│       │   ├── contexts/    # Auth context
│       │   ├── components/  # Login, Signup, Dashboard, etc.
│       │   └── App.tsx
│       └── package.json
├── functions/
│   └── api/                 # Cloud Function backend
│       ├── src/
│       │   └── index.ts     # Express API with auth middleware
│       └── package.json
└── package.json
```

## Development

Local development uses Firebase emulators for Auth and Firestore:

- Auth emulator: http://localhost:9099
- Firestore emulator: http://localhost:8080
- Emulator UI: http://localhost:4000

The frontend auto-detects dev mode and connects to emulators automatically.

## Customization

### Adding Google Sign-In (Production)

1. Create OAuth credentials in GCP Console
2. Configure Firebase Auth with your OAuth client
3. Add your domain to authorized origins

### Environment Variables

**Frontend (.env):**
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
```

**Backend:**
Environment variables are injected automatically by StackSolo during deployment.

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | No | Health check |
| `/api/profile` | GET | Yes | Get user profile |
| `/api/profile` | PUT | Yes | Update user profile |
| `/api/items` | GET | Yes | List user's items |
| `/api/items` | POST | Yes | Create new item |