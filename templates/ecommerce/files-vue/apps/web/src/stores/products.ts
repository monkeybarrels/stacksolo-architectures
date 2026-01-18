/**
 * Products Store
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api, type Product } from '../lib/api';

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const hasProducts = computed(() => products.value.length > 0);

  async function fetchProducts() {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.listProducts();
      products.value = response.products;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch products';
    } finally {
      loading.value = false;
    }
  }

  async function fetchProduct(id: string): Promise<Product | null> {
    // Check if we already have it
    const existing = products.value.find((p) => p.id === id);
    if (existing) return existing;

    loading.value = true;
    error.value = null;
    try {
      const response = await api.getProduct(id);
      // Add to cache if not already there
      if (!products.value.find((p) => p.id === response.product.id)) {
        products.value.push(response.product);
      }
      return response.product;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch product';
      return null;
    } finally {
      loading.value = false;
    }
  }

  function getProductById(id: string): Product | undefined {
    return products.value.find((p) => p.id === id);
  }

  return {
    products,
    loading,
    error,
    hasProducts,
    fetchProducts,
    fetchProduct,
    getProductById,
  };
});
