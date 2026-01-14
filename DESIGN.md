# ModelCurl - LLM Endpoint Testing Utility
## Design Document

## 📋 Overview
A cross-platform desktop application for testing and benchmarking OpenAI-compatible LLM endpoints with real-time performance metrics visualization.

---

## 🎯 Core Features

### 1. Endpoint Configuration
- Multiple endpoint profiles (save/load)
- Base URL configuration
- API key authentication
- Custom headers support
- Model selection
- Connection timeout settings

### 2. Request Management
- Prompt input field (multi-line support)
- System message configuration
- Temperature, max_tokens, and other parameters
- Request history (local storage)
- Streaming toggle
- Conversation threading support

### 3. Performance Metrics
- **TTFT (Time To First Token)**: Time from request sent to first token received
- **TPOT (Time Per Output Token)**: Average time between consecutive tokens
- **TBT (Total Bytestime)**: Total duration of token generation
- **Throughput**: Tokens per second
- **Total Latency**: End-to-end request time
- **Metrics Variance**: Min/Max/StdDev across multiple requests

### 4. Visualization
- Real-time token stream display
- Timeline view of token arrivals
- Plots for metrics comparison:
  - TTFT scatter plot
  - TPOT distribution (box plot)
  - Throughput over time (line chart)
  - Heatmap for request patterns

---

## 🏗️ Technology Stack

### Recommended: **Tauri + React + TypeScript**

**Why Tauri?**
- ✅ Native performance (Rust backend)
- ✅ Small bundle size (~3MB vs Electron's ~100MB)
- ✅ Built-in security model
- ✅ Excellent cross-platform support (macOS, Windows, Linux)
- ✅ Modern web technologies for UI
- ✅ Native system tray and notifications

**Alternative: Electron + React**
- Larger ecosystem
- Easier debugging
- More familiar to web developers
- Heavier resource usage

### Backend Stack (Rust)
- `reqwest` - HTTP client with streaming support
- `tokio` - Async runtime
- `serde` - JSON serialization
- `dirs` - Cross-platform config directories
- `chrono` - Time tracking for metrics

### Frontend Stack
- **React 18** + **TypeScript** - UI framework
- **Vite** - Fast build tool
- **TailwindCSS** - Styling
- **shadcn/ui** or **Chakra UI** - Component library
- **Recharts** or **Plotly.js** - Data visualization
- **Zustand** or **Jotai** - Lightweight state management
- **React Query** - Request caching & synchronization

---

## 🎨 UI/UX Design

### Color Scheme
```
Primary:   #6366f1 (Indigo 500)
Secondary: #8b5cf6 (Violet 500)
Accent:    #06b6d4 (Cyan 500)
Success:   #10b981 (Emerald 500)
Warning:   #f59e0b (Amber 500)
Error:     #ef4444 (Red 500)

Background (Light):
  Surface: #ffffff
  Background: #f8fafc
  Border: #e2e8f0

Background (Dark):
  Surface: #1e293b
  Background: #0f172a
  Border: #334155
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Menu Bar: File | Edit | View | Tools | Help                │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────────────────────────────────┐ │
│ │             │  │  Response Display                        │ │
│ │   Sidebar   │  │  ┌─────────────────────────────────────┐ │ │
│ │             │  │  │ Token stream with syntax highlight  │ │ │
│ │ ┌─────────┐ │  │  │                                     │ │ │
│ │ │Endpoint │ │  │  │ [Streaming tokens appear here...]   │ │ │
│ │ │Profiles │ │  │  │                                     │ │ │
│ │ │         │ │  │  └─────────────────────────────────────┘ │ │
│ │ ├─────────┤ │  │  ┌─────────────────────────────────────┐ │ │
│ │ │History  │ │  │  │ Quick Stats Panel                   │ │ │
│ │ │         │ │  │  │ TTFT: 245ms  TPOT: 12ms  Tokens: 142│ │ │
│ │ │         │ │  │  └─────────────────────────────────────┘ │ │
│ │ └─────────┘ │  │                                          │ │
│ │             │  └─────────────────────────────────────────┘ │
│ └─────────────┘                                               │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Prompt Input                                            │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Type your prompt here...                             │ │ │
│ │ │                                                     │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ Parameters: [Model ▼] [Temp: 0.7] [Max Tokens: 2048]   │ │
│ │ [☑ Streaming] [📊 Show Metrics] [Submit] [Cancel]      │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Metrics Dashboard                                       │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │ │
│ │ │ TTFT     │ │ TPOT     │ │ Throughput│ │ Latency  │   │ │
│ │ │ Chart    │ │ Chart    │ │ Chart    │ │ Chart    │   │ │
│ │ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. **Sidebar** (Collapsible)
- Endpoint profiles list
- Quick add/edit/delete profiles
- Request history with timestamps
- Filter history by endpoint

#### 2. **Response Display** (Main Content)
- Tabbed interface:
  - **Response Tab**: Formatted markdown output with syntax highlighting
  - **Raw Tab**: JSON/raw response
  - **Debug Tab**: Full request/response headers and timing
- Real-time streaming indicator
- Token counter (cumulative)
- Copy to clipboard button
- Save response button

#### 3. **Prompt Input Area**
- Auto-expanding textarea
- Character/token counter
- Save as template feature
- Recent prompts dropdown
- Clear button

#### 4. **Parameters Panel**
- Model dropdown (auto-fetch available models)
- Temperature slider (0-2)
- Top-p slider (0-1)
- Max tokens input
- System message field
- Streaming toggle
- Custom key-value pairs for additional parameters

#### 5. **Metrics Dashboard** (Bottom Panel, Collapsible)
- **Summary Cards**: Large numbers with trend indicators
  - Last TTFT: 245ms (↓ 15ms from avg)
  - Last TPOT: 12ms (→ stable)
  - Throughput: 87 tokens/sec
  - Total Tokens: 1,423

- **Charts Grid**:
  1. **TTFT Timeline**: Scatter plot showing TTFT for each request
  2. **TPOT Distribution**: Box plot showing min, Q1, median, Q3, max
  3. **Throughput Trend**: Line chart over time
  4. **Token Velocity**: Bar chart of tokens/time windows

- **Export Options**:
  - Export metrics as CSV
  - Export charts as PNG/SVG
  - Generate PDF report

#### 6. **Configuration Modal**
- Endpoint URL input with validation
- API key input (password field, masked)
- Custom headers editor (key-value pairs)
- Connection timeout slider
- Test connection button
- Auto-save toggle

---

## 📊 Metrics Calculation

### Data Collection

```rust
struct RequestMetrics {
    request_id: String,
    timestamp: DateTime<Utc>,

    // Latency metrics
    ttft: Duration,           // Time to first token
    tpot_samples: Vec<Duration>,  // Time between tokens
    total_latency: Duration,

    // Output metrics
    total_tokens: usize,
    tokens_per_second: f64,

    // Request metadata
    model: String,
    streaming: bool,
    prompt_tokens: usize,
}
```

### Calculation Formulas

1. **TTFT**: `timestamp(first_token) - timestamp(request_sent)`
2. **TPOT**: `(timestamp(last_token) - timestamp(first_token)) / (token_count - 1)`
3. **Throughput**: `total_tokens / total_generation_time`
4. **Token Velocity**: Tokens received per 100ms window

### Statistical Analysis

For N requests:
- **Mean TTFT**: Average of all TTFT values
- **StdDev TTFT**: Standard deviation of TTFT
- **P50/P95/P99 TTFT**: Percentiles
- **Min/Max TPOT**: Range of inter-token times
- **TPOT CV**: Coefficient of variation (std/mean)

---

## 🔄 Request Flow

```
User Input
    ↓
[Validation]
    ↓
[Build Request] → [Add Metadata Headers]
    ↓
[Send HTTP Request]
    ↓
    ├─→ [Non-Streaming] → [Parse Complete Response] → [Calculate Metrics]
    │                                                      ↓
    │                                              [Update UI]
    │
    └─→ [Streaming] → [Parse SSE Chunks]
                      ↓
                  [Record Each Token Timestamp]
                      ↓
                  [Calculate TTFT on first token]
                      ↓
                  [Calculate TPOT in real-time]
                      ↓
                  [Update UI progressively]
                      ↓
                  [Final metrics on completion]
```

---

## 📁 Project Structure

```
modelcurl/
├── src-tauri/              # Rust backend
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs     # Tauri commands (IPC)
│   │   ├── http.rs         # HTTP client & metrics
│   │   ├── metrics.rs      # Metrics calculation
│   │   ├── config.rs       # Config management
│   │   └── storage.rs      # Local storage
│   └── icons/
│
├── src/                    # React frontend
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── Sidebar/
│   │   │   ├── EndpointList.tsx
│   │   │   └── RequestHistory.tsx
│   │   ├── ResponseDisplay/
│   │   │   ├── ResponseView.tsx
│   │   │   └── RawView.tsx
│   │   ├── PromptInput.tsx
│   │   ├── ParametersPanel.tsx
│   │   ├── MetricsDashboard.tsx
│   │   ├── Charts/
│   │   │   ├── TTFTChart.tsx
│   │   │   ├── TPOTChart.tsx
│   │   │   └── ThroughputChart.tsx
│   │   └── ConfigModal.tsx
│   ├── hooks/
│   │   ├── useLLMRequest.ts
│   │   └── useMetrics.ts
│   ├── stores/
│   │   ├── endpointStore.ts
│   │   └── metricsStore.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
│
├── public/
│   └── assets/
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tauri.conf.json
```

---

## 🎯 Implementation Phases

### Phase 1: Foundation
- [ ] Set up Tauri + React + TypeScript project
- [ ] Configure TailwindCSS and component library
- [ ] Create base layout structure
- [ ] Implement endpoint configuration (CRUD)
- [ ] Build prompt input and parameters panel

### Phase 2: Core Functionality
- [ ] Implement non-streaming request handler
- [ ] Implement streaming request handler (SSE parsing)
- [ ] Build response display with markdown rendering
- [ ] Add request history tracking

### Phase 3: Metrics & Visualization
- [ ] Implement metrics collection system
- [ ] Calculate TTFT, TPOT, throughput
- [ ] Create charts with Recharts/Plotly
- [ ] Build metrics dashboard

### Phase 4: Polish & Features
- [ ] Add dark mode support
- [ ] Implement keyboard shortcuts
- [ ] Add export functionality (CSV, PNG, PDF)
- [ ] Create configuration import/export
- [ ] Add tooltips and help documentation

### Phase 5: Testing & Optimization
- [ ] Performance optimization
- [ ] Error handling and edge cases
- [ ] Cross-platform testing (macOS, Windows)
- [ ] Bundle and distribution setup

---

## 🔧 Technical Considerations

### 1. Streaming Implementation
- Use Server-Sent Events (SSE) format
- Parse `data: ` prefixed JSON chunks
- Handle `[DONE]` termination signal
- Implement reconnection logic

### 2. Metrics Precision
- Use `performance.now()` for browser timing
- Use Rust's `std::time::Instant` for backend timing
- Store timestamps as UTC for consistency

### 3. State Management
- Use Zustand for lightweight state
- Separate stores for endpoints, metrics, UI state
- Persist critical data to localStorage via Tauri

### 4. Error Handling
- Network timeouts
- Invalid API keys
- Malformed responses
- Streaming interruptions
- Rate limiting (429) handling

### 5. Cross-Platform Compatibility
- Native window controls
- System tray integration
- Notification support
- Native file dialogs for export

---

## 📦 Dependencies Summary

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tauri-apps/api": "^1.5.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "recharts": "^2.8.0",
    "tailwindcss": "^3.3.0",
    "@radix-ui/react-*": "^1.0.0",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0"
  }
}
```

### Backend (Rust)
```toml
[dependencies]
tauri = { version = "1.5", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.11", features = ["stream", "json"] }
chrono = { version = "0.4", features = ["serde"] }
dirs = "5.0"
```

---

## 🎨 Design Inspirations

- **Modern aesthetics**: Linear.app, Raycast, Vercel Dashboard
- **Data visualization**: Grafana, Datadog
- **Developer tools**: Postman, Insomnia, Thunder Client
- **Code editors**: VS Code, Cursor

---

## 🚀 Next Steps

Once you approve this design, I'll implement:
1. Project scaffolding with Tauri + React + TypeScript
2. Core UI components with TailwindCSS
3. Endpoint configuration system
4. Request handlers (streaming & non-streaming)
5. Metrics calculation and visualization
6. Testing and cross-platform builds

Would you like me to proceed with this design? Any specific aspects you'd like me to adjust?
