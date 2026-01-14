import React, { useState } from 'react';
import { Send, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Button } from './UI/Button';
import { Textarea } from './UI/Textarea';
import { Label } from './UI/Label';

interface PromptInputProps {
  onSubmit: (prompt: string, systemMessage: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isLoading = false,
  disabled = false,
}) => {
  const [prompt, setPrompt] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  const [showSystem, setShowSystem] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !disabled) {
      onSubmit(prompt, systemMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (prompt.trim() && !disabled) {
        onSubmit(prompt, systemMessage);
      }
    }
  };

  return (
    <div className="bg-card border-t border-border">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Prompt Input</span>
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {!isCollapsed && (
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {showSystem && (
              <div>
                <Label htmlFor="system" className="text-sm text-muted-foreground">
                  System Message (Optional)
                </Label>
                <Textarea
                  id="system"
                  placeholder="You are a helpful assistant..."
                  value={systemMessage}
                  onChange={(e) => setSystemMessage(e.target.value)}
                  className="mt-2 text-sm"
                  rows={2}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Label
                htmlFor="prompt"
                className="text-sm cursor-pointer hover:text-primary transition-colors"
              >
                Prompt
              </Label>
              <button
                type="button"
                onClick={() => setShowSystem(!showSystem)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showSystem ? '−' : '+'} System Message
              </button>
            </div>

            <Textarea
              id="prompt"
              placeholder="Type your message here... (Cmd/Ctrl + Enter to submit)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              rows={4}
              className="resize-none"
            />

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {prompt.length} characters · {prompt.split(/\s+/).filter(Boolean).length} words
              </div>
              <Button
                type="submit"
                disabled={!prompt.trim() || disabled || isLoading}
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
