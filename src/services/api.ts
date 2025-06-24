const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface BasicInformationData {
  firstName: string;
  lastName: string;
  email: string;
  semester: string;
  levelOfStudy: string;
  universityInCyprus: string;
  department: string;
  receptionCountry: string;
  receptionCity: string;
  foreignUniversity: string;
  departmentAtHost: string;
}

export interface CourseMatchingData {
  basicInfoId: number;
  hostCourseCount: number;
  homeCourseCount: number;
  courseMatchingDifficult: string;
  courseMatchingChallenges: string;
  recommendCourses: string;
  recommendationReason: string;
  courses: Array<{
    name: string;
    code: string;
    ects: string;
    difficulty: string;
    examTypes: string[];
    type: "host" | "home";
  }>;
}

export interface AccommodationData {
  basicInfoId: number;
  accommodationType: string;
  monthlyRent: string;
  utilities: string;
  neighborhood: string;
  roommates: string;
  satisfactionLevel: string;
  recommendAccommodation: string;
  recommendationReason: string;
}

export interface LivingExpensesData {
  basicInfoId: number;
  monthlyIncomeAmount: string;
  unexpectedCosts: string;
  moneyManagementHabits: string;
  cheapGroceryPlaces: string;
  cheapEatingPlaces: string;
  transportationTips: string;
  budgetAdvice: string;
}

export interface HelpFutureStudentsData {
  basicInfoId: number;
  wantToHelp: string;
  contactMethod: string;
  email: string;
  instagramUsername: string;
  facebookLink: string;
  linkedinProfile: string;
  personalWebsite: string;
  phoneNumber: string;
  preferredContactTime: string;
  languagesSpoken: string[];
  helpTopics: string[];
  specializations: string[];
  otherSpecialization: string;
  availabilityLevel: string;
  publicProfile: string;
  allowPublicContact: string;
  responseTime: string;
  nickname: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async saveBasicInformation(
    data: BasicInformationData,
  ): Promise<{ id: number; message: string }> {
    return this.makeRequest<{ id: number; message: string }>(
      "/basic-information",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async saveCourseMatching(
    data: CourseMatchingData,
  ): Promise<{ id: number; message: string }> {
    return this.makeRequest<{ id: number; message: string }>(
      "/course-matching",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async saveAccommodation(
    data: AccommodationData,
  ): Promise<{ id: number; message: string }> {
    return this.makeRequest<{ id: number; message: string }>("/accommodation", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async saveLivingExpenses(
    data: LivingExpensesData,
  ): Promise<{ id: number; message: string }> {
    return this.makeRequest<{ id: number; message: string }>(
      "/living-expenses",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async saveHelpFutureStudents(
    data: HelpFutureStudentsData,
  ): Promise<{ id: number; message: string }> {
    return this.makeRequest<{ id: number; message: string }>(
      "/help-future-students",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async getAllSubmissions(): Promise<any[]> {
    return this.makeRequest<any[]>("/submissions");
  }

  async getSubmissionById(id: number): Promise<any> {
    return this.makeRequest<any>(`/submission/${id}`);
  }
}

export const apiService = new ApiService();

// User session management
class SessionManager {
  private static instance: SessionManager;
  private currentUserSession: { basicInfoId?: number } = {};

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  setBasicInfoId(id: number): void {
    this.currentUserSession.basicInfoId = id;
    localStorage.setItem(
      "erasmusJourneySession",
      JSON.stringify(this.currentUserSession),
    );
  }

  getBasicInfoId(): number | undefined {
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
