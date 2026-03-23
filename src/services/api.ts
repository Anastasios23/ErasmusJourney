class SessionManager {
  private static instance: SessionManager;
  private currentUserSession: { basicInfoId?: string } = {};

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  setBasicInfoId(id: string): void {
    this.currentUserSession.basicInfoId = id;
    localStorage.setItem(
      "erasmusJourneySession",
      JSON.stringify(this.currentUserSession),
    );
  }

  getBasicInfoId(): string | undefined {
    // Try to get from memory first
    if (this.currentUserSession.basicInfoId) {
      return this.currentUserSession.basicInfoId;
    }

    // Fall back to localStorage
    const stored = localStorage.getItem("erasmusJourneySession");
    if (stored) {
      try {
        const session = JSON.parse(stored);
        this.currentUserSession = session;
        return session.basicInfoId;
      } catch (error) {
        console.error("Error parsing stored session:", error);
        localStorage.removeItem("erasmusJourneySession");
      }
    }

    return undefined;
  }

  clearSession(): void {
    this.currentUserSession = {};
    localStorage.removeItem("erasmusJourneySession");
  }
}

export const sessionManager = SessionManager.getInstance();

export async function registerUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; message: string; user?: any }> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
}
