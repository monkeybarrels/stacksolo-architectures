import { VertexAI } from '@google-cloud/vertexai';

const PROJECT_ID = process.env.GCP_PROJECT_ID || '';
const LOCATION = process.env.GCP_REGION || 'us-central1';
const EMBEDDING_MODEL = 'text-embedding-004';

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

export interface EmbeddingResult {
  embedding: number[];
  tokenCount: number;
}

/**
 * Generate embeddings for text using Vertex AI
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const vertex = getVertexAI();
  const model = vertex.getGenerativeModel({ model: EMBEDDING_MODEL });

  // Vertex AI embedding via prediction
  const response = await model.embedContent(text);

  const embedding = response.embedding?.values;
  if (!embedding) {
    throw new Error('Failed to generate embedding');
  }

  return {
    embedding: embedding as number[],
    tokenCount: text.split(/\s+/).length, // Rough estimate
  };
}

/**
 * Generate embeddings for multiple texts (batched)
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  // Process in parallel with concurrency limit
  const results: EmbeddingResult[] = [];
  const batchSize = 5;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(generateEmbedding));
    results.push(...batchResults);
  }

  return results;
}

