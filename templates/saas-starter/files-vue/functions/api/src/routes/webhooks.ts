/**
 * Webhook Routes
 *
 * Stripe webhook handler (unauthenticated but signature-verified).
 */

import { Router, raw } from 'express';
import { stripeService } from '../services/stripe.service';

const router = Router();

// Stripe webhook - needs raw body
router.post('/stripe', raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    const payload = req.body.toString();
    await stripeService.handleWebhook(payload, signature);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    const message = error instanceof Error ? error.message : 'Webhook failed';
    res.status(400).json({ error: message });
  }
});

export default router;
