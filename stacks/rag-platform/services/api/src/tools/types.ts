/**
 * Tool System Types
 *
 * Defines the structure for creating extensible tools that can be used
 * by the RAG platform's LLM to perform actions.
 */

export type ParameterType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface ParameterDefinition {
  type: ParameterType;
  description: string;
  required?: boolean;
  enum?: string[];
  items?: { type: ParameterType };
  default?: unknown;
}

export interface ToolDefinition<TParams = Record<string, unknown>> {
  name: string;
  description: string;
  parameters: Record<keyof TParams, ParameterDefinition>;
}

export interface ToolContext {
  botId: string;
  userId: string;
  conversationId?: string;
}

export type ToolHandler<TParams = Record<string, unknown>, TResult = unknown> = (
  params: TParams,
  context: ToolContext
) => Promise<TResult>;

export interface Tool<TParams = Record<string, unknown>, TResult = unknown> {
  definition: ToolDefinition<TParams>;
  handler: ToolHandler<TParams, TResult>;
}

export interface ToolCallRequest {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolCallResult {
  name: string;
  result: unknown;
  error?: string;
}

/**
 * Function declaration format for Vertex AI Gemini
 */
export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      items?: { type: string };
    }>;
    required: string[];
  };
}
