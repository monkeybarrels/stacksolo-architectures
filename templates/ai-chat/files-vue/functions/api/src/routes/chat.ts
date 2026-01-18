/**
 * Chat Routes
 * Handles chat messages with streaming responses
 */

import { Router } from 'express';
import { kernel } from '@stacksolo/runtime';
import { streamChat, type ChatMessage } from '../services/gemini.service';
import {
  createConversation,
  getConversation,
  addMessage,
} from '../services/firestore.service';

const router = Router();

// Default system prompt
const SYSTEM_PROMPT = `You are a helpful AI assistant. You provide clear, accurate, and helpful responses.
When appropriate, use markdown formatting for better readability:
- Use code blocks for code snippets
- Use bullet points for lists
- Use headers for organizing long responses
Be concise but thorough.`;

/**
 * POST /api/chat
 * Send a message and receive a streaming response
 */
router.post('/', kernel.authMiddleware(), async (req, res) => {
  const userId = req.user!.uid;
  const { message, conversationId, systemPrompt } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let convId = conversationId;
    let messages: ChatMessage[] = [];

    // Get or create conversation
    if (convId) {
      const conversation = await getConversation(convId, userId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      messages = conversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
    } else {
      convId = await createConversation(userId, message);
    }

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: message };
    messages.push(userMessage);

    // Save user message to Firestore
    await addMessage(convId, userId, { role: 'user', content: message });

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Conversation-Id', convId);

    // Stream the response
    let fullResponse = '';

    try {
      for await (const chunk of streamChat(messages, systemPrompt || SYSTEM_PROMPT)) {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      }

      // Save assistant message to Firestore
      await addMessage(convId, userId, { role: 'model', content: fullResponse });

      // Send completion event
      res.write(`data: ${JSON.stringify({ type: 'done', conversationId: convId })}\n\n`);
    } catch (streamError: any) {
      console.error('Stream error:', streamError);
      res.write(`data: ${JSON.stringify({ type: 'error', error: streamError.message })}\n\n`);
    }

    res.end();
  } catch (error: any) {
    console.error('Chat error:', error);

    // If headers haven't been sent, send JSON error
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }

    // Otherwise send SSE error
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

/**
 * POST /api/chat/simple
 * Non-streaming chat endpoint (for simpler integrations)
 */
router.post('/simple', kernel.authMiddleware(), async (req, res) => {
  const userId = req.user!.uid;
  const { message, conversationId, systemPrompt } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let convId = conversationId;
    let messages: ChatMessage[] = [];

    if (convId) {
      const conversation = await getConversation(convId, userId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      messages = conversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
    } else {
      convId = await createConversation(userId, message);
    }

    // Add user message
    messages.push({ role: 'user', content: message });
    await addMessage(convId, userId, { role: 'user', content: message });

    // Collect full response
    let fullResponse = '';
    for await (const chunk of streamChat(messages, systemPrompt || SYSTEM_PROMPT)) {
      fullResponse += chunk;
    }

    // Save response
    await addMessage(convId, userId, { role: 'model', content: fullResponse });

    res.json({
      conversationId: convId,
      response: fullResponse,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
