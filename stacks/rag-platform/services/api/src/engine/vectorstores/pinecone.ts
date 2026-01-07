/**
 * Pinecone Vector Store Implementation
 *
 * Uses Pinecone's managed vector database.
 * Requires: pineconeApiKey, pineconeIndex
 */

import type { VectorStore, VectorDocument, VectorSearchResult, VectorStoreConfig } from './types';

export class PineconeVectorStore implements VectorStore {
  private apiKey: string;
  private indexHost: string;
  private namespace: string;

  constructor(config: VectorStoreConfig) {
    if (!config.pineconeApiKey) {
      throw new Error('Pinecone API key is required');
    }
    if (!config.pineconeIndex) {
      throw new Error('Pinecone index name is required');
    }

    this.apiKey = config.pineconeApiKey;
    this.indexHost = config.pineconeIndex; // Should be the full host URL
    this.namespace = config.pineconeNamespace || 'default';
  }

  private async request(endpoint: string, method: string, body?: unknown): Promise<unknown> {
    const response = await fetch(`${this.indexHost}${endpoint}`, {
      method,
      headers: {
        'Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinecone API error: ${error}`);
    }

    return response.json();
  }

  async upsert(vectors: VectorDocument[]): Promise<void> {
    const pineconeVectors = vectors.map((vec) => ({
      id: vec.id,
      values: vec.embedding,
      metadata: {
        botId: vec.botId,
        documentId: vec.documentId,
        content: vec.content,
        ...vec.metadata,
      },
    }));

    // Pinecone recommends batching upserts
    const batchSize = 100;
    for (let i = 0; i < pineconeVectors.length; i += batchSize) {
      const batch = pineconeVectors.slice(i, i + batchSize);
      await this.request('/vectors/upsert', 'POST', {
        vectors: batch,
        namespace: this.namespace,
      });
    }
  }

  async search(
    botId: string,
    queryEmbedding: number[],
    limit: number = 5
  ): Promise<VectorSearchResult[]> {
    const result = await this.request('/query', 'POST', {
      vector: queryEmbedding,
      topK: limit,
      namespace: this.namespace,
      filter: { botId: { $eq: botId } },
      includeMetadata: true,
    }) as { matches: Array<{ id: string; score: number; metadata: Record<string, unknown> }> };

    return (result.matches || []).map((match) => ({
      id: match.id,
      documentId: match.metadata.documentId as string,
      content: match.metadata.content as string,
      score: match.score,
      metadata: match.metadata,
    }));
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.request('/vectors/delete', 'POST', {
      namespace: this.namespace,
      filter: { documentId: { $eq: documentId } },
    });
  }

  async deleteByBotId(botId: string): Promise<void> {
    await this.request('/vectors/delete', 'POST', {
      namespace: this.namespace,
      filter: { botId: { $eq: botId } },
    });
  }
}
