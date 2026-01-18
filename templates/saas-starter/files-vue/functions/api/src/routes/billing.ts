/**
 * Billing Routes
 *
 * Stripe checkout and portal endpoints.
 */

import { Router } from 'express';
import { stripeService, PLANS } from '../services/stripe.service';

const router = Router();

// Get available plans
router.get('/plans', (_req, res) => {
  res.json(PLANS);
});

// Get current subscription
router.get('/subscription', async (req, res) => {
  try {
    const user = req.user!;
    const subscription = await stripeService.getSubscription(user.uid);
    res.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Create checkout session
router.post('/checkout', async (req, res) => {
  try {
    const user = req.user!;
    const { priceId, successUrl, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }

    const checkoutUrl = await stripeService.createCheckoutSession(
      user.uid,
      user.email || '',
      priceId,
      successUrl || `${req.headers.origin}/billing?success=true`,
      cancelUrl || `${req.headers.origin}/billing?canceled=true`
    );

    res.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Error creating checkout:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create customer portal session
router.post('/portal', async (req, res) => {
  try {
    const user = req.user!;
    const { returnUrl } = req.body;

    const portalUrl = await stripeService.createPortalSession(
      user.uid,
      returnUrl || `${req.headers.origin}/billing`
    );

    res.json({ url: portalUrl });
  } catch (error) {
    console.error('Error creating portal:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

export default router;
