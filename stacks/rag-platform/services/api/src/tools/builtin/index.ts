/**
 * Built-in Tools
 *
 * Default tools that are available to all bots.
 */

export { searchDocumentsTool } from './search-documents';
export { currentTimeTool } from './current-time';

import { toolRegistry } from '../registry';
import { searchDocumentsTool } from './search-documents';
import { currentTimeTool } from './current-time';

/**
 * Register all built-in tools globally
 */
export function registerBuiltinTools(): void {
  toolRegistry.register(searchDocumentsTool);
  toolRegistry.register(currentTimeTool);
}
