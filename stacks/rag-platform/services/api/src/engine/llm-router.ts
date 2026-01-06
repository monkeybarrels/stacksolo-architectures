/**
 * LLM Router
 *
 * Abstracts LLM providers to support multiple backends:
 * - Vertex AI Gemini (default)
 * - OpenAI (BYOK)
 * - Anthropic (BYOK)
 *
 * Bots can specify their preferred provider and API key.
 */

import { VertexAI, type Content, type Part } from '@google-cloud/vertexai';
import type { GeminiFunctionDeclaration, ToolCallRequest, ToolContext, ToolCallResult } from '../tools/types';
import { toolRegistry } from '../tools/registry';

// Provider types
export type LLMProvider = 'vertex' | 'openai' | 'anthropic';

export interface LLMConfig {
  provider: LLMProvider;
  model?: string;
  apiKey?: string; // For OpenAI/Anthropic BYOK
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  systemPrompt?: string;
  tools?: boolean;
  toolContext?: ToolContext;
  history?: ChatMessage[];
  stream?: boolean;
}

export interface ChatResult {
  content: string;
  toolCalls?: ToolCallRequest[];
  toolResults?: ToolCallResult[];
}

// Default configs
const DEFAULT_VERTEX_MODEL = 'gemini-1.5-flash';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
const DEFAULT_ANTHROPIC_MODEL = 'claude-3-haiku-20240307';

// Environment
const PROJECT_ID = process.env.GCP_PROJECT_ID || '';
const LOCATION = process.env.GCP_REGION || 'us-central1';

// Singleton Vertex client
let vertexAI: VertexAI | null = null;

function getVertexAI(): VertexAI {
  if (!vertexAI) {
    if (!PROJECT_ID) {
      throw new Error('GCP_PROJECT_ID environment variable is required for Vertex AI');
    }
    vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
  }
  return vertexAI;
}

/**
 * Generate chat response using the configured provider
 */
export async function chat(
  message: string,
  config: LLMConfig,
  options: ChatOptions = {}
): Promise<ChatResult> {
  const { provider = 'vertex' } = config;

  switch (provider) {
    case 'vertex':
      return chatWithVertex(message, config, options);
    case 'openai':
      return chatWithOpenAI(message, config, options);
    case 'anthropic':
      return chatWithAnthropic(message, config, options);
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}

/**
 * Generate streaming chat response
 */
export async function* chatStream(
  message: string,
  config: LLMConfig,
  options: ChatOptions = {}
): AsyncGenerator<string, ChatResult, unknown> {
  const { provider = 'vertex' } = config;

  switch (provider) {
    case 'vertex':
      return yield* chatWithVertexStream(message, config, options);
    case 'openai':
      return yield* chatWithOpenAIStream(message, config, options);
    case 'anthropic':
      return yield* chatWithAnthropicStream(message, config, options);
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}

// ============================================================================
// Vertex AI Implementation
// ============================================================================

async function chatWithVertex(
  message: string,
  config: LLMConfig,
  options: ChatOptions
): Promise<ChatResult> {
  const vertex = getVertexAI();
  const modelName = config.model || DEFAULT_VERTEX_MODEL;

  // Get function declarations if tools enabled
  const tools = options.tools && options.toolContext
    ? toolRegistry.getFunctionDeclarations(options.toolContext.botId)
    : [];

  const modelConfig: Record<string, unknown> = { model: modelName };
  if (tools.length > 0) {
    modelConfig.tools = [{ functionDeclarations: tools }];
  }

  const model = vertex.getGenerativeModel(modelConfig);

  // Build history
  const history: Content[] = (options.history || [])
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const chat = model.startChat({
    history,
    systemInstruction: options.systemPrompt,
    generationConfig: {
      temperature: config.temperature,
      maxOutputTokens: config.maxTokens,
    },
  });

  const result = await chat.sendMessage(message);
  const response = result.response;
  const candidate = response.candidates?.[0];

  if (!candidate) {
    throw new Error('No response generated');
  }

  // Check for function calls
  const functionCalls = candidate.content?.parts
    ?.filter((p: Part) => 'functionCall' in p)
    .map((p: Part) => ({
      name: (p as { functionCall: { name: string; args: Record<string, unknown> } }).functionCall.name,
      arguments: (p as { functionCall: { name: string; args: Record<string, unknown> } }).functionCall.args || {},
    }));

  if (functionCalls && functionCalls.length > 0 && options.toolContext) {
    // Execute tool calls
    const toolResults = await toolRegistry.executeMany(functionCalls, options.toolContext);

    // Send tool results back to get final response
    const toolResponseParts = toolResults.map((tr) => ({
      functionResponse: {
        name: tr.name,
        response: { result: tr.error || tr.result },
      },
    }));

    const finalResult = await chat.sendMessage(toolResponseParts);
    const finalText = finalResult.response.candidates?.[0]?.content?.parts?.[0];
    const text = finalText && 'text' in finalText ? finalText.text : '';

    return {
      content: text || '',
      toolCalls: functionCalls,
      toolResults,
    };
  }

  // Regular text response
  const textPart = candidate.content?.parts?.find((p: Part) => 'text' in p);
  const text = textPart && 'text' in textPart ? textPart.text : '';

  return { content: text || '' };
}

async function* chatWithVertexStream(
  message: string,
  config: LLMConfig,
  options: ChatOptions
): AsyncGenerator<string, ChatResult, unknown> {
  const vertex = getVertexAI();
  const modelName = config.model || DEFAULT_VERTEX_MODEL;
  const model = vertex.getGenerativeModel({ model: modelName });

  const history: Content[] = (options.history || [])
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const chat = model.startChat({
    history,
    systemInstruction: options.systemPrompt,
    generationConfig: {
      temperature: config.temperature,
      maxOutputTokens: config.maxTokens,
    },
  });

  const streamingResult = await chat.sendMessageStream(message);
  let fullContent = '';

  for await (const chunk of streamingResult.stream) {
    const textPart = chunk.candidates?.[0]?.content?.parts?.[0];
    const text = textPart && 'text' in textPart ? textPart.text : '';
    if (text) {
      fullContent += text;
      yield text;
    }
  }

  return { content: fullContent };
}

// ============================================================================
// OpenAI Implementation (BYOK)
// ============================================================================

async function chatWithOpenAI(
  message: string,
  config: LLMConfig,
  options: ChatOptions
): Promise<ChatResult> {
  if (!config.apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const modelName = config.model || DEFAULT_OPENAI_MODEL;

  // Build messages
  const messages: Array<{ role: string; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  for (const m of options.history || []) {
    messages.push({ role: m.role, content: m.content });
  }
  messages.push({ role: 'user', content: message });

  // Get tools if enabled
  const tools = options.tools && options.toolContext
    ? toolRegistry.getToolsForBot(options.toolContext.botId).map((t) => ({
        type: 'function' as const,
        function: {
          name: t.definition.name,
          description: t.definition.description,
          parameters: {
            type: 'object',
            properties: Object.fromEntries(
              Object.entries(t.definition.parameters).map(([k, v]) => [
                k,
                {
                  type: v.type,
                  description: v.description,
                  enum: v.enum,
                },
              ])
            ),
            required: Object.entries(t.definition.parameters)
              .filter(([, v]) => v.required)
              .map(([k]) => k),
          },
        },
      }))
    : [];

  const body: Record<string, unknown> = {
    model: modelName,
    messages,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
  };

  if (tools.length > 0) {
    body.tools = tools;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];

  if (!choice) {
    throw new Error('No response from OpenAI');
  }

  // Handle tool calls
  if (choice.message?.tool_calls && options.toolContext) {
    const toolCalls: ToolCallRequest[] = choice.message.tool_calls.map((tc: { function: { name: string; arguments: string } }) => ({
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments || '{}'),
    }));

    const toolResults = await toolRegistry.executeMany(toolCalls, options.toolContext);

    // Send tool results back
    const toolMessages = toolResults.map((tr, i) => ({
      role: 'tool',
      tool_call_id: choice.message.tool_calls[i].id,
      content: JSON.stringify(tr.error || tr.result),
    }));

    const finalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          ...messages,
          choice.message,
          ...toolMessages,
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    });

    const finalData = await finalResponse.json();
    const finalContent = finalData.choices?.[0]?.message?.content || '';

    return {
      content: finalContent,
      toolCalls,
      toolResults,
    };
  }

  return { content: choice.message?.content || '' };
}

async function* chatWithOpenAIStream(
  message: string,
  config: LLMConfig,
  options: ChatOptions
): AsyncGenerator<string, ChatResult, unknown> {
  if (!config.apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const modelName = config.model || DEFAULT_OPENAI_MODEL;

  const messages: Array<{ role: string; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  for (const m of options.history || []) {
    messages.push({ role: m.role, content: m.content });
  }
  messages.push({ role: 'user', content: message });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const data = JSON.parse(line.slice(6));
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            fullContent += content;
            yield content;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }

  return { content: fullContent };
}

// ============================================================================
// Anthropic Implementation (BYOK)
// ============================================================================

async function chatWithAnthropic(
  message: string,
  config: LLMConfig,
  options: ChatOptions
): Promise<ChatResult> {
  if (!config.apiKey) {
    throw new Error('Anthropic API key is required');
  }

  const modelName = config.model || DEFAULT_ANTHROPIC_MODEL;

  // Build messages (Anthropic format)
  const messages: Array<{ role: string; content: string }> = [];
  for (const m of options.history || []) {
    if (m.role !== 'system') {
      messages.push({ role: m.role, content: m.content });
    }
  }
  messages.push({ role: 'user', content: message });

  // Get tools if enabled
  const tools = options.tools && options.toolContext
    ? toolRegistry.getToolsForBot(options.toolContext.botId).map((t) => ({
        name: t.definition.name,
        description: t.definition.description,
        input_schema: {
          type: 'object',
          properties: Object.fromEntries(
            Object.entries(t.definition.parameters).map(([k, v]) => [
              k,
              {
                type: v.type,
                description: v.description,
                enum: v.enum,
              },
            ])
          ),
          required: Object.entries(t.definition.parameters)
            .filter(([, v]) => v.required)
            .map(([k]) => k),
        },
      }))
    : [];

  const body: Record<string, unknown> = {
    model: modelName,
    messages,
    max_tokens: config.maxTokens || 4096,
    temperature: config.temperature,
  };

  if (options.systemPrompt) {
    body.system = options.systemPrompt;
  }

  if (tools.length > 0) {
    body.tools = tools;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();

  // Handle tool use
  const toolUseBlocks = data.content?.filter((b: { type: string }) => b.type === 'tool_use') || [];
  if (toolUseBlocks.length > 0 && options.toolContext) {
    const toolCalls: ToolCallRequest[] = toolUseBlocks.map((b: { name: string; input: Record<string, unknown> }) => ({
      name: b.name,
      arguments: b.input || {},
    }));

    const toolResults = await toolRegistry.executeMany(toolCalls, options.toolContext);

    // Send tool results back
    const toolResultMessages = toolUseBlocks.map((b: { id: string }, i: number) => ({
      type: 'tool_result',
      tool_use_id: b.id,
      content: JSON.stringify(toolResults[i].error || toolResults[i].result),
    }));

    const finalResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        ...body,
        messages: [
          ...messages,
          { role: 'assistant', content: data.content },
          { role: 'user', content: toolResultMessages },
        ],
      }),
    });

    const finalData = await finalResponse.json();
    const textBlock = finalData.content?.find((b: { type: string }) => b.type === 'text');

    return {
      content: textBlock?.text || '',
      toolCalls,
      toolResults,
    };
  }

  // Regular text response
  const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
  return { content: textBlock?.text || '' };
}

async function* chatWithAnthropicStream(
  message: string,
  config: LLMConfig,
  options: ChatOptions
): AsyncGenerator<string, ChatResult, unknown> {
  if (!config.apiKey) {
    throw new Error('Anthropic API key is required');
  }

  const modelName = config.model || DEFAULT_ANTHROPIC_MODEL;

  const messages: Array<{ role: string; content: string }> = [];
  for (const m of options.history || []) {
    if (m.role !== 'system') {
      messages.push({ role: m.role, content: m.content });
    }
  }
  messages.push({ role: 'user', content: message });

  const body: Record<string, unknown> = {
    model: modelName,
    messages,
    max_tokens: config.maxTokens || 4096,
    temperature: config.temperature,
    stream: true,
  };

  if (options.systemPrompt) {
    body.system = options.systemPrompt;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'content_block_delta' && data.delta?.text) {
            fullContent += data.delta.text;
            yield data.delta.text;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }

  return { content: fullContent };
}

/**
 * Get default config for a provider
 */
export function getDefaultConfig(provider: LLMProvider): LLMConfig {
  switch (provider) {
    case 'vertex':
      return { provider: 'vertex', model: DEFAULT_VERTEX_MODEL };
    case 'openai':
      return { provider: 'openai', model: DEFAULT_OPENAI_MODEL };
    case 'anthropic':
      return { provider: 'anthropic', model: DEFAULT_ANTHROPIC_MODEL };
    default:
      return { provider: 'vertex', model: DEFAULT_VERTEX_MODEL };
  }
}
