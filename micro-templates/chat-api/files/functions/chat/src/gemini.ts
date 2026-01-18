/**
 * Gemini Service
 *
 * Vertex AI Gemini wrapper for streaming chat.
 */

import { VertexAI, type Content } from '@google-cloud/vertexai';

const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID || '';
const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

const vertexAI = new VertexAI({ project: projectId, location });

const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  // Uncomment for more capable model:
  // model: 'gemini-1.5-pro',
});

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Convert our message format to Vertex AI format
 */
function toVertexHistory(messages: Message[]): Content[] {
  return messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
}

/**
 * Stream a chat response
 */
export async function* streamChat(
  message: string,
  history: Message[] = [],
  systemPrompt?: string
): AsyncGenerator<string> {
  const chat = model.startChat({
    history: toVertexHistory(history),
    ...(systemPrompt && {
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemPrompt }],
      },
    }),
  });

  const result = await chat.sendMessageStream(message);

  for await (const chunk of result.stream) {
    const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      yield text;
    }
  }
}
