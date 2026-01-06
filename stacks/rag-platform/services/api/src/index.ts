import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Chat API routes
app.use('/api', chatRouter);

app.listen(PORT, () => {
  console.log(`RAG Platform API running on port ${PORT}`);
});

export { app };