/**
 * User Repository
 *
 * Data access layer for users table.
 */

import { eq } from 'drizzle-orm';
import { db, users, type User, type NewUser } from '../db';

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  },

  async findByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, stripeCustomerId));
    return user || null;
  },

  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  },

  async findOrCreate(id: string, email: string): Promise<User> {
    const existing = await this.findById(id);
    if (existing) return existing;

    return this.create({ id, email });
  },

  async setStripeCustomerId(id: string, stripeCustomerId: string): Promise<User | null> {
    return this.update(id, { stripeCustomerId });
  },
};
