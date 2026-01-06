import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat';
import { documentsRouter } from './routes/documents';
import { botsRouter } from './routes/bots';
import { registerBuiltinTools } from './tools';

// Register built-in tools on startup
registerBuiltinTools();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', botsRouter);
app.use('/api', chatRouter);
app.use('/api', documentsRouter);

app.listen(PORT, () => {
  console.log(`RAG Platform API running on port ${PORT}`);
});

export { app };