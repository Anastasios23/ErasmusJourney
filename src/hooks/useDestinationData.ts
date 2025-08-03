import { useState, useEffect } from "react";

interface DestinationCostData {
  city: string;
  country: string;
  avgAccommodation: number;
  avgFood: number;
  avgTransport: number;
  avgEntertainment: number;
  totalMonthly: number;
  currency: string;
  sampleSize: number;
  lastUpdated: Date;
}

interface DestinationAnalytics {
  popularityScore: number;
  costRanking: number;
  studentSatisfaction: number;
  totalStudents: number;
  averageStayDuration: number;
}

// Hook for destination costs based on real form submissions
export function useDestinationCosts(city: string, country: string) {
  const [costs, setCosts] = useState<DestinationCostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCosts = async () => {
      try {
        const response = await fetch(
          `/api/destinations/costs?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setCosts(data);
        }
      } catch (error) {
        console.error("Error fetching destination costs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (city && country) {
      fetchCosts();
    }
  }, [city, country]);

  return { costs, loading };
}

// Hook for destination analytics
export function useDestinationAnalytics(city: string, country: string) {
  const [analytics, setAnalytics] = useState<DestinationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          `/api/destinations/analytics?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Error fetching destination analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (city && country) {
      fetchAnalytics();
    }
  }, [city, country]);

  return { analytics, loading };
}

// Hook for global destination statistics
export function useDestinationStats() {
  const [stats, setStats] = useState({
    totalDestinations: 0,
    totalSubmissions: 0,
    avgCostRange: { min: 0, max: 0 },
    popularDestinations: [] as Array<{
      city: string;
      country: string;
      studentCount: number;
      avgCost: number;
    }>,
    costEffectiveDestinations: [] as Array<{
      city: string;
      country: string;
      avgCost: number;
      satisfactionScore: number;
    }>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/destinations/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching destination stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}

// Calculate cost comparison percentage
export function calculateCostComparison(
  currentCost: number,
  benchmarkCost: number,
): { percentage: number; isHigher: boolean } {
  if (benchmarkCost === 0) return { percentage: 0, isHigher: false };

  const difference = currentCost - benchmarkCost;
  const percentage = Math.abs((difference / benchmarkCost) * 100);

  return {
    percentage: Math.round(percentage),
    isHigher: difference > 0,
  };
}

// Generate cost insights based on data
export function generateCostInsights(
  costs: DestinationCostData,
  analytics: DestinationAnalytics,
): string[] {
  const insights: string[] = [];

  if (costs.sampleSize < 10) {
    insights.push("Limited data available - costs may vary significantly");
  }

  if (costs.avgAccommodation > costs.totalMonthly * 0.6) {
    insights.push("Accommodation represents majority of monthly costs");
  }

  if (analytics.costRanking <= 10) {
    insights.push("One of the most affordable destinations");
  } else if (analytics.costRanking >= 90) {
    insights.push("Premium destination with higher costs");
  }

  if (analytics.studentSatisfaction > 4.5) {
    insights.push("Highly rated by students");
  }

  return insights;
}
