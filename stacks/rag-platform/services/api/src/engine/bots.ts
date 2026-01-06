import { firestore } from '@stacksolo/runtime';
import { FieldValue } from '@google-cloud/firestore';

const BOTS_COLLECTION = 'bots';

export interface Bot {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBotInput {
  name: string;
  description?: string;
  systemPrompt?: string;
  isPublic?: boolean;
  createdBy: string;
}

export interface UpdateBotInput {
  name?: string;
  description?: string;
  systemPrompt?: string;
  isPublic?: boolean;
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. Answer questions based on the provided context.
If you don't have enough information to answer, say so clearly.`;

/**
 * Create a new bot
 */
export async function createBot(input: CreateBotInput): Promise<Bot> {
  const db = firestore();
  const docRef = db.collection(BOTS_COLLECTION).doc();

  const bot: Bot = {
    id: docRef.id,
    name: input.name,
    description: input.description || '',
    systemPrompt: input.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    isPublic: input.isPublic ?? false,
    createdBy: input.createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await docRef.set({
    ...bot,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return bot;
}

/**
 * Get bot by ID
 */
export async function getBot(id: string): Promise<Bot | null> {
  const db = firestore();
  const doc = await db.collection(BOTS_COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data()!;
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Bot;
}

/**
 * List all bots (optionally filter by creator or public)
 */
export async function listBots(options?: { createdBy?: string; includePublic?: boolean }): Promise<Bot[]> {
  const db = firestore();
  let query = db.collection(BOTS_COLLECTION).orderBy('createdAt', 'desc');

  const snapshot = await query.get();

  let bots = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Bot;
  });

  // Filter in memory (Firestore doesn't support OR queries well)
  if (options?.createdBy) {
    bots = bots.filter(
      (bot) => bot.createdBy === options.createdBy || (options.includePublic && bot.isPublic)
    );
  }

  return bots;
}

/**
 * Update bot
 */
export async function updateBot(id: string, input: UpdateBotInput): Promise<Bot | null> {
  const db = firestore();
  const docRef = db.collection(BOTS_COLLECTION).doc(id);

  const doc = await docRef.get();
  if (!doc.exists) {
    return null;
  }

  await docRef.update({
    ...input,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return getBot(id);
}

/**
 * Delete bot
 */
export async function deleteBot(id: string): Promise<boolean> {
  const db = firestore();
  const docRef = db.collection(BOTS_COLLECTION).doc(id);

  const doc = await docRef.get();
  if (!doc.exists) {
    return false;
  }

  await docRef.delete();
  return true;
}
