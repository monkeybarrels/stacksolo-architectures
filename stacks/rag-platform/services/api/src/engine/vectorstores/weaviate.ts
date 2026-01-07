/**
 * Weaviate Vector Store Implementation
 *
 * Uses Weaviate's open-source vector database.
 * Requires: weaviateUrl, optional weaviateApiKey
 */

import type { VectorStore, VectorDocument, VectorSearchResult, VectorStoreConfig } from './types';

export class WeaviateVectorStore implements VectorStore {
  private url: string;
  private apiKey?: string;
  private className: string;

  constructor(config: VectorStoreConfig) {
    if (!config.weaviateUrl) {
      throw new Error('Weaviate URL is required');
    }

    this.url = config.weaviateUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.weaviateApiKey;
    this.className = config.weaviateClassName || 'RagChunk';
  }

  private async request(endpoint: string, method: string, body?: unknown): Promise<unknown> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.url}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Weaviate API error: ${error}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async upsert(vectors: VectorDocument[]): Promise<void> {
    // Weaviate batch import
    const objects = vectors.map((vec) => ({
      class: this.className,
      id: vec.id,
      vector: vec.embedding,
      properties: {
        botId: vec.botId,
        documentId: vec.documentId,
        content: vec.content,
        ...vec.metadata,
      },
    }));

    // Batch in groups of 100
    const batchSize = 100;
    for (let i = 0; i < objects.length; i += batchSize) {
      const batch = objects.slice(i, i + batchSize);
      await this.request('/v1/batch/objects', 'POST', { objects: batch });
    }
  }

  async search(
    botId: string,
    queryEmbedding: number[],
    limit: number = 5
  ): Promise<VectorSearchResult[]> {
    const graphql = {
      query: `{
        Get {
          ${this.className}(
            nearVector: { vector: ${JSON.stringify(queryEmbedding)} }
            where: {
              path: ["botId"]
              operator: Equal
              valueText: "${botId}"
            }
            limit: ${limit}
          ) {
            _additional {
              id
              distance
            }
            documentId
            content
          }
        }
      }`,
    };

    const result = await this.request('/v1/graphql', 'POST', graphql) as {
      data: { Get: { [key: string]: Array<{
        _additional: { id: string; distance: number };
        documentId: string;
        content: string;
      }> } };
    };

    const items = result.data?.Get?.[this.className] || [];

    return items.map((item) => ({
      id: item._additional.id,
      documentId: item.documentId,
      content: item.content,
      score: 1 - item._additional.distance, // Convert distance to similarity
    }));
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.request('/v1/batch/objects', 'DELETE', {
      match: {
        class: this.className,
        where: {
          path: ['documentId'],
          operator: 'Equal',
          valueText: documentId,
        },
      },
    });
  }

  async deleteByBotId(botId: string): Promise<void> {
    await this.request('/v1/batch/objects', 'DELETE', {
      match: {
        class: this.className,
        where: {
          path: ['botId'],
          operator: 'Equal',
          valueText: botId,
        },
      },
    });
  }
}
