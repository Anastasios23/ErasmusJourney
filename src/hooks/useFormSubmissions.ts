import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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
    status?: string,
  ) => Promise<void>;
  getDraftData: (type: string) => any | null;
  saveDraft: (type: string, title: string, data: any) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
  refreshSubmissions: () => Promise<void>;
}

export function useFormSubmissions(): UseFormSubmissionsReturn {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    if (!session) return;

    try {
      setLoading(true);
      const response = await fetch("/api/forms/get");
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } else if (response.status === 401) {
        const errorData = await response.json();
        setError(
          errorData.message || "Please sign in again to access your data",
        );
      } else {
        setError("Failed to fetch submissions");
      }
    } catch (err) {
      setError("Error fetching submissions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async (
    type: string,
    title: string,
    data: any,
    status: string = "submitted",
  ) => {
    if (!session) {
      throw new Error("Must be logged in to submit forms");
    }

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          title,
          data,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error(
            errorData.message || "Please sign in again to submit forms",
          );
        }
        throw new Error(errorData.message || "Failed to submit form");
      }

      // Refresh submissions after successful submission
      await fetchSubmissions();
    } catch (err) {
      console.error("Error submitting form:", err);
      throw err;
    }
  };

  const saveDraft = async (type: string, title: string, data: any) => {
    if (!session) {
      throw new Error("Must be logged in to save drafts");
    }

    try {
      const response = await fetch("/api/forms/saveDraft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          title,
          data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error(
            errorData.message || "Please sign in again to save drafts",
          );
        }
        throw new Error(errorData.message || "Failed to save draft");
      }

      // Refresh submissions after successful save
      await fetchSubmissions();
    } catch (err) {
      console.error("Error saving draft:", err);
      throw err;
    }
  };

  const getDraftData = (type: string): any | null => {
    const draft = submissions.find(
      (s) => s.type === type && s.status === "draft",
    );
    return draft ? draft.data : null;
  };

  const deleteDraft = async (id: string) => {
    // In a real app, this would call an API endpoint
    // For now, we'll just remove it from the local state
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  const refreshSubmissions = async () => {
    await fetchSubmissions();
  };

  useEffect(() => {
    if (session) {
      fetchSubmissions();
    }
  }, [session]);

  return {
    submissions,
    loading,
    error,
    submitForm,
    getDraftData,
    saveDraft,
    deleteDraft,
    refreshSubmissions,
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
      } else if (response.status === 401) {
        const errorData = await response.json();
        setError(errorData.message || "Please sign in again to access content");
      } else {
        setError("Failed to fetch content");
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
