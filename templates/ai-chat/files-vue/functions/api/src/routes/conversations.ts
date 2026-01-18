/**
 * Conversations Routes
 * Manage conversation history
 */

import { Router } from 'express';
import { kernel } from '@stacksolo/runtime';
import {
  listConversations,
  getConversation,
  deleteConversation,
  updateConversationTitle,
} from '../services/firestore.service';

const router = Router();

/**
 * GET /api/conversations
 * List all conversations for the current user
 */
router.get('/', kernel.authMiddleware(), async (req, res) => {
  const userId = req.user!.uid;
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const conversations = await listConversations(userId, limit);

    // Return without full message content for list view
    const summaries = conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      messageCount: conv.messages.length,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));

    res.json({ conversations: summaries });
  } catch (error: any) {
    console.error('List conversations error:', error);
    res.status(500).json({ error: error.message || 'Failed to list conversations' });
  }
});

/**
 * GET /api/conversations/:id
 * Get a specific conversation with all messages
 */
router.get('/:id', kernel.authMiddleware(), async (req, res) => {
  const userId = req.user!.uid;
  const { id } = req.params;

  try {
    const conversation = await getConversation(id, userId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ conversation });
  } catch (error: any) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: error.message || 'Failed to get conversation' });
  }
});

/**
 * PATCH /api/conversations/:id
 * Update conversation (e.g., title)
 */
router.patch('/:id', kernel.authMiddleware(), async (req, res) => {
  const userId = req.user!.uid;
  const { id } = req.params;
  const { title } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const updated = await updateConversationTitle(id, userId, title);

    if (!updated) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: error.message || 'Failed to update conversation' });
  }
});

/**
 * DELETE /api/conversations/:id
 * Delete a conversation
 */
router.delete('/:id', kernel.authMiddleware(), async (req, res) => {
  const userId = req.user!.uid;
  const { id } = req.params;

  try {
    const deleted = await deleteConversation(id, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete conversation' });
  }
});

export default router;
