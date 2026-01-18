/**
 * AI Chat API
 *
 * Streaming chat endpoint using Vertex AI (Gemini).
 * Returns Server-Sent Events for real-time response streaming.
 */

import * as functions from '@google-cloud/functions-framework';
import express from 'express';
import { streamChat, type Message } from './gemini';

const app = express();
app.use(express.json());

interface ChatRequest {
  message: string;
  history?: Message[];
  systemPrompt?: string;
}

/**
 * POST /chat - Stream a chat response
 */
app.post('/chat', async (req, res) => {
  const { message, history = [], systemPrompt } = req.body as ChatRequest;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    for await (const chunk of streamChat(message, history, systemPrompt)) {
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat error:', error);

    // If headers already sent, try to send error via SSE
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Chat failed' })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: 'Chat failed' });
    }
  }
});

/**
 * Health check
 */
app.get('/chat/health', (_req, res) => {
  res.json({ status: 'ok' });
});

functions.http('chat', app);
