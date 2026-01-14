use crate::http::{send_llm_request, send_llm_request_streaming};
use crate::types::*;
use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub async fn send_request(
    endpoint: Endpoint,
    request: LLMRequest,
) -> Result<LLMResponse, String> {
    send_llm_request(&endpoint, &request).await
}

#[tauri::command]
pub async fn send_streaming_request(
    endpoint: Endpoint,
    request: LLMRequest,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    send_llm_request_streaming(&endpoint, &request, app_handle).await
}

#[tauri::command]
pub fn get_saved_endpoints() -> Result<Vec<Endpoint>, String> {
    let config_dir = get_config_dir()?;
    let endpoints_file = config_dir.join("endpoints.json");

    if !endpoints_file.exists() {
        return Ok(vec![]);
    }

    let content = fs::read_to_string(endpoints_file)
        .map_err(|e| format!("Failed to read endpoints: {}", e))?;

    let endpoints: Vec<Endpoint> = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse endpoints: {}", e))?;

    Ok(endpoints)
}

#[tauri::command]
pub fn save_endpoint(endpoint: Endpoint) -> Result<(), String> {
    let config_dir = get_config_dir()?;
    let endpoints_file = config_dir.join("endpoints.json");

    let mut endpoints = get_saved_endpoints().unwrap_or_default();

    // Update or add endpoint
    if let Some(idx) = endpoints.iter().position(|e| e.id == endpoint.id) {
        endpoints[idx] = endpoint;
    } else {
        endpoints.push(endpoint);
    }

    let content = serde_json::to_string_pretty(&endpoints)
        .map_err(|e| format!("Failed to serialize endpoints: {}", e))?;

    fs::write(endpoints_file, content)
        .map_err(|e| format!("Failed to write endpoints: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn delete_endpoint(id: String) -> Result<(), String> {
    let config_dir = get_config_dir()?;
    let endpoints_file = config_dir.join("endpoints.json");

    let mut endpoints = get_saved_endpoints().unwrap_or_default();
    endpoints.retain(|e| e.id != id);

    let content = serde_json::to_string_pretty(&endpoints)
        .map_err(|e| format!("Failed to serialize endpoints: {}", e))?;

    fs::write(endpoints_file, content)
        .map_err(|e| format!("Failed to write endpoints: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn get_request_history() -> Result<Vec<RequestHistoryItem>, String> {
    let config_dir = get_config_dir()?;
    let history_file = config_dir.join("history.json");

    if !history_file.exists() {
        return Ok(vec![]);
    }

    let content = fs::read_to_string(history_file)
        .map_err(|e| format!("Failed to read history: {}", e))?;

    let history: Vec<RequestHistoryItem> = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse history: {}", e))?;

    Ok(history)
}

#[tauri::command]
pub fn clear_history() -> Result<(), String> {
    let config_dir = get_config_dir()?;
    let history_file = config_dir.join("history.json");

    fs::write(history_file, "[]")
        .map_err(|e| format!("Failed to clear history: {}", e))?;

    Ok(())
}

fn get_config_dir() -> Result<PathBuf, String> {
    let config_dir = dirs::config_dir()
        .ok_or_else(|| "Failed to get config directory".to_string())?
        .join("modelcurl");

    fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Failed to create config directory: {}", e))?;

    Ok(config_dir)
}
