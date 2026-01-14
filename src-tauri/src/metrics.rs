use crate::types::PerformanceMetrics;
use std::time::{Duration, Instant};

pub struct MetricsCollector {
    start_time: Instant,
    first_token_time: Option<Instant>,
    token_timestamps: Vec<Instant>,
    token_count: usize,
}

impl MetricsCollector {
    pub fn new() -> Self {
        Self {
            start_time: Instant::now(),
            first_token_time: None,
            token_timestamps: Vec::new(),
            token_count: 0,
        }
    }

    pub fn record_token(&mut self, token: &str) {
        let now = Instant::now();

        if self.first_token_time.is_none() && !token.trim().is_empty() {
            self.first_token_time = Some(now);
        }

        self.token_timestamps.push(now);
        self.token_count += token.len();
    }

    pub fn finalize(&self) -> PerformanceMetrics {
        let ttft = self
            .first_token_time
            .map(|t| t.duration_since(self.start_time))
            .unwrap_or(Duration::from_millis(0));

        let total_duration = self.start_time.elapsed();

        // Calculate TPOT (Time Per Output Token)
        let tpot_samples: Vec<Duration> = self
            .token_timestamps
            .windows(2)
            .map(|w| w[1].duration_since(w[0]))
            .collect();

        let avg_tpot = if !tpot_samples.is_empty() {
            let sum: Duration = tpot_samples.iter().sum();
            Some(sum.as_millis() as f64 / tpot_samples.len() as f64)
        } else {
            None
        };

        let tokens_per_second = if total_duration.as_millis() > 0 {
            Some(
                (self.token_timestamps.len() as f64 / total_duration.as_secs_f64()) * 1000.0,
            )
        } else {
            None
        };

        PerformanceMetrics {
            ttft_ms: ttft.as_millis() as f64,
            avg_tpot_ms: avg_tpot,
            total_latency_ms: total_duration.as_millis() as f64,
            total_tokens: self.token_timestamps.len(),
            tokens_per_second,
        }
    }
}

impl Default for MetricsCollector {
    fn default() -> Self {
        Self::new()
    }
}
