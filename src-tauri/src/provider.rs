use crate::types::ReasoningProvider;
use lazy_static::lazy_static;
use regex::Regex;

/// Detect reasoning provider from model name using flexible pattern matching
pub fn detect_provider(model_name: &str) -> Option<ReasoningProvider> {
    let normalized = model_name.to_lowercase();

    // Order matters: check more specific patterns first

    // OpenAI reasoning models
    // Matches: o1, o1-preview, o1-mini, o3, o3-mini, gpt-5.0, gpt-5.x, etc.
    if is_openai_model(&normalized) {
        return Some(ReasoningProvider::OpenAI);
    }

    // DeepSeek reasoning models
    // Matches: deepseek-r1, deepseek-reasoner, Deepseekv3.2, deepseek-v3, etc.
    if is_deepseek_model(&normalized) {
        return Some(ReasoningProvider::DeepSeek);
    }

    // Qwen reasoning models
    // Matches: qwen-plus, qwen3-max, qwq-32b, qwen2.5-coder, etc.
    if is_qwen_model(&normalized) {
        return Some(ReasoningProvider::Qwen);
    }

    // Claude reasoning models
    // Matches: claude-3.7-sonnet, claude-4-sonnet, claude-opus-4.5, etc.
    if is_claude_model(&normalized) {
        return Some(ReasoningProvider::Claude);
    }

    None
}

fn is_openai_model(model: &str) -> bool {
    // Pattern: starts with o1, o3, or contains gpt-5
    lazy_static! {
        static ref OPENAI_PATTERN: Regex = Regex::new(r"^o[13]").unwrap();
        static ref GPT5_PATTERN: Regex = Regex::new(r"gpt[-_]5").unwrap();
    }

    OPENAI_PATTERN.is_match(model) || GPT5_PATTERN.is_match(model)
}

fn is_deepseek_model(model: &str) -> bool {
    // Pattern: contains deepseek and (r1, reasoner, v3, or similar indicators)
    lazy_static! {
        static ref DEEPSEEK_PATTERN: Regex =
            Regex::new(r"deepseek[-_]?[rv]?[13]?(\.?\d+)?(-?reason(er)?)?").unwrap();
    }

    DEEPSEEK_PATTERN.is_match(model)
}

fn is_qwen_model(model: &str) -> bool {
    // Pattern: qwen, qwq with potential reasoning indicators
    lazy_static! {
        static ref QWEN_PATTERN: Regex =
            Regex::new(r"^(qwen|qwq)([-_.]?(plus|max|turbo|coder|\d+\.?\d*))?$").unwrap();
    }

    QWEN_PATTERN.is_match(model)
}

fn is_claude_model(model: &str) -> bool {
    // Pattern: claude with version 3.7, 4, or opus 4.5
    lazy_static! {
        static ref CLAUDE_PATTERN: Regex =
            Regex::new(r"^claude[-_]?(3\.7|4|opus[-_]4\.5|sonnet[-_]4)").unwrap();
    }

    CLAUDE_PATTERN.is_match(model)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_openai_detection() {
        assert_eq!(
            detect_provider("o1"),
            Some(ReasoningProvider::OpenAI)
        );
        assert_eq!(
            detect_provider("o1-preview"),
            Some(ReasoningProvider::OpenAI)
        );
        assert_eq!(
            detect_provider("o1-mini"),
            Some(ReasoningProvider::OpenAI)
        );
        assert_eq!(
            detect_provider("o3"),
            Some(ReasoningProvider::OpenAI)
        );
        assert_eq!(
            detect_provider("gpt-5.0"),
            Some(ReasoningProvider::OpenAI)
        );
        assert_eq!(
            detect_provider("gpt_5_x"),
            Some(ReasoningProvider::OpenAI)
        );
        // Case insensitive
        assert_eq!(
            detect_provider("O1-PREVIEW"),
            Some(ReasoningProvider::OpenAI)
        );
    }

    #[test]
    fn test_deepseek_detection() {
        assert_eq!(
            detect_provider("deepseek-r1"),
            Some(ReasoningProvider::DeepSeek)
        );
        assert_eq!(
            detect_provider("deepseek-reasoner"),
            Some(ReasoningProvider::DeepSeek)
        );
        assert_eq!(
            detect_provider("Deepseekv3.2"),
            Some(ReasoningProvider::DeepSeek)
        );
        assert_eq!(
            detect_provider("deepseek-v3"),
            Some(ReasoningProvider::DeepSeek)
        );
        assert_eq!(
            detect_provider("DEEPSEEK-R1"),
            Some(ReasoningProvider::DeepSeek)
        );
    }

    #[test]
    fn test_qwen_detection() {
        assert_eq!(
            detect_provider("qwen-plus"),
            Some(ReasoningProvider::Qwen)
        );
        assert_eq!(
            detect_provider("qwen3-max"),
            Some(ReasoningProvider::Qwen)
        );
        assert_eq!(
            detect_provider("qwq-32b"),
            Some(ReasoningProvider::Qwen)
        );
        assert_eq!(
            detect_provider("qwen2.5-coder"),
            Some(ReasoningProvider::Qwen)
        );
        assert_eq!(
            detect_provider("QWEN-TURBO"),
            Some(ReasoningProvider::Qwen)
        );
    }

    #[test]
    fn test_claude_detection() {
        assert_eq!(
            detect_provider("claude-3.7-sonnet"),
            Some(ReasoningProvider::Claude)
        );
        assert_eq!(
            detect_provider("claude-4-sonnet"),
            Some(ReasoningProvider::Claude)
        );
        assert_eq!(
            detect_provider("claude-opus-4.5"),
            Some(ReasoningProvider::Claude)
        );
        assert_eq!(
            detect_provider("CLAUDE-4-SONNET"),
            Some(ReasoningProvider::Claude)
        );
    }

    #[test]
    fn test_non_reasoning_models() {
        assert_eq!(detect_provider("gpt-4"), None);
        assert_eq!(detect_provider("gpt-3.5-turbo"), None);
        assert_eq!(detect_provider("llama-2"), None);
        assert_eq!(detect_provider("mistral-7b"), None);
    }
}
