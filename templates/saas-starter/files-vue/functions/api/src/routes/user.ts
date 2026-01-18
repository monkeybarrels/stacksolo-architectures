/**
 * User Routes
 *
 * Profile management endpoints.
 */

import { Router } from 'express';
import { userRepository } from '../repositories';

const router = Router();

// Get user profile
router.get('/profile', async (req, res) => {
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
router.put('/profile', async (req, res) => {
  try {
    const user = req.user!;
    const { name, avatarUrl } = req.body;

    const profile = await userRepository.update(user.uid, { name, avatarUrl });

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
