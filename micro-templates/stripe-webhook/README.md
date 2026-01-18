# Stripe Webhook Handler

Handle Stripe webhook events for checkout completion, subscription changes, and payment failures.

## Usage

```bash
stacksolo add stripe-webhook
```

## What's Included

- `functions/webhooks/src/index.ts` - Webhook handler with signature verification
- Handles common events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

## Setup

1. Create the webhook secret:
```bash
echo "whsec_xxx" | gcloud secrets create stripe-webhook-secret --data-file=-
```

2. After deployment, configure webhook in Stripe Dashboard:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: Select the events you need

## Customization

Edit `functions/webhooks/src/index.ts` to add your business logic:

```typescript
case 'checkout.session.completed': {
  const session = event.data.object;
  // TODO: Create order, provision access, send email, etc.
  break;
}
```
