import { firestore } from '@stacksolo/runtime';
import { FieldValue, VectorQuery, VectorQuerySnapshot } from '@google-cloud/firestore';

// Collections
const DOCUMENTS_COLLECTION = 'documents';
const CHUNKS_COLLECTION = 'chunks';

export interface Document {
  id: string;
  botId: string;
  filename: string;
  path: string;
  contentType: string;
  size: number;
  chunkCount: number;
  status: 'pending' | 'processing' | 'ready' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface Chunk {
  id: string;
  botId: string;
  documentId: string;
  content: string;
  embedding: number[];
  chunkIndex: number;
  tokenCount: number;
  createdAt: Date;
}

export interface SearchResult {
  chunk: Chunk;
  document: Document;
  score: number;
}

/**
 * Save document metadata
 */
export async function saveDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
  const db = firestore();
  const docRef = db.collection(DOCUMENTS_COLLECTION).doc();

  const document: Document = {
    ...doc,
    id: docRef.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await docRef.set({
    ...document,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return document;
}

/**
 * Update document status
 */
export async function updateDocumentStatus(
  documentId: string,
  status: Document['status'],
  updates?: Partial<Document>
): Promise<void> {
  const db = firestore();
  await db.collection(DOCUMENTS_COLLECTION).doc(documentId).update({
    status,
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Save document chunks with embeddings
 */
export async function saveChunks(
  botId: string,
  documentId: string,
  chunks: Array<{ content: string; embedding: number[]; tokenCount: number }>
): Promise<Chunk[]> {
  const db = firestore();
  const batch = db.batch();
  const savedChunks: Chunk[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkRef = db.collection(CHUNKS_COLLECTION).doc();
    const chunk: Chunk = {
      id: chunkRef.id,
      botId,
      documentId,
      content: chunks[i].content,
      embedding: chunks[i].embedding,
      chunkIndex: i,
      tokenCount: chunks[i].tokenCount,
      createdAt: new Date(),
    };

    batch.set(chunkRef, {
      ...chunk,
      // Store embedding as Firestore Vector for native vector search
      embedding: FieldValue.vector(chunks[i].embedding),
      createdAt: FieldValue.serverTimestamp(),
    });

    savedChunks.push(chunk);
  }

  await batch.commit();
  return savedChunks;
}

/**
 * Get document by ID
 */
export async function getDocument(id: string): Promise<Document | null> {
  const db = firestore();
  const doc = await db.collection(DOCUMENTS_COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data()!;
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Document;
}

/**
 * List documents (optionally by botId)
 */
export async function listDocuments(botId?: string): Promise<Document[]> {
  const db = firestore();
  let query = db.collection(DOCUMENTS_COLLECTION).orderBy('createdAt', 'desc');

  if (botId) {
    query = db
      .collection(DOCUMENTS_COLLECTION)
      .where('botId', '==', botId)
      .orderBy('createdAt', 'desc');
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Document;
  });
}

/**
 * Delete document and its chunks
 */
export async function deleteDocumentAndChunks(documentId: string): Promise<void> {
  const db = firestore();

  // Delete chunks
  const chunksSnapshot = await db
    .collection(CHUNKS_COLLECTION)
    .where('documentId', '==', documentId)
    .get();

  const batch = db.batch();
  chunksSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(db.collection(DOCUMENTS_COLLECTION).doc(documentId));

  await batch.commit();
}

/**
 * Search for similar chunks using Firestore native vector search
 */
export async function searchSimilarChunks(
  botId: string,
  queryEmbedding: number[],
  limit: number = 5
): Promise<SearchResult[]> {
  const db = firestore();

  // Use Firestore native vector search with bot filter
  const vectorQuery: VectorQuery = db
    .collection(CHUNKS_COLLECTION)
    .where('botId', '==', botId)
    .findNearest('embedding', queryEmbedding, {
      limit,
      distanceMeasure: 'COSINE',
    });

  const snapshot: VectorQuerySnapshot = await vectorQuery.get();

  const results: SearchResult[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const chunk: Chunk = {
      id: doc.id,
      botId: data.botId,
      documentId: data.documentId,
      content: data.content,
      embedding: [], // Don't return embedding in results
      chunkIndex: data.chunkIndex,
      tokenCount: data.tokenCount,
      createdAt: data.createdAt?.toDate() || new Date(),
    };

    // Get document info
    const document = await getDocument(chunk.documentId);
    if (document) {
      results.push({
        chunk,
        document,
        // Firestore returns distance, convert to similarity score
        // For COSINE: similarity = 1 - distance
        score: 1 - (doc.get('_distance') || 0),
      });
    }
  }

  return results;
}
