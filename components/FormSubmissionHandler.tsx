import { useState } from "react";
import { useRouter } from "next/router";

// TypeScript interfaces matching the API
interface AccommodationData {
  type: string;
  name: string;
  url?: string;
  pricePerMonth?: number;
}

interface CourseExchangeData {
  homeCourse: string;
  hostCourse: string;
  ects?: number;
  approved?: boolean;
}

interface DestinationData {
  name: string;
  country: string;
  summary?: string;
}

interface FormData {
  destination: DestinationData;
  accommodations: AccommodationData[];
  courseExchanges: CourseExchangeData[];
}

interface ApiResponse {
  slug: string;
  url: string;
  message: string;
}

interface ApiError {
  error: string;
}

// Custom hook for form submission
export function useFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData): Promise<void> => {
    // Reset error state
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate required fields before sending
      if (!formData.destination.name || !formData.destination.country) {
        throw new Error("Destination name and country are required");
      }

      // Make POST request to our API
      const response = await fetch("/api/form-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Parse response
      const responseData = await response.json();

      if (!response.ok) {
        // Handle API errors
        const errorData = responseData as ApiError;
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      // Success - redirect to the new destination page
      const successData = responseData as ApiResponse;
      await router.push(successData.url);
    } catch (err) {
      // Handle any errors that occurred during submission
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Form submission error:", err);

      // Show error to user (you can replace this with a toast notification)
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    error,
  };
}

// Example React component showing how to use the hook
export function ExampleFormComponent() {
  const { handleSubmit, isSubmitting, error } = useFormSubmission();

  // Example form data - replace with your actual form state
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Collect your form data here
    const formData: FormData = {
      destination: {
        name: "Paris", // Get from your form inputs
        country: "France",
        summary: "Beautiful city with rich culture and history",
      },
      accommodations: [
        {
          type: "Student Dorm",
          name: "CROUS Residence",
          url: "https://example.com",
          pricePerMonth: 400,
        },
        {
          type: "Shared Apartment",
          name: "Coliving Space in Marais",
          pricePerMonth: 650,
        },
      ],
      courseExchanges: [
        {
          homeCourse: "Computer Science 101",
          hostCourse: "Informatique Fondamentale",
          ects: 6,
          approved: true,
        },
        {
          homeCourse: "Mathematics for CS",
          hostCourse: "Mathématiques pour l'Informatique",
          ects: 5,
          approved: false,
        },
      ],
    };

    // Submit the form
    await handleSubmit(formData);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {/* Your form inputs go here */}

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          px-4 py-2 rounded font-medium
          ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }
        `}
      >
        {isSubmitting ? "Submitting..." : "Submit Destination"}
      </button>
    </form>
  );
}

// Standalone function version (if you prefer not to use the hook)
export async function submitFormData(formData: FormData): Promise<ApiResponse> {
  try {
    const response = await fetch("/api/form-submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorData = responseData as ApiError;
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    return responseData as ApiResponse;
  } catch (error) {
    console.error("Form submission error:", error);
    throw error;
  }
}
