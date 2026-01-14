# 🚀 Quick Start Guide

## Prerequisites Check

Before running ModelCurl, ensure you have:

1. **Node.js 18+** installed
   ```bash
   node --version  # Should be v18 or higher
   ```

2. **Rust** installed (for building)
   ```bash
   rustc --version
   ```
   If not installed: https://rustup.rs/

3. **System dependencies**:
   - **macOS**: None required ✅
   - **Windows**: Visual Studio C++ Build Tools (recommended)
   - **Linux**: Run the following:
     ```bash
     sudo apt update
     sudo apt install libwebkit2gtk-4.0-dev libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
     ```

## Installation & Running

### Step 1: Install Dependencies

```bash
cd modelcurl
npm install
```

### Step 2: Run in Development Mode

```bash
npm run tauri dev
```

This will:
1. Start the Vite development server
2. Launch the Tauri application
3. Open the ModelCurl window

### Step 3: Build for Production

```bash
npm run tauri build
```

Built binaries will be in: `src-tauri/target/release/bundle/`

## First Run

1. **Add an Endpoint**:
   - Click "New Endpoint" in the sidebar
   - For OpenAI, use:
     ```
     Name: OpenAI
     URL: https://api.openai.com/v1
     API Key: sk-...
     Model: gpt-3.5-turbo
     ```
   - For local Ollama:
     ```
     Name: Local Ollama
     URL: http://localhost:11434/v1
     API Key: (leave empty)
     Model: llama2
     ```

2. **Send Your First Request**:
   - Select your endpoint
   - Type a message in the prompt area
   - Press Cmd/Ctrl+Enter or click "Send"
   - Watch the response stream in real-time!

3. **View Metrics**:
   - TTFT (Time To First Token)
   - TPOT (Time Per Output Token)
   - Tokens/second throughput
   - Total latency

## Troubleshooting

### "Rust not found"
Install Rust from https://rustup.rs/

### "npm install fails"
Try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Build fails on macOS"
Ensure Xcode command line tools are installed:
```bash
xcode-select --install
```

### "Build fails on Linux"
Install webkit2gtk:
```bash
sudo apt install libwebkit2gtk-4.0-dev
```

## Next Steps

- Read the full [README.md](README.md) for detailed features
- Check [DESIGN.md](DESIGN.md) for architecture documentation
- Customize the UI in `src/components/`
- Add new metrics in `src-tauri/src/metrics.rs`

Enjoy testing your LLM endpoints! 🎉
