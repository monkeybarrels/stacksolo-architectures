/**
 * API Function
 *
 * Protected API endpoints using kernel.authMiddleware() for Firebase Auth validation.
 */

import express from 'express';
import cors from 'cors';
import { kernel, firestore } from '@stacksolo/runtime';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check (unauthenticated)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected routes - require Firebase Auth token
app.use('/api', kernel.authMiddleware());

// Get user profile
app.get('/api/profile', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const db = firestore();
    const userDoc = await db.collection('users').doc(user.uid).get();

    if (!userDoc.exists) {
      // Create user profile if it doesn't exist
      const profile = {
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
      };
      await db.collection('users').doc(user.uid).set(profile);
      return res.json(profile);
    }

    return res.json(userDoc.data());
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/api/profile', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { displayName, bio } = req.body;
    const db = firestore();

    await db.collection('users').doc(user.uid).set(
      {
        displayName,
        bio,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    const updated = await db.collection('users').doc(user.uid).get();
    return res.json(updated.data());
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Example: List user's items
app.get('/api/items', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const db = firestore();
    const snapshot = await db
      .collection('users')
      .doc(user.uid)
      .collection('items')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Example: Create item
app.post('/api/items', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const db = firestore();
    const item = {
      title,
      description: description || '',
      createdAt: new Date().toISOString(),
    };

    const docRef = await db
      .collection('users')
      .doc(user.uid)
      .collection('items')
      .add(item);

    return res.status(201).json({
      id: docRef.id,
      ...item,
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Cloud Function entry point
export const handler = app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
  });
}
