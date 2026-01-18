import mitt from 'mitt';

/**
 * Event types for cross-feature communication.
 * Add new event types here as features are added.
 */
export type Events = {
  // Example events - features can add their own
  'notification:show': { message: string; type: 'success' | 'error' | 'info' };
  'user:updated': { userId: string };
};

/**
 * Global event bus for loose coupling between features.
 *
 * Usage:
 * ```typescript
 * // Emit an event
 * import { eventBus } from '@myorg/shared';
 * eventBus.emit('notification:show', { message: 'Hello!', type: 'success' });
 *
 * // Listen to events
 * eventBus.on('notification:show', (data) => {
 *   console.log(data.message);
 * });
 * ```
 */
export const eventBus = mitt<Events>();
