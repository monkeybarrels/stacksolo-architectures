/**
 * Tool Registry
 *
 * Central registry for managing tools. Tools can be registered globally
 * or scoped to specific bots.
 */

import type { Tool, ToolContext, ToolCallRequest, ToolCallResult, GeminiFunctionDeclaration } from './types';
import { toGeminiFunctionDeclaration } from './create-tool';

class ToolRegistry {
  private globalTools: Map<string, Tool> = new Map();
  private botTools: Map<string, Map<string, Tool>> = new Map();

  /**
   * Register a tool globally (available to all bots)
   */
  register(tool: Tool): void {
    if (this.globalTools.has(tool.definition.name)) {
      console.warn(`Overwriting existing global tool: ${tool.definition.name}`);
    }
    this.globalTools.set(tool.definition.name, tool);
  }

  /**
   * Register a tool for a specific bot
   */
  registerForBot(botId: string, tool: Tool): void {
    if (!this.botTools.has(botId)) {
      this.botTools.set(botId, new Map());
    }
    const botToolMap = this.botTools.get(botId)!;

    if (botToolMap.has(tool.definition.name)) {
      console.warn(`Overwriting existing bot tool: ${tool.definition.name} for bot ${botId}`);
    }
    botToolMap.set(tool.definition.name, tool);
  }

  /**
   * Unregister a global tool
   */
  unregister(toolName: string): boolean {
    return this.globalTools.delete(toolName);
  }

  /**
   * Unregister a bot-specific tool
   */
  unregisterForBot(botId: string, toolName: string): boolean {
    const botToolMap = this.botTools.get(botId);
    if (!botToolMap) return false;
    return botToolMap.delete(toolName);
  }

  /**
   * Get a tool by name (bot-specific tools take precedence)
   */
  get(toolName: string, botId?: string): Tool | undefined {
    // Check bot-specific tools first
    if (botId) {
      const botToolMap = this.botTools.get(botId);
      if (botToolMap?.has(toolName)) {
        return botToolMap.get(toolName);
      }
    }
    // Fall back to global tools
    return this.globalTools.get(toolName);
  }

  /**
   * Get all tools available to a bot
   */
  getToolsForBot(botId: string): Tool[] {
    const tools = new Map<string, Tool>();

    // Add global tools
    for (const [name, tool] of this.globalTools) {
      tools.set(name, tool);
    }

    // Add/override with bot-specific tools
    const botToolMap = this.botTools.get(botId);
    if (botToolMap) {
      for (const [name, tool] of botToolMap) {
        tools.set(name, tool);
      }
    }

    return Array.from(tools.values());
  }

  /**
   * Get function declarations for Gemini
   */
  getFunctionDeclarations(botId: string): GeminiFunctionDeclaration[] {
    return this.getToolsForBot(botId).map((tool) => toGeminiFunctionDeclaration(tool));
  }

  /**
   * Execute a tool call
   */
  async execute(request: ToolCallRequest, context: ToolContext): Promise<ToolCallResult> {
    const tool = this.get(request.name, context.botId);

    if (!tool) {
      return {
        name: request.name,
        result: null,
        error: `Tool not found: ${request.name}`,
      };
    }

    try {
      const result = await tool.handler(request.arguments, context);
      return {
        name: request.name,
        result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        name: request.name,
        result: null,
        error: message,
      };
    }
  }

  /**
   * Execute multiple tool calls
   */
  async executeMany(requests: ToolCallRequest[], context: ToolContext): Promise<ToolCallResult[]> {
    return Promise.all(requests.map((req) => this.execute(req, context)));
  }

  /**
   * List all registered tool names
   */
  listTools(botId?: string): string[] {
    if (botId) {
      return this.getToolsForBot(botId).map((t) => t.definition.name);
    }
    return Array.from(this.globalTools.keys());
  }

  /**
   * Check if any tools are registered for a bot
   */
  hasTools(botId: string): boolean {
    return this.getToolsForBot(botId).length > 0;
  }

  /**
   * Clear all tools (useful for testing)
   */
  clear(): void {
    this.globalTools.clear();
    this.botTools.clear();
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();
