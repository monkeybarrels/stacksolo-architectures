/**
 * Cart Store
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api, type CartItem, type Product } from '../lib/api';
import { useAuthStore } from './auth';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const products = ref<Map<string, Product>>(new Map());
  const loading = ref(false);
  const error = ref<string | null>(null);
  const drawerOpen = ref(false);

  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const total = computed(() => {
    return items.value.reduce((sum, item) => {
      const product = products.value.get(item.productId);
      if (product?.price) {
        return sum + product.price.unitAmount * item.quantity;
      }
      return sum;
    }, 0);
  });

  const currency = computed(() => {
    for (const item of items.value) {
      const product = products.value.get(item.productId);
      if (product?.price?.currency) {
        return product.price.currency;
      }
    }
    return 'usd';
  });

  async function fetchCart() {
    const authStore = useAuthStore();
    if (!authStore.user) return;

    loading.value = true;
    error.value = null;
    try {
      const response = await api.getCart();
      items.value = response.items;

      // Fetch product details for cart items
      const productIds = [...new Set(response.items.map((item) => item.productId))];
      for (const productId of productIds) {
        if (!products.value.has(productId)) {
          try {
            const { product } = await api.getProduct(productId);
            products.value.set(productId, product);
          } catch {
            // Product might have been deleted
          }
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch cart';
    } finally {
      loading.value = false;
    }
  }

  async function addItem(product: Product, quantity = 1) {
    const authStore = useAuthStore();
    if (!authStore.user || !product.price) return;

    error.value = null;
    try {
      const response = await api.addToCart(product.id, product.price.id, quantity);

      // Update local state
      const existingIndex = items.value.findIndex((i) => i.productId === product.id);
      if (existingIndex >= 0) {
        items.value[existingIndex] = response.item;
      } else {
        items.value.push(response.item);
      }

      // Cache product
      products.value.set(product.id, product);

      // Open drawer to show item was added
      drawerOpen.value = true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add to cart';
      throw e;
    }
  }

  async function updateQuantity(itemId: number, quantity: number) {
    error.value = null;
    try {
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }

      await api.updateCartItem(itemId, quantity);
      const item = items.value.find((i) => i.id === itemId);
      if (item) {
        item.quantity = quantity;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update cart';
      throw e;
    }
  }

  async function removeItem(itemId: number) {
    error.value = null;
    try {
      await api.removeFromCart(itemId);
      items.value = items.value.filter((i) => i.id !== itemId);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to remove from cart';
      throw e;
    }
  }

  async function clearCart() {
    error.value = null;
    try {
      await api.clearCart();
      items.value = [];
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to clear cart';
      throw e;
    }
  }

  async function checkout() {
    error.value = null;
    try {
      const successUrl = `${window.location.origin}/checkout/success`;
      const cancelUrl = `${window.location.origin}/cart`;
      const response = await api.createCheckout(successUrl, cancelUrl);

      // Redirect to Stripe Checkout
      window.location.href = response.url;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create checkout';
      throw e;
    }
  }

  function openDrawer() {
    drawerOpen.value = true;
  }

  function closeDrawer() {
    drawerOpen.value = false;
  }

  function getProduct(productId: string): Product | undefined {
    return products.value.get(productId);
  }

  return {
    items,
    products,
    loading,
    error,
    drawerOpen,
    itemCount,
    total,
    currency,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    checkout,
    openDrawer,
    closeDrawer,
    getProduct,
  };
});
