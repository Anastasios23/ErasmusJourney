import { useState, useEffect } from "react";

// Mock data fallback for when API is unavailable
const mockMentors: MentorshipMember[] = [
  {
    id: "mock-1",
    name: "Elena Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
    bio: "Barcelona can be overwhelming at first. Start with the basics - find a good neighborhood, learn some Spanish phrases, and don't be afraid to explore beyond the tourist areas.",
    funFact: "I became a certified salsa dancer during my exchange!",
    universityInCyprus: "European University Cyprus",
    studyProgram: "Business Administration",
    hostUniversity: "Universitat Pompeu Fabra",
    hostCity: "Barcelona",
    hostCountry: "Spain",
    exchangePeriod: "Fall 2022",
    specializations: ["Business", "Psychology", "Social Work"],
    helpTopics: [
      "Accommodation Search",
      "Budget Planning",
      "Cultural Adaptation",
    ],
    languagesSpoken: ["English", "Greek", "Spanish", "Catalan"],
    availabilityLevel: "high",
    responseTime: "within-day",
    preferredContactTime: "flexible",
    contactInfo: {
      email: "elena.rodriguez@example.com",
      instagram: "elena_in_barcelona",
    },
    contactMethod: "email",
    mentorshipExperience:
      "I've been mentoring for 2 years, especially with budget planning.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-2",
    name: "Andreas K.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=andreas",
    bio: "Florence is magical for art students. Take advantage of every museum, gallery, and cultural event. The Renaissance history comes alive when you're living there.",
    funFact:
      "I can now identify most Renaissance artists just by looking at their brushwork techniques!",
    universityInCyprus: "University of Cyprus",
    studyProgram: "Art History",
    hostUniversity: "University of Florence",
    hostCity: "Florence",
    hostCountry: "Italy",
    exchangePeriod: "Spring 2023",
    specializations: ["Art History", "Arts & Design", "Languages"],
    helpTopics: ["Academic Support", "Course Selection", "Cultural Adaptation"],
    languagesSpoken: ["English", "Greek", "Italian", "French"],
    availabilityLevel: "moderate",
    responseTime: "within-week",
    preferredContactTime: "weekends",
    contactInfo: {
      email: "andreas.k@example.com",
      facebook: "https://facebook.com/andreask",
      linkedin: "https://linkedin.com/in/andreask",
    },
    contactMethod: "email",
    mentorshipExperience:
      "I understand the challenges international students face.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-3",
    name: "Maria Sophia",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    bio: "Berlin was life-changing. I learned so much about myself and gained confidence I never knew I had. The German academic system is rigorous but incredibly rewarding!",
    funFact:
      "I learned to make traditional German pretzels and now bake them for my friends in Cyprus!",
    universityInCyprus: "Cyprus University of Technology",
    studyProgram: "Computer Science",
    hostUniversity: "Technische Universität Berlin",
    hostCity: "Berlin",
    hostCountry: "Germany",
    exchangePeriod: "Fall 2023",
    specializations: ["Computer Science", "Engineering"],
    helpTopics: [
      "University Application",
      "Academic Support",
      "Language Learning",
    ],
    languagesSpoken: ["English", "Greek", "German", "Spanish"],
    availabilityLevel: "high",
    responseTime: "within-day",
    preferredContactTime: "evenings",
    contactInfo: {
      email: "maria.sophia@example.com",
      instagram: "maria_erasmus",
      linkedin: "https://linkedin.com/in/mariasophia",
    },
    contactMethod: "email",
    mentorshipExperience:
      "I've helped over 15 students prepare for their exchange programs.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
