/**
 * Webhook Routes
 * Stripe webhook handler
 */

import { Router, raw } from 'express';
import { db } from '../db/index';
import { orders, orderItems, cartItems, type NewOrder, type NewOrderItem } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as stripeService from '../services/stripe.service';
import type Stripe from 'stripe';

const router = Router();

/**
 * Stripe webhook handler
 */
router.post('/stripe', raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  let event: Stripe.Event;

  try {
    event = stripeService.constructWebhookEvent(req.body, signature);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Handle completed checkout session
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  // Check if order already exists (idempotency)
  const [existing] = await db.select().from(orders).where(eq(orders.id, session.id));

  if (existing) {
    console.log('Order already processed:', session.id);
    return;
  }

  // Get full session with line items
  const fullSession = await stripeService.getCheckoutSession(session.id);

  // Create order
  const newOrder: NewOrder = {
    id: session.id,
    userId,
    stripePaymentIntentId: session.payment_intent as string,
    status: 'completed',
    totalAmount: session.amount_total || 0,
    currency: session.currency || 'usd',
    customerEmail: session.customer_email || undefined,
    completedAt: new Date(),
  };

  await db.insert(orders).values(newOrder);

  // Create order items
  const lineItems = fullSession.line_items?.data || [];

  for (const lineItem of lineItems) {
    const price = lineItem.price;
    const product = price?.product as Stripe.Product | undefined;

    const orderItem: NewOrderItem = {
      orderId: session.id,
      productId: product?.id || 'unknown',
      productName: product?.name || lineItem.description || 'Unknown Product',
      productDescription: product?.description || null,
      priceId: price?.id || 'unknown',
      quantity: lineItem.quantity || 1,
      unitAmount: price?.unit_amount || 0,
      // For digital products, you could generate a signed URL here
      downloadUrl: product?.metadata?.download_url || null,
    };

    await db.insert(orderItems).values(orderItem);
  }

  // Clear user's cart
  await db.delete(cartItems).where(eq(cartItems.userId, userId));

  console.log('Order created:', session.id);
}

export default router;
