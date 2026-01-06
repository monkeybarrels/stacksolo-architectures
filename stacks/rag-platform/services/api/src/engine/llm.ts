import { VertexAI } from '@google-cloud/vertexai';

const PROJECT_ID = process.env.GCP_PROJECT_ID || '';
const LOCATION = process.env.GCP_REGION || 'us-central1';
const MODEL = 'gemini-1.5-flash';

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful AI assistant. Answer questions clearly and concisely.
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

export async function generateResponse(userMessage: string): Promise<string> {
  const vertex = getVertexAI();
  const model = vertex.getGenerativeModel({ model: MODEL });

  const chat = model.startChat({
    history: [],
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await chat.sendMessage(userMessage);
  const response = result.response;

  // Extract text from response
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response generated');
  }

  return text;
}