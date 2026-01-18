# SaaS Starter Template

A complete SaaS foundation with authentication, billing, and user management. Everything you need to launch a subscription-based product.

## Features

- **Firebase Authentication** - Email/password, Google sign-in
- **Stripe Billing** - Subscription management, customer portal
- **PostgreSQL Database** - User data, subscriptions, with Drizzle ORM
- **Modern Vue 3 Frontend** - Tailwind CSS, Pinia state management
- **Protected Routes** - Auth-gated dashboard and billing pages
- **Webhook Handling** - Stripe event processing

## Quick Start

```bash
# Create project
stacksolo init --template saas-starter

# Install dependencies
npm install

# Start local development
stacksolo dev

# Deploy to GCP
stacksolo deploy
```

## Project Structure

```
├── apps/web/                    # Vue 3 frontend
│   └── src/
│       ├── components/
│       │   ├── ui/              # UI components
│       │   ├── auth/            # Login, Signup forms
│       │   ├── billing/         # Subscription UI
│       │   └── layout/          # Navigation, sidebar
│       ├── composables/
│       │   ├── useAuth.ts       # Firebase auth composable
│       │   └── useSubscription.ts
│       ├── stores/
│       │   ├── auth.ts          # Pinia auth store
│       │   └── subscription.ts
│       ├── pages/
│       │   ├── Landing.vue
│       │   ├── Dashboard.vue
│       │   ├── Settings.vue
│       │   └── Billing.vue
│       └── lib/
│           ├── firebase.ts
│           └── api.ts
│
├── functions/api/               # Express API
│   └── src/
│       ├── db/
│       │   ├── index.ts         # Drizzle connection
│       │   └── schema.ts        # User, Subscription tables
│       ├── repositories/
│       │   ├── user.repository.ts
│       │   └── subscription.repository.ts
│       ├── services/
│       │   └── stripe.service.ts
│       ├── routes/
│       │   ├── user.ts
│       │   ├── billing.ts
│       │   └── webhooks.ts
│       └── index.ts
│
└── stacksolo.config.json
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | No | Health check |
| GET | /api/user/profile | Yes | Get current user |
| PUT | /api/user/profile | Yes | Update profile |
| POST | /api/billing/checkout | Yes | Create Stripe checkout |
| POST | /api/billing/portal | Yes | Create customer portal |
| GET | /api/billing/subscription | Yes | Get subscription status |
| POST | /api/webhooks/stripe | No* | Stripe webhook handler |

*Verified by Stripe signature

## Setup

### 1. Stripe Configuration

1. Create a Stripe account at https://stripe.com
2. Create products and prices in Stripe Dashboard:
   - **Pro** - $19/month
   - **Business** - $49/month

3. Create secrets in GCP:
```bash
# Get your keys from Stripe Dashboard > Developers > API keys
echo "sk_test_xxx" | gcloud secrets create stripe-secret-key --data-file=-

# Set up webhook endpoint in Stripe Dashboard, then get the signing secret
echo "whsec_xxx" | gcloud secrets create stripe-webhook-secret --data-file=-
```

### 2. Firebase Authentication

1. Enable Authentication in Firebase Console
2. Enable Email/Password and Google providers
3. Add your domain to authorized domains

### 3. Environment Variables

For local development, create `.env.local`:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## Customization

### Adding Features

The template is designed to be extended. Common additions:

- **Teams/Organizations** - Add team tables and invite flow
- **Usage Limits** - Track feature usage per plan
- **Admin Dashboard** - Add admin-only routes
- **Email Notifications** - Integrate Resend or SendGrid

### Changing Plans

Update `PLANS` in `services/stripe.service.ts`:

```typescript
const PLANS = {
  pro: {
    name: 'Pro',
    priceId: 'price_xxx',  // Your Stripe price ID
    features: ['Feature 1', 'Feature 2'],
  },
  // Add more plans...
};
```

## Deployment

```bash
# Deploy everything
stacksolo deploy

# After deployment, set up webhook endpoint in Stripe:
# https://your-domain.com/api/webhooks/stripe
```

## License

MIT
