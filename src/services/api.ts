const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface BasicInformationData {
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  phoneNumber: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;

  // Academic Information
  universityInCyprus: string;
  departmentInCyprus: string;
  levelOfStudy: string;
  currentYear: string;
  gpa: string;
  studentId: string;
  academicAdvisor: string;

  // Exchange Information
  exchangePeriod: string;
  exchangeStartDate: string;
  exchangeEndDate: string;
  hostUniversity: string;
  hostCountry: string;
  hostCity: string;
  hostDepartment: string;
  hostCoordinator: string;

  // Language Requirements
  languageOfInstruction: string;
  languageProficiencyLevel: string;
  languageCertificates: string;

  // Motivation and Goals
  motivationForExchange: string;
  academicGoals: string;
  personalGoals: string;
  careerGoals: string;

  // Additional Information
  previousExchangeExperience: string;
  extracurricularActivities: string;
  specialNeeds: string;
  dietaryRestrictions: string;
  medicalConditions: string;
  additionalNotes: string;

  // Preferences
  accommodationPreference: string;
  buddyProgramInterest: string;
  orientationProgramInterest: string;
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

// User session management
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

class ApiService {
  private isBackendAvailable = true;
  public sessionManager = SessionManager.getInstance();

  private async makeRequest<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;

    try {
      // Add timeout to requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);
      this.isBackendAvailable = true;

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      this.isBackendAvailable = false;

      // Only log in development mode
      if (process.env.NODE_ENV === "development") {
        console.warn(`Backend connection failed for ${endpoint}:`, error);
      }

      // Return mock success response when backend is not available
      if (options?.method === "POST") {
        // Store data locally when backend is unavailable
        this.storeLocally(endpoint, options.body);
        return {
          id: Date.now(),
          message: "Data saved locally (backend unavailable)",
        } as T;
      }

      throw error;
    }
  }

  private storeLocally(endpoint: string, data: any): void {
    try {
      const localData = JSON.parse(
        localStorage.getItem("offline_submissions") || "[]",
      );
      localData.push({
        endpoint,
        data: typeof data === "string" ? JSON.parse(data) : data,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("offline_submissions", JSON.stringify(localData));
    } catch (error) {
      console.warn("Failed to store data locally:", error);
    }
  }

  public getBackendStatus(): boolean {
    return this.isBackendAvailable;
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
export const sessionManager = SessionManager.getInstance();

// Registration function
export async function registerUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    // Check if response body can be read
    if (!response.body || response.bodyUsed) {
      throw new Error("Response body is not available");
    }

    // Read the response data
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Error parsing response JSON:", parseError);
      throw new Error("Invalid response from server");
    }

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}
