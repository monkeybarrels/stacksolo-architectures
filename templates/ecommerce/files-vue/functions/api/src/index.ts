/**
 * E-commerce API - Main Entry Point
 */

import express from 'express';
import cors from 'cors';
import { http } from '@google-cloud/functions-framework';
import './types';

import productsRoutes from './routes/products';
import cartRoutes from './routes/cart';
import checkoutRoutes from './routes/checkout';
import ordersRoutes from './routes/orders';
import webhooksRoutes from './routes/webhooks';

const app = express();

// Middleware - note: webhooks need raw body, so don't apply JSON parser globally to that route
app.use(cors());

// Webhooks must come before express.json() middleware
app.use('/api/webhooks', webhooksRoutes);

// JSON parser for all other routes
app.use(express.json());

// Health check (public)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ecommerce-api' });
});

// Product routes (public)
app.use('/api/products', productsRoutes);

// Cart routes (authenticated)
app.use('/api/cart', cartRoutes);

// Checkout routes (authenticated)
app.use('/api/checkout', checkoutRoutes);

// Order routes (authenticated)
app.use('/api/orders', ordersRoutes);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Export for Cloud Functions
http('handler', app);

export default app;
