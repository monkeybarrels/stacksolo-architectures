/**
 * Cart Routes
 * Shopping cart management
 */

import { Router } from 'express';
import { kernel } from '@stacksolo/runtime';
import { db } from '../db/index';
import { cartItems, users, type NewCartItem, type NewUser } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// All cart routes require authentication
router.use(kernel.authMiddleware());

/**
 * Ensure user exists in database
 */
async function ensureUser(uid: string, email: string) {
  let [user] = await db.select().from(users).where(eq(users.id, uid));

  if (!user) {
    const newUser: NewUser = { id: uid, email };
    [user] = await db.insert(users).values(newUser).returning();
  }

  return user;
}

/**
 * Get cart items
 */
router.get('/', async (req, res) => {
  try {
    const { uid, email } = req.user!;
    await ensureUser(uid, email || '');

    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, uid));

    res.json({ items });
  } catch (error: any) {
    console.error('Error getting cart:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add item to cart
 */
router.post('/', async (req, res) => {
  try {
    const { uid, email } = req.user!;
    await ensureUser(uid, email || '');

    const { priceId, productId, quantity = 1 } = req.body;

    if (!priceId || !productId) {
      return res.status(400).json({ error: 'priceId and productId are required' });
    }

    // Check if item already in cart
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, uid), eq(cartItems.priceId, priceId)));

    if (existing) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + quantity, updatedAt: new Date() })
        .where(eq(cartItems.id, existing.id))
        .returning();

      return res.json({ item: updated });
    }

    // Add new item
    const newItem: NewCartItem = {
      userId: uid,
      priceId,
      productId,
      quantity,
    };

    const [item] = await db.insert(cartItems).values(newItem).returning();
    res.status(201).json({ item });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update cart item quantity
 */
router.put('/:id', async (req, res) => {
  try {
    const { uid } = req.user!;
    const { id } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    // Delete if quantity is 0
    if (quantity === 0) {
      await db
        .delete(cartItems)
        .where(and(eq(cartItems.id, parseInt(id)), eq(cartItems.userId, uid)));

      return res.json({ message: 'Item removed from cart' });
    }

    const [updated] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(and(eq(cartItems.id, parseInt(id)), eq(cartItems.userId, uid)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ item: updated });
  } catch (error: any) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Remove item from cart
 */
router.delete('/:id', async (req, res) => {
  try {
    const { uid } = req.user!;
    const { id } = req.params;

    const result = await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, parseInt(id)), eq(cartItems.userId, uid)));

    if ((result.rowCount ?? 0) === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Clear entire cart
 */
router.delete('/', async (req, res) => {
  try {
    const { uid } = req.user!;

    await db.delete(cartItems).where(eq(cartItems.userId, uid));

    res.json({ message: 'Cart cleared' });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
