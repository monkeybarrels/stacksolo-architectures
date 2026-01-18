# Feature Module

Add a new feature package to an existing app-shell monorepo.

## Quick Start

```bash
# Add a new feature
stacksolo add feature-module --name inventory --org mycompany

# The CLI will:
# 1. Create packages/feature-inventory/
# 2. Update shell's package.json with workspace:* dependency
# 3. Update shell's router to import feature routes
# 4. Run pnpm install
```

## Generated Structure

```
packages/feature-{{name}}/
├── src/
│   ├── pages/
│   │   └── {{Name}}Page.vue     # Main feature page
│   ├── components/
│   │   └── {{Name}}Card.vue     # Example component
│   ├── stores/
│   │   └── {{name}}.ts          # Feature-specific Pinia store
│   └── index.ts                 # Exports routes + components
├── package.json                 # @{{org}}/feature-{{name}}
└── tsconfig.json
```

## Feature Exports

Each feature exports routes for shell registration:

```typescript
// packages/feature-inventory/src/index.ts
import type { RouteRecordRaw } from 'vue-router';
import InventoryPage from './pages/InventoryPage.vue';

export const routes: RouteRecordRaw[] = [
  {
    path: '/inventory',
    name: 'inventory',
    component: InventoryPage,
    meta: {
      title: 'Inventory',
      icon: 'package',
    },
  },
];

export { InventoryPage };
```

## Shell Integration

After adding a feature, the shell's router imports it:

```typescript
// packages/shell/src/core/router/index.ts
import { routes as inventoryRoutes } from '@myorg/feature-inventory';

const featureRoutes: RouteRecordRaw[] = [
  ...dashboardRoutes,
  ...inventoryRoutes,  // Added by CLI
];
```

## Using Shared Package

Features can use components and stores from the shared package:

```vue
<script setup lang="ts">
import { Card, Button, useNotificationStore } from '@myorg/shared';

const notifications = useNotificationStore();

function handleSave() {
  // Save logic...
  notifications.show('Item saved!', 'success');
}
</script>
```

## Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `name` | Feature name (lowercase) | (required) |
| `Name` | Feature name (PascalCase) | (required) |
| `org` | npm organization scope | `myorg` |

## Manual Integration (if CLI doesn't auto-update)

1. Add dependency to `packages/shell/package.json`:
   ```json
   "dependencies": {
     "@myorg/feature-inventory": "workspace:*"
   }
   ```

2. Import in `packages/shell/src/core/router/index.ts`:
   ```typescript
   import { routes as inventoryRoutes } from '@myorg/feature-inventory';

   const featureRoutes = [
     ...dashboardRoutes,
     ...inventoryRoutes,
   ];
   ```

3. Run `pnpm install`
