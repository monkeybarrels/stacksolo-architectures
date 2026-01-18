/**
 * Stripe Service
 * Handles Stripe API interactions for products and checkout
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export interface ProductWithPrice {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  metadata: Record<string, string>;
  price: {
    id: string;
    unitAmount: number;
    currency: string;
  } | null;
}

/**
 * List all active products with their prices
 */
export async function listProducts(): Promise<ProductWithPrice[]> {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price'],
  });

  return products.data.map((product) => {
    const defaultPrice = product.default_price as Stripe.Price | null;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      metadata: product.metadata,
      price: defaultPrice
        ? {
            id: defaultPrice.id,
            unitAmount: defaultPrice.unit_amount || 0,
            currency: defaultPrice.currency,
          }
        : null,
    };
  });
}

/**
 * Get a single product with its price
 */
export async function getProduct(productId: string): Promise<ProductWithPrice | null> {
  try {
    const product = await stripe.products.retrieve(productId, {
      expand: ['default_price'],
    });

    if (!product.active) {
      return null;
    }

    const defaultPrice = product.default_price as Stripe.Price | null;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      metadata: product.metadata,
      price: defaultPrice
        ? {
            id: defaultPrice.id,
            unitAmount: defaultPrice.unit_amount || 0,
            currency: defaultPrice.currency,
          }
        : null,
    };
  } catch {
    return null;
  }
}

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  existingCustomerId?: string | null
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: {
      firebaseUid: userId,
    },
  });

  return customer.id;
}

export interface CheckoutLineItem {
  priceId: string;
  quantity: number;
}

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(
  customerId: string,
  lineItems: CheckoutLineItem[],
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems.map((item) => ({
      price: item.priceId,
      quantity: item.quantity,
    })),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });

  return session.url || '';
}

/**
 * Retrieve a checkout session
 */
export async function getCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product'],
  });
}

/**
 * Construct and verify webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export { stripe };
