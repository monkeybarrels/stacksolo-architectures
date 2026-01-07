/**
 * Firestore Vector Store Implementation
 *
 * Uses Firestore's native vector search capability.
 */

import { firestore } from '@stacksolo/runtime';
import { FieldValue, VectorQuery, VectorQuerySnapshot } from '@google-cloud/firestore';
import type { VectorStore, VectorDocument, VectorSearchResult } from './types';

const VECTORS_COLLECTION = 'vectors';

export class FirestoreVectorStore implements VectorStore {
  async upsert(vectors: VectorDocument[]): Promise<void> {
    const db = firestore();
    const batch = db.batch();

    for (const vec of vectors) {
      const docRef = db.collection(VECTORS_COLLECTION).doc(vec.id);
      batch.set(docRef, {
        botId: vec.botId,
        documentId: vec.documentId,
        content: vec.content,
        embedding: FieldValue.vector(vec.embedding),
        metadata: vec.metadata || {},
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
  }

  async search(
    botId: string,
    queryEmbedding: number[],
    limit: number = 5
  ): Promise<VectorSearchResult[]> {
    const db = firestore();

    const vectorQuery: VectorQuery = db
      .collection(VECTORS_COLLECTION)
      .where('botId', '==', botId)
      .findNearest('embedding', queryEmbedding, {
        limit,
        distanceMeasure: 'COSINE',
      });

    const snapshot: VectorQuerySnapshot = await vectorQuery.get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        documentId: data.documentId,
        content: data.content,
        score: 1 - (doc.get('_distance') || 0),
        metadata: data.metadata,
      };
    });
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    const db = firestore();
    const snapshot = await db
      .collection(VECTORS_COLLECTION)
      .where('documentId', '==', documentId)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  async deleteByBotId(botId: string): Promise<void> {
    const db = firestore();
    const snapshot = await db
      .collection(VECTORS_COLLECTION)
      .where('botId', '==', botId)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}
