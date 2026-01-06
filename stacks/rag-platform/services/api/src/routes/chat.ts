import { Router, Response } from 'express';
import {
  generateResponse,
  generateRAGResponse,
  generateRAGResponseStream,
  generateResponseStream,
} from '../engine/llm';
import { generateEmbedding } from '../engine/embeddings';
import { searchSimilarChunks, type SearchResult } from '../engine/vectorstore';

export const chatRouter = Router();

interface ChatRequest {
  message: string;
  conversationId?: string;
  stream?: boolean; // Enable streaming
  useRAG?: boolean; // Enable RAG retrieval (default: true if documents exist)
}

interface Source {
  documentId: string;
  filename: string;
  content: string;
  score: number;
}

interface ChatResponse {
  response: string;
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

// POST /api/chat - Send a message and get AI response
chatRouter.post('/chat', async (req, res) => {
  try {
    const { message, conversationId, stream = false, useRAG = true } = req.body as ChatRequest;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const convId = conversationId || crypto.randomUUID();

    // Search for relevant documents if RAG is enabled
    let sources: SearchResult[] = [];
    if (useRAG) {
      try {
        const queryEmbedding = await generateEmbedding(message);
        sources = await searchSimilarChunks(queryEmbedding.embedding, 5);
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
      sendSSE(res, 'start', { conversationId: convId });

      // Stream the response
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
      conversationId: convId,
    };

    // Include sources if RAG was used
    if (hasContext) {
      result.sources = formatSources(sources);
    }

    res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// GET /api/chat/stream - SSE endpoint for streaming (alternative to POST with stream=true)
chatRouter.get('/chat/stream', async (req, res) => {
  const message = req.query.message as string;
  const conversationId = (req.query.conversationId as string) || crypto.randomUUID();
  const useRAG = req.query.useRAG !== 'false';

  if (!message) {
    return res.status(400).json({ error: 'Message query parameter is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Search for relevant documents if RAG is enabled
    let sources: SearchResult[] = [];
    if (useRAG) {
      try {
        const queryEmbedding = await generateEmbedding(message);
        sources = await searchSimilarChunks(queryEmbedding.embedding, 5);
      } catch (searchError) {
        console.warn('RAG search failed:', searchError);
      }
    }

    const hasContext = sources.length > 0;

    // Send sources first
    if (hasContext) {
      sendSSE(res, 'sources', { sources: formatSources(sources) });
    }

    sendSSE(res, 'start', { conversationId });

    const generator = hasContext
      ? generateRAGResponseStream(message, { sources })
      : generateResponseStream(message);

    for await (const chunk of generator) {
      sendSSE(res, 'chunk', { text: chunk });
    }

    sendSSE(res, 'done', { conversationId });
  } catch (error) {
    console.error('Stream error:', error);
    sendSSE(res, 'error', { error: 'Failed to generate response' });
  }

  res.end();
});

// GET /api/health - API health check
chatRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'rag-platform-api' });
});