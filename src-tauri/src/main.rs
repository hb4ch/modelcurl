// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod http;
mod metrics;
mod types;

use commands::*;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            send_request,
            send_streaming_request,
            get_saved_endpoints,
            save_endpoint,
            delete_endpoint,
            get_request_history,
            clear_history,
            fetch_models,
            test_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
