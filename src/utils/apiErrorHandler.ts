import { signIn } from "next-auth/react";

interface ApiError {
  error: string;
  message: string;
  status: number;
}

export class AuthenticationError extends Error {
  constructor(message: string = "Please sign in again to continue") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends Error {
  constructor(message: string = "Invalid input provided") {
    super(message);
    this.name = "ValidationError";
  }
}

export class ServerError extends Error {
  constructor(message: string = "Server error occurred") {
    super(message);
    this.name = "ServerError";
  }
}

/**
 * Handles API responses and throws appropriate errors
 */
export async function handleApiResponse(response: Response) {
  if (response.ok) {
    return response.json();
  }

  let errorData: Partial<ApiError>;
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: "Unknown error occurred" };
  }

  const message = errorData.message || "An error occurred";

  switch (response.status) {
    case 401:
      throw new AuthenticationError(message);
    case 403:
      throw new AuthenticationError(
        "You don't have permission to access this resource",
      );
    case 400:
      throw new ValidationError(message);
    case 404:
      throw new Error("Resource not found");
    case 500:
    default:
      throw new ServerError(message);
  }
}

/**
 * Generic fetch wrapper with error handling
 */
export async function apiRequest(
  url: string,
  options: RequestInit = {},
): Promise<any> {
  const response = await fetch(url, {
    credentials: "include", // Send cookies for authentication
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  return handleApiResponse(response);
}

/**
 * Shows appropriate user feedback for different error types
 */
export function handleApiError(error: Error): {
  message: string;
  action?: "signin" | "retry" | "dismiss";
} {
  if (error instanceof AuthenticationError) {
    return {
      message: error.message,
      action: "signin",
    };
  }

  if (error instanceof ValidationError) {
    return {
      message: error.message,
      action: "dismiss",
    };
  }

  if (error instanceof ServerError) {
    return {
      message: error.message,
      action: "retry",
    };
  }

  return {
    message: error.message || "An unexpected error occurred",
    action: "retry",
  };
}

/**
 * Automatically triggers sign-in for auth errors
 */
export function handleAuthError(error: Error, autoSignIn: boolean = false) {
  if (error instanceof AuthenticationError && autoSignIn) {
    signIn();
  }
  return handleApiError(error);
}
