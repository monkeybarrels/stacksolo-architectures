/**
 * API Client
 */

import { auth } from './firebase';

const API_BASE = '/api';

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function fetchApi<T>(path: string, options: RequestInit = {}, requireAuth = true): Promise<T> {
  const headers = requireAuth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

// Types
export interface Product {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  metadata: Record<string, string>;
  price: {
    id: string;
    unitAmount: number;
    currency: string;
  } | null;
}

export interface CartItem {
  id: number;
  userId: string;
  priceId: string;
  productId: string;
  quantity: number;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  completedAt?: string;
}

export interface OrderItem {
  id: number;
  orderId: string;
  productId: string;
  productName: string;
  productDescription?: string;
  priceId: string;
  quantity: number;
  unitAmount: number;
  downloadUrl?: string;
}

// API functions
export const api = {
  // Products (public)
  async listProducts(): Promise<{ products: Product[] }> {
    return fetchApi('/products', {}, false);
  },

  async getProduct(id: string): Promise<{ product: Product }> {
    return fetchApi(`/products/${id}`, {}, false);
  },

  // Cart (authenticated)
  async getCart(): Promise<{ items: CartItem[] }> {
    return fetchApi('/cart');
  },

  async addToCart(productId: string, priceId: string, quantity = 1): Promise<{ item: CartItem }> {
    return fetchApi('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, priceId, quantity }),
    });
  },

  async updateCartItem(itemId: number, quantity: number): Promise<{ item: CartItem } | { message: string }> {
    return fetchApi(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  async removeFromCart(itemId: number): Promise<{ message: string }> {
    return fetchApi(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  },

  async clearCart(): Promise<{ message: string }> {
    return fetchApi('/cart', {
      method: 'DELETE',
    });
  },

  // Checkout
  async createCheckout(successUrl: string, cancelUrl: string): Promise<{ url: string }> {
    return fetchApi('/checkout', {
      method: 'POST',
      body: JSON.stringify({ successUrl, cancelUrl }),
    });
  },

  // Orders
  async listOrders(): Promise<{ orders: Order[] }> {
    return fetchApi('/orders');
  },

  async getOrder(id: string): Promise<{ order: Order; items: OrderItem[] }> {
    return fetchApi(`/orders/${id}`);
  },
};
