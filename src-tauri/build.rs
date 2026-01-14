fn main() {
    // Force target OS for cross-compilation
    if std::env::var("TARGET").is_err() {
        std::env::set_var("TARGET", "x86_64-pc-windows-gnu");
    }
    tauri_build::build()
}
