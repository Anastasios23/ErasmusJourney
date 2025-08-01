import { useState } from "react";
import { AuthenticationError } from "../utils/apiErrorHandler";

interface UseAuthErrorHandlerResult {
  authError: AuthenticationError | null;
  setAuthError: (error: AuthenticationError | null) => void;
  handleError: (error: Error) => boolean; // Returns true if error was handled
  clearAuthError: () => void;
}

/**
 * Hook to handle authentication errors in forms
 * Automatically detects auth errors and provides state management
 */
export function useAuthErrorHandler(): UseAuthErrorHandlerResult {
  const [authError, setAuthError] = useState<AuthenticationError | null>(null);

  const handleError = (error: Error): boolean => {
    if (error instanceof AuthenticationError) {
      setAuthError(error);
      return true; // Error was handled
    }

    // Clear any existing auth error if this is a different type of error
    if (authError) {
      setAuthError(null);
    }

    return false; // Error was not handled
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return {
    authError,
    setAuthError,
    handleError,
    clearAuthError,
  };
}

export default useAuthErrorHandler;
