# StackSolo Architectures - AI Guide

This repository contains architecture patterns, templates, and stacks for StackSolo.

## Repository Structure

```
stacksolo-architectures/
├── architectures/     # Config-only patterns (reference configs)
├── templates/         # Scaffold templates (full source code)
└── stacks/            # Product stacks (complete deployable apps)
```

## Current Focus: RAG Platform Stack

Building a complete RAG chatbot platform at `stacks/rag-platform/`.

### Progress

- [x] v0.1 - Simplest Working Chat (DONE)
- [ ] v0.2 - Core Features (document ingestion, vector search, streaming)
- [ ] v0.3 - Multi-bot + Admin (bot CRUD, admin dashboard, IAP)
- [ ] v0.4 - Extensibility (tool system, LLM router, widget)
- [ ] v0.5 - Polish (vector store abstraction, feedback)

---

# CRITICAL: Use StackSolo Runtime

**DO NOT reinvent infrastructure.** StackSolo already provides:

## `@stacksolo/runtime` - Use This!

```typescript
import {
  kernel,           // Auth + files + events
  firestore,        // Auto-configured Firestore
  uploadFile,       // Direct storage upload
  downloadFile,     // Direct storage download
  secrets,          // Secret Manager access
} from '@stacksolo/runtime';

// Zero-trust auth plugin (registers kernel.access)
import '@stacksolo/plugin-zero-trust-auth/runtime';
```

### Auth & Access Control

```typescript
// Validate Firebase token
const result = await kernel.validateToken(req.headers.authorization);
if (result.valid) {
  console.log('User:', result.uid, result.email);
}

// Express middleware
app.use('/api', kernel.authMiddleware());

// Zero-trust access control (after importing plugin)
const { hasAccess } = await kernel.access.check('admin-dashboard', userEmail, 'read');
await kernel.access.grant('admin-dashboard', 'bob@example.com', ['read', 'write'], currentUser);
await kernel.access.revoke('admin-dashboard', 'bob@example.com', currentUser);

// Express middleware for IAP-protected routes
app.get('/admin', kernel.access.requireAccess('admin-dashboard', 'read'), handler);
```

### File Operations

```typescript
// Signed URLs for client-side upload/download
const { uploadUrl } = await kernel.files.getUploadUrl('docs/file.pdf', 'application/pdf');
const { downloadUrl } = await kernel.files.getDownloadUrl('docs/file.pdf');

// List, delete, move
const { files } = await kernel.files.list({ prefix: 'docs/' });
await kernel.files.delete('docs/old.pdf');
await kernel.files.move('temp/file.pdf', 'docs/file.pdf');

// Direct storage (server-side)
const url = await uploadFile(bucket, 'path/to/file', buffer, { contentType: 'application/pdf' });
const data = await downloadFile(bucket, 'path/to/file');
```

### Events (Pub/Sub)

```typescript
// Publish events
await kernel.events.publish('document.ingested', { docId: '123', botId: 'abc' });

// Subscribe (containers)
const sub = await kernel.events.subscribe('document.*', (event) => {
  console.log('Event:', event.type, event.data);
});

// HTTP push (serverless)
await kernel.events.registerSubscription({
  pattern: 'document.ingested',
  endpoint: 'https://my-function.run.app/events',
  serviceName: 'embeddings-worker',
});
```

### Firestore

```typescript
const db = firestore();
const doc = await db.collection('bots').doc(botId).get();
await db.collection('conversations').add({ ... });
```

### Secrets

```typescript
import { requireSecret } from '@stacksolo/runtime';
const openaiKey = await requireSecret('OPENAI_API_KEY');
```

---

# RAG Platform Stack Plan

## Goal

Create the first StackSolo "Stack" - a complete RAG chatbot platform with:
- Chat widget + standalone page
- Admin dashboard (IAP zero-trust protected)
- Multi-bot support with different knowledge bases
- Extensible tool system (`createTool` helper)
- Flexible LLM backend (Vertex AI + BYOK)

## User Experience

```bash
stacksolo stack create rag-platform my-chatbot
cd my-chatbot
stacksolo deploy

# Result:
# - Chat at yourdomain.com/chat
# - Admin at yourdomain.com/admin (IAP protected)
# - API at yourdomain.com/api
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer (SSL)                   │
└────────┬─────────────────┬─────────────────┬────────────┘
         │                 │                 │
   /chat/*│          /api/*│          /admin/*│ (IAP)
         │                 │                 │
  ┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼──────┐
  │ Chat UI     │  │   RAG API     │  │   Admin UI  │
  │ + Widget    │  │               │  │             │
  └─────────────┘  └───────┬───────┘  └─────────────┘
                           │
                    ┌──────▼──────────────────┐
                    │      RAG Engine         │
                    │  - Tool Registry        │
                    │  - Vector Search        │
                    │  - LLM Router           │
                    │  - Conversation Mgr     │
                    └──────┬──────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
  ┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼───────┐
  │  Firestore  │  │ Vector Store  │  │   Kernel     │
  │ - Bots      │  │ (Firestore    │  │ - Files      │
  │ - Convos    │  │  vectors)     │  │ - Events     │
  │ - Docs meta │  │               │  │ - Access     │
  └─────────────┘  └───────────────┘  └──────────────┘
```

---

## Implementation (Using StackSolo Runtime)

### v0.1 - Simplest Working Chat (COMPLETE)
1. Stack structure - `stacks/rag-platform/` with manifest
2. Basic RAG API - `POST /api/chat` with Vertex AI Gemini
3. Simple Chat UI - React app, send/receive messages
4. Minimal infra config - Cloud Run + static UI

### v0.2 - Core Features

**Document Ingestion:**
```typescript
// POST /api/documents - Use kernel.files!
import { kernel, firestore } from '@stacksolo/runtime';

const { uploadUrl, path } = await kernel.files.getUploadUrl(
  `documents/${botId}/${filename}`,
  contentType
);

await firestore().collection('documents').add({
  botId, path, filename, status: 'pending', createdAt: new Date(),
});

// Publish for async embedding
await kernel.events.publish('document.uploaded', { docId, botId, path });
```

**Embedding Worker:**
```typescript
// Use kernel.events for subscription
await kernel.events.registerSubscription({
  pattern: 'document.uploaded',
  endpoint: `${process.env.SERVICE_URL}/events/embed`,
});

// Handler downloads via kernel.files
const { downloadUrl } = await kernel.files.getDownloadUrl(path);
const file = await fetch(downloadUrl);
const chunks = chunkDocument(file);
const embeddings = await generateEmbeddings(chunks);
await storeVectors(embeddings);
await kernel.events.publish('document.embedded', { docId });
```

**Vector Search (Firestore):**
```typescript
// Native Firestore vector search
const db = firestore();
const results = await db.collection('embeddings')
  .where('botId', '==', botId)
  .findNearest('embedding', queryVector, { limit: 5 });
```

### v0.3 - Multi-bot + Admin

**IAP Admin with kernel.access:**
```typescript
import '@stacksolo/plugin-zero-trust-auth/runtime';

// Protect all admin routes
app.use('/admin/api', kernel.access.requireAccess('admin-dashboard', 'read'));

// Grant access
app.post('/admin/api/invite',
  kernel.access.requireAccess('admin-dashboard', 'admin'),
  async (req, res) => {
    await kernel.access.grant('admin-dashboard', req.body.email, ['read'], req.user.email);
  }
);
```

**Authenticated Conversations:**
```typescript
// Use kernel.validateToken for auth
const user = await kernel.validateToken(token);
await firestore().collection('conversations').add({
  botId, userId: user.uid, userEmail: user.email, messages: [], createdAt: new Date(),
});
```

### v0.4 - Extensibility

**BYOK with secrets:**
```typescript
import { requireSecret } from '@stacksolo/runtime';
const openaiKey = await requireSecret('OPENAI_API_KEY');
```

---

## Config Example

```json
{
  "project": {
    "name": "rag-platform",
    "gcpProjectId": "{{gcpProjectId}}",
    "region": "{{region}}",
    "plugins": [
      "@stacksolo/plugin-gcp-cdktf",
      "@stacksolo/plugin-gcp-kernel",
      "@stacksolo/plugin-zero-trust"
    ],
    "gcpKernel": {
      "name": "kernel",
      "firebaseProjectId": "{{gcpProjectId}}"
    },
    "zeroTrustAuth": {
      "iapClientId": "{{iapClientId}}",
      "allowedUsers": ["{{adminEmail}}"]
    },
    "buckets": [
      { "name": "{{projectName}}-documents" }
    ],
    "networks": [{
      "name": "main",
      "containers": [
        {
          "name": "api",
          "port": 8080,
          "env": {
            "DOCUMENTS_BUCKET": "@bucket/{{projectName}}-documents.name"
          }
        },
        {
          "name": "admin",
          "port": 3000,
          "iap": true
        }
      ],
      "uis": [
        { "name": "chat", "framework": "react" }
      ],
      "loadBalancer": {
        "name": "gateway",
        "routes": [
          { "path": "/api/*", "backend": "api" },
          { "path": "/admin/*", "backend": "admin", "iap": true },
          { "path": "/*", "backend": "chat" }
        ]
      }
    }]
  }
}
```

Note: `KERNEL_URL` is automatically injected when `gcpKernel` is configured.

---

## Design Decisions

1. **Use `@stacksolo/runtime`** - Auth, files, events are already built
2. **Use `kernel.access`** - Zero-trust admin with IAP, no custom auth
3. **Use `kernel.files`** - Signed URLs for uploads, no direct GCS SDK
4. **Use `kernel.events`** - Pub/sub for async processing (embeddings)
5. **Use `firestore()`** - Auto-configured, works with emulator in dev
6. **Use `secrets`** - Store BYOK API keys in Secret Manager

---

## Key Files

| Path | Purpose |
|------|---------|
| `stacks/rag-platform/stack.json` | Stack manifest |
| `stacks/rag-platform/infrastructure/config.json` | StackSolo config |
| `stacks/rag-platform/services/api/` | RAG Engine API |
| `stacks/rag-platform/apps/chat/` | Chat UI |

---

## Bigger Vision: StackSolo Builder

**"Build AI apps visually. Own everything."**

Unlike Bolt/Bubble/Vercel:
- No vendor lock-in (your GCP, your code)
- No runtime fees (pay GCP directly, scales to zero)
- Full customization (fork, extend, modify anything)
- MCP-native (AI assistants help you build)

| Phase | Deliverable |
|-------|-------------|
| **Phase 1** | RAG Platform Stack (current) |
| **Phase 2** | StackSolo Builder MCP |
| **Phase 3** | Visual Builder Website |
| **Phase 4** | More stacks (auth, cms, analytics) |