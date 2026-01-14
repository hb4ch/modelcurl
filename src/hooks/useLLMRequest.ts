import { useState, useCallback, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { Endpoint, LLMRequest, LLMResponse, PerformanceMetrics } from '../types';

interface UseLLMRequestReturn {
  isLoading: boolean;
  error: string | null;
  response: string;
  metrics: PerformanceMetrics | null;
  sendRequest: (
    endpoint: Endpoint,
    request: LLMRequest,
    onToken?: (token: string) => void
  ) => Promise<void>;
  clearResponse: () => void;
  dismissError: () => void;
}

export function useLLMRequest(): UseLLMRequestReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  const startTimeRef = useRef<number>(0);
  const firstTokenTimeRef = useRef<number | null>(null);
  const tokenTimestampsRef = useRef<number[]>([]);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
      }, 5000);
    }

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [error]);

  const sendRequest = useCallback(
    async (
      endpoint: Endpoint,
      request: LLMRequest,
      onToken?: (token: string) => void
    ) => {
      setIsLoading(true);
      setError(null);
      setResponse('');
      setMetrics(null);

      // Reset metrics tracking
      startTimeRef.current = performance.now();
      firstTokenTimeRef.current = null;
      tokenTimestampsRef.current = [];

      try {
        if (request.stream) {
          // Set up token listener
          const unlisten = await listen<string>('token', (event) => {
            const token = event.payload;
            const now = performance.now();

            if (firstTokenTimeRef.current === null && token.trim().length > 0) {
              firstTokenTimeRef.current = now;
            }

            tokenTimestampsRef.current.push(now);
            setResponse((prev) => prev + token);
            onToken?.(token);
          });

          try {
            await invoke('send_streaming_request', {
              endpoint,
              request,
            });
          } finally {
            unlisten();
          }

          // Calculate metrics
          const endTime = performance.now();
          const ttft = firstTokenTimeRef.current
            ? firstTokenTimeRef.current - startTimeRef.current
            : 0;

          const totalLatency = endTime - startTimeRef.current;

          // Calculate TPOT (Time Per Output Token)
          const tpotSamples: number[] = [];
          for (let i = 1; i < tokenTimestampsRef.current.length; i++) {
            tpotSamples.push(
              tokenTimestampsRef.current[i] - tokenTimestampsRef.current[i - 1]
            );
          }

          const avgTpot =
            tpotSamples.length > 0
              ? tpotSamples.reduce((a, b) => a + b, 0) / tpotSamples.length
              : undefined;

          const tokensPerSecond =
            totalLatency > 0
              ? (tokenTimestampsRef.current.length / totalLatency) * 1000
              : undefined;

          setMetrics({
            ttftMs: ttft,
            avgTpotMs: avgTpot,
            totalLatencyMs: totalLatency,
            totalTokens: tokenTimestampsRef.current.length,
            tokensPerSecond,
          });
        } else {
          const result = await invoke<LLMResponse>('send_request', {
            endpoint,
            request,
          });

          setResponse(result.content);

          const endTime = performance.now();
          const totalLatency = endTime - startTimeRef.current;

          setMetrics({
            ttftMs: totalLatency,
            totalLatencyMs: totalLatency,
            totalTokens: result.usage?.completionTokens || 0,
          });
        }
      } catch (err) {
        setError(err as string);
        console.error('Request failed:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearResponse = useCallback(() => {
    setResponse('');
    setError(null);
    setMetrics(null);
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    response,
    metrics,
    sendRequest,
    clearResponse,
    dismissError,
  };
}
