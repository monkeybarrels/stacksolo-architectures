/**
 * API with Firebase Auth + PostgreSQL
 *
 * Firebase Auth for authentication, Cloud SQL PostgreSQL for data.
 * Uses Drizzle ORM with repository pattern for clean data access.
 */

import express from 'express';
import cors from 'cors';
import { kernel } from '@stacksolo/runtime';
import { userRepository, itemRepository } from './repositories';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check (unauthenticated)
app.get('/api/health', async (_req, res) => {
  try {
    // Quick check - count returns 0 if table is empty, throws if disconnected
    await userRepository.findById('health-check');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Protected routes - require Firebase Auth token
app.use('/api', kernel.authMiddleware());

// Get user profile (creates if not exists)
app.get('/api/profile', async (req, res) => {
  try {
    const user = req.user!;
    const profile = await userRepository.findOrCreate(user.uid, user.email || '');
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
app.put('/api/profile', async (req, res) => {
  try {
    const user = req.user!;
    const { name, bio } = req.body;

    const profile = await userRepository.update(user.uid, { name, bio });

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// List user's items
app.get('/api/items', async (req, res) => {
  try {
    const user = req.user!;
    const userItems = await itemRepository.findByUser(user.uid);
    res.json(userItems);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Create item
app.post('/api/items', async (req, res) => {
  try {
    const user = req.user!;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const item = await itemRepository.create({
      userId: user.uid,
      title,
      description: description || null,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update item
app.put('/api/items/:id', async (req, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { title, description } = req.body;

    const item = await itemRepository.update(parseInt(id), user.uid, {
      title,
      description,
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const deleted = await itemRepository.delete(parseInt(id), user.uid);

    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Cloud Function entry point
export const handler = app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
  });
}