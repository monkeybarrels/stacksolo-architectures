import { Router } from 'express';
import { kernel, downloadFile } from '@stacksolo/runtime';
import { generateEmbeddings } from '../engine/embeddings';
import { chunkText } from '../engine/chunker';
import {
  saveDocument,
  saveChunks,
  listDocuments,
  getDocument,
  deleteDocumentAndChunks,
  updateDocumentStatus,
} from '../engine/vectorstore';

export const documentsRouter = Router();

const BUCKET = process.env.DOCUMENTS_BUCKET || '';

/**
 * Extract text from document based on content type
 */
function extractText(content: Buffer, contentType: string): string {
  if (
    contentType === 'text/plain' ||
    contentType === 'text/markdown' ||
    contentType === 'application/json'
  ) {
    return content.toString('utf-8');
  }

  if (contentType === 'text/html') {
    return content.toString('utf-8').replace(/<[^>]*>/g, ' ');
  }

  // Default: try to read as text
  return content.toString('utf-8');
}

// POST /api/documents/upload-url - Get signed URL for upload
documentsRouter.post('/documents/upload-url', async (req, res) => {
  try {
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename and contentType are required' });
    }

    const path = `documents/${Date.now()}-${filename}`;

    // Get signed upload URL from kernel
    const { uploadUrl } = await kernel.files.getUploadUrl(path, contentType);

    // Create document record in pending state
    const document = await saveDocument({
      filename,
      path,
      contentType,
      size: 0,
      chunkCount: 0,
      status: 'pending',
    });

    res.json({
      uploadUrl,
      documentId: document.id,
      path,
    });
  } catch (error) {
    console.error('Get upload URL error:', error);
    res.status(500).json({ error: 'Failed to get upload URL' });
  }
});

// POST /api/documents/:id/process - Process uploaded document (generate embeddings)
documentsRouter.post('/documents/:id/process', async (req, res) => {
  try {
    const document = await getDocument(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.status !== 'pending') {
      return res.status(400).json({ error: `Document is already ${document.status}` });
    }

    // Update status to processing
    await updateDocumentStatus(document.id, 'processing');

    try {
      // Download file content using kernel
      const { downloadUrl } = await kernel.files.getDownloadUrl(document.path);
      const response = await fetch(downloadUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      // Extract text
      const text = extractText(buffer, document.contentType);
      if (!text.trim()) {
        await updateDocumentStatus(document.id, 'error');
        return res.status(400).json({ error: 'Could not extract text from document' });
      }

      // Chunk the text
      const textChunks = chunkText(text);

      // Generate embeddings
      const embeddings = await generateEmbeddings(textChunks);

      // Save chunks with embeddings
      const chunks = textChunks.map((content, i) => ({
        content,
        embedding: embeddings[i].embedding,
        tokenCount: embeddings[i].tokenCount,
      }));

      await saveChunks(document.id, chunks);

      // Update document status and chunk count
      await updateDocumentStatus(document.id, 'ready', {
        chunkCount: textChunks.length,
        size: buffer.length,
      });

      // Publish event for downstream processing
      await kernel.events.publish('document.embedded', {
        documentId: document.id,
        chunkCount: textChunks.length,
      });

      res.json({
        id: document.id,
        status: 'ready',
        chunkCount: textChunks.length,
        message: 'Document processed successfully',
      });
    } catch (processError) {
      console.error('Document processing error:', processError);
      await updateDocumentStatus(document.id, 'error');
      throw processError;
    }
  } catch (error) {
    console.error('Process document error:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

// GET /api/documents - List all documents
documentsRouter.get('/documents', async (req, res) => {
  try {
    const documents = await listDocuments();
    res.json({ documents });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

// GET /api/documents/:id - Get document by ID
documentsRouter.get('/documents/:id', async (req, res) => {
  try {
    const document = await getDocument(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to get document' });
  }
});

// DELETE /api/documents/:id - Delete a document
documentsRouter.delete('/documents/:id', async (req, res) => {
  try {
    const document = await getDocument(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from Cloud Storage via kernel
    try {
      await kernel.files.delete(document.path);
    } catch (storageError) {
      console.warn('Could not delete from storage:', storageError);
    }

    // Delete from Firestore
    await deleteDocumentAndChunks(document.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});
