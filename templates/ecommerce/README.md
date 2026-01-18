# E-commerce Store Template

Digital products e-commerce store with Stripe checkout, product catalog, order management, and Vue 3 frontend.

## Features

- **Product Catalog** - Browse and search products from Stripe
- **Shopping Cart** - Add/remove items, persistent cart
- **Stripe Checkout** - Secure hosted checkout
- **Order History** - View past purchases
- **Digital Delivery** - Secure download links for digital products
- **Firebase Auth** - User accounts with Google sign-in

## Quick Start

```bash
# Create project from template
stacksolo init --template ecommerce

# Install dependencies
cd my-store
npm install

# Start local development
stacksolo dev
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Storefront                          │
│                     (Vue 3 + Pinia)                      │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                         API                              │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Products   │  │     Cart     │  │    Orders    │   │
│  │   (Stripe)   │  │  (Postgres)  │  │  (Postgres)  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │                 Stripe Webhooks                   │   │
│  │         (checkout.session.completed)             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
├── apps/web/                    # Vue 3 Storefront
│   └── src/
│       ├── components/
│       │   ├── ProductCard.vue
│       │   ├── CartDrawer.vue
│       │   └── OrderCard.vue
│       ├── stores/
│       │   ├── auth.ts
│       │   ├── cart.ts
│       │   └── products.ts
│       ├── pages/
│       │   ├── Home.vue
│       │   ├── Products.vue
│       │   ├── Product.vue
│       │   ├── Cart.vue
│       │   └── Orders.vue
│       └── lib/
│           ├── firebase.ts
│           └── api.ts

├── functions/api/               # Express API
│   └── src/
│       ├── services/
│       │   └── stripe.service.ts
│       ├── db/
│       │   ├── index.ts
│       │   └── schema.ts
│       └── routes/
│           ├── products.ts
│           ├── cart.ts
│           ├── checkout.ts
│           ├── orders.ts
│           └── webhooks.ts

└── stacksolo.config.json
```

## Database Schema

```typescript
// Users - synced from Firebase Auth
export const users = pgTable('users', {
  id: varchar('id', { length: 128 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Cart items
export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull(),
  priceId: varchar('price_id', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Orders
export const orders = pgTable('orders', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  totalAmount: integer('total_amount').notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Order items
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: varchar('order_id', { length: 255 }).notNull(),
  productId: varchar('product_id', { length: 255 }).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  priceId: varchar('price_id', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitAmount: integer('unit_amount').notNull(),
});
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/products | No | List products from Stripe |
| GET | /api/products/:id | No | Get single product |
| GET | /api/cart | Yes | Get user's cart |
| POST | /api/cart | Yes | Add item to cart |
| PUT | /api/cart/:id | Yes | Update cart item quantity |
| DELETE | /api/cart/:id | Yes | Remove cart item |
| POST | /api/checkout | Yes | Create Stripe checkout |
| GET | /api/orders | Yes | List user's orders |
| GET | /api/orders/:id | Yes | Get order details |
| POST | /api/webhooks/stripe | No* | Stripe webhook handler |

*Verified by Stripe signature

## Stripe Setup

1. **Create Stripe account** at https://stripe.com
2. **Create products** in Stripe Dashboard:
   - Add product name, description, images
   - Add price (one-time payment)
   - Note: Products sync automatically to your store

3. **Get API keys** from Developers > API keys
4. **Create webhook** in Developers > Webhooks:
   - Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`

5. **Set secrets**:
```bash
echo "sk_test_xxx" | gcloud secrets create stripe-secret-key --data-file=-
echo "whsec_xxx" | gcloud secrets create stripe-webhook-secret --data-file=-
```

## Checkout Flow

1. User adds items to cart
2. User clicks "Checkout"
3. API creates Stripe Checkout Session with cart items
4. User redirected to Stripe hosted checkout
5. User completes payment
6. Stripe sends webhook to API
7. API creates order record and clears cart
8. User redirected to success page

## Development

```bash
# Start local development
stacksolo dev

# Test Stripe webhooks locally
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

## Deployment

```bash
stacksolo deploy
```

Creates:
- Cloud Functions API
- Cloud SQL PostgreSQL
- Cloud Storage for frontend
- Load balancer with SSL

## Customization

### Adding Physical Products

For physical products, add shipping to checkout:
```typescript
const session = await stripe.checkout.sessions.create({
  // ... existing config
  shipping_address_collection: {
    allowed_countries: ['US', 'CA'],
  },
  shipping_options: [
    { shipping_rate: 'shr_xxx' },
  ],
});
```

### Adding Subscriptions

Change the Stripe price from one-time to recurring in Stripe Dashboard, then update the order handling.

## Environment Variables

For local development, create `.env.local`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```
