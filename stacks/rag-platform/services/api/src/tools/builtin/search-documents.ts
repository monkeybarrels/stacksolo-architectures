/**
 * Built-in Tool: Search Documents
 *
 * Allows the LLM to explicitly search the knowledge base
 * when it needs more information.
 */

import { createTool } from '../create-tool';
import { generateEmbedding } from '../../engine/embeddings';
import { searchSimilarChunks } from '../../engine/vectorstore';

interface SearchParams {
  query: string;
  limit?: number;
}

interface SearchResultItem {
  filename: string;
  content: string;
  score: number;
}

export const searchDocumentsTool = createTool<SearchParams, SearchResultItem[]>({
  name: 'search_documents',
  description:
    'Search the knowledge base for relevant documents. Use this when you need to find specific information from uploaded documents.',
  parameters: {
    query: {
      type: 'string',
      description: 'The search query to find relevant documents',
      required: true,
    },
    limit: {
      type: 'number',
      description: 'Maximum number of results to return (default: 5)',
      required: false,
      default: 5,
    },
  },
  handler: async ({ query, limit = 5 }, context) => {
    const embedding = await generateEmbedding(query);
    const results = await searchSimilarChunks(context.botId, embedding.embedding, limit);

    return results.map((r) => ({
      filename: r.document.filename,
      content: r.chunk.content,
      score: Math.round(r.score * 100) / 100,
    }));
  },
});
