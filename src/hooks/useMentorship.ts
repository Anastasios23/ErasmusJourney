import { useState, useEffect } from "react";

export interface MentorshipMember {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  funFact?: string;
  universityInCyprus: string;
  studyProgram: string;
  hostUniversity: string;
  hostCity: string;
  hostCountry: string;
  exchangePeriod: string;
  specializations: string[];
  helpTopics: string[];
  languagesSpoken: string[];
  availabilityLevel: string;
  responseTime: string;
  preferredContactTime: string;
  contactInfo: {
    email?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
    phone?: string;
  };
  contactMethod: string;
  mentorshipExperience?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipResponse {
  mentors: MentorshipMember[];
  total: number;
}

export function useMentorshipMembers() {
  const [mentors, setMentors] = useState<MentorshipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError(null);

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("/api/mentorship/members", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `API responded with ${response.status}: ${response.statusText}`,
        );
      }

      const data: MentorshipResponse = await response.json();
      setMentors(data.mentors || []);
    } catch (err) {
      console.error("Error fetching mentors:", err);

      // Provide more specific error messages
      let errorMessage = "Failed to load mentors";
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          errorMessage = "Request timed out. Please check your connection.";
        } else if (err.message.includes("Failed to fetch")) {
          errorMessage =
            "Unable to connect to server. Please check your internet connection.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);

      // Fallback to mock data if available or empty array
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  return {
    mentors,
    loading,
    error,
    refetch: fetchMentors,
  };
}
