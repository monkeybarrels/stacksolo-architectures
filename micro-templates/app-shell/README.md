# App Shell

A modular Vue 3 application shell with pnpm workspaces for feature-driven development.

## Quick Start

```bash
# Add to existing project
stacksolo add app-shell --org mycompany

# Install dependencies
pnpm install

# Run locally
pnpm --filter shell dev
```

## Structure

```
packages/
├── shell/                    # Core shell app
│   ├── src/
│   │   ├── App.vue
│   │   ├── core/
│   │   │   ├── layouts/     # ShellLayout.vue
│   │   │   ├── router/      # Dynamic feature registration
│   │   │   └── stores/      # Auth, navigation stores
│   │   └── pages/
│   │       └── Login.vue
│   └── package.json
│
├── shared/                   # Shared components/stores
│   ├── src/
│   │   ├── components/      # Button, Card, etc.
│   │   ├── composables/     # useAuth, useCurrentUser
│   │   └── stores/          # notifications
│   └── package.json         # @{{org}}/shared
│
└── feature-dashboard/        # Default feature
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── index.ts         # Exports routes + components
    └── package.json         # @{{org}}/feature-dashboard
```

## Architecture

### Feature Packages

Each feature is an npm package that exports routes and components:

```typescript
// packages/feature-inventory/src/index.ts
import InventoryPage from './pages/InventoryPage.vue';

export const routes = [
  {
    path: '/inventory',
    name: 'inventory',
    component: InventoryPage,
    meta: { title: 'Inventory', icon: 'package' }
  }
];

export { InventoryPage };
```

### Shell Router

The shell imports feature routes dynamically:

```typescript
// packages/shell/src/core/router/index.ts
import { routes as dashboardRoutes } from '@myorg/feature-dashboard';
import { routes as inventoryRoutes } from '@myorg/feature-inventory';

const featureRoutes = [
  ...dashboardRoutes,
  ...inventoryRoutes,
];
```

### Shared Package

Cross-feature communication happens via the shared package:

```typescript
// Use shared components
import { Button, Card } from '@myorg/shared';

// Use shared stores
import { useNotificationStore } from '@myorg/shared';
const notifications = useNotificationStore();
notifications.show('Success!', 'success');

// Use composables
import { useCurrentUser } from '@myorg/shared';
const { user, isAdmin } = useCurrentUser();
```

## Adding Features

Use `stacksolo add feature-module` to add new feature packages:

```bash
stacksolo add feature-module --name inventory --org mycompany
```

This will:
1. Create `packages/feature-inventory/`
2. Update shell's package.json with dependency
3. Update shell's router to import feature routes
4. Run `pnpm install`

## Firebase Auth

The shell includes Firebase Authentication:
- Google sign-in
- Email/password
- Auth state persistence
- Protected routes

Configure in `packages/shell/src/core/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ...
};
```

## Built-in Security

Security is built into the stack via:
- Firebase Auth token validation
- Firestore security rules (when using Firestore)
- Route guards for protected pages

## Requirements

- Node.js 18+
- pnpm 8+
- Firebase project (for auth)

## Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `org` | npm organization scope | `myorg` |
| `projectName` | Project name for package.json | (required) |
