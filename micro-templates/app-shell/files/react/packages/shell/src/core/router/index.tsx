import { routes as dashboardRoutes } from '@{{org}}/feature-dashboard';

// Feature routes are automatically added here when you run:
// stacksolo add feature-module --name <feature-name>

export const routes = [
  ...dashboardRoutes,
];

// Navigation items for sidebar (derived from routes with titles)
export const navItems = routes
  .filter((route) => route.meta?.title)
  .map((route) => ({
    path: route.path,
    title: route.meta!.title,
    icon: route.meta?.icon,
  }));
