use crate::types::{Endpoint, LLMRequest, LLMResponse, UsageMetrics};
use anyhow::Result;
use reqwest::Client;
use std::time::Instant;
use futures_util::stream::StreamExt;

pub async fn send_llm_request(endpoint: &Endpoint, request: &LLMRequest) -> Result<LLMResponse, String> {
    let client = Client::new();

    let request_body = serde_json::json!({
        "model": request.model.clone(),
        "messages": request.messages,
        "temperature": request.temperature,
        "max_tokens": request.max_tokens,
        "stream": false
    });

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

    let start = Instant::now();
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

    let content = parsed["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("")
        .to_string();

    let usage = parsed.get("usage").and_then(|u| {
        Some(UsageMetrics {
            prompt_tokens: u["prompt_tokens"].as_u64()? as u32,
            completion_tokens: u["completion_tokens"].as_u64()? as u32,
            total_tokens: u["total_tokens"].as_u64()? as u32,
        })
    });

    Ok(LLMResponse {
        content,
        usage,
        finish_reason: parsed["choices"][0]["finish_reason"]
            .as_str()
            .unwrap_or("stop")
            .to_string(),
    })
}

pub async fn send_llm_request_streaming(
    endpoint: &Endpoint,
    request: &LLMRequest,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    use futures::StreamExt;

    let client = Client::new();

    let request_body = serde_json::json!({
        "model": request.model.clone(),
        "messages": request.messages,
        "temperature": request.temperature,
        "max_tokens": request.max_tokens,
        "stream": true
    });

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
