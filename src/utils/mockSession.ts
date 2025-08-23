// Static mock session objects to prevent re-renders when authentication is disabled
export const MOCK_SESSION_USER = {
  user: {
    id: "anonymous",
    name: "Anonymous User",
    email: "anonymous@example.com",
  },
};

export const MOCK_SESSION_ADMIN = {
  user: {
    id: "anonymous",
    name: "Admin User",
    email: "admin@example.com",
    role: "ADMIN",
  },
};

export const MOCK_STATUS_AUTHENTICATED = "authenticated" as const;
export const MOCK_STATUS_LOADING = "loading" as const;
export const MOCK_STATUS_UNAUTHENTICATED = "unauthenticated" as const;

// Mock session update function
export const MOCK_SESSION_UPDATE = async () => {};
