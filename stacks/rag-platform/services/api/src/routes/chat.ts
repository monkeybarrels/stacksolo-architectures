import { Router, Response } from 'express';
import { kernel } from '@stacksolo/runtime';
import {
  generateResponse,
  generateRAGResponse,
  generateRAGResponseStream,
  generateResponseStream,
} from '../engine/llm';
import { generateEmbedding } from '../engine/embeddings';
import { searchSimilarChunks, type SearchResult } from '../engine/vectorstore';
import { getBot } from '../engine/bots';
import {
  createConversation,
  getConversation,
  listConversations,
  addMessage,
  updateConversationTitle,
} from '../engine/conversations';

export const chatRouter = Router();

interface ChatRequest {
  message: string;
  botId: string;
  conversationId?: string;
  stream?: boolean;
  useRAG?: boolean;
}

interface Source {
  documentId: string;
  filename: string;
  content: string;
  score: number;
}

interface ChatResponse {
  response: string;
  botId: string;
  conversationId: string;
  sources?: Source[];
}

/**
 * Format search results as sources for the response
 */
function formatSources(results: SearchResult[]): Source[] {
  return results.map((r) => ({
    documentId: r.document.id,
    filename: r.document.filename,
    content: r.chunk.content.slice(0, 200) + (r.chunk.content.length > 200 ? '...' : ''),
    score: Math.round(r.score * 100) / 100,
  }));
}

/**
 * Send SSE event
 */
function sendSSE(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Get user info from auth header
 */
async function getUserFromAuth(authHeader?: string): Promise<{ userId: string; email?: string }> {
  if (authHeader) {
    try {
      const result = await kernel.validateToken(authHeader);
      if (result.valid) {
        return { userId: result.uid, email: result.email };
      }
    } catch {
      // Fall through to anonymous
    }
  }
  return { userId: 'anonymous' };
}

// POST /api/bots/:botId/chat - Send a message to a specific bot
chatRouter.post('/bots/:botId/chat', async (req, res) => {
  try {
    const { botId } = req.params;
    const { message, conversationId, stream = false, useRAG = true } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify bot exists
    const bot = await getBot(botId);
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Get user info
    const user = await getUserFromAuth(req.headers.authorization);

    // Get or create conversation
    let conversation = conversationId ? await getConversation(conversationId) : null;
    if (!conversation) {
      conversation = await createConversation(botId, user.userId, user.email);
    }

    // Save user message
    await addMessage(conversation.id, { role: 'user', content: message });

    // Auto-generate title from first message
    if (conversation.messages.length === 0) {
      const title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
      await updateConversationTitle(conversation.id, title);
    }

    // Search for relevant documents if RAG is enabled
    let sources: SearchResult[] = [];
    if (useRAG) {
      try {
        const queryEmbedding = await generateEmbedding(message);
        sources = await searchSimilarChunks(botId, queryEmbedding.embedding, 5);
      } catch (searchError) {
        console.warn('RAG search failed, falling back to non-RAG:', searchError);
      }
    }

    const hasContext = sources.length > 0;

    // Handle streaming response
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Send sources first if we have them
      if (hasContext) {
        sendSSE(res, 'sources', { sources: formatSources(sources) });
      }

      // Send conversation ID
      sendSSE(res, 'start', { conversationId: conversation.id, botId });

      // Stream the response
      const generator = hasContext
        ? generateRAGResponseStream(message, { sources }, bot.systemPrompt)
        : generateResponseStream(message, bot.systemPrompt);

      let fullResponse = '';
      for await (const chunk of generator) {
        fullResponse += chunk;
        sendSSE(res, 'chunk', { text: chunk });
      }

      // Save assistant response
      await addMessage(conversation.id, {
        role: 'assistant',
        content: fullResponse,
        sources: hasContext ? formatSources(sources) : undefined,
      });

      sendSSE(res, 'done', { conversationId: conversation.id });
      res.end();
      return;
    }

    // Non-streaming response
    const response = hasContext
      ? await generateRAGResponse(message, { sources }, bot.systemPrompt)
      : await generateResponse(message, bot.systemPrompt);

    // Save assistant response
    await addMessage(conversation.id, {
      role: 'assistant',
      content: response,
      sources: hasContext ? formatSources(sources) : undefined,
    });

    const result: ChatResponse = {
      response,
      botId,
      conversationId: conversation.id,
    };

    if (hasContext) {
      result.sources = formatSources(sources);
    }

    res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// GET /api/bots/:botId/conversations - List conversations for a bot
chatRouter.get('/bots/:botId/conversations', async (req, res) => {
  try {
    const { botId } = req.params;

    const bot = await getBot(botId);
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const user = await getUserFromAuth(req.headers.authorization);
    const conversations = await listConversations(botId, user.userId);

    res.json({ conversations });
  } catch (error) {
    console.error('List conversations error:', error);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
});

// GET /api/conversations/:id - Get conversation by ID
chatRouter.get('/conversations/:id', async (req, res) => {
  try {
    const conversation = await getConversation(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Legacy endpoint - POST /api/chat (backward compatible, uses default bot)
chatRouter.post('/chat', async (req, res) => {
  try {
    const { message, botId, conversationId, stream = false, useRAG = true } = req.body as ChatRequest;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // If botId provided, redirect to bot-specific endpoint logic
    if (botId) {
      req.params.botId = botId;
      // Forward to bot-specific handler (simplified for now)
    }

    const convId = conversationId || crypto.randomUUID();

    // For legacy endpoint without botId, search all chunks (not recommended)
    let sources: SearchResult[] = [];
    if (useRAG && botId) {
      try {
        const queryEmbedding = await generateEmbedding(message);
        sources = await searchSimilarChunks(botId, queryEmbedding.embedding, 5);
      } catch (searchError) {
        console.warn('RAG search failed, falling back to non-RAG:', searchError);
      }
    }

    const hasContext = sources.length > 0;

    // Handle streaming response
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (hasContext) {
        sendSSE(res, 'sources', { sources: formatSources(sources) });
      }

      sendSSE(res, 'start', { conversationId: convId });

      const generator = hasContext
        ? generateRAGResponseStream(message, { sources })
        : generateResponseStream(message);

      for await (const chunk of generator) {
        sendSSE(res, 'chunk', { text: chunk });
      }

      sendSSE(res, 'done', { conversationId: convId });
      res.end();
      return;
    }

    // Non-streaming response
    const response = hasContext
      ? await generateRAGResponse(message, { sources })
      : await generateResponse(message);

    const result: ChatResponse = {
      response,
      botId: botId || '',
      conversationId: convId,
    };

    if (hasContext) {
      result.sources = formatSources(sources);
    }

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
