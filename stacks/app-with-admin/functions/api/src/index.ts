/**
 * Main API Function
 *
 * Express API for user-facing features.
 * Protected by Firebase Auth.
 */

import express from 'express';
import cors from 'cors';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

const app = express();
app.use(cors());
app.use(express.json());

// Success response helper
function success(res: express.Response, data: unknown) {
  res.json({ success: true, data });
}

// Error response helper
function error(res: express.Response, status: number, message: string, code: string) {
  res.status(status).json({ success: false, error: message, code });
}

/**
 * Auth middleware - validates Firebase ID token
 */
async function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return error(res, 401, 'Missing authorization header', 'MISSING_AUTH');
  }

  const token = authHeader.split('Bearer ')[1] ?? '';

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    (req as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    next();
  } catch (e) {
    console.error('Token verification failed:', e);
    return error(res, 401, 'Invalid token', 'INVALID_TOKEN');
  }
}

// Health check (public)
app.get('/api/health', (_req, res) => {
  success(res, { status: 'ok', timestamp: new Date().toISOString() });
});

// Protected routes
app.use('/api', authMiddleware);

// Get user profile
app.get('/api/profile', async (req, res) => {
  try {
    const user = (req as any).user;
    const userDoc = await db.collection('users').doc(user.uid).get();

    if (!userDoc.exists) {
      // Create user profile if it doesn't exist
      const newUser = {
        email: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.collection('users').doc(user.uid).set(newUser);
      return success(res, newUser);
    }

    success(res, userDoc.data());
  } catch (e) {
    console.error('Error fetching profile:', e);
    error(res, 500, 'Failed to fetch profile', 'INTERNAL_ERROR');
  }
});

// Update user profile
app.put('/api/profile', async (req, res) => {
  try {
    const user = (req as any).user;
    const { name } = req.body;

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (name !== undefined) updates.name = name;

    await db.collection('users').doc(user.uid).update(updates);

    const userDoc = await db.collection('users').doc(user.uid).get();
    success(res, userDoc.data());
  } catch (e) {
    console.error('Error updating profile:', e);
    error(res, 500, 'Failed to update profile', 'INTERNAL_ERROR');
  }
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  error(res, 500, 'Internal server error', 'INTERNAL_ERROR');
});

// Export for Cloud Functions
export const handler: any = app;
