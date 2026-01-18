import type { RouteRecordRaw } from 'vue-router';
import FeaturePage from './pages/FeaturePage.vue';

/**
 * Feature routes exported for shell registration.
 *
 * The shell imports these routes:
 * ```typescript
 * import { routes as {{name}}Routes } from '@{{org}}/feature-{{name}}';
 * ```
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/{{name}}',
    name: '{{name}}',
    component: FeaturePage,
    meta: {
      title: '{{Name}}',
      icon: 'folder',
    },
  },
];

// Export components for potential use in other features
export { FeaturePage as {{Name}}Page };

// Export store if needed by other features
export { useFeatureStore as use{{Name}}Store } from './stores/feature';
