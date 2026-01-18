import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface NavItem {
  name: string;
  path: string;
  icon: string;
}

export const useShellStore = defineStore('shell', () => {
  const sidebarOpen = ref(true);
  const theme = ref<'light' | 'dark'>('light');

  // Navigation items - features register themselves here
  const navItems = ref<NavItem[]>([]);

  const isDark = computed(() => theme.value === 'dark');

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }

  function registerNavItem(item: NavItem) {
    // Avoid duplicates
    if (!navItems.value.find((n) => n.path === item.path)) {
      navItems.value.push(item);
    }
  }

  function registerNavItems(items: NavItem[]) {
    items.forEach(registerNavItem);
  }

  return {
    sidebarOpen,
    theme,
    navItems,
    isDark,
    toggleSidebar,
    toggleTheme,
    registerNavItem,
    registerNavItems,
  };
});
