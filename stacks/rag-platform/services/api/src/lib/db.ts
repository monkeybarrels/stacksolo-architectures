/**
 * Database Helper
 *
 * Caches the Firestore instance to avoid repeated async calls.
 */

import { firestore } from '@stacksolo/runtime';
import type { Firestore } from '@google-cloud/firestore';

let dbInstance: Firestore | null = null;

/**
 * Get cached Firestore instance
 * Call initDb() once at startup, then use getDb() synchronously
 */
export async function initDb(): Promise<Firestore> {
  if (!dbInstance) {
    dbInstance = await firestore();
  }
  return dbInstance!;
}

/**
 * Get Firestore instance (sync, must call initDb first)
 */
export function getDb(): Firestore {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDb() at startup.');
  }
  return dbInstance!;
}
