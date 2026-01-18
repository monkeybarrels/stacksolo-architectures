import * as functions from '@google-cloud/functions-framework';
import express from 'express';
import { stripe } from './stripe';

const app = express();
app.use(express.json());

// Create checkout session
app.post('/checkout/session', async (req, res) => {
  try {
    const { priceId, customerId, successUrl, cancelUrl, mode = 'subscription' } = req.body;

    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required fields: priceId, successUrl, cancelUrl' });
    }

    const sessionConfig: Record<string, unknown> = {
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    // Attach to existing customer if provided
    if (customerId) {
      sessionConfig.customer = customerId;
    } else {
      sessionConfig.customer_creation = 'always';
    }

    const session = await stripe.checkout.sessions.create(
      sessionConfig as Parameters<typeof stripe.checkout.sessions.create>[0]
    );

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create customer portal session
app.post('/checkout/portal', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;

    if (!customerId || !returnUrl) {
      return res.status(400).json({ error: 'Missing required fields: customerId, returnUrl' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Create or retrieve customer
app.post('/checkout/customer', async (req, res) => {
  try {
    const { email, name, metadata } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing required field: email' });
    }

    // Check if customer exists
    const existing = await stripe.customers.list({ email, limit: 1 });

    if (existing.data.length > 0) {
      return res.json({ customer: existing.data[0], created: false });
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    res.json({ customer, created: true });
  } catch (error) {
    console.error('Error with customer:', error);
    res.status(500).json({ error: 'Failed to process customer' });
  }
});

// Health check
app.get('/checkout/health', (_req, res) => {
  res.json({ status: 'ok' });
});

functions.http('handler', app);
