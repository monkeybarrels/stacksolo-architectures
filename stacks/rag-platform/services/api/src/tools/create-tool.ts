/**
 * createTool - Helper for defining tools
 *
 * Usage:
 * ```typescript
 * import { createTool } from './create-tool';
 *
 * export const weatherTool = createTool({
 *   name: 'get_weather',
 *   description: 'Get current weather for a location',
 *   parameters: {
 *     location: {
 *       type: 'string',
 *       description: 'City name or coordinates',
 *       required: true,
 *     },
 *     units: {
 *       type: 'string',
 *       description: 'Temperature units',
 *       enum: ['celsius', 'fahrenheit'],
 *       default: 'celsius',
 *     },
 *   },
 *   handler: async ({ location, units }, context) => {
 *     // Implementation here
 *     return { temperature: 22, condition: 'sunny' };
 *   },
 * });
 * ```
 */

import type {
  Tool,
  ToolDefinition,
  ToolHandler,
  ParameterDefinition,
  GeminiFunctionDeclaration,
} from './types';

interface CreateToolOptions<TParams extends Record<string, unknown>, TResult> {
  name: string;
  description: string;
  parameters: Record<keyof TParams, ParameterDefinition>;
  handler: ToolHandler<TParams, TResult>;
}

/**
 * Create a type-safe tool with validation
 */
export function createTool<TParams extends Record<string, unknown>, TResult = unknown>(
  options: CreateToolOptions<TParams, TResult>
): Tool<TParams, TResult> {
  const { name, description, parameters, handler } = options;

  // Validate tool name (alphanumeric + underscore only)
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    throw new Error(
      `Invalid tool name "${name}". Must start with lowercase letter and contain only lowercase letters, numbers, and underscores.`
    );
  }

  const definition: ToolDefinition<TParams> = {
    name,
    description,
    parameters,
  };

  // Wrap handler with parameter validation
  const wrappedHandler: ToolHandler<TParams, TResult> = async (params, context) => {
    // Validate required parameters
    for (const [key, param] of Object.entries(parameters) as [keyof TParams, ParameterDefinition][]) {
      if (param.required && (params[key] === undefined || params[key] === null)) {
        throw new Error(`Missing required parameter: ${String(key)}`);
      }

      // Apply defaults
      if (params[key] === undefined && param.default !== undefined) {
        (params as Record<string, unknown>)[key as string] = param.default;
      }

      // Validate enum values
      if (param.enum && params[key] !== undefined) {
        if (!param.enum.includes(params[key] as string)) {
          throw new Error(
            `Invalid value for ${String(key)}: "${params[key]}". Must be one of: ${param.enum.join(', ')}`
          );
        }
      }
    }

    return handler(params, context);
  };

  return {
    definition,
    handler: wrappedHandler,
  };
}

/**
 * Convert tool definition to Gemini function declaration format
 */
export function toGeminiFunctionDeclaration<TParams extends Record<string, unknown>>(
  tool: Tool<TParams, unknown>
): GeminiFunctionDeclaration {
  const properties: Record<string, {
    type: string;
    description: string;
    enum?: string[];
    items?: { type: string };
  }> = {};

  const required: string[] = [];

  for (const [key, param] of Object.entries(tool.definition.parameters) as [string, ParameterDefinition][]) {
    properties[key] = {
      type: param.type === 'array' ? 'array' : param.type,
      description: param.description,
    };

    if (param.enum) {
      properties[key].enum = param.enum;
    }

    if (param.items) {
      properties[key].items = { type: param.items.type };
    }

    if (param.required) {
      required.push(key);
    }
  }

  return {
    name: tool.definition.name,
    description: tool.definition.description,
    parameters: {
      type: 'object',
      properties,
      required,
    },
  };
}
