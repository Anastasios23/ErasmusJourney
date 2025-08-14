import React, { createContext, useContext, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

interface LoadingContextType {
  loadingStates: Record<string, LoadingState>;
  setLoading: (
    key: string,
    loading: boolean,
    message?: string,
    progress?: number,
  ) => void;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;
  isAnyLoading: () => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<
    Record<string, LoadingState>
  >({});

  const setLoading = useCallback(
    (key: string, loading: boolean, message?: string, progress?: number) => {
      setLoadingStates((prev) => {
        if (!loading) {
          const { [key]: removed, ...rest } = prev;
          return rest;
        }
        return {
          ...prev,
          [key]: { isLoading: loading, message, progress },
        };
      });
    },
    [],
  );

  const clearLoading = useCallback((key: string) => {
    setLoadingStates((prev) => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some((state) => state.isLoading);
  }, [loadingStates]);

  return (
    <LoadingContext.Provider
      value={{
        loadingStates,
        setLoading,
        clearLoading,
        clearAllLoading,
        isAnyLoading,
      }}
    >
      {children}
      <GlobalLoadingIndicator />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

// Hook for managing loading state of a specific operation
export function useOperationLoading(operationKey: string) {
  const { loadingStates, setLoading } = useLoading();

  const isLoading = loadingStates[operationKey]?.isLoading || false;
  const message = loadingStates[operationKey]?.message;
  const progress = loadingStates[operationKey]?.progress;

  const startLoading = useCallback(
    (message?: string, progress?: number) => {
      setLoading(operationKey, true, message, progress);
    },
    [operationKey, setLoading],
  );

  const stopLoading = useCallback(() => {
    setLoading(operationKey, false);
  }, [operationKey, setLoading]);

  const updateProgress = useCallback(
    (progress: number, message?: string) => {
      setLoading(operationKey, true, message, progress);
    },
    [operationKey, setLoading],
  );

  return {
    isLoading,
    message,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
  };
}

function GlobalLoadingIndicator() {
  const { loadingStates, isAnyLoading } = useLoading();

  if (!isAnyLoading()) return null;

  // Find the most recent loading operation with a message
  const currentOperation =
    Object.values(loadingStates).find((state) => state.message) ||
    Object.values(loadingStates)[0];

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-blue-600 text-white px-4 py-2 text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{currentOperation?.message || "Loading..."}</span>
          {currentOperation?.progress !== undefined && (
            <span className="text-blue-200">
              ({currentOperation.progress}%)
            </span>
          )}
        </div>

        {currentOperation?.progress !== undefined && (
          <div className="mt-1 bg-blue-700 rounded-full h-1">
            <div
              className="bg-white h-1 rounded-full transition-all duration-300"
              style={{ width: `${currentOperation.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Loading overlay component for specific sections
export function LoadingOverlay({
  isLoading,
  message = "Loading...",
  className,
}: {
  isLoading: boolean;
  message?: string;
  className?: string;
}) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 bg-white/80 flex items-center justify-center z-10",
        className,
      )}
    >
      <div className="flex items-center space-x-2 bg-white rounded-lg shadow-lg px-4 py-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-sm text-gray-700">{message}</span>
      </div>
    </div>
  );
}

// Button with loading state
export function LoadingButton({
  isLoading,
  loadingText = "Loading...",
  children,
  disabled,
  className,
  ...props
}: {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md",
        "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {isLoading ? loadingText : children}
    </button>
  );
}

// Card with loading state
export function LoadingCard({
  isLoading,
  children,
  skeleton,
  className,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {isLoading
        ? skeleton || (
            <div className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
          )
        : children}
    </div>
  );
}
