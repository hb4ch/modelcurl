export interface Endpoint {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  headers: [string, string][];
  model: string;
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
}

export interface UsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LLMResponse {
  content: string;
  usage?: UsageMetrics;
  finishReason: string;
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
