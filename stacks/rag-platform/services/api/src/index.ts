import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat';
import { documentsRouter } from './routes/documents';
import { botsRouter } from './routes/bots';
import { feedbackRouter } from './routes/feedback';
import { registerBuiltinTools } from './tools';
import { rateLimitPresets } from './middleware';
import { initDb } from './lib/db';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Apply standard rate limiting to all API routes
app.use('/api', rateLimitPresets.standard);

// Health check (no rate limit)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', botsRouter);
app.use('/api', chatRouter);
app.use('/api', documentsRouter);
app.use('/api', feedbackRouter);

// Initialize and start server
async function start() {
  // Initialize database connection
  await initDb();

  // Register built-in tools
  registerBuiltinTools();

  app.listen(PORT, () => {
    console.log(`RAG Platform API running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export { app };