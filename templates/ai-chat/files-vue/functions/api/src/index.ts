/**
 * AI Chat API
 * Express server with Vertex AI integration
 */

import express from 'express';
import cors from 'cors';
import { kernel } from '@stacksolo/runtime';
import chatRoutes from './routes/chat';
import conversationsRoutes from './routes/conversations';

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Initialize kernel (Firebase Auth verification)
kernel.init({
  kernelUrl: process.env.KERNEL_URL,
  kernelType: (process.env.KERNEL_TYPE as 'gcp' | 'nats') || 'gcp',
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ai-chat-api',
  });
});

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationsRoutes);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Cloud Functions
export const handler = app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`AI Chat API running on port ${port}`);
  });
}
