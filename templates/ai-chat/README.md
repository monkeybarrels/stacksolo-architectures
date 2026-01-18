# AI Chat Template

AI-powered chat application with Vertex AI (Gemini), streaming responses, and conversation history.

## Features

- **Vertex AI Integration** - Uses Gemini 1.5 Flash for fast responses
- **Streaming Responses** - Real-time token streaming via Server-Sent Events
- **Conversation History** - Persisted in Firestore per user
- **Firebase Auth** - Email/password and Google sign-in
- **Markdown Rendering** - Code blocks, lists, and formatting
- **Mobile Responsive** - Works on all screen sizes

## Quick Start

```bash
# Create project
stacksolo init --template ai-chat

# Install dependencies
cd my-chat-app
npm install

# Start Firebase emulators + dev server
firebase emulators:start --only auth,firestore &
npm run dev
```

## Project Structure

```
├── apps/web/                    # Vue 3 frontend
│   └── src/
│       ├── components/
│       │   ├── ChatMessage.vue  # Message bubble with markdown
│       │   ├── ChatInput.vue    # Message input with send button
│       │   └── ConversationList.vue
│       ├── composables/
│       │   ├── useAuth.ts
│       │   └── useChat.ts       # Chat state and streaming
│       ├── stores/
│       │   ├── auth.ts
│       │   └── chat.ts
│       ├── pages/
│       │   ├── Chat.vue         # Main chat interface
│       │   └── Login.vue
│       └── lib/
│           ├── firebase.ts
│           └── api.ts
│
├── functions/api/               # Express API
│   └── src/
│       ├── services/
│       │   └── gemini.service.ts  # Vertex AI integration
│       ├── routes/
│       │   ├── chat.ts          # Chat endpoints
│       │   └── conversations.ts # History management
│       └── index.ts
│
└── stacksolo.config.json
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | No | Health check |
| POST | /api/chat | Yes | Send message (streaming SSE response) |
| GET | /api/conversations | Yes | List user's conversations |
| GET | /api/conversations/:id | Yes | Get conversation messages |
| DELETE | /api/conversations/:id | Yes | Delete conversation |

## Chat Flow

1. User sends message via `POST /api/chat`
2. API adds message to Firestore conversation
3. API calls Vertex AI with conversation context
4. Response streams back as Server-Sent Events
5. Frontend renders tokens in real-time
6. Final message saved to Firestore

## Customization

### Change AI Model

Edit `services/gemini.service.ts`:
```typescript
const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-pro',  // or 'gemini-1.5-flash'
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.7,
  },
});
```

### Add System Prompt

```typescript
const chat = model.startChat({
  history: messages,
  systemInstruction: {
    role: 'system',
    parts: [{ text: 'You are a helpful assistant...' }],
  },
});
```

### Add File Uploads

The Gemini API supports images and documents. Add multipart form handling to accept files.

## Deployment

```bash
stacksolo deploy
```

This creates:
- Cloud Functions API with Vertex AI access
- Cloud Storage for frontend
- Load balancer with SSL
- Firestore for conversation history

## Environment Variables

For local development, create `apps/web/.env.local`:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## Costs

- **Vertex AI**: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens (Gemini 1.5 Flash)
- **Cloud Functions**: Pay per invocation
- **Firestore**: Pay per read/write
