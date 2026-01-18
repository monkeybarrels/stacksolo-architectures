/**
 * API Gateway - Main Entry Point
 */

import express from 'express';
import cors from 'cors';
import { http } from '@google-cloud/functions-framework';
import './types';

import adminRoutes from './routes/admin';
import gatewayRoutes from './routes/gateway';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check (public)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Admin routes (Firebase Auth required)
app.use('/api/admin', adminRoutes);

// Gateway routes (API Key required)
app.use('/api/v1', gatewayRoutes);

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
