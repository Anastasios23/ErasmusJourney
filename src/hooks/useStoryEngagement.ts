import { useState, useEffect } from "react";

interface StoryEngagementData {
  storyId: string;
  likes: number;
  views: number;
  comments: number;
  rating: number;
  isLiked: boolean;
  isBookmarked: boolean;
  lastViewed?: Date;
}

interface StoryAnalytics {
  readingTime: number;
  popularityScore: number;
  helpfulnessRating: number;
  responseRate?: number;
}

// Hook for managing story engagement data
export function useStoryEngagement(storyId: string) {
  const [engagement, setEngagement] = useState<StoryEngagementData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEngagement = async () => {
      try {
        const response = await fetch(
          `/api/stories/engagement/${storyId}/engagement`,
        );
        if (response.ok) {
          const data = await response.json();
          setEngagement(data);
        }
      } catch (error) {
        console.error("Error fetching story engagement:", error);
      } finally {
        setLoading(false);
      }
    };

    if (storyId) {
      fetchEngagement();
    }
  }, [storyId]);

  const toggleLike = async () => {
    if (!engagement) return;

    try {
      const response = await fetch(`/api/stories/engagement/${storyId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        setEngagement((prev) =>
          prev
            ? {
                ...prev,
                likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
                isLiked: !prev.isLiked,
              }
            : null,
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const toggleBookmark = async () => {
    if (!engagement) return;

    try {
      const response = await fetch(
        `/api/stories/engagement/${storyId}/bookmark`,
        {
          method: "POST",
        },
      );

      if (response.ok) {
        setEngagement((prev) =>
          prev
            ? {
                ...prev,
                isBookmarked: !prev.isBookmarked,
              }
            : null,
        );
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const incrementView = async () => {
    try {
      const response = await fetch(`/api/stories/engagement/${storyId}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setEngagement((prev) =>
          prev
            ? {
                ...prev,
                views: prev.views + 1,
                lastViewed: new Date(),
              }
            : null,
        );
      } else {
        console.warn(
          "Failed to increment view, server responded with:",
          response.status,
        );
      }
    } catch (error) {
      console.error("Error incrementing view:", error);
    }
  };

  return {
    engagement,
    loading,
    toggleLike,
    toggleBookmark,
    incrementView,
  };
}

// Hook for story analytics and metrics
export function useStoryAnalytics(storyId: string) {
  const [analytics, setAnalytics] = useState<StoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/stories/${storyId}/analytics`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Error fetching story analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (storyId) {
      fetchAnalytics();
    }
  }, [storyId]);

  return { analytics, loading };
}

// Hook for real-time story statistics
export function useStoriesStats() {
  const [stats, setStats] = useState({
    totalStories: 0,
    totalLikes: 0,
    totalViews: 0,
    avgRating: 0,
    helpfulnessRate: 0,
    topCategories: [] as Array<{ name: string; count: number }>,
    recentActivity: [] as Array<{
      type: string;
      storyId: string;
      timestamp: Date;
    }>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stories/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stories stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading };
}

// Calculate reading time based on content
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Generate popularity score based on engagement
export function calculatePopularityScore(
  engagement: StoryEngagementData,
  analytics: StoryAnalytics,
): number {
  const likesWeight = 0.3;
  const viewsWeight = 0.2;
  const commentsWeight = 0.4;
  const ratingWeight = 0.1;

  const normalizedLikes = Math.min(engagement.likes / 100, 1);
  const normalizedViews = Math.min(engagement.views / 1000, 1);
  const normalizedComments = Math.min(engagement.comments / 50, 1);
  const normalizedRating = engagement.rating / 5;

  return (
    (normalizedLikes * likesWeight +
      normalizedViews * viewsWeight +
      normalizedComments * commentsWeight +
      normalizedRating * ratingWeight) *
    100
  );
}
