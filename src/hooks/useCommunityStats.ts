import { useState, useEffect } from "react";

export interface CommunityStats {
  studentsHelped: number;
  countriesFeatured: number;
  averageRating: number;
  submissionsToday: number;
}

// Function to get a slightly randomized initial value to simulate live data
const getInitialValue = (base: number, variance: number) => {
  return base + Math.floor(Math.random() * variance);
};

export function useCommunityStats(): {
  stats: CommunityStats;
  loading: boolean;
} {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CommunityStats>({
    studentsHelped: 3241,
    countriesFeatured: 28,
    averageRating: 4.9,
    submissionsToday: 15,
  });

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setStats({
        studentsHelped: getInitialValue(3241, 50),
        countriesFeatured: 28, // This can remain static
        averageRating: parseFloat((4.85 + Math.random() * 0.1).toFixed(1)),
        submissionsToday: getInitialValue(15, 10),
      });
      setLoading(false);
    }, 1200); // Simulate network delay

    return () => clearTimeout(timer);
  }, []);

  return { stats, loading };
}
