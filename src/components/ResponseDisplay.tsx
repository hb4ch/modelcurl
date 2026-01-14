import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check, Trash2, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { Button } from './UI/Button';
import { PerformanceMetrics, ThinkingBlock } from '../types';
import 'katex/dist/katex.min.css';

/**
 * Preprocess markdown to convert bracket-enclosed LaTeX to dollar-sign format
 * Handles patterns like [ \frac{a}{b} ] -> $ \frac{a}{b} $
 */
function preprocessLatex(markdown: string): string {
  // Pattern 1: Multi-line bracket-enclosed formulas (display math)
  // Matches: [ newline LaTeX content newline ]
  // Converts to: $$ LaTeX content $$
  const displayMathPattern = /\[\s*\n((?:[^\]]|\n(?!\]))*\\\[\w\*]+(?:\{[^}]*\})?(?:[^\]]|\n(?!\]))*?)\n\s*\]/g;

  // Pattern 2: Single-line bracket-enclosed formulas (inline math)
  // Matches: [ LaTeX with backslash commands ]
  // Converts to: $ LaTeX $
  const inlineMathPattern = /\[((?:[^\]]*\\(?:[\w\*]+|[\{\}\(\)\[\]])\s*)[^\]]*)\]/g;

  let processed = markdown;

  // First process display math (multi-line)
  processed = processed.replace(displayMathPattern, (_match, content) => {
    return `$$${content}$$`;
  });

  // Then process inline math (single-line)
  processed = processed.replace(inlineMathPattern, (_match, content) => {
    // Only convert if it looks like LaTeX (contains backslash commands)
    if (content.includes('\\')) {
      return `$${content}$`;
    }
    return _match; // Return original if not LaTeX
  });

  return processed;
}

interface ResponseDisplayProps {
  response: string;
  metrics: PerformanceMetrics | null;
  reasoningContent?: string;
  thinkingBlocks?: ThinkingBlock[];
  reasoningProvider?: string | null;
  isLoading?: boolean;
  onCopy?: () => void;
  onClear?: () => void;
  isStreaming?: boolean;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  metrics,
  reasoningContent,
  thinkingBlocks,
  reasoningProvider,
  isLoading = false,
  onCopy,
  onClear,
  isStreaming = false,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showReasoning, setShowReasoning] = React.useState(false);

  const handleCopy = async () => {
    if (response) {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasReasoning = reasoningContent || (thinkingBlocks && thinkingBlocks.length > 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Response</h2>
          <div className="flex gap-2">
            {response && (
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            )}
            {onClear && (
              <Button variant="ghost" size="sm" onClick={onClear}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {metrics && (
          <div className="grid grid-cols-4 gap-3">
            <MetricCard
              label="TTFT"
              value={`${metrics.ttftMs.toFixed(0)}ms`}
              tooltip="Time to First Token"
            />
            <MetricCard
              label="TPOT"
              value={
                metrics.avgTpotMs
                  ? `${metrics.avgTpotMs.toFixed(1)}ms`
                  : 'N/A'
              }
              tooltip="Time Per Output Token"
            />
            <MetricCard
              label="Tokens/s"
              value={
                metrics.tokensPerSecond
                  ? metrics.tokensPerSecond.toFixed(1)
                  : 'N/A'
              }
              tooltip="Tokens per second"
            />
            <MetricCard
              label="Total Tokens"
              value={metrics.totalTokens.toString()}
              tooltip="Total number of tokens"
            />
          </div>
        )}
      </div>

      {/* Reasoning Display */}
      {hasReasoning && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                {reasoningProvider === 'openai'
                  ? 'Reasoning (tokens counted, content not exposed)'
                  : 'Thinking Process'}
              </span>
            </div>
            {showReasoning ? (
              <ChevronUp className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            )}
          </button>

          {showReasoning && reasoningContent && (
            <div className="px-4 pb-4 max-h-96 overflow-y-auto">
              <div className="prose prose-sm dark:prose-invert max-w-none text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-900/30 rounded-lg p-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {preprocessLatex(reasoningContent)}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {showReasoning && thinkingBlocks && thinkingBlocks.length > 0 && (
            <div className="px-4 pb-4 max-h-96 overflow-y-auto space-y-3">
              {thinkingBlocks.map((block, index) => (
                <div
                  key={index}
                  className="prose prose-sm dark:prose-invert max-w-none text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-900/30 rounded-lg p-4"
                >
                  {block.summary && (
                    <div className="text-xs font-semibold mb-2 opacity-70">
                      {block.summary}
                    </div>
                  )}
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {preprocessLatex(block.content)}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 bg-background/50">
        {isLoading && !response && (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span>Waiting for response...</span>
            </div>
          </div>
        )}

        {isStreaming && response && (
          <div className="flex items-center gap-2 text-sm text-primary mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            Streaming response...
          </div>
        )}

        {response ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {preprocessLatex(response)}
            </ReactMarkdown>
          </div>
        ) : (
          !isLoading && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Response will appear here</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  tooltip: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, tooltip }) => {
  return (
    <div className="bg-muted/50 rounded-lg p-3" title={tooltip}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
};
