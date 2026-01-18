# Landing Page

Marketing landing page with hero section, features grid, pricing table, and CTA.

## Usage

```bash
stacksolo add landing-page
```

## What's Included

- `apps/landing/` - Vue 3 + Tailwind CSS landing page
- Hero section with headline and CTA
- Features grid (6 features)
- Pricing table (3 tiers)
- Footer with links

## Customization

### Update Content

Edit the content directly in `apps/landing/src/pages/Home.vue`:

```vue
const features = [
  {
    icon: '🚀',
    title: 'Fast',
    description: 'Lightning fast performance',
  },
  // Add more features...
];

const plans = [
  {
    name: 'Starter',
    price: '$9',
    features: ['Feature 1', 'Feature 2'],
  },
  // Add more plans...
];
```

### Change Colors

Update `tailwind.config.js` to match your brand:

```js
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color',
        600: '#your-darker-color',
      },
    },
  },
},
```

### Add Navigation

The page includes a simple navbar. Add links as needed:

```vue
const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Login', href: '/login' },
];
```
