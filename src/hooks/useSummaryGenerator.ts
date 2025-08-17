import { useDebounceApi } from "./useDebounceApi";
import { generateSummary } from "../services/aiService";
import type { PromptSettings } from "../types/types";

interface UseSummaryGeneratorParams {
  onSuccess?: (summary: string) => void;
  onError?: (error: Error) => void;
  delay?: number;
}

export function useSummaryGenerator({
  onSuccess,
  onError,
  delay = 1000,
}: UseSummaryGeneratorParams = {}) {
  const {
    data: summary,
    isLoading,
    error,
    execute,
    reset,
  } = useDebounceApi<string, [string, PromptSettings]>(
    async (text: string, settings: PromptSettings) => {
      return generateSummary(text, settings);
    },
    {
      delay,
      onSuccess,
      onError,
    }
  );

  return {
    summary,
    isLoading,
    error,
    generateSummary: execute,
    reset,
  };
}
