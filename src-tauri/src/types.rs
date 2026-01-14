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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMRequest {
    pub model: String,
    pub messages: Vec<Message>,
    pub temperature: f32,
    #[serde(alias = "maxTokens")]
    pub max_tokens: u32,
    pub stream: bool,
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
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageMetrics {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
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
