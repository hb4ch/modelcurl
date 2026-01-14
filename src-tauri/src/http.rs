use crate::types::{Endpoint, LLMRequest, LLMResponse, UsageMetrics, ReasoningProvider};
use crate::provider::detect_provider;
use anyhow::Result;
use reqwest::Client;
use std::time::Instant;
use serde_json::Value;

/// Build request body with provider-specific reasoning parameters
fn build_request_body(_endpoint: &Endpoint, request: &LLMRequest, stream: bool) -> Value {
    let provider = detect_provider(&request.model);

    let mut body = serde_json::json!({
        "model": request.model.clone(),
        "messages": request.messages,
        "temperature": request.temperature,
        "stream": stream
    });

    // Add max_tokens based on provider
    if let Some(reasoning_config) = &request.reasoning_config {
        match provider {
            Some(ReasoningProvider::OpenAI) => {
                // OpenAI uses max_completion_tokens for reasoning models
                if let Some(max_completion) = reasoning_config.max_completion_tokens {
                    body["max_completion_tokens"] = serde_json::json!(max_completion);
                } else {
                    body["max_tokens"] = serde_json::json!(request.max_tokens);
                }

                // Add reasoning_effort parameter
                if let Some(effort) = &reasoning_config.reasoning_effort {
                    body["reasoning_effort"] = serde_json::json!(effort);
                }
            }
            Some(ReasoningProvider::DeepSeek) => {
                // DeepSeek uses thinking parameter
                body["max_tokens"] = serde_json::json!(request.max_tokens);
                body["thinking"] = serde_json::json!({
                    "type": if reasoning_config.enable_thinking { "enabled" } else { "disabled" }
                });
            }
            Some(ReasoningProvider::Qwen) => {
                // Qwen uses enable_thinking and thinking_budget
                body["max_tokens"] = serde_json::json!(request.max_tokens);

                if reasoning_config.enable_thinking {
                    body["enable_thinking"] = serde_json::json!(true);
                    if let Some(budget) = reasoning_config.thinking_budget_tokens {
                        body["thinking_budget"] = serde_json::json!(budget);
                    }
                }
            }
            Some(ReasoningProvider::Claude) => {
                // Claude uses thinking parameter with budget
                body["max_tokens"] = serde_json::json!(request.max_tokens);

                if reasoning_config.enable_thinking {
                    let mut thinking = serde_json::json!({
                        "type": "enabled"
                    });
                    if let Some(budget) = reasoning_config.thinking_budget_tokens {
                        thinking["budget_tokens"] = serde_json::json!(budget);
                    }
                    body["thinking"] = thinking;
                }
            }
            None => {
                // Non-reasoning model
                body["max_tokens"] = serde_json::json!(request.max_tokens);
            }
        }
    } else {
        // No reasoning config
        body["max_tokens"] = serde_json::json!(request.max_tokens);
    }

    body
}

pub async fn send_llm_request(endpoint: &Endpoint, request: &LLMRequest) -> Result<LLMResponse, String> {
    let client = Client::new();

    let request_body = build_request_body(endpoint, request, false);

    let mut req_builder = client
        .post(format!("{}/chat/completions", endpoint.url))
        .header("Content-Type", "application/json")
        .json(&request_body);

    // Add API key if provided
    if let Some(api_key) = &endpoint.api_key {
        req_builder = req_builder.header("Authorization", format!("Bearer {}", api_key));
    }

    // Add custom headers
    for (key, value) in &endpoint.headers {
        req_builder = req_builder.header(key, value);
    }

    let _start = Instant::now();
    let response = req_builder
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status();

    if !status.is_success() {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Request failed with status {}: {}", status, error_text));
    }

    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    let parsed: serde_json::Value = serde_json::from_str(&response_text)
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    let provider = detect_provider(&request.model);

    // Extract reasoning content based on provider
    let reasoning_content = match provider {
        Some(ReasoningProvider::DeepSeek) | Some(ReasoningProvider::Qwen) => {
            parsed["choices"][0]["message"]["reasoning_content"]
                .as_str()
                .map(|s| s.to_string())
        }
        _ => None,
    };

    // Extract thinking blocks for Claude
    let thinking_blocks = match provider {
        Some(ReasoningProvider::Claude) => {
            // Claude returns thinking as content blocks
            if let Some(content_array) = parsed["choices"][0]["message"]["content"].as_array() {
                content_array
                    .iter()
                    .filter_map(|block| {
                        if block["type"] == "thinking" {
                            Some(crate::types::ThinkingBlock {
                                content: block["thinking"].as_str().unwrap_or("").to_string(),
                                summary: block["summary"].as_str().map(|s| s.to_string()),
                            })
                        } else {
                            None
                        }
                    })
                    .collect()
            } else {
                Vec::new()
            }
        }
        _ => Vec::new(),
    };

    let content = parsed["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("")
        .to_string();

    let usage = parsed.get("usage").and_then(|u| {
        Some(UsageMetrics {
            prompt_tokens: u["prompt_tokens"].as_u64()? as u32,
            completion_tokens: u["completion_tokens"].as_u64()? as u32,
            total_tokens: u["total_tokens"].as_u64()? as u32,
            reasoning_tokens: u.get("reasoning_tokens").and_then(|t| t.as_u64()).map(|t| t as u32),
        })
    });

    Ok(LLMResponse {
        content,
        usage,
        finish_reason: parsed["choices"][0]["finish_reason"]
            .as_str()
            .unwrap_or("stop")
            .to_string(),
        reasoning_content,
        thinking_blocks,
        reasoning_provider: provider,
    })
}

pub async fn send_llm_request_streaming(
    endpoint: &Endpoint,
    request: &LLMRequest,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    use futures::StreamExt;

    let client = Client::new();

    let request_body = build_request_body(endpoint, request, true);

    let mut req_builder = client
        .post(format!("{}/chat/completions", endpoint.url))
        .header("Content-Type", "application/json")
        .json(&request_body);

    // Add API key if provided
    if let Some(api_key) = &endpoint.api_key {
        req_builder = req_builder.header("Authorization", format!("Bearer {}", api_key));
    }

    // Add custom headers
    for (key, value) in &endpoint.headers {
        req_builder = req_builder.header(key, value);
    }

    let response = req_builder
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    if !response.status().is_success() {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Request failed: {}", error_text));
    }

    let mut stream = response.bytes_stream();
    let mut full_content = String::new();
    let mut buffer = Vec::new();

    use tauri::Manager;

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| format!("Stream error: {}", e))?;
        buffer.extend_from_slice(&chunk);

        // Process complete SSE lines
        while let Some(pos) = buffer.iter().position(|&b| b == b'\n') {
            let line = buffer.drain(..=pos).collect::<Vec<u8>>();
            buffer.drain(..1);

            let line_str = String::from_utf8_lossy(&line);

            if line_str.starts_with("data: ") {
                let data = &line_str[6..];

                if data.trim() == "[DONE]" {
                    break;
                }

                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(data) {
                    if let Some(content) =
                        parsed["choices"][0]["delta"]["content"].as_str()
                    {
                        if !content.is_empty() {
                            // Emit token event to frontend
                            app_handle
                                .emit_all("token", content)
                                .map_err(|e| format!("Failed to emit token: {}", e))?;

                            full_content.push_str(content);
                        }
                    }
                }
            }
        }
    }

    Ok(full_content)
}

/// Get available models from the endpoint's /models API
pub async fn get_available_models(endpoint: &Endpoint) -> Result<Vec<String>, String> {
    let client = Client::new();

    let mut req_builder = client
        .get(format!("{}/models", endpoint.url))
        .header("Content-Type", "application/json");

    // Add API key if provided
    if let Some(api_key) = &endpoint.api_key {
        req_builder = req_builder.header("Authorization", format!("Bearer {}", api_key));
    }

    // Add custom headers
    for (key, value) in &endpoint.headers {
        req_builder = req_builder.header(key, value);
    }

    let response = req_builder
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status();

    if !status.is_success() {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Failed to fetch models with status {}: {}", status, error_text));
    }

    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    let parsed: Value = serde_json::from_str(&response_text)
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    // Parse models from OpenAI-compatible format
    let models = parsed["data"]
        .as_array()
        .ok_or_else(|| "Invalid response format: 'data' field not found".to_string())?
        .iter()
        .filter_map(|model| model["id"].as_str().map(|s| s.to_string()))
        .collect();

    Ok(models)
}

/// Test endpoint validity by making a lightweight request
pub async fn test_endpoint(endpoint: &Endpoint) -> Result<String, String> {
    let client = Client::new();

    // Try to fetch models as a lightweight test
    let mut req_builder = client
        .get(format!("{}/models", endpoint.url))
        .header("Content-Type", "application/json");

    // Add API key if provided
    if let Some(api_key) = &endpoint.api_key {
        req_builder = req_builder.header("Authorization", format!("Bearer {}", api_key));
    }

    // Add custom headers
    for (key, value) in &endpoint.headers {
        req_builder = req_builder.header(key, value);
    }

    let start = Instant::now();
    let response = req_builder
        .send()
        .await
        .map_err(|e| format!("Connection failed: {}", e))?;

    let elapsed = start.elapsed().as_millis();
    let status = response.status();

    if !status.is_success() {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Endpoint returned error {}: {}", status, error_text));
    }

    Ok(format!("Connection successful! Response time: {}ms", elapsed))
}
