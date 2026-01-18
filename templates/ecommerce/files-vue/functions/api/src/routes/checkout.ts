/**
 * Checkout Routes
 * Stripe checkout session creation
 */

import { Router } from 'express';
import { kernel } from '@stacksolo/runtime';
import { db } from '../db/index';
import { cartItems, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as stripeService from '../services/stripe.service';

const router = Router();

// All checkout routes require authentication
router.use(kernel.authMiddleware());

/**
 * Create checkout session from cart
 */
router.post('/', async (req, res) => {
  try {
    const { uid, email } = req.user!;
    const { successUrl, cancelUrl } = req.body;

    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'successUrl and cancelUrl are required' });
    }

    // Get user
    let [user] = await db.select().from(users).where(eq(users.id, uid));

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({ id: uid, email: email || '' })
        .returning();
      user = newUser;
    }

    // Get cart items
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, uid));

    if (items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Get or create Stripe customer
    const customerId = await stripeService.getOrCreateCustomer(
      uid,
      email || '',
      user.stripeCustomerId
    );

    // Save customer ID if new
    if (!user.stripeCustomerId) {
      await db
        .update(users)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(users.id, uid));
    }

    // Create line items for checkout
    const lineItems = items.map((item) => ({
      priceId: item.priceId,
      quantity: item.quantity,
    }));

    // Create checkout session
    const checkoutUrl = await stripeService.createCheckoutSession(
      customerId,
      lineItems,
      successUrl,
      cancelUrl,
      { userId: uid }
    );

    res.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Error creating checkout:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
