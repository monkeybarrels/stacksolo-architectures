<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { useProductsStore } from '../stores/products';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import type { Product } from '../lib/api';

const route = useRoute();
const productsStore = useProductsStore();
const cartStore = useCartStore();
const authStore = useAuthStore();

const product = ref<Product | null>(null);
const loading = ref(true);
const selectedImage = ref(0);
const quantity = ref(1);
const addingToCart = ref(false);

const isAuthenticated = computed(() => !!authStore.user);

const formattedPrice = computed(() => {
  if (!product.value?.price) return 'Price unavailable';
  const amount = product.value.price.unitAmount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.value.price.currency,
  }).format(amount);
});

async function loadProduct() {
  loading.value = true;
  const id = route.params.id as string;
  product.value = await productsStore.fetchProduct(id);
  loading.value = false;
}

async function addToCart() {
  if (!product.value?.price) return;
  addingToCart.value = true;
  try {
    await cartStore.addItem(product.value, quantity.value);
    quantity.value = 1;
  } finally {
    addingToCart.value = false;
  }
}

onMounted(loadProduct);
watch(() => route.params.id, loadProduct);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <RouterLink to="/" class="hover:text-gray-700">Home</RouterLink>
        <span>/</span>
        <RouterLink to="/products" class="hover:text-gray-700">Products</RouterLink>
        <span>/</span>
        <span class="text-gray-900">{{ product?.name || 'Loading...' }}</span>
      </nav>

      <div v-if="loading" class="flex items-center justify-center h-96">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="!product" class="text-center py-16">
        <h2 class="text-2xl font-bold text-gray-900">Product not found</h2>
        <p class="mt-2 text-gray-500">The product you're looking for doesn't exist.</p>
        <RouterLink
          to="/products"
          class="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
        >
          Browse products
        </RouterLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Images -->
        <div>
          <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              v-if="product.images.length > 0"
              :src="product.images[selectedImage]"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              No image available
            </div>
          </div>
          <div v-if="product.images.length > 1" class="mt-4 grid grid-cols-4 gap-4">
            <button
              v-for="(image, index) in product.images"
              :key="index"
              @click="selectedImage = index"
              :class="[
                'aspect-square rounded-lg overflow-hidden border-2 transition-colors',
                selectedImage === index ? 'border-blue-600' : 'border-transparent'
              ]"
            >
              <img :src="image" :alt="`${product.name} ${index + 1}`" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Details -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ product.name }}</h1>
          <p class="mt-4 text-2xl font-bold text-gray-900">{{ formattedPrice }}</p>

          <div v-if="product.description" class="mt-6">
            <h2 class="text-lg font-semibold text-gray-900">Description</h2>
            <p class="mt-2 text-gray-600 whitespace-pre-wrap">{{ product.description }}</p>
          </div>

          <div v-if="Object.keys(product.metadata).length > 0" class="mt-6">
            <h2 class="text-lg font-semibold text-gray-900">Details</h2>
            <dl class="mt-2 divide-y divide-gray-100">
              <div
                v-for="(value, key) in product.metadata"
                :key="key"
                class="py-2 flex justify-between"
              >
                <dt class="text-gray-500 capitalize">{{ key }}</dt>
                <dd class="text-gray-900">{{ value }}</dd>
              </div>
            </dl>
          </div>

          <div v-if="product.price && isAuthenticated" class="mt-8">
            <div class="flex items-center gap-4 mb-4">
              <label class="text-sm font-medium text-gray-700">Quantity</label>
              <div class="flex items-center border border-gray-300 rounded-lg">
                <button
                  @click="quantity = Math.max(1, quantity - 1)"
                  class="px-4 py-2 text-gray-600 hover:bg-gray-50"
                >
                  -
                </button>
                <span class="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                  {{ quantity }}
                </span>
                <button
                  @click="quantity++"
                  class="px-4 py-2 text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
            <button
              @click="addToCart"
              :disabled="addingToCart"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
            </button>
          </div>

          <div v-else-if="!isAuthenticated" class="mt-8">
            <RouterLink
              to="/login"
              class="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
            >
              Sign in to purchase
            </RouterLink>
          </div>

          <div v-else class="mt-8">
            <p class="text-gray-500">This product is not available for purchase.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
