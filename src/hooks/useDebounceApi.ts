import { useState, useEffect, useCallback } from "react";

interface UseDebounceApiOptions<T> {
  delay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface UseDebounceApiResult<T, P extends unknown[]> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: (...args: P) => void;
  reset: () => void;
}

export function useDebounceApi<T, P extends unknown[]>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseDebounceApiOptions<T> = {}
): UseDebounceApiResult<T, P> {
  const { delay = 500, onSuccess, onError, enabled = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<P>(() => [] as unknown as P);
  const [shouldExecute, setShouldExecute] = useState(false);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setParams([] as unknown as P);
    setShouldExecute(false);
  }, []);

  const execute = useCallback((...args: P) => {
    setParams(args);
    setShouldExecute(true);
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let mounted = true;

    const executeApi = async () => {
      if (!enabled || !shouldExecute) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...params);
        if (mounted) {
          setData(result);
          onSuccess?.(result);
        }
      } catch (err) {
        if (mounted) {
          const error =
            err instanceof Error ? err : new Error("An error occurred");
          setError(error);
          onError?.(error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setShouldExecute(false);
        }
      }
    };

    // Debounce the API call
    if (shouldExecute) {
      timeoutId = setTimeout(executeApi, delay);
    }

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [apiFunction, delay, enabled, onError, onSuccess, params, shouldExecute]);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}
