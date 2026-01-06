/**
 * Text chunking utilities for RAG
 */

export interface ChunkOptions {
  maxChunkSize?: number; // Max characters per chunk
  chunkOverlap?: number; // Characters to overlap between chunks
  separator?: string; // Preferred split point
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  maxChunkSize: 1000,
  chunkOverlap: 200,
  separator: '\n\n',
};

/**
 * Split text into overlapping chunks for embedding
 */
export function chunkText(text: string, options?: ChunkOptions): string[] {
  const { maxChunkSize, chunkOverlap, separator } = { ...DEFAULT_OPTIONS, ...options };

  // Clean up text
  const cleanText = text.replace(/\r\n/g, '\n').trim();

  if (cleanText.length <= maxChunkSize) {
    return [cleanText];
  }

  const chunks: string[] = [];

  // Try to split on preferred separator first
  const paragraphs = cleanText.split(separator);

  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;

    // If adding this paragraph exceeds max size, save current chunk
    if (currentChunk && currentChunk.length + trimmedParagraph.length + separator.length > maxChunkSize) {
      chunks.push(currentChunk.trim());

      // Start new chunk with overlap from previous
      const overlap = currentChunk.slice(-chunkOverlap);
      currentChunk = overlap + (overlap ? separator : '') + trimmedParagraph;
    } else {
      currentChunk += (currentChunk ? separator : '') + trimmedParagraph;
    }

    // Handle paragraphs larger than max chunk size
    while (currentChunk.length > maxChunkSize) {
      // Find a good split point (sentence end, word boundary)
      let splitPoint = maxChunkSize;

      // Try to split at sentence end
      const sentenceEnd = currentChunk.lastIndexOf('. ', maxChunkSize);
      if (sentenceEnd > maxChunkSize / 2) {
        splitPoint = sentenceEnd + 1;
      } else {
        // Fall back to word boundary
        const wordBoundary = currentChunk.lastIndexOf(' ', maxChunkSize);
        if (wordBoundary > maxChunkSize / 2) {
          splitPoint = wordBoundary;
        }
      }

      chunks.push(currentChunk.slice(0, splitPoint).trim());

      // Keep overlap for next chunk
      const overlapStart = Math.max(0, splitPoint - chunkOverlap);
      currentChunk = currentChunk.slice(overlapStart).trim();
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Split text by sentences (for finer-grained chunking)
 */
export function splitSentences(text: string): string[] {
  // Basic sentence splitting (can be improved with NLP)
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
