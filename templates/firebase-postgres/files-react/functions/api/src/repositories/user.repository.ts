/**
 * User Repository
 *
 * Data access layer for users table.
 */

import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, type User, type NewUser } from '../db/schema';

export const userRepository = {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  },

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  },

  /**
   * Create a new user
   */
  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  /**
   * Update user
   */
  async update(
    id: string,
    data: Partial<Pick<User, 'name' | 'bio'>>
  ): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    return result.length > 0;
  },

  /**
   * Find or create user (upsert pattern)
   */
  async findOrCreate(id: string, email: string): Promise<User> {
    let user = await this.findById(id);
    if (!user) {
      user = await this.create({ id, email });
    }
    return user;
  },
};