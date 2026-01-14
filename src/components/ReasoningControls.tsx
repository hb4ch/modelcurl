import React from 'react';
import { Label } from './UI/Label';
import { Input } from './UI/Input';
import { ChevronDown, ChevronUp, Brain } from 'lucide-react';
import type { ReasoningProvider, ReasoningConfig } from '../types';
import { getProviderName } from '../utils/provider';

interface ReasoningControlsProps {
  provider: ReasoningProvider | null;
  config: ReasoningConfig;
  onChange: (config: ReasoningConfig) => void;
  disabled?: boolean;
}

export const ReasoningControls: React.FC<ReasoningControlsProps> = ({
  provider,
  config,
  onChange,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // If not a reasoning model, don't render
  if (!provider) {
    return null;
  }

  const updateConfig = (updates: Partial<ReasoningConfig>) => {
    onChange({ ...config, ...updates });
  };

  const renderOpenAIControls = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reasoningEffort" className="text-xs">
            Reasoning Effort
          </Label>
          <select
            id="reasoningEffort"
            value={config.reasoningEffort || 'medium'}
            onChange={(e) => updateConfig({ reasoningEffort: e.target.value })}
            disabled={disabled}
            className="w-full mt-2 px-3 py-2 bg-background border border-border rounded-md text-sm"
          >
            <option value="none">None</option>
            <option value="minimal">Minimal</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <Label htmlFor="maxCompletionTokens" className="text-xs">
            Max Completion Tokens
          </Label>
          <Input
            id="maxCompletionTokens"
            type="number"
            min="1"
            max="100000"
            value={config.maxCompletionTokens || 2048}
            onChange={(e) =>
              updateConfig({ maxCompletionTokens: parseInt(e.target.value) || 2048 })
            }
            disabled={disabled}
            className="mt-2"
          />
        </div>
      </div>
    </>
  );

  const renderDeepSeekControls = () => (
    <div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={config.enableThinking}
          onChange={(e) => updateConfig({ enableThinking: e.target.checked })}
          disabled={disabled}
          className="w-4 h-4 rounded border-input"
        />
        <span>Enable Thinking Mode</span>
      </label>
      <p className="text-xs text-muted-foreground mt-1">
        Show reasoning process in response
      </p>
    </div>
  );

  const renderQwenControls = () => (
    <>
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableThinking}
            onChange={(e) => updateConfig({ enableThinking: e.target.checked })}
            disabled={disabled}
            className="w-4 h-4 rounded border-input"
          />
          <span>Enable Thinking Mode</span>
        </label>
        <p className="text-xs text-muted-foreground mt-1">
          Hybrid mode: Can switch between thinking and non-thinking
        </p>
      </div>

      {config.enableThinking && (
        <div className="mt-4">
          <Label htmlFor="thinkingBudgetTokens" className="text-xs">
            Thinking Budget (tokens)
          </Label>
          <Input
            id="thinkingBudgetTokens"
            type="number"
            min="1"
            max="100000"
            value={config.thinkingBudgetTokens || 8000}
            onChange={(e) =>
              updateConfig({ thinkingBudgetTokens: parseInt(e.target.value) || 8000 })
            }
            disabled={disabled}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum tokens for reasoning process
          </p>
        </div>
      )}
    </>
  );

  const renderClaudeControls = () => (
    <>
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableThinking}
            onChange={(e) => updateConfig({ enableThinking: e.target.checked })}
            disabled={disabled}
            className="w-4 h-4 rounded border-input"
          />
          <span>Enable Thinking Mode</span>
        </label>
        <p className="text-xs text-muted-foreground mt-1">
          Extended thinking for complex reasoning tasks
        </p>
      </div>

      {config.enableThinking && (
        <div className="mt-4">
          <Label htmlFor="thinkingBudgetTokens" className="text-xs">
            Thinking Budget (tokens)
          </Label>
          <Input
            id="thinkingBudgetTokens"
            type="number"
            min="1"
            max="200000"
            value={config.thinkingBudgetTokens || 20000}
            onChange={(e) =>
              updateConfig({ thinkingBudgetTokens: parseInt(e.target.value) || 20000 })
            }
            disabled={disabled}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum tokens for extended thinking
          </p>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-card border-t border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">
            Reasoning ({getProviderName(provider)})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            {provider === 'openai' && (
              <>
                <strong>OpenAI Reasoning Models:</strong> Uses{' '}
                <code>reasoning_effort</code> parameter to control thinking depth.
                Reasoning content is not exposed in API responses (token count only).
              </>
            )}
            {provider === 'deepseek' && (
              <>
                <strong>DeepSeek Reasoning Models:</strong> Toggle thinking mode on/off.
                When enabled, reasoning process is shown in{' '}
                <code>reasoning_content</code> field.
              </>
            )}
            {provider === 'qwen' && (
              <>
                <strong>Qwen Reasoning Models:</strong> Hybrid mode supports switching
                between thinking and non-thinking. Set{' '}
                <code>thinking_budget</code> to control reasoning tokens.
              </>
            )}
            {provider === 'claude' && (
              <>
                <strong>Claude Reasoning Models:</strong> Extended thinking for complex
                tasks. Thinking blocks are shown separately from the main response.
              </>
            )}
          </div>

          {provider === 'openai' && renderOpenAIControls()}
          {provider === 'deepseek' && renderDeepSeekControls()}
          {provider === 'qwen' && renderQwenControls()}
          {provider === 'claude' && renderClaudeControls()}
        </div>
      )}
    </div>
  );
};
