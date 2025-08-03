import { useState, useCallback } from "react";

interface ErrorState {
  message: string;
  code?: string;
  timestamp: Date;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback((error: unknown, context?: string) => {
    console.error(`Error ${context ? `in ${context}` : ""}:`, error);

    let message = "An unexpected error occurred";
    let code: string | undefined;

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else if (error && typeof error === "object" && "message" in error) {
      message = String((error as any).message);
      code = (error as any).code;
    }

    setError({
      message,
      code,
      timestamp: new Date(),
    });

    // Auto-clear error after 10 seconds
    setTimeout(() => setError(null), 10000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

// Global error boundary for unhandled errors
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  context?: string,
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      console.error(`Error in ${context || "async operation"}:`, error);
      throw error;
    }
  }) as T;
}
