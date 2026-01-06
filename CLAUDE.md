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
  │  Firestore  │  │ Vector Store  │  │Cloud Storage │
  │ - Bots      │  │ (pluggable)   │  │ - Documents  │
  │ - Convos    │  │               │  │              │
  │ - Access    │  │               │  │              │
  └─────────────┘  └───────────────┘  └──────────────┘
```

---

## Implementation Order (Minimal Vertical Slice)

### v0.1 - Simplest Working Chat (COMPLETE)
1. Stack structure - `stacks/rag-platform/` with manifest
2. Basic RAG API - `POST /api/chat` with Vertex AI Gemini
3. Simple Chat UI - React app, send/receive messages
4. Minimal infra config - Cloud Run + static UI

### v0.2 - Core Features
5. Document ingestion - `POST /api/documents` with Cloud Storage + embeddings
6. Vector search - Firestore vector store, RAG retrieval
7. Streaming responses - SSE for real-time chat
8. Source citations - Show which docs answered

### v0.3 - Multi-bot + Admin
9. Bot CRUD - Multiple bots with different knowledge bases
10. Admin Dashboard - Bot management, document upload (file drop zone)
11. IAP protection - Zero-trust admin access
12. Conversation history - Per-user, per-bot

### v0.4 - Extensibility
13. Tool system SDK - `createTool` helper + registry
14. LLM router - OpenAI/Anthropic BYOK options
15. Widget embed - `widget.js` for drop-in integration
16. Stack CLI commands - `stacksolo stack create`, `stack list`

### v0.5 - Polish
17. Vector store abstraction - pgvector/Pinecone options
18. Feedback system - Thumbs up/down
19. `stack add-tool` scaffold - Generate tool boilerplate

---

## Key Files

### Stack Structure
| Path | Purpose |
|------|---------|
| `stacks/rag-platform/stack.json` | Stack manifest |
| `stacks/rag-platform/infrastructure/config.json` | StackSolo config |
| `stacks/rag-platform/services/api/` | RAG Engine API |
| `stacks/rag-platform/apps/chat/` | Chat UI |

### API Routes (planned)
| Endpoint | Description |
|----------|-------------|
| `POST /api/chat` | Send message, get response |
| `POST /api/documents` | Ingest document |
| `GET /api/documents` | List documents |
| `DELETE /api/documents/:id` | Delete document |
| `GET /api/bots` | List bots |
| `POST /api/bots` | Create bot |
| `GET /api/conversations` | List conversations |

### Tool System (planned)
```typescript
import { createTool } from '@rag-platform/sdk';

export const myTool = createTool({
  name: 'my_tool',
  description: 'What this tool does',
  parameters: {
    query: { type: 'string', required: true },
  },
  handler: async ({ query }, context) => {
    return `Result for: ${query}`;
  },
});
```

---

## Design Decisions

1. **Stacks in architectures repo** - Keeps all patterns in one place
2. **Tool system is SDK-first** - `createTool` makes extension dead simple
3. **Vector store abstraction** - Start with Firestore, swap later
4. **IAP for admin** - Zero-trust built-in, no custom auth needed
5. **Widget.js for embedding** - Drop-in integration for any site
6. **Streaming responses** - SSE for real-time chat experience

---

## Bigger Vision: StackSolo Builder

The RAG Platform Stack proves a larger model:

**"Build AI apps visually. Own everything."**

Unlike Bolt/Bubble/Vercel:
- No vendor lock-in (your GCP, your code)
- No runtime fees (pay GCP directly, scales to zero)
- Full customization (fork, extend, modify anything)
- MCP-native (AI assistants help you build)

### Roadmap

| Phase | Deliverable |
|-------|-------------|
| **Phase 1** | RAG Platform Stack (current) |
| **Phase 2** | StackSolo Builder MCP |
| **Phase 3** | Visual Builder Website |
| **Phase 4** | More stacks (auth, cms, analytics) |