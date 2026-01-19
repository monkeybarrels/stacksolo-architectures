import type { HttpFunction } from '@google-cloud/functions-framework';

/**
 * API Function Handler
 *
 * This is your main API endpoint. Add routes and business logic here.
 * The function is deployed to Cloud Functions and proxied via /api/*
 */
export const handler: HttpFunction = async (req, res) => {
  // Enable CORS for local development
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Simple routing
  const path = req.path.replace(/^\/api/, '') || '/';

  switch (path) {
    case '/':
    case '/health':
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
      break;

    case '/hello':
      const name = req.query.name || 'World';
      res.json({ message: `Hello, ${name}!` });
      break;

    default:
      res.status(404).json({ error: 'Not found', path });
  }
};
