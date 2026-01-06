import { Router } from 'express';
import {
  createBot,
  getBot,
  listBots,
  updateBot,
  deleteBot,
  type CreateBotInput,
  type UpdateBotInput,
} from '../engine/bots';
import { listDocuments, deleteDocumentAndChunks } from '../engine/vectorstore';
import { kernel } from '@stacksolo/runtime';

export const botsRouter = Router();

// POST /api/bots - Create a new bot
botsRouter.post('/bots', async (req, res) => {
  try {
    const { name, description, systemPrompt, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Bot name is required' });
    }

    // Get user from auth (optional for now, use anonymous if not authenticated)
    let createdBy = 'anonymous';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const result = await kernel.validateToken(authHeader);
        if (result.valid) {
          createdBy = result.email || result.uid;
        }
      } catch {
        // Continue with anonymous
      }
    }

    const input: CreateBotInput = {
      name,
      description,
      systemPrompt,
      isPublic,
      createdBy,
    };

    const bot = await createBot(input);
    res.status(201).json(bot);
  } catch (error) {
    console.error('Create bot error:', error);
    res.status(500).json({ error: 'Failed to create bot' });
  }
});

// GET /api/bots - List bots
botsRouter.get('/bots', async (req, res) => {
  try {
    // Get user from auth (optional)
    let userEmail: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const result = await kernel.validateToken(authHeader);
        if (result.valid) {
          userEmail = result.email || result.uid;
        }
      } catch {
        // Continue without user filter
      }
    }

    const bots = await listBots({
      createdBy: userEmail,
      includePublic: true,
    });

    res.json({ bots });
  } catch (error) {
    console.error('List bots error:', error);
    res.status(500).json({ error: 'Failed to list bots' });
  }
});

// GET /api/bots/:id - Get bot by ID
botsRouter.get('/bots/:id', async (req, res) => {
  try {
    const bot = await getBot(req.params.id);

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json(bot);
  } catch (error) {
    console.error('Get bot error:', error);
    res.status(500).json({ error: 'Failed to get bot' });
  }
});

// PUT /api/bots/:id - Update bot
botsRouter.put('/bots/:id', async (req, res) => {
  try {
    const { name, description, systemPrompt, isPublic } = req.body;

    const input: UpdateBotInput = {};
    if (name !== undefined) input.name = name;
    if (description !== undefined) input.description = description;
    if (systemPrompt !== undefined) input.systemPrompt = systemPrompt;
    if (isPublic !== undefined) input.isPublic = isPublic;

    const bot = await updateBot(req.params.id, input);

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json(bot);
  } catch (error) {
    console.error('Update bot error:', error);
    res.status(500).json({ error: 'Failed to update bot' });
  }
});

// DELETE /api/bots/:id - Delete bot and all its documents
botsRouter.delete('/bots/:id', async (req, res) => {
  try {
    const bot = await getBot(req.params.id);

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Delete all documents belonging to this bot
    const documents = await listDocuments(req.params.id);
    for (const doc of documents) {
      try {
        await kernel.files.delete(doc.path);
      } catch {
        // Continue even if file deletion fails
      }
      await deleteDocumentAndChunks(doc.id);
    }

    // Delete the bot
    await deleteBot(req.params.id);

    res.json({ message: 'Bot deleted successfully' });
  } catch (error) {
    console.error('Delete bot error:', error);
    res.status(500).json({ error: 'Failed to delete bot' });
  }
});
