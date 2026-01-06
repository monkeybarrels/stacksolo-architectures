/**
 * Tool System
 *
 * Extensible tool system for the RAG platform.
 *
 * Usage:
 * ```typescript
 * import { createTool, toolRegistry } from './tools';
 *
 * // Create a custom tool
 * const myTool = createTool({
 *   name: 'my_tool',
 *   description: 'Does something useful',
 *   parameters: {
 *     input: { type: 'string', description: 'The input', required: true },
 *   },
 *   handler: async ({ input }, context) => {
 *     return `Processed: ${input}`;
 *   },
 * });
 *
 * // Register globally
 * toolRegistry.register(myTool);
 *
 * // Or register for a specific bot
 * toolRegistry.registerForBot('bot-123', myTool);
 *
 * // Execute a tool call
 * const result = await toolRegistry.execute(
 *   { name: 'my_tool', arguments: { input: 'hello' } },
 *   { botId: 'bot-123', userId: 'user-456' }
 * );
 * ```
 */

// Core exports
export { createTool, toGeminiFunctionDeclaration } from './create-tool';
export { toolRegistry } from './registry';

// Types
export type {
  Tool,
  ToolDefinition,
  ToolHandler,
  ToolContext,
  ToolCallRequest,
  ToolCallResult,
  ParameterType,
  ParameterDefinition,
  GeminiFunctionDeclaration,
} from './types';

// Built-in tools
export { registerBuiltinTools, searchDocumentsTool, currentTimeTool } from './builtin';
