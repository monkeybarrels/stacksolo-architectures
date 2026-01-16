/**
 * Admin API Function
 *
 * Express API for admin features.
 * Protected by Firebase Auth + domain restriction.
 *
 * Only users with emails from allowed domains can access.
 * Configure ADMIN_DOMAINS env var as comma-separated list.
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

// Get allowed domains from environment
const ADMIN_DOMAINS = (process.env.ADMIN_DOMAINS || '')
  .split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

// Success response helper
function success(res: express.Response, data: unknown) {
  res.json({ success: true, data });
}

// Error response helper
function error(res: express.Response, status: number, message: string, code: string) {
  res.status(status).json({ success: false, error: message, code });
}

/**
 * Auth middleware - validates Firebase ID token + domain restriction
 */
async function adminAuthMiddleware(
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
    const email = decodedToken.email;

    if (!email) {
      return error(res, 403, 'No email associated with account', 'NO_EMAIL');
    }

    // Check domain restriction
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain || !ADMIN_DOMAINS.includes(domain)) {
      console.warn(`Access denied for ${email} - domain ${domain} not in allowed list`);
      return error(
        res,
        403,
        `Access denied. Your domain (${domain}) is not authorized.`,
        'DOMAIN_NOT_ALLOWED'
      );
    }

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
app.get('/admin-api/health', (_req, res) => {
  success(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    allowedDomains: ADMIN_DOMAINS.length > 0 ? ADMIN_DOMAINS : ['<not configured>'],
  });
});

// Protected admin routes
app.use('/admin-api', adminAuthMiddleware);

// List all users (admin only)
app.get('/admin-api/users', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').limit(limit).offset(offset).get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const countSnapshot = await db.collection('users').count().get();
    const total = countSnapshot.data().count;

    success(res, { users, total, limit, offset });
  } catch (e) {
    console.error('Error fetching users:', e);
    error(res, 500, 'Failed to fetch users', 'INTERNAL_ERROR');
  }
});

// Get single user (admin only)
app.get('/admin-api/users/:id', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.id).get();

    if (!userDoc.exists) {
      return error(res, 404, 'User not found', 'NOT_FOUND');
    }

    success(res, { id: userDoc.id, ...userDoc.data() });
  } catch (e) {
    console.error('Error fetching user:', e);
    error(res, 500, 'Failed to fetch user', 'INTERNAL_ERROR');
  }
});

// Update user (admin only)
app.put('/admin-api/users/:id', async (req, res) => {
  try {
    const { name, status, notes } = req.body;
    const adminUser = (req as any).user;

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser.email,
    };
    if (name !== undefined) updates.name = name;
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.adminNotes = notes;

    await db.collection('users').doc(req.params.id).update(updates);

    const userDoc = await db.collection('users').doc(req.params.id).get();
    success(res, { id: userDoc.id, ...userDoc.data() });
  } catch (e) {
    console.error('Error updating user:', e);
    error(res, 500, 'Failed to update user', 'INTERNAL_ERROR');
  }
});

// Delete user (admin only)
app.delete('/admin-api/users/:id', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.id).get();

    if (!userDoc.exists) {
      return error(res, 404, 'User not found', 'NOT_FOUND');
    }

    // Soft delete - mark as deleted but keep record
    await db.collection('users').doc(req.params.id).update({
      deletedAt: new Date().toISOString(),
      deletedBy: (req as any).user.email,
      status: 'deleted',
    });

    success(res, { message: 'User deleted' });
  } catch (e) {
    console.error('Error deleting user:', e);
    error(res, 500, 'Failed to delete user', 'INTERNAL_ERROR');
  }
});

// Dashboard stats (admin only)
app.get('/admin-api/stats', async (req, res) => {
  try {
    const [usersCount, activeCount] = await Promise.all([
      db.collection('users').count().get(),
      db
        .collection('users')
        .where('status', '!=', 'deleted')
        .count()
        .get(),
    ]);

    success(res, {
      totalUsers: usersCount.data().count,
      activeUsers: activeCount.data().count,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Error fetching stats:', e);
    error(res, 500, 'Failed to fetch stats', 'INTERNAL_ERROR');
  }
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  error(res, 500, 'Internal server error', 'INTERNAL_ERROR');
});

// Export for Cloud Functions
export const handler: any = app;
