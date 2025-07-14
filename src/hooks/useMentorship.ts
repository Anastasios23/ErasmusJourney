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

      const response = await fetch("/api/mentorship/members", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch mentors: ${response.status} ${response.statusText}`,
        );
      }

      const data: MentorshipResponse = await response.json();
      setMentors(data.mentors || []);
    } catch (err) {
      console.error("Error fetching mentors:", err);
      setError(err instanceof Error ? err.message : "Failed to load mentors");
      // Fallback to empty array on error
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
