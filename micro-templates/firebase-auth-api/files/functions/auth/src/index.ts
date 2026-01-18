/**
 * Firebase Auth API
 *
 * Provides authentication middleware and profile management endpoints.
 */

import * as functions from '@google-cloud/functions-framework';
import express from 'express';
import { kernel } from '@stacksolo/runtime';
import { eq } from 'drizzle-orm';
import { db, users, type User, type NewUser } from './db/index';

const app = express();
app.use(express.json());

// Apply auth middleware to all routes
app.use(kernel.authMiddleware());

/**
 * Get or create user profile
 */
app.get('/auth/profile', async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user!;

    // Try to find existing user
    let [user] = await db.select().from(users).where(eq(users.id, uid));

    // Create if not exists
    if (!user) {
      const newUser: NewUser = {
        id: uid,
        email: email || '',
        name: name || null,
        avatarUrl: picture || null,
      };

      [user] = await db.insert(users).values(newUser).returning();
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * Update user profile
 */
app.put('/auth/profile', async (req, res) => {
  try {
    const { uid } = req.user!;
    const { name, bio, avatarUrl } = req.body;

    const [user] = await db
      .update(users)
      .set({
        name,
        bio,
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, uid))
      .returning();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Health check (no auth required for this one, add before middleware if needed)
app.get('/auth/health', (_req, res) => {
  res.json({ status: 'ok' });
});

functions.http('auth', app);
