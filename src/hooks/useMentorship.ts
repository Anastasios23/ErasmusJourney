import { useState, useEffect } from "react";

// Mock data fallback for when API is unavailable - Updated to match real Cyprus universities and agreements
const mockMentors: MentorshipMember[] = [
  {
    id: "mock-1",
    name: "Elena Martinez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
    bio: "Barcelona is an incredible city for business students. The startup ecosystem here is amazing, and I learned so much about international business practices. The city's blend of culture and innovation is perfect for growing professionally.",
    funFact:
      "I started my own consulting business after my exchange experience!",
    universityInCyprus: "University of Nicosia",
    studyProgram: "Business Administration",
    hostUniversity: "ESADE Business School",
    hostCity: "Barcelona",
    hostCountry: "Spain",
    exchangePeriod: "Fall 2023",
    specializations: ["Business Administration", "International Business"],
    helpTopics: [
      "University Application",
      "Accommodation Search",
      "Cultural Adaptation",
      "Academic Support",
    ],
    languagesSpoken: ["English", "Greek", "Spanish", "Catalan"],
    availabilityLevel: "high",
    responseTime: "within-day",
    preferredContactTime: "flexible",
    contactInfo: {
      email: "elena.martinez@example.com",
      instagram: "elena_in_barcelona",
    },
    contactMethod: "email",
    mentorshipExperience:
      "I've been mentoring UNIC business students for 2 years, helping them navigate the Spanish academic system.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-2",
    name: "Andreas Nicolaou",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=andreas",
    bio: "Engineering studies in Germany opened my eyes to precision and innovation. The technical education at TUM is world-class, and Munich's tech scene is thriving. It's the perfect place for ambitious engineering students.",
    funFact: "I'm now working for BMW on electric vehicle technology!",
    universityInCyprus: "Cyprus University of Technology",
    studyProgram: "Electrical Engineering",
    hostUniversity: "Technical University of Munich",
    hostCity: "Munich",
    hostCountry: "Germany",
    exchangePeriod: "Spring 2023",
    specializations: ["Electrical Engineering", "Mechanical Engineering"],
    helpTopics: [
      "Academic Support",
      "Course Selection",
      "Career Guidance",
      "Language Learning",
    ],
    languagesSpoken: ["English", "Greek", "German"],
    availabilityLevel: "moderate",
    responseTime: "within-week",
    preferredContactTime: "weekends",
    contactInfo: {
      email: "andreas.nicolaou@example.com",
      linkedin: "https://linkedin.com/in/andreasnicolaou",
    },
    contactMethod: "email",
    mentorshipExperience:
      "As a CUT engineering graduate, I help students prepare for the rigorous German technical education system.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-3",
    name: "Sofia Papadopoulos",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia",
    bio: "Studying psychology at the University of Vienna was transformative. The city's rich history in psychology, from Freud to modern research, provides an unparalleled learning environment. Vienna combines academic excellence with quality of life.",
    funFact:
      "I conducted research at the same institute where Freud once worked!",
    universityInCyprus: "University of Cyprus",
    studyProgram: "Psychology",
    hostUniversity: "University of Vienna",
    hostCity: "Vienna",
    hostCountry: "Austria",
    exchangePeriod: "Fall 2022",
    specializations: ["Psychology", "Social Sciences"],
    helpTopics: [
      "University Application",
      "Research Opportunities",
      "Cultural Adaptation",
      "Academic Support",
    ],
    languagesSpoken: ["English", "Greek", "German"],
    availabilityLevel: "high",
    responseTime: "within-day",
    preferredContactTime: "evenings",
    contactInfo: {
      email: "sofia.papadopoulos@example.com",
      instagram: "sofia_in_vienna",
      linkedin: "https://linkedin.com/in/sofiapapadopoulos",
    },
    contactMethod: "email",
    mentorshipExperience:
      "I help UCY psychology students understand the Austrian academic system and research opportunities.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-4",
    name: "Dimitris Constantinou",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dimitris",
    bio: "Studying computer science at KTH Stockholm was incredible. Sweden's tech innovation and startup culture is world-leading. The work-life balance and approach to technology for social good really shaped my perspective.",
    funFact:
      "I learned Swedish and now work remotely for a Stockholm-based AI startup!",
    universityInCyprus: "Frederick University",
    studyProgram: "Computer Science",
    hostUniversity: "KTH Royal Institute of Technology",
    hostCity: "Stockholm",
    hostCountry: "Sweden",
    exchangePeriod: "Spring 2024",
    specializations: ["Computer Science", "Information Technology"],
    helpTopics: [
      "Academic Support",
      "Course Selection",
      "Career Guidance",
      "Tech Industry",
    ],
    languagesSpoken: ["English", "Greek", "Swedish"],
    availabilityLevel: "moderate",
    responseTime: "within-week",
    preferredContactTime: "mornings",
    contactInfo: {
      email: "dimitris.constantinou@example.com",
      linkedin: "https://linkedin.com/in/dimitrisconstantinou",
    },
    contactMethod: "email",
    mentorshipExperience:
      "I guide Frederick University CS students through the Nordic tech education system and startup opportunities.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-5",
    name: "Christina Ioannou",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=christina",
    bio: "My economics studies at Bocconi University in Milan were exceptional. Italy's blend of traditional business practices and modern innovation provided unique insights. Milan's fashion and finance sectors offer amazing internship opportunities.",
    funFact:
      "I interned at a luxury fashion house and learned about sustainable business practices!",
    universityInCyprus: "European University Cyprus",
    studyProgram: "Economics",
    hostUniversity: "Bocconi University",
    hostCity: "Milan",
    hostCountry: "Italy",
    exchangePeriod: "Fall 2023",
    specializations: ["Economics", "Business Administration"],
    helpTopics: [
      "University Application",
      "Accommodation Search",
      "Internship Opportunities",
      "Cultural Adaptation",
    ],
    languagesSpoken: ["English", "Greek", "Italian"],
    availabilityLevel: "high",
    responseTime: "within-day",
    preferredContactTime: "flexible",
    contactInfo: {
      email: "christina.ioannou@example.com",
      instagram: "christina_in_milan",
      linkedin: "https://linkedin.com/in/christinaioannou",
    },
    contactMethod: "email",
    mentorshipExperience:
      "I help EUC economics students navigate Italian business education and internship opportunities.",
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
  const [retryCount, setRetryCount] = useState(0);

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

      // Fallback to mock data when API is unavailable
      console.log("Using mock data fallback due to API error");
      setMentors(mockMentors);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  // Auto-retry mechanism
  useEffect(() => {
    if (error && retryCount < 2) {
      const timeoutId = setTimeout(
        () => {
          console.log(`Retrying fetch, attempt ${retryCount + 1}`);
          setRetryCount((prev) => prev + 1);
          fetchMentors();
        },
        2000 * (retryCount + 1),
      ); // Exponential backoff: 2s, 4s

      return () => clearTimeout(timeoutId);
    }
  }, [error, retryCount]);

  const manualRetry = () => {
    setRetryCount(0);
    setError(null);
    fetchMentors();
  };

  return {
    mentors,
    loading,
    error,
    refetch: fetchMentors,
    retry: manualRetry,
  };
}
