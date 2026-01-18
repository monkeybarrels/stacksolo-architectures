/**
 * Gateway Routes
 * Public API endpoints that require API key authentication
 */

import { Router } from 'express';
import { apiKeyMiddleware } from '../middleware/apiKey';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { usageTrackingMiddleware } from '../middleware/usage';

const router = Router();

// Apply middleware to all gateway routes
router.use(apiKeyMiddleware);
router.use(rateLimitMiddleware);
router.use(usageTrackingMiddleware);

/**
 * Health check endpoint
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Echo endpoint - returns request details
 * Useful for testing and debugging
 */
router.post('/echo', (req, res) => {
  res.json({
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
    },
    apiKey: {
      id: req.apiKey?.id,
      plan: req.apiKey?.plan,
    },
  });
});

/**
 * Example: Get data endpoint
 * Replace this with your actual API logic
 */
router.get('/data', async (req, res) => {
  // Simulated data response
  const mockData = [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
    { id: 3, name: 'Item 3', value: 300 },
  ];

  res.json({
    data: mockData,
    meta: {
      count: mockData.length,
      apiKeyId: req.apiKey?.id,
    },
  });
});

/**
 * Example: Create data endpoint
 */
router.post('/data', async (req, res) => {
  const { name, value } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  // Simulated create response
  const newItem = {
    id: Date.now(),
    name,
    value: value || 0,
    createdAt: new Date().toISOString(),
  };

  res.status(201).json({ data: newItem });
});

/**
 * Example: Get single item
 */
router.get('/data/:id', async (req, res) => {
  const { id } = req.params;

  // Simulated response
  const item = {
    id: parseInt(id),
    name: `Item ${id}`,
    value: parseInt(id) * 100,
  };

  res.json({ data: item });
});

/**
 * Example: Update item
 */
router.put('/data/:id', async (req, res) => {
  const { id } = req.params;
  const { name, value } = req.body;

  // Simulated update response
  const item = {
    id: parseInt(id),
    name: name || `Item ${id}`,
    value: value || parseInt(id) * 100,
    updatedAt: new Date().toISOString(),
  };

  res.json({ data: item });
});

/**
 * Example: Delete item
 */
router.delete('/data/:id', async (req, res) => {
  const { id } = req.params;

  // Simulated delete response
  res.json({
    message: `Item ${id} deleted`,
    deletedAt: new Date().toISOString(),
  });
});

export default router;
