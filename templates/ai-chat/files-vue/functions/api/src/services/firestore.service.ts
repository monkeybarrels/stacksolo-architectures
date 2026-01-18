/**
 * Firestore Service
 * Manages conversation history
 */

import { Firestore, FieldValue } from '@google-cloud/firestore';

const db = new Firestore();

export interface Message {
  id?: string;
  role: 'user' | 'model';
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id?: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const CONVERSATIONS_COLLECTION = 'conversations';

/**
 * Create a new conversation
 */
export async function createConversation(
  userId: string,
  firstMessage: string
): Promise<string> {
  // Generate title from first message (first 50 chars)
  const title = firstMessage.length > 50
    ? firstMessage.substring(0, 47) + '...'
    : firstMessage;

  const doc = await db.collection(CONVERSATIONS_COLLECTION).add({
    userId,
    title,
    messages: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return doc.id;
}

/**
 * Get a conversation by ID
 */
export async function getConversation(
  conversationId: string,
  userId: string
): Promise<Conversation | null> {
  const doc = await db.collection(CONVERSATIONS_COLLECTION).doc(conversationId).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data();

  // Verify ownership
  if (data?.userId !== userId) {
    return null;
  }

  return {
    id: doc.id,
    userId: data.userId,
    title: data.title,
    messages: data.messages || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * List conversations for a user
 */
export async function listConversations(
  userId: string,
  limit: number = 20
): Promise<Conversation[]> {
  const snapshot = await db
    .collection(CONVERSATIONS_COLLECTION)
    .where('userId', '==', userId)
    .orderBy('updatedAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      title: data.title,
      messages: data.messages || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  userId: string,
  message: Omit<Message, 'id' | 'createdAt'>
): Promise<void> {
  const docRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const doc = await docRef.get();

  if (!doc.exists || doc.data()?.userId !== userId) {
    throw new Error('Conversation not found');
  }

  await docRef.update({
    messages: FieldValue.arrayUnion({
      ...message,
      createdAt: new Date(),
    }),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const docRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const doc = await docRef.get();

  if (!doc.exists || doc.data()?.userId !== userId) {
    return false;
  }

  await docRef.delete();
  return true;
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string,
  userId: string,
  title: string
): Promise<boolean> {
  const docRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const doc = await docRef.get();

  if (!doc.exists || doc.data()?.userId !== userId) {
    return false;
  }

  await docRef.update({
    title,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return true;
}
