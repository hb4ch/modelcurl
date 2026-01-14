import React, { useState } from 'react';
import { Label } from './UI/Label';
import { Input } from './UI/Input';
import { ReasoningControls } from './ReasoningControls';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';
import type { ReasoningConfig, ReasoningProvider } from '../types';

interface ParametersPanelProps {
  temperature: number;
  maxTokens: number;
  stream: boolean;
  reasoningConfig?: ReasoningConfig;
  reasoningProvider?: ReasoningProvider | null;
  onTemperatureChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
  onStreamChange: (value: boolean) => void;
  onReasoningConfigChange?: (config: ReasoningConfig) => void;
  disabled?: boolean;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  temperature,
  maxTokens,
  stream,
  reasoningConfig,
  reasoningProvider,
  onTemperatureChange,
  onMaxTokensChange,
  onStreamChange,
  onReasoningConfigChange,
  disabled = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Default reasoning config if not provided
  const defaultReasoningConfig: ReasoningConfig = {
    enableThinking: false,
    reasoningEffort: 'medium',
    maxCompletionTokens: 2048,
    thinkingBudgetTokens: 8000,
  };

  const currentReasoningConfig = reasoningConfig || defaultReasoningConfig;

  return (
    <>
      <div className="bg-card border-t border-border">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Parameters</span>
          </div>
          <div className="flex items-center gap-3">
            <label
              className="flex items-center gap-2 text-sm cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={stream}
                onChange={(e) => onStreamChange(e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 rounded border-input"
              />
              <span>Streaming</span>
            </label>
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {!isCollapsed && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperature" className="text-xs">
                  Temperature: {temperature.toFixed(1)}
                </Label>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                  disabled={disabled}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.0</span>
                  <span>1.0</span>
                  <span>2.0</span>
                </div>
              </div>

              <div>
                <Label htmlFor="maxTokens" className="text-xs">
                  Max Tokens
                </Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="1"
                  max="128000"
                  value={maxTokens}
                  onChange={(e) => onMaxTokensChange(parseInt(e.target.value) || 2048)}
                  disabled={disabled}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {onReasoningConfigChange && reasoningProvider && (
        <ReasoningControls
          provider={reasoningProvider}
          config={currentReasoningConfig}
          onChange={onReasoningConfigChange}
          disabled={disabled}
        />
      )}
    </>
  );
};
