# AI Chat API

Streaming chat endpoint using Vertex AI (Gemini) with Server-Sent Events.

## Usage

```bash
stacksolo add chat-api
```

## What's Included

- `functions/chat/src/index.ts` - SSE streaming chat endpoint
- `functions/chat/src/gemini.ts` - Vertex AI service wrapper

## Endpoint

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /chat | Optional | Stream chat response (SSE) |

## Request

```json
{
  "message": "What is the capital of France?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

## Response (SSE)

```
data: {"type": "chunk", "content": "The capital"}
data: {"type": "chunk", "content": " of France"}
data: {"type": "chunk", "content": " is Paris."}
data: {"type": "done"}
```

## Frontend Usage

```typescript
async function* streamChat(message: string, history: Message[]) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        yield JSON.parse(line.slice(6));
      }
    }
  }
}
```

## Customization

### Change Model

Edit `gemini.ts`:
```typescript
const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-pro',  // or gemini-1.5-flash
});
```

### Add System Prompt

```typescript
const chat = model.startChat({
  history,
  systemInstruction: {
    role: 'system',
    parts: [{ text: 'You are a helpful assistant for...' }],
  },
});
```

### Add Auth

Import and use the auth middleware from firebase-auth-api:
```typescript
app.use(kernel.authMiddleware());
```
