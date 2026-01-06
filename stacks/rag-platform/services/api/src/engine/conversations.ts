import { firestore } from '@stacksolo/runtime';
import { FieldValue } from '@google-cloud/firestore';

const CONVERSATIONS_COLLECTION = 'conversations';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    documentId: string;
    filename: string;
    content: string;
    score: number;
  }>;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  botId: string;
  userId: string;
  userEmail?: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new conversation
 */
export async function createConversation(
  botId: string,
  userId: string,
  userEmail?: string,
  title?: string
): Promise<Conversation> {
  const db = firestore();
  const docRef = db.collection(CONVERSATIONS_COLLECTION).doc();

  const conversation: Conversation = {
    id: docRef.id,
    botId,
    userId,
    userEmail,
    title: title || 'New Conversation',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await docRef.set({
    ...conversation,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return conversation;
}

/**
 * Get conversation by ID
 */
export async function getConversation(id: string): Promise<Conversation | null> {
  const db = firestore();
  const doc = await db.collection(CONVERSATIONS_COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data()!;
  return {
    ...data,
    id: doc.id,
    messages: (data.messages || []).map((m: any) => ({
      ...m,
      timestamp: m.timestamp?.toDate() || new Date(),
    })),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Conversation;
}

/**
 * List conversations for a user and bot
 */
export async function listConversations(
  botId: string,
  userId: string
): Promise<Conversation[]> {
  const db = firestore();
  const snapshot = await db
    .collection(CONVERSATIONS_COLLECTION)
    .where('botId', '==', botId)
    .where('userId', '==', userId)
    .orderBy('updatedAt', 'desc')
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      messages: (data.messages || []).map((m: any) => ({
        ...m,
        timestamp: m.timestamp?.toDate() || new Date(),
      })),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Conversation;
  });
}

/**
 * Add message to conversation
 */
export async function addMessage(
  conversationId: string,
  message: Omit<Message, 'timestamp'>
): Promise<void> {
  const db = firestore();
  const docRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);

  const messageWithTimestamp: Message = {
    ...message,
    timestamp: new Date(),
  };

  await docRef.update({
    messages: FieldValue.arrayUnion(messageWithTimestamp),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Update conversation title (auto-generated from first message)
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  const db = firestore();
  await db.collection(CONVERSATIONS_COLLECTION).doc(conversationId).update({
    title,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Delete conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const db = firestore();
  await db.collection(CONVERSATIONS_COLLECTION).doc(conversationId).delete();
}
