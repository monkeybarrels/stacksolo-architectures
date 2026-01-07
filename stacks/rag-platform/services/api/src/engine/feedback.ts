/**
 * Feedback System
 *
 * Allows users to provide thumbs up/down feedback on responses.
 * This data can be used to improve the system over time.
 */

import { firestore } from '@stacksolo/runtime';
import { FieldValue } from '@google-cloud/firestore';

const FEEDBACK_COLLECTION = 'feedback';

export type FeedbackType = 'positive' | 'negative';

export interface Feedback {
  id: string;
  botId: string;
  conversationId: string;
  messageId: string;
  userId?: string;
  type: FeedbackType;
  comment?: string;
  userMessage: string;
  assistantResponse: string;
  sources?: string[];
  createdAt: Date;
}

export interface CreateFeedbackInput {
  botId: string;
  conversationId: string;
  messageId: string;
  userId?: string;
  type: FeedbackType;
  comment?: string;
  userMessage: string;
  assistantResponse: string;
  sources?: string[];
}

export interface FeedbackStats {
  totalPositive: number;
  totalNegative: number;
  positiveRate: number;
}

/**
 * Submit feedback for a response
 */
export async function submitFeedback(input: CreateFeedbackInput): Promise<Feedback> {
  const db = firestore();
  const docRef = db.collection(FEEDBACK_COLLECTION).doc();

  const feedback: Feedback = {
    id: docRef.id,
    ...input,
    createdAt: new Date(),
  };

  await docRef.set({
    ...feedback,
    createdAt: FieldValue.serverTimestamp(),
  });

  return feedback;
}

/**
 * Get feedback by message ID
 */
export async function getFeedbackByMessageId(messageId: string): Promise<Feedback | null> {
  const db = firestore();
  const snapshot = await db
    .collection(FEEDBACK_COLLECTION)
    .where('messageId', '==', messageId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as Feedback;
}

/**
 * Update existing feedback
 */
export async function updateFeedback(
  feedbackId: string,
  updates: { type?: FeedbackType; comment?: string }
): Promise<void> {
  const db = firestore();
  await db.collection(FEEDBACK_COLLECTION).doc(feedbackId).update({
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Get feedback stats for a bot
 */
export async function getFeedbackStats(botId: string): Promise<FeedbackStats> {
  const db = firestore();

  const [positiveSnapshot, negativeSnapshot] = await Promise.all([
    db
      .collection(FEEDBACK_COLLECTION)
      .where('botId', '==', botId)
      .where('type', '==', 'positive')
      .count()
      .get(),
    db
      .collection(FEEDBACK_COLLECTION)
      .where('botId', '==', botId)
      .where('type', '==', 'negative')
      .count()
      .get(),
  ]);

  const totalPositive = positiveSnapshot.data().count;
  const totalNegative = negativeSnapshot.data().count;
  const total = totalPositive + totalNegative;

  return {
    totalPositive,
    totalNegative,
    positiveRate: total > 0 ? totalPositive / total : 0,
  };
}

/**
 * List recent feedback for a bot
 */
export async function listFeedback(
  botId: string,
  options?: { limit?: number; type?: FeedbackType }
): Promise<Feedback[]> {
  const db = firestore();
  let query = db
    .collection(FEEDBACK_COLLECTION)
    .where('botId', '==', botId)
    .orderBy('createdAt', 'desc');

  if (options?.type) {
    query = db
      .collection(FEEDBACK_COLLECTION)
      .where('botId', '==', botId)
      .where('type', '==', options.type)
      .orderBy('createdAt', 'desc');
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Feedback;
  });
}

/**
 * Delete all feedback for a bot
 */
export async function deleteFeedbackByBotId(botId: string): Promise<void> {
  const db = firestore();
  const snapshot = await db.collection(FEEDBACK_COLLECTION).where('botId', '==', botId).get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}
