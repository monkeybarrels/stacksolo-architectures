/**
 * Vector Store Abstraction Types
 *
 * Defines a common interface for vector storage backends.
 */

export interface VectorDocument {
  id: string;
  botId: string;
  documentId: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}

export interface VectorSearchResult {
  id: string;
  documentId: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface VectorStoreConfig {
  type: 'firestore' | 'pinecone' | 'weaviate';
  // Pinecone config
  pineconeApiKey?: string;
  pineconeIndex?: string;
  pineconeNamespace?: string;
  // Weaviate config
  weaviateUrl?: string;
  weaviateApiKey?: string;
  weaviateClassName?: string;
}

export interface VectorStore {
  /**
   * Store vectors for a document's chunks
   */
  upsert(vectors: VectorDocument[]): Promise<void>;

  /**
   * Search for similar vectors
   */
  search(
    botId: string,
    queryEmbedding: number[],
    limit?: number
  ): Promise<VectorSearchResult[]>;

  /**
   * Delete vectors for a document
   */
  deleteByDocumentId(documentId: string): Promise<void>;

  /**
   * Delete all vectors for a bot
   */
  deleteByBotId(botId: string): Promise<void>;
}
