/**
 * Item Repository
 *
 * Data access layer for items table.
 */

import { eq, desc, and } from 'drizzle-orm';
import { db } from '../db';
import { items, type Item, type NewItem } from '../db/schema';

export const itemRepository = {
  /**
   * Find item by ID
   */
  async findById(id: number): Promise<Item | null> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || null;
  },

  /**
   * Find item by ID and user (ownership check)
   */
  async findByIdAndUser(id: number, userId: string): Promise<Item | null> {
    const [item] = await db
      .select()
      .from(items)
      .where(and(eq(items.id, id), eq(items.userId, userId)));
    return item || null;
  },

  /**
   * Find all items for a user
   */
  async findByUser(userId: string, limit = 50): Promise<Item[]> {
    return db
      .select()
      .from(items)
      .where(eq(items.userId, userId))
      .orderBy(desc(items.createdAt))
      .limit(limit);
  },

  /**
   * Create a new item
   */
  async create(data: NewItem): Promise<Item> {
    const [item] = await db.insert(items).values(data).returning();
    return item;
  },

  /**
   * Update item (only if owned by user)
   */
  async update(
    id: number,
    userId: string,
    data: Partial<Pick<Item, 'title' | 'description'>>
  ): Promise<Item | null> {
    // First check ownership
    const existing = await this.findByIdAndUser(id, userId);
    if (!existing) return null;

    const [item] = await db
      .update(items)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(items.id, id))
      .returning();
    return item || null;
  },

  /**
   * Delete item (only if owned by user)
   */
  async delete(id: number, userId: string): Promise<boolean> {
    // First check ownership
    const existing = await this.findByIdAndUser(id, userId);
    if (!existing) return false;

    const result = await db.delete(items).where(eq(items.id, id)).returning({ id: items.id });
    return result.length > 0;
  },

  /**
   * Count items for a user
   */
  async countByUser(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(items)
      .where(eq(items.userId, userId));
    return result.length;
  },
};