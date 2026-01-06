# StackSolo Architectures & Templates

Community-maintained architecture templates for [StackSolo](https://stacksolo.dev).

## Quick Start

```bash
# Create a new project from a template
stacksolo init --template firebase-app

# List available templates
stacksolo init --list-templates
```

## Available Templates

Templates include complete source code - frontend, backend, authentication, and database setup.

| Template | Description | Difficulty |
|----------|-------------|------------|
| **firebase-app** | Full-stack app with Firebase Auth + Firestore | Beginner |
| **firebase-postgres** | Firebase Auth + Cloud SQL PostgreSQL with Drizzle ORM | Intermediate |
| **api-starter** | Simple Express API ready to extend | Beginner |
| **static-site** | React static site with Vite and CDN deployment | Beginner |

### firebase-app

Full-stack application with Firebase Authentication and Firestore.

- **Frontend:** React or Vue (choose during init)
- **Backend:** Express API on Cloud Functions
- **Auth:** Firebase Auth + `@stacksolo/runtime` kernel middleware
- **Database:** Firestore
- **Features:** Auto-detects Firebase emulators in development

```bash
stacksolo init --template firebase-app
```

### firebase-postgres

Firebase Auth for authentication with Cloud SQL PostgreSQL for data storage. Best for apps that need relational data.

- **Frontend:** React
- **Backend:** Express API on Cloud Functions
- **Auth:** Firebase Auth + `@stacksolo/runtime` kernel middleware
- **Database:** Cloud SQL PostgreSQL with Drizzle ORM
- **Pattern:** Repository pattern (one repository per table)
- **Features:** Type-safe queries, migrations included

The backend uses `kernel.authMiddleware()` from `@stacksolo/runtime` to verify Firebase tokens:

```typescript
import { kernel } from '@stacksolo/runtime';

// Protected routes - verifies Firebase Auth token
app.use('/api', kernel.authMiddleware());

// req.user contains { uid, email, ... } from the verified token
app.get('/api/profile', async (req, res) => {
  const user = req.user!;  // Firebase user from token
  // ...
});
```

```bash
stacksolo init --template firebase-postgres
```

### api-starter

Minimal Express API template for building serverless backends.

- **Backend:** Express on Cloud Functions
- **Endpoints:** Health check, echo
- **Use case:** Starting point for custom APIs

```bash
stacksolo init --template api-starter
```

### static-site

React static site optimized for CDN deployment.

- **Frontend:** React + Vite
- **Deployment:** Cloud Storage + CDN
- **Use case:** Marketing sites, landing pages, SPAs

```bash
stacksolo init --template static-site
```

## Available Architectures

Architectures are config-only (no source code). Use with `stacksolo clone`.

| Name | Description | Difficulty |
|------|-------------|------------|
| [nextjs-postgres](architectures/nextjs-postgres/) | Full-stack Next.js with PostgreSQL | Beginner |
| [api-with-redis](architectures/api-with-redis/) | High-performance API with Redis cache | Intermediate |
| [static-website](architectures/static-website/) | Static site with CDN | Beginner |

## Templates vs Architectures

| Concept | What it provides | Command |
|---------|------------------|---------|
| **Template** | Full source code + config | `stacksolo init --template <name>` |
| **Architecture** | Config only (no code) | `stacksolo clone <name>` |

## How to Use

### With AI Assistants (Claude, Cursor)

If you have the StackSolo MCP installed, your AI assistant can:

1. List templates: "What StackSolo templates are available?"
2. Get guides: "Show me the firebase-postgres template guide"
3. Help customize: "Set up a Firebase app with PostgreSQL for my-project"

### Manual Usage

**For Templates:**
```bash
stacksolo init --template firebase-app
cd my-app
npm install
npm run dev
```

**For Architectures:**
```bash
stacksolo clone nextjs-postgres
# Edit .stacksolo/stacksolo.config.json
stacksolo scaffold
stacksolo deploy
```

## Contributing

We welcome contributions!

### Adding a Template

1. Fork this repository
2. Create a new folder in `templates/your-template/`
3. Add:
   - `template.json` - Metadata and variables
   - `config.json` - StackSolo configuration
   - `files-react/` or `files-vue/` - Source code
   - `README.md` - Documentation
4. Update `templates.json` manifest
5. Submit a pull request

### Adding an Architecture

1. Fork this repository
2. Create a new folder in `architectures/` or `community/`
3. Add `config.json`, `README.md`, and `variables.json`
4. Update `index.json` with your architecture metadata
5. Submit a pull request

### Structure

```
templates/your-template/
├── template.json       # Metadata + variables
├── config.json         # StackSolo configuration
├── README.md           # Documentation
├── files-react/        # React variant source code
│   ├── apps/web/       # Frontend
│   └── functions/api/  # Backend
└── files-vue/          # Vue variant (optional)

architectures/your-architecture/
├── config.json         # StackSolo configuration
├── README.md           # Documentation
└── variables.json      # Customizable variables
```

### Guidelines

- Test your configuration before submitting
- Include clear documentation with use cases
- Set appropriate difficulty level
- Tag relevant categories (frontend, backend, database, etc.)

## Community

Community-contributed templates are marked with a star in the MCP.

## License

MIT