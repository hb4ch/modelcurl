import React from 'react';
import { Label } from './UI/Label';
import { Input } from './UI/Input';

interface ParametersPanelProps {
  temperature: number;
  maxTokens: number;
  stream: boolean;
  onTemperatureChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
  onStreamChange: (value: boolean) => void;
  disabled?: boolean;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  temperature,
  maxTokens,
  stream,
  onTemperatureChange,
  onMaxTokensChange,
  onStreamChange,
  disabled = false,
}) => {
  return (
    <div className="bg-card border-t border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Parameters</h3>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={stream}
            onChange={(e) => onStreamChange(e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 rounded border-input"
          />
          <span>Streaming</span>
        </label>
      </div>

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
  );
};
