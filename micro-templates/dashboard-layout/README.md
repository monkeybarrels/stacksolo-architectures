# Dashboard Layout

Sidebar + header layout for authenticated dashboards.

## Usage

```bash
stacksolo add dashboard-layout
```

## What's Included

- `apps/dashboard/src/layouts/DashboardLayout.vue` - Main layout wrapper
- `apps/dashboard/src/components/Sidebar.vue` - Collapsible sidebar navigation
- `apps/dashboard/src/components/Header.vue` - Top header with user menu

## Features

- Responsive sidebar (collapses on mobile)
- User dropdown menu
- Active route highlighting
- Customizable navigation items
- Dark/light mode ready

## Customization

### Add Navigation Items

Edit `Sidebar.vue` to add new navigation items:

```typescript
const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  { name: 'Analytics', path: '/analytics', icon: ChartIcon },
  { name: 'Settings', path: '/settings', icon: CogIcon },
  // Add more items here
];
```

### Combine with Auth Pages

This layout works well with the `auth-pages` micro-template:

```bash
stacksolo add auth-pages
stacksolo add dashboard-layout
```

Then protect dashboard routes with auth middleware.
