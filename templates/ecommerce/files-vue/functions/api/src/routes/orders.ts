/**
 * Orders Routes
 * Order history and details
 */

import { Router } from 'express';
import { kernel } from '@stacksolo/runtime';
import { db } from '../db/index';
import { orders, orderItems } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

const router = Router();

// All order routes require authentication
router.use(kernel.authMiddleware());

/**
 * List user's orders
 */
router.get('/', async (req, res) => {
  try {
    const { uid } = req.user!;

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, uid))
      .orderBy(desc(orders.createdAt));

    res.json({ orders: userOrders });
  } catch (error: any) {
    console.error('Error listing orders:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get order details with items
 */
router.get('/:id', async (req, res) => {
  try {
    const { uid } = req.user!;
    const { id } = req.params;

    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.userId, uid)));

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    res.json({ order, items });
  } catch (error: any) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
