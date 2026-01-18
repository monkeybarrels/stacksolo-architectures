/**
 * Gemini AI Service
 * Handles Vertex AI interactions with streaming support
 */

import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import type { Content, Part } from '@google-cloud/vertexai';

const projectId = process.env.GCP_PROJECT_ID || '';
const location = process.env.GCP_REGION || 'us-central1';

// Initialize Vertex AI
const vertexAI = new VertexAI({ project: projectId, location });

// Get the generative model
const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    maxOutputTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp?: Date;
}

/**
 * Convert our message format to Vertex AI format
 */
function toVertexContent(messages: ChatMessage[]): Content[] {
  return messages.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }] as Part[],
  }));
}

/**
 * Generate a streaming response from Gemini
 */
export async function* streamChat(
  messages: ChatMessage[],
  systemPrompt?: string
): AsyncGenerator<string, void, unknown> {
  const history = toVertexContent(messages.slice(0, -1));
  const lastMessage = messages[messages.length - 1];

  const chat = model.startChat({
    history,
    systemInstruction: systemPrompt
      ? { role: 'system' as const, parts: [{ text: systemPrompt }] }
      : undefined,
  });

  const result = await chat.sendMessageStream(lastMessage.content);

  for await (const chunk of result.stream) {
    const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      yield text;
    }
  }
}

/**
 * Generate a non-streaming response from Gemini
 */
export async function generateResponse(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<string> {
  const history = toVertexContent(messages.slice(0, -1));
  const lastMessage = messages[messages.length - 1];

  const chat = model.startChat({
    history,
    systemInstruction: systemPrompt
      ? { role: 'system' as const, parts: [{ text: systemPrompt }] }
      : undefined,
  });

  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;

  return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Count tokens in a message (approximate)
 */
export async function countTokens(text: string): Promise<number> {
  const result = await model.countTokens(text);
  return result.totalTokens;
}
