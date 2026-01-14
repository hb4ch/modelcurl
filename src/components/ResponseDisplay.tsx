import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Trash2 } from 'lucide-react';
import { Button } from './UI/Button';
import { PerformanceMetrics } from '../types';

interface ResponseDisplayProps {
  response: string;
  metrics: PerformanceMetrics | null;
  isLoading?: boolean;
  onCopy?: () => void;
  onClear?: () => void;
  isStreaming?: boolean;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  metrics,
  isLoading = false,
  onCopy,
  onClear,
  isStreaming = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (response) {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {response}
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
