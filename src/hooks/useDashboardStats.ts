import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface DashboardStats {
  daysActive: number;
  universitiesViewed: number;
  storiesRead: number;
  profileCompletion: number;
  deadlines: {
    title: string;
    date: string;
    priority: "high" | "medium" | "low";
  }[];
  recommendations: {
    title: string;
    description: string;
    action: string;
    url: string;
  }[];
}

// Function to get a slightly randomized initial value
const getInitialValue = (base: number, variance: number) => {
  return base + Math.floor(Math.random() * variance);
};

export function useDashboardStats() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      setLoading(true);
      const timer = setTimeout(() => {
        setStats({
          daysActive: getInitialValue(12, 10),
          universitiesViewed: getInitialValue(5, 8),
          storiesRead: getInitialValue(8, 15),
          profileCompletion: getInitialValue(75, 25),
          deadlines: [
            {
              title: "Apply to University of Barcelona",
              date: "2024-03-15",
              priority: "high",
            },
            {
              title: "Submit Accommodation Request",
              date: "2024-04-01",
              priority: "medium",
            },
          ],
          recommendations: [
            {
              title: "Explore Low-Cost Destinations",
              description: "Based on your budget, check out these cities.",
              action: "See Options",
              url: "/destinations?cost=low",
            },
            {
              title: "Read a Story from Prague",
              description:
                "Another student's experience in a city you might like.",
              action: "Read Story",
              url: "/stories/1", // Placeholder ID
            },
          ],
        });
        setLoading(false);
      }, 1200); // Simulate network delay

      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [session]);

  return { stats, loading };
}
