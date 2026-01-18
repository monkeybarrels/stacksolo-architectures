import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

/**
 * Global notification store for showing toast messages.
 *
 * Usage:
 * ```typescript
 * import { useNotificationStore } from '@myorg/shared';
 *
 * const notifications = useNotificationStore();
 * notifications.show('Operation successful!', 'success');
 * notifications.show('Something went wrong', 'error');
 * ```
 */
export const useNotificationStore = defineStore('notifications', () => {
  const items = ref<Notification[]>([]);
  let nextId = 0;

  function show(message: string, type: Notification['type'] = 'info', duration = 5000) {
    const id = nextId++;
    const notification: Notification = { id, message, type, duration };
    items.value.push(notification);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }

  function dismiss(id: number) {
    const index = items.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      items.value.splice(index, 1);
    }
  }

  function clear() {
    items.value = [];
  }

  return {
    items,
    show,
    dismiss,
    clear,
  };
});
