import { VertexAI } from '@google-cloud/vertexai';
import type { SearchResult } from './vectorstore';

const PROJECT_ID = process.env.GCP_PROJECT_ID || '';
const LOCATION = process.env.GCP_REGION || 'us-central1';
const MODEL = 'gemini-1.5-flash';

// System prompt for the chatbot (without RAG context)
const BASE_SYSTEM_PROMPT = `You are a helpful AI assistant. Answer questions clearly and concisely.
If you don't know something, say so. Be friendly and professional.`;

let vertexAI: VertexAI | null = null;

function getVertexAI(): VertexAI {
  if (!vertexAI) {
    if (!PROJECT_ID) {
      throw new Error('GCP_PROJECT_ID environment variable is required');
    }
    vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
  }
  return vertexAI;
}

export interface RAGContext {
  sources: SearchResult[];
}

/**
 * Format search results into context for the LLM
 */
function formatContext(sources: SearchResult[]): string {
  return sources
    .map((result, i) => {
      return `[Source ${i + 1}: ${result.document.filename}]\n${result.chunk.content}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Generate response without RAG context
 */
export async function generateResponse(userMessage: string, customSystemPrompt?: string): Promise<string> {
  const vertex = getVertexAI();
  const model = vertex.getGenerativeModel({ model: MODEL });

  const chat = model.startChat({
    history: [],
    systemInstruction: customSystemPrompt || BASE_SYSTEM_PROMPT,
  });

  const result = await chat.sendMessage(userMessage);
  const response = result.response;

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response generated');
  }

  return text;
}

/**
 * Build RAG system prompt with context
 */
function buildRAGPrompt(basePrompt: string, context: string): string {
  return `${basePrompt}

CONTEXT FROM DOCUMENTS:
${context}

---
Answer the user's question based on the above context. If the context doesn't contain enough information, say so clearly.`;
}

/**
 * Generate response with RAG context
 */
export async function generateRAGResponse(
  userMessage: string,
  context: RAGContext,
  customSystemPrompt?: string
): Promise<string> {
  const vertex = getVertexAI();
  const model = vertex.getGenerativeModel({ model: MODEL });

  const contextText = formatContext(context.sources);
  const basePrompt = customSystemPrompt || BASE_SYSTEM_PROMPT;
  const systemPrompt = buildRAGPrompt(basePrompt, contextText);

  const chat = model.startChat({
    history: [],
    systemInstruction: systemPrompt,
  });

  const result = await chat.sendMessage(userMessage);
  const response = result.response;

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response generated');
  }

  return text;
}

/**
 * Generate streaming response with RAG context
 */
export async function* generateRAGResponseStream(
  userMessage: string,
  context: RAGContext,
  customSystemPrompt?: string
): AsyncGenerator<string, void, unknown> {
  const vertex = getVertexAI();
  const model = vertex.getGenerativeModel({ model: MODEL });

  const contextText = formatContext(context.sources);
  const basePrompt = customSystemPrompt || BASE_SYSTEM_PROMPT;
  const systemPrompt = buildRAGPrompt(basePrompt, contextText);

  const chat = model.startChat({
    history: [],
    systemInstruction: systemPrompt,
  });

  const streamingResult = await chat.sendMessageStream(userMessage);

  for await (const chunk of streamingResult.stream) {
    const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      yield text;
    }
  }
}

/**
 * Generate streaming response without RAG context
 */
export async function* generateResponseStream(
  userMessage: string,
  customSystemPrompt?: string
): AsyncGenerator<string, void, unknown> {
  const vertex = getVertexAI();
  const model = vertex.getGenerativeModel({ model: MODEL });

  const chat = model.startChat({
    history: [],
    systemInstruction: customSystemPrompt || BASE_SYSTEM_PROMPT,
  });

  const streamingResult = await chat.sendMessageStream(userMessage);

  for await (const chunk of streamingResult.stream) {
    const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      yield text;
    }
  }
}