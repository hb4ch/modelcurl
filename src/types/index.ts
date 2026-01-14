export interface Endpoint {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  headers: [string, string][];
  model: string;
}

export type ReasoningProvider = 'openai' | 'deepseek' | 'qwen' | 'claude';

export interface ReasoningConfig {
  /** Enable reasoning mode (for hybrid models like Qwen) */
  enableThinking: boolean;
  /** Reasoning effort for OpenAI (none, minimal, low, medium, high) */
  reasoningEffort?: string;
  /** Maximum completion tokens for OpenAI reasoning models */
  maxCompletionTokens?: number;
  /** Thinking budget tokens for Claude/Qwen */
  thinkingBudgetTokens?: number;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  model: string;
  messages: Message[];
  temperature: number;
  maxTokens: number;
  stream: boolean;
  /** Reasoning configuration for supported models */
  reasoningConfig?: ReasoningConfig;
}

export interface UsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  /** Reasoning tokens (OpenAI only - counts but not exposes content) */
  reasoningTokens?: number;
}

export interface ThinkingBlock {
  content: string;
  /** For Claude 4.x where thinking is summarized */
  summary?: string;
}

export interface LLMResponse {
  content: string;
  usage?: UsageMetrics;
  finishReason: string;
  /** Reasoning content from DeepSeek/Qwen */
  reasoningContent?: string;
  /** Thinking blocks from Claude */
  thinkingBlocks?: ThinkingBlock[];
  /** Detected reasoning provider */
  reasoningProvider?: ReasoningProvider;
}

export interface PerformanceMetrics {
  ttftMs: number;
  avgTpotMs?: number;
  totalLatencyMs: number;
  totalTokens: number;
  tokensPerSecond?: number;
}

export interface RequestHistoryItem {
  id: string;
  timestamp: number;
  endpointName: string;
  model: string;
  prompt: string;
  response: string;
  metrics: PerformanceMetrics;
  stream: boolean;
}

export interface TokenEvent {
  token: string;
  timestamp: number;
}
