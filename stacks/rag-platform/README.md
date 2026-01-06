# RAG Platform Stack

AI-powered chatbot platform with knowledge base, admin dashboard, and extensible tools.

## What You Get

- **Chat Interface** - Clean, responsive chat UI at `/`
- **RAG API** - REST API for chat at `/api/chat`
- **Vertex AI** - Powered by Gemini 1.5 Flash

## Quick Start

### 1. Copy the stack to your project

```bash
# Create a new directory
mkdir my-chatbot && cd my-chatbot

# Copy the stack files
cp -r path/to/stacks/rag-platform/* .
```

### 2. Configure

Edit `infrastructure/config.json` and replace:
- `{{projectName}}` with your project name
- `{{gcpProjectId}}` with your GCP project ID
- `{{region}}` with your preferred region (default: us-central1)

### 3. Install dependencies

```bash
# API
cd services/api && npm install && cd ../..

# Chat UI
cd apps/chat && npm install && cd ../..
```

### 4. Local Development

```bash
# Terminal 1: Run API
cd services/api && npm run dev

# Terminal 2: Run Chat UI
cd apps/chat && npm run dev
```

Open http://localhost:5173 to chat.

### 5. Deploy

```bash
# Build
cd services/api && npm run build && cd ../..
cd apps/chat && npm run build && cd ../..

# Deploy with StackSolo
stacksolo deploy
```

## API Reference

### POST /api/chat

Send a message and get an AI response.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "conversationId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "response": "I'm doing well, thank you for asking!",
  "conversationId": "abc123"
}
```

## Coming Soon

- Document ingestion & RAG retrieval
- Multi-bot support
- Admin dashboard (IAP protected)
- Custom tool system
- OpenAI/Anthropic BYOK