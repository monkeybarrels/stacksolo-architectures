/**
 * Vector Store Factory
 *
 * Creates the appropriate vector store based on configuration.
 */

import type { VectorStore, VectorStoreConfig } from './types';
import { FirestoreVectorStore } from './firestore';
import { PineconeVectorStore } from './pinecone';
import { WeaviateVectorStore } from './weaviate';

export * from './types';
export { FirestoreVectorStore } from './firestore';
export { PineconeVectorStore } from './pinecone';
export { WeaviateVectorStore } from './weaviate';

// Default to Firestore
let defaultVectorStore: VectorStore | null = null;

/**
 * Create a vector store from configuration
 */
export function createVectorStore(config: VectorStoreConfig): VectorStore {
  switch (config.type) {
    case 'pinecone':
      return new PineconeVectorStore(config);
    case 'weaviate':
      return new WeaviateVectorStore(config);
    case 'firestore':
    default:
      return new FirestoreVectorStore();
  }
}

/**
 * Get the default vector store (Firestore)
 */
export function getDefaultVectorStore(): VectorStore {
  if (!defaultVectorStore) {
    defaultVectorStore = new FirestoreVectorStore();
  }
  return defaultVectorStore;
}

/**
 * Create vector store from environment variables
 */
export function createVectorStoreFromEnv(): VectorStore {
  const type = process.env.VECTOR_STORE_TYPE as VectorStoreConfig['type'] || 'firestore';

  const config: VectorStoreConfig = {
    type,
    // Pinecone
    pineconeApiKey: process.env.PINECONE_API_KEY,
    pineconeIndex: process.env.PINECONE_INDEX,
    pineconeNamespace: process.env.PINECONE_NAMESPACE,
    // Weaviate
    weaviateUrl: process.env.WEAVIATE_URL,
    weaviateApiKey: process.env.WEAVIATE_API_KEY,
    weaviateClassName: process.env.WEAVIATE_CLASS_NAME,
  };

  return createVectorStore(config);
}
