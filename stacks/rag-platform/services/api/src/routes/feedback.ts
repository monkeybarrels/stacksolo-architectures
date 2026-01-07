/**
 * Feedback Routes
 *
 * API endpoints for submitting and viewing feedback.
 */

import { Router } from 'express';
import {
  submitFeedback,
  getFeedbackByMessageId,
  updateFeedback,
  getFeedbackStats,
  listFeedback,
} from '../engine/feedback';

export const feedbackRouter = Router();

/**
 * POST /api/feedback
 * Submit feedback for a message
 */
feedbackRouter.post('/feedback', async (req, res) => {
  try {
    const {
      botId,
      conversationId,
      messageId,
      userId,
      type,
      comment,
      userMessage,
      assistantResponse,
      sources,
    } = req.body;

    if (!botId || !conversationId || !messageId || !type) {
      return res.status(400).json({
        error: 'Missing required fields: botId, conversationId, messageId, type',
      });
    }

    if (type !== 'positive' && type !== 'negative') {
      return res.status(400).json({
        error: 'Type must be "positive" or "negative"',
      });
    }

    // Check if feedback already exists
    const existing = await getFeedbackByMessageId(messageId);
    if (existing) {
      // Update existing feedback
      await updateFeedback(existing.id, { type, comment });
      return res.json({
        feedback: { ...existing, type, comment },
        updated: true,
      });
    }

    const feedback = await submitFeedback({
      botId,
      conversationId,
      messageId,
      userId,
      type,
      comment,
      userMessage: userMessage || '',
      assistantResponse: assistantResponse || '',
      sources,
    });

    res.status(201).json({ feedback });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

/**
 * GET /api/bots/:botId/feedback/stats
 * Get feedback statistics for a bot
 */
feedbackRouter.get('/bots/:botId/feedback/stats', async (req, res) => {
  try {
    const { botId } = req.params;
    const stats = await getFeedbackStats(botId);
    res.json(stats);
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ error: 'Failed to get feedback stats' });
  }
});

/**
 * GET /api/bots/:botId/feedback
 * List feedback for a bot
 */
feedbackRouter.get('/bots/:botId/feedback', async (req, res) => {
  try {
    const { botId } = req.params;
    const { limit, type } = req.query;

    const feedback = await listFeedback(botId, {
      limit: limit ? parseInt(limit as string, 10) : 50,
      type: type as 'positive' | 'negative' | undefined,
    });

    res.json({ feedback });
  } catch (error) {
    console.error('List feedback error:', error);
    res.status(500).json({ error: 'Failed to list feedback' });
  }
});

/**
 * GET /api/messages/:messageId/feedback
 * Get feedback for a specific message
 */
feedbackRouter.get('/messages/:messageId/feedback', async (req, res) => {
  try {
    const { messageId } = req.params;
    const feedback = await getFeedbackByMessageId(messageId);

    if (!feedback) {
      return res.json({ feedback: null });
    }

    res.json({ feedback });
  } catch (error) {
    console.error('Get message feedback error:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});
