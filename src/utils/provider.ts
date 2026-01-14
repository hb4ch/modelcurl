import type { ReasoningProvider } from '../types';

/**
 * Detect reasoning provider from model name using flexible pattern matching
 * @param modelName - The model name to analyze
 * @returns The detected reasoning provider or null if not a reasoning model
 */
export function detectProvider(modelName: string): ReasoningProvider | null {
  const normalized = modelName.toLowerCase();

  // Order matters: check more specific patterns first

  // OpenAI reasoning models
  // Matches: o1, o1-preview, o1-mini, o3, o3-mini, gpt-5.0, gpt-5.x, etc.
  if (isOpenAIModel(normalized)) {
    return 'openai';
  }

  // DeepSeek reasoning models
  // Matches: deepseek-r1, deepseek-reasoner, Deepseekv3.2, deepseek-v3, etc.
  if (isDeepSeekModel(normalized)) {
    return 'deepseek';
  }

  // Qwen reasoning models
  // Matches: qwen-plus, qwen3-max, qwq-32b, qwen2.5-coder, etc.
  if (isQwenModel(normalized)) {
    return 'qwen';
  }

  // Claude reasoning models
  // Matches: claude-3.7-sonnet, claude-4-sonnet, claude-opus-4.5, etc.
  if (isClaudeModel(normalized)) {
    return 'claude';
  }

  return null;
}

function isOpenAIModel(model: string): boolean {
  // Pattern: starts with o1, o3, or contains gpt-5
  const openaiPattern = /^o[13]/;
  const gpt5Pattern = /gpt[-_]5/;

  return openaiPattern.test(model) || gpt5Pattern.test(model);
}

function isDeepSeekModel(model: string): boolean {
  // Pattern: contains deepseek and (r1, reasoner, v3, or similar indicators)
  const deepseekPattern = /deepseek[-_]?[rv]?[13]?(\.?\d+)?(-?reason(er)?)?/;

  return deepseekPattern.test(model);
}

function isQwenModel(model: string): boolean {
  // Pattern: qwen, qwq with potential reasoning indicators
  const qwenPattern = /^(qwen|qwq)([-_.]?(plus|max|turbo|coder|\d+\.?\d*))?$/;

  return qwenPattern.test(model);
}

function isClaudeModel(model: string): boolean {
  // Pattern: claude with version 3.7, 4, or opus 4.5
  const claudePattern = /^claude[-_]?(3\.7|4|opus[-_]4\.5|sonnet[-_]4)/;

  return claudePattern.test(model);
}

/**
 * Check if a model is a reasoning model
 * @param modelName - The model name to check
 * @returns true if the model is a reasoning model
 */
export function isReasoningModel(modelName: string): boolean {
  return detectProvider(modelName) !== null;
}

/**
 * Get human-readable provider name
 * @param provider - The provider identifier
 * @returns Human-readable provider name
 */
export function getProviderName(provider: ReasoningProvider): string {
  const names: Record<ReasoningProvider, string> = {
    openai: 'OpenAI',
    deepseek: 'DeepSeek',
    qwen: 'Qwen',
    claude: 'Claude',
  };
  return names[provider];
}
