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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEngagement = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/stories/${storyId}/engagement`);
        if (response.ok) {
          const data = await response.json();
          setEngagement(data);
        } else {
          // If API fails, provide fallback data
          console.warn(
            `Failed to fetch engagement for story ${storyId}, using fallback`,
          );
          setEngagement({
            storyId,
            likes: 0,
            views: 0,
            comments: 0,
            rating: 0,
            isLiked: false,
            isBookmarked: false,
          });
        }
      } catch (error) {
        console.error("Error fetching story engagement:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch engagement",
        );
        // Provide fallback data on error
        setEngagement({
          storyId,
          likes: 0,
          views: 0,
          comments: 0,
          rating: 0,
          isLiked: false,
          isBookmarked: false,
        });
      } finally {
        setLoading(false);
      }
    };

    if (storyId) {
      fetchEngagement();
    } else {
      setLoading(false);
    }
  }, [storyId]);

  const toggleLike = async () => {
    if (!engagement) return;

    // Optimistically update UI
    const previousEngagement = engagement;
    setEngagement((prev) =>
      prev
        ? {
            ...prev,
            likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
            isLiked: !prev.isLiked,
          }
        : null,
    );

    try {
      const response = await fetch(`/api/stories/${storyId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        // Revert optimistic update on failure
        setEngagement(previousEngagement);
        console.warn("Failed to toggle like, reverting change");
      }
    } catch (error) {
      // Revert optimistic update on error
      setEngagement(previousEngagement);
      console.error("Error toggling like:", error);
    }
  };

  const toggleBookmark = async () => {
    if (!engagement) return;

    // Optimistically update UI
    const previousEngagement = engagement;
    setEngagement((prev) =>
      prev
        ? {
            ...prev,
            isBookmarked: !prev.isBookmarked,
          }
        : null,
    );

    try {
      const response = await fetch(`/api/stories/${storyId}/bookmark`, {
        method: "POST",
      });

      if (!response.ok) {
        // Revert optimistic update on failure
        setEngagement(previousEngagement);
        console.warn("Failed to toggle bookmark, reverting change");
      }
    } catch (error) {
      // Revert optimistic update on error
      setEngagement(previousEngagement);
      console.error("Error toggling bookmark:", error);
    }
  };

  const incrementView = async () => {
    // Optimistically update view count
    setEngagement((prev) =>
      prev
        ? {
            ...prev,
            views: prev.views + 1,
            lastViewed: new Date(),
          }
        : null,
    );

    try {
      const response = await fetch(`/api/stories/${storyId}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn(
          "Failed to increment view, server responded with:",
          response.status,
        );
        // Don't revert view count as it's less critical
      }
    } catch (error) {
      console.error("Error incrementing view:", error);
      // Don't revert view count as it's less critical
    }
  };

  return {
    engagement,
    loading,
    error,
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);
        const response = await fetch("/api/stories/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.warn("Failed to fetch stories stats, using fallback");
          setError(`HTTP ${response.status}: ${response.statusText}`);
          // Keep existing stats rather than clearing them
        }
      } catch (error) {
        console.error("Error fetching stories stats:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch stats",
        );
        // Keep existing stats rather than clearing them
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time updates every 60 seconds (increased from 30 to reduce load)
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
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
