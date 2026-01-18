/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events with signature verification.
 * Customize the event handlers below for your business logic.
 */

import * as functions from '@google-cloud/functions-framework';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

functions.http('webhooks', async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Verify webhook signature
  const signature = req.headers['stripe-signature'];
  if (!signature) {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody || Buffer.from(JSON.stringify(req.body)),
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  console.log(`Received event: ${event.type}`);

  try {
    switch (event.type) {
      // Checkout completed - customer finished payment
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout completed:', session.id);

        // TODO: Add your business logic here
        // - Create order in database
        // - Provision access/subscription
        // - Send confirmation email
        // - Update user record

        break;
      }

      // New subscription created
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription created:', subscription.id);

        // TODO: Add your business logic here
        // - Store subscription in database
        // - Grant access to premium features

        break;
      }

      // Subscription updated (plan change, renewal, etc.)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id, 'Status:', subscription.status);

        // TODO: Add your business logic here
        // - Update subscription status in database
        // - Handle plan upgrades/downgrades

        break;
      }

      // Subscription cancelled or expired
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', subscription.id);

        // TODO: Add your business logic here
        // - Update subscription status to cancelled
        // - Revoke premium access
        // - Send cancellation email

        break;
      }

      // Payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed for invoice:', invoice.id);

        // TODO: Add your business logic here
        // - Send payment failed email
        // - Update subscription status to past_due
        // - Show warning banner in app

        break;
      }

      // Payment succeeded (subscription renewal)
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for invoice:', invoice.id);

        // TODO: Add your business logic here
        // - Send receipt email
        // - Update billing history

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});
