/**
 * Stripe Service
 *
 * Handles Stripe checkout, portal, and webhook processing.
 */

import Stripe from 'stripe';
import { userRepository, subscriptionRepository } from '../repositories';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

// Plan configuration - update these with your Stripe price IDs
export const PLANS = {
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_xxx',
    features: ['Unlimited projects', 'Priority support', 'Advanced analytics'],
  },
  business: {
    name: 'Business',
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_yyy',
    features: ['Everything in Pro', 'Team members', 'Custom integrations', 'SLA'],
  },
};

export const stripeService = {
  /**
   * Get or create a Stripe customer for a user
   */
  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    const user = await userRepository.findOrCreate(userId, email);

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });

    // Save customer ID
    await userRepository.setStripeCustomerId(userId, customer.id);

    return customer.id;
  },

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(
    userId: string,
    email: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    const customerId = await this.getOrCreateCustomer(userId, email);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
    });

    return session.url!;
  },

  /**
   * Create a customer portal session
   */
  async createPortalSession(userId: string, returnUrl: string): Promise<string> {
    const user = await userRepository.findById(userId);

    if (!user?.stripeCustomerId) {
      throw new Error('User has no Stripe customer');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  },

  /**
   * Get current subscription for a user
   */
  async getSubscription(userId: string) {
    const subscription = await subscriptionRepository.findByUserId(userId);
    return subscription;
  },

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(payload: string, signature: string): Promise<void> {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.syncSubscription(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handlePaymentFailed(invoice);
        break;
      }
    }
  },

  /**
   * Handle successful checkout
   */
  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    if (!userId) {
      console.error('No userId in checkout session metadata');
      return;
    }

    // Subscription is created by the subscription.created webhook
    console.log(`Checkout completed for user ${userId}`);
  },

  /**
   * Sync subscription data from Stripe
   */
  async syncSubscription(stripeSubscription: Stripe.Subscription): Promise<void> {
    // Get user from customer
    const customer = await stripe.customers.retrieve(
      stripeSubscription.customer as string
    );

    if (customer.deleted) {
      console.error('Customer deleted');
      return;
    }

    const userId = customer.metadata?.userId;
    if (!userId) {
      console.error('No userId in customer metadata');
      return;
    }

    const priceId = stripeSubscription.items.data[0]?.price.id;
    const productId = stripeSubscription.items.data[0]?.price.product as string;

    await subscriptionRepository.upsert({
      id: stripeSubscription.id,
      userId,
      status: stripeSubscription.status,
      priceId,
      productId,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    });
  },

  /**
   * Handle subscription deletion
   */
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    await subscriptionRepository.update(subscription.id, {
      status: 'canceled',
    });
  },

  /**
   * Handle failed payment
   */
  async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = invoice.subscription as string;
    if (subscriptionId) {
      await subscriptionRepository.update(subscriptionId, {
        status: 'past_due',
      });
    }
  },

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload: string, signature: string): Stripe.Event {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  },
};
