use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Endpoint {
    pub id: String,
    pub name: String,
    pub url: String,
    #[serde(rename = "apiKey")]
    pub api_key: Option<String>,
    pub headers: Vec<(String, String)>,
    pub model: String,
}

/// Reasoning model providers
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ReasoningProvider {
    OpenAI,
    DeepSeek,
    Qwen,
    Claude,
}

/// Reasoning configuration for supported models
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReasoningConfig {
    /// Enable reasoning mode (for hybrid models like Qwen)
    #[serde(rename = "enableThinking")]
    pub enable_thinking: bool,

    /// Reasoning effort for OpenAI (none, minimal, low, medium, high)
    #[serde(rename = "reasoningEffort")]
    pub reasoning_effort: Option<String>,

    /// Maximum completion tokens for OpenAI reasoning models
    #[serde(rename = "maxCompletionTokens")]
    pub max_completion_tokens: Option<u32>,

    /// Thinking budget tokens for Claude/Qwen
    #[serde(rename = "thinkingBudgetTokens")]
    pub thinking_budget_tokens: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMRequest {
    pub model: String,
    pub messages: Vec<Message>,
    pub temperature: f32,
    #[serde(alias = "maxTokens")]
    pub max_tokens: u32,
    pub stream: bool,
    /// Reasoning configuration for supported models
    #[serde(rename = "reasoningConfig")]
    pub reasoning_config: Option<ReasoningConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMResponse {
    pub content: String,
    pub usage: Option<UsageMetrics>,
    pub finish_reason: String,
    /// Reasoning content from DeepSeek/Qwen
    pub reasoning_content: Option<String>,
    /// Thinking blocks from Claude
    pub thinking_blocks: Vec<ThinkingBlock>,
    /// Detected reasoning provider
    pub reasoning_provider: Option<ReasoningProvider>,
}

/// Thinking block from Claude API
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThinkingBlock {
    pub content: String,
    /// For Claude 4.x where thinking is summarized
    pub summary: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageMetrics {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
    /// Reasoning tokens (OpenAI only - counts but not exposes content)
    pub reasoning_tokens: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub ttft_ms: f64,
    pub avg_tpot_ms: Option<f64>,
    pub total_latency_ms: f64,
    pub total_tokens: usize,
    pub tokens_per_second: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenEvent {
    pub token: String,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestHistoryItem {
    pub id: String,
    pub timestamp: i64,
    pub endpoint_name: String,
    pub model: String,
    pub prompt: String,
    pub response: String,
    pub metrics: PerformanceMetrics,
    pub stream: bool,
}
