import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  apiRequest,
  handleApiError,
  AuthenticationError,
  ValidationError,
} from "../utils/apiErrorHandler";
import { apiService } from "../services/api";
import { FormType, FormStatus } from "../types/forms";
import { livingExpensesSchema } from "../lib/schemas";

interface FormSubmission {
  id: string;
  userId: string;
  type:
    | "basic-info"
    | "course-matching"
    | "accommodation"
    | "story"
    | "experience";
  title: string;
  data: any;
  status: "draft" | "submitted" | "published";
  createdAt: string;
  updatedAt: string;
}

interface UseFormSubmissionsReturn {
  submissions: FormSubmission[];
  loading: boolean;
  error: string | null;
  submitForm: (
    type: string,
    title: string,
    data: any,
    formStatus?: string,
    basicInfoId?: string,
  ) => Promise<any>;
  getDraftData: (type: string) => any | null;
  getSubmittedData: (type: string) => any | null;
  getFormData: (type: string) => any | null;
  saveDraft: (type: string, title: string, data: any) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
  refreshSubmissions: () => Promise<void>;
  getBasicInfoId: () => string | undefined;
  setBasicInfoId: (id: string) => void;
}

// Update the FormType type to include living-expenses
type ExtendedFormType =
  | "basic-info"
  | "course-matching"
  | "accommodation"
  | "living-expenses"
  | "experience";

export function useFormSubmissions(): UseFormSubmissionsReturn {
  const { data: session, status } = useSession();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      if (session) {
        // Authenticated user: fetch from server
        const data = await apiRequest("/api/forms/get");
        setSubmissions(data.submissions || []);
      } else {
        // Unauthenticated user: load from localStorage
        if (typeof window !== "undefined") {
          const localDrafts: FormSubmission[] = [];
          const formTypes = [
            "basic-info",
            "course-matching",
            "accommodation",
            "story",
            "experience",
          ];

          formTypes.forEach((type) => {
            const draftKey = `erasmus_draft_${type}`;
            const localDraft = localStorage.getItem(draftKey);
            if (localDraft) {
              try {
                const parsed = JSON.parse(localDraft);
                localDrafts.push({
                  id: `local_${type}`,
                  userId: "local",
                  type: type as any,
                  title: parsed.title,
                  data: parsed.data,
                  status: "draft",
                  createdAt: parsed.timestamp,
                  updatedAt: parsed.timestamp,
                });
              } catch (err) {
                console.error(`Error parsing local draft for ${type}:`, err);
                localStorage.removeItem(draftKey);
              }
            }
          });

          setSubmissions(localDrafts);
        }
      }
    } catch (err) {
      const errorInfo = handleApiError(err as Error);
      setError(errorInfo.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async (
    type: FormType,
    title: string,
    data: any,
    status: FormStatus = "submitted",
    basicInfoId?: string,
  ) => {
    try {
      // Validate data before sending to API
      if (type === "living-expenses") {
        livingExpensesSchema.parse({ type, title, data });
      }

      if (status === "loading") {
        throw new Error("Please wait while we check your authentication");
      }

      if (!session) {
        throw new AuthenticationError("Must be logged in to submit forms");
      }

      // If this is a basic-info submission, we don't need to include a basicInfoId
      // For other form types, try to get the basicInfoId from the parameter or from the session manager
      const payload: any = {
        type,
        title,
        data,
        status,
      };

      // For non-basic-info forms, include the basicInfoId if available
      if (type !== "basic-info") {
        // Use the provided basicInfoId or get it from the session manager
        const infoId =
          basicInfoId ||
          (apiService.sessionManager
            ? apiService.sessionManager.getBasicInfoId()
            : undefined);
        if (infoId) {
          payload.basicInfoId = infoId;
        } else {
          console.warn("No basicInfoId available for form submission");
        }
      }

      const response = await apiRequest("/api/forms/submit", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // If this is a basic-info submission, store the returned ID for future use
      if (
        type === "basic-info" &&
        response.submissionId &&
        apiService.sessionManager
      ) {
        apiService.sessionManager.setBasicInfoId(response.submissionId);
      }

      // Refresh submissions after successful submission
      await fetchSubmissions();

      return response;
    } catch (err) {
      console.error("Error submitting form:", err);
      throw err;
    }
  };

  const saveDraft = async (type: FormType, title: string, data: any) => {
    try {
      if (session?.user === undefined && status === "loading") {
        const draftKey = `erasmus_draft_${type}`;
        const draftData = {
          type,
          title,
          data,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(draftKey, JSON.stringify(draftData));
        return;
      }

      if (session) {
        await apiRequest("/api/forms/saveDraft", {
          method: "POST",
          body: JSON.stringify({
            type,
            title,
            data,
          }),
        });

        // Refresh submissions after successful save
        await fetchSubmissions();
      } else {
        // Unauthenticated user: save to localStorage
        const draftKey = `erasmus_draft_${type}`;
        const draftData = {
          type,
          title,
          data,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(draftKey, JSON.stringify(draftData));

        // Update local state to reflect the saved draft
        const localDraft = {
          id: `local_${type}`,
          userId: "local",
          type: type as any,
          title,
          data,
          status: "draft" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setSubmissions((prev) => {
          const filtered = prev.filter((s) => s.id !== localDraft.id);
          return [...filtered, localDraft];
        });
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error("Validation error:", error.message);
        throw error;
      }
      console.error("Error saving draft:", error);
      throw error;
    }
  };

  // Update getDraftData to use consistent form types
  const getDraftData = (type: FormType): any | null => {
    // First check server drafts (for authenticated users)
    const serverDraft = submissions.find(
      (s) => s.type === type && s.status === "draft",
    );
    if (serverDraft) {
      return serverDraft.data;
    }

    // Fallback to localStorage draft (for unauthenticated users)
    if (typeof window !== "undefined") {
      const draftKey = `erasmus_draft_${type}`;
      const localDraft = localStorage.getItem(draftKey);
      if (localDraft) {
        try {
          const parsed = JSON.parse(localDraft);
          return parsed.data;
        } catch (err) {
          console.error("Error parsing local draft:", err);
          localStorage.removeItem(draftKey);
        }
      }
    }

    return null;
  };

  const getSubmittedData = (type: string): any | null => {
    // Check for submitted or published forms (for authenticated users)
    const submittedForm = submissions.find(
      (s) =>
        s.type === type &&
        (s.status === "submitted" || s.status === "published"),
    );
    if (submittedForm) {
      return submittedForm.data;
    }

    return null;
  };

  const getFormData = (type: FormType): any | null => {
    // First try to get submitted data, then fall back to draft data
    return getSubmittedData(type) || getDraftData(type);
  };

  const deleteDraft = async (id: string) => {
    if (id.startsWith("local_")) {
      // Local draft: remove from localStorage
      const type = id.replace("local_", "");
      const draftKey = `erasmus_draft_${type}`;
      if (typeof window !== "undefined") {
        localStorage.removeItem(draftKey);
      }
    } else if (session) {
      // Server draft: would call API endpoint in production
      // For now, just remove from local state
      console.log("Would delete server draft:", id);
    }

    // Remove from local state
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  const refreshSubmissions = async () => {
    await fetchSubmissions();
  };

  useEffect(() => {
    // Only fetch submissions once we know the authentication status
    if (status !== "loading") {
      fetchSubmissions();
    }
  }, [session, status]);

  const getBasicInfoId = () => {
    return apiService.sessionManager
      ? apiService.sessionManager.getBasicInfoId()
      : undefined;
  };

  const setBasicInfoId = (id: string) => {
    if (apiService.sessionManager) {
      apiService.sessionManager.setBasicInfoId(id);
    }
  };

  return {
    submissions,
    loading,
    error,
    submitForm,
    getDraftData,
    getSubmittedData,
    getFormData,
    saveDraft,
    deleteDraft,
    refreshSubmissions,
    getBasicInfoId,
    setBasicInfoId,
  };
}

// Hook to get content generated from form submissions
export function useGeneratedContent(type?: string) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const url = `/api/content/generate${type ? `?type=${type}` : ""}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setContent(data);
      } else {
        // Only parse JSON once for error responses
        try {
          const errorData = await response.json();
          if (response.status === 401) {
            setError(
              errorData.message || "Please sign in again to access content",
            );
          } else {
            setError(errorData.message || "Failed to fetch content");
          }
        } catch (parseError) {
          // If JSON parsing fails, use generic error message
          if (response.status === 401) {
            setError("Please sign in again to access content");
          } else {
            setError("Failed to fetch content");
          }
        }
      }
    } catch (err) {
      setError("Error fetching content");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [type]);

  return {
    content,
    loading,
    error,
    refreshContent: fetchContent,
  };
}
