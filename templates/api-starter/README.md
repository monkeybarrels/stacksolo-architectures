# API Starter Template

Simple Express API ready to extend with TypeScript.

## What's Included

- Express API with CORS and JSON parsing
- Health check endpoint
- Structured route examples
- TypeScript with tsup bundling
- Cloud Functions ready

## Usage

```bash
# Initialize with this template
stacksolo init --template api-starter

# Install dependencies
npm run install:all

# Start local development
npm run dev

# Deploy to GCP
stacksolo deploy
```

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api` | GET | API info and available endpoints |
| `/api/hello` | GET | Hello world |
| `/api/hello/:name` | GET | Hello with name parameter |
| `/api/echo` | POST | Echo back request body |

## Adding New Routes

Edit `functions/api/src/index.ts`:

```typescript
// Add a new GET endpoint
app.get('/api/users', async (req, res) => {
  const users = await fetchUsers();
  res.json(users);
});

// Add a new POST endpoint
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  const user = await createUser({ name, email });
  res.status(201).json(user);
});
```

## Project Structure

```
your-project/
├── .stacksolo/
│   └── stacksolo.config.json
├── functions/
│   └── api/
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
└── package.json
```

## Next Steps

- Add database (Cloud SQL, Firestore)
- Add authentication (Firebase Auth, JWT)
- Add caching (Redis)
- Add background jobs (Pub/Sub, Cloud Scheduler)