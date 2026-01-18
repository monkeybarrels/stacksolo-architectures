<script setup lang="ts">
import { ref } from 'vue';
import DashboardLayout from '../components/DashboardLayout.vue';

const copiedEndpoint = ref<string | null>(null);

function copyToClipboard(text: string, endpoint: string) {
  navigator.clipboard.writeText(text);
  copiedEndpoint.value = endpoint;
  setTimeout(() => {
    copiedEndpoint.value = null;
  }, 2000);
}

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/health',
    description: 'Health check endpoint',
    example: `curl -X GET "https://your-api.com/api/v1/health" \\
  -H "X-API-Key: gw_xxxxx"`,
    response: `{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/echo',
    description: 'Echo endpoint for testing',
    example: `curl -X POST "https://your-api.com/api/v1/echo" \\
  -H "X-API-Key: gw_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello, World!"}'`,
    response: `{
  "method": "POST",
  "path": "/echo",
  "body": { "message": "Hello, World!" },
  "apiKey": { "id": "abc123", "plan": "free" }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/data',
    description: 'Get list of data items',
    example: `curl -X GET "https://your-api.com/api/v1/data" \\
  -H "X-API-Key: gw_xxxxx"`,
    response: `{
  "data": [
    { "id": 1, "name": "Item 1", "value": 100 },
    { "id": 2, "name": "Item 2", "value": 200 }
  ],
  "meta": { "count": 2 }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/data',
    description: 'Create a new data item',
    example: `curl -X POST "https://your-api.com/api/v1/data" \\
  -H "X-API-Key: gw_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "New Item", "value": 500}'`,
    response: `{
  "data": {
    "id": 1705315800000,
    "name": "New Item",
    "value": 500,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}`,
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
};
</script>

<template>
  <DashboardLayout>
    <div class="max-w-4xl">
      <h1 class="text-2xl font-bold text-gray-900">API Documentation</h1>
      <p class="mt-1 text-gray-500">Learn how to integrate with the API</p>

      <!-- Authentication -->
      <div class="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900">Authentication</h2>
        <p class="mt-2 text-gray-600">
          All API requests require an API key. Include your key in the <code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">X-API-Key</code> header:
        </p>
        <pre class="mt-4 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
curl -X GET "https://your-api.com/api/v1/endpoint" \
  -H "X-API-Key: gw_your_key_here"</pre>
      </div>

      <!-- Rate Limiting -->
      <div class="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900">Rate Limiting</h2>
        <p class="mt-2 text-gray-600">
          Rate limits depend on your plan. The following headers are included in every response:
        </p>
        <table class="mt-4 w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-2 text-gray-500">Header</th>
              <th class="text-left py-2 text-gray-500">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr>
              <td class="py-2 font-mono text-gray-900">X-RateLimit-Limit</td>
              <td class="py-2 text-gray-600">Requests allowed per minute</td>
            </tr>
            <tr>
              <td class="py-2 font-mono text-gray-900">X-RateLimit-Remaining</td>
              <td class="py-2 text-gray-600">Requests remaining in current window</td>
            </tr>
            <tr>
              <td class="py-2 font-mono text-gray-900">X-RateLimit-Reset</td>
              <td class="py-2 text-gray-600">Unix timestamp when the limit resets</td>
            </tr>
            <tr>
              <td class="py-2 font-mono text-gray-900">Retry-After</td>
              <td class="py-2 text-gray-600">Seconds to wait (only when rate limited)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Errors -->
      <div class="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900">Error Responses</h2>
        <p class="mt-2 text-gray-600">
          Errors return a JSON object with <code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">error</code> and <code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">message</code> fields:
        </p>
        <pre class="mt-4 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Limit is 100 requests per minute.",
  "retryAfter": 30
}</pre>
        <table class="mt-4 w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-2 text-gray-500">Status Code</th>
              <th class="text-left py-2 text-gray-500">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr>
              <td class="py-2 font-mono text-gray-900">401</td>
              <td class="py-2 text-gray-600">Invalid or missing API key</td>
            </tr>
            <tr>
              <td class="py-2 font-mono text-gray-900">429</td>
              <td class="py-2 text-gray-600">Rate limit exceeded</td>
            </tr>
            <tr>
              <td class="py-2 font-mono text-gray-900">500</td>
              <td class="py-2 text-gray-600">Internal server error</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Endpoints -->
      <div class="mt-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Endpoints</h2>

        <div class="space-y-4">
          <div
            v-for="endpoint in endpoints"
            :key="endpoint.path"
            class="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span :class="['px-2 py-1 text-xs font-bold rounded', methodColors[endpoint.method]]">
                  {{ endpoint.method }}
                </span>
                <span class="font-mono text-gray-900">{{ endpoint.path }}</span>
              </div>
              <span class="text-sm text-gray-500">{{ endpoint.description }}</span>
            </div>

            <div class="p-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Example Request</span>
                <button
                  @click="copyToClipboard(endpoint.example, endpoint.path)"
                  class="text-sm text-blue-600 hover:text-blue-700"
                >
                  {{ copiedEndpoint === endpoint.path ? 'Copied!' : 'Copy' }}
                </button>
              </div>
              <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">{{ endpoint.example }}</pre>

              <div class="mt-4">
                <span class="text-sm font-medium text-gray-700">Response</span>
                <pre class="mt-2 bg-gray-100 text-gray-800 p-4 rounded-lg overflow-x-auto text-sm">{{ endpoint.response }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
