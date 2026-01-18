/**
 * SaaS Starter API
 *
 * Firebase Auth + PostgreSQL + Stripe billing.
 */

import express from 'express';
import cors from 'cors';
import { kernel } from '@stacksolo/runtime';
import userRoutes from './routes/user';
import billingRoutes from './routes/billing';
import webhooksRoutes from './routes/webhooks';
import { userRepository } from './repositories';

const app = express();

// Middleware
app.use(cors());

// Health check (unauthenticated)
app.get('/api/health', async (_req, res) => {
  try {
    await userRepository.findById('health-check');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Webhooks - before body parsing and auth middleware
app.use('/api/webhooks', webhooksRoutes);

// Body parsing for other routes
app.use(express.json());

// Protected routes - require Firebase Auth token
app.use('/api', kernel.authMiddleware());

// Route handlers
app.use('/api/user', userRoutes);
app.use('/api/billing', billingRoutes);

// Cloud Function entry point
export const handler = app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
  });
}
