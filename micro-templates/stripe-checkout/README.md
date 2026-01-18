# Stripe Checkout API

Create Stripe checkout sessions and customer portal links.

## Usage

```bash
stacksolo add stripe-checkout
```

## What's Included

- `functions/checkout/src/index.ts` - Checkout session and portal endpoints
- `functions/checkout/src/stripe.ts` - Stripe client configuration

## Endpoints

### POST /checkout/session
Creates a Stripe Checkout session for subscription or one-time payment.

**Request body:**
```json
{
  "priceId": "price_xxx",
  "customerId": "cus_xxx",
  "successUrl": "https://app.example.com/success",
  "cancelUrl": "https://app.example.com/cancel"
}
```

### POST /checkout/portal
Creates a customer portal session for managing subscriptions.

**Request body:**
```json
{
  "customerId": "cus_xxx",
  "returnUrl": "https://app.example.com/billing"
}
```

## Setup

1. Get your Stripe API keys from https://dashboard.stripe.com/apikeys
2. Create secret:
   ```bash
   echo "sk_live_xxx" | gcloud secrets create stripe-secret-key --data-file=-
   ```
3. Create products and prices in Stripe Dashboard

## Customization

### Add One-Time Payments

```typescript
// In index.ts, modify createCheckoutSession
const session = await stripe.checkout.sessions.create({
  mode: 'payment',  // Instead of 'subscription'
  // ... rest of config
});
```

### Add Trial Periods

```typescript
const session = await stripe.checkout.sessions.create({
  subscription_data: {
    trial_period_days: 14,
  },
  // ... rest of config
});
```
