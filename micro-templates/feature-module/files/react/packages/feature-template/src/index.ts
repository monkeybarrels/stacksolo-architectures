import type { RouteObject } from 'react-router-dom';

/**
 * Feature routes exported for shell registration.
 *
 * The shell imports these routes:
 * ```typescript
 * import { routes as {{name}}Routes } from '@{{org}}/feature-{{name}}';
 * ```
 */
export const routes: RouteObject[] = [
  {
    path: '/{{name}}',
    lazy: async () => {
      const { {{Name}}Page } = await import('./pages/{{Name}}Page');
      return { Component: {{Name}}Page };
    },
  },
];

// Feature metadata for sidebar
export const meta = {
  title: '{{Name}}',
  icon: 'folder',
  order: 10,
};

// Export components for potential use in other features
export { {{Name}}Page } from './pages/{{Name}}Page';

// Export store if needed by other features
export { use{{Name}}Store } from './stores/{{name}}';
