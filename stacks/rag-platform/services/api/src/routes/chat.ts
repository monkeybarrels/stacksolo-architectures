import { Router } from 'express';
import { generateResponse } from '../engine/llm';

export const chatRouter = Router();

interface ChatRequest {
  message: string;
  conversationId?: string;
}

interface ChatResponse {
  response: string;
  conversationId: string;
}

// POST /api/chat - Send a message and get AI response
chatRouter.post('/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body as ChatRequest;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate conversation ID if not provided
    const convId = conversationId || crypto.randomUUID();

    // Get response from LLM
    const response = await generateResponse(message);

    const result: ChatResponse = {
      response,
      conversationId: convId,
    };

    res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// GET /api/health - API health check
chatRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'rag-platform-api' });
});