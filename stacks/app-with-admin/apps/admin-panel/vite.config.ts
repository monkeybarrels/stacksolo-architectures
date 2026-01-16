import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  // IMPORTANT: Set base to /admin/ since this app is served at /admin/*
  base: '/admin/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/admin-api': {
        target: `http://localhost:${process.env.ADMIN_API_PORT || 8082}`,
        changeOrigin: true,
      },
    },
  },
});
