/**
 * Subscription Repository
 *
 * Data access layer for subscriptions table.
 */

import { eq, and, desc } from 'drizzle-orm';
import { db, subscriptions, type Subscription, type NewSubscription } from '../db';

export const subscriptionRepository = {
  async findById(id: string): Promise<Subscription | null> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));
    return subscription || null;
  },

  async findByUserId(userId: string): Promise<Subscription | null> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return subscription || null;
  },

  async findActiveByUserId(userId: string): Promise<Subscription | null> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        )
      );
    return subscription || null;
  },

  async create(data: NewSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(data)
      .returning();
    return subscription;
  },

  async update(
    id: string,
    data: Partial<Omit<Subscription, 'id' | 'createdAt'>>
  ): Promise<Subscription | null> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription || null;
  },

  async upsert(data: NewSubscription): Promise<Subscription> {
    const existing = await this.findById(data.id);

    if (existing) {
      const updated = await this.update(data.id, {
        status: data.status,
        priceId: data.priceId,
        productId: data.productId,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      });
      return updated!;
    }

    return this.create(data);
  },

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(subscriptions)
      .where(eq(subscriptions.id, id))
      .returning();
    return result.length > 0;
  },
};
