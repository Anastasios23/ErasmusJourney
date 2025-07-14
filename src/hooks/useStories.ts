import { useState, useEffect } from "react";

export interface Story {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string | null;
  photos: Array<{
    id: string;
    image: string;
    caption: string;
    location: string;
    description: string;
  }>;
  location: {
    city?: string;
    country?: string;
    university?: string;
  };
  author: {
    name: string;
    university?: string;
  };
  period?: string;
  tags: string[];
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoriesResponse {
  stories: Story[];
  total: number;
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stories");

      if (!response.ok) {
        throw new Error(`Failed to fetch stories: ${response.status}`);
      }

      const data: StoriesResponse = await response.json();
      setStories(data.stories);
    } catch (err) {
      console.error("Error fetching stories:", err);
      setError(err instanceof Error ? err.message : "Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return {
    stories,
    loading,
    error,
    refetch: fetchStories,
  };
}

export function useLikeStory() {
  const likeStory = async (storyId: string) => {
    // Placeholder for future like functionality
    console.log("Liked story:", storyId);
    // In the future, this would call an API to increment likes
  };

  return { likeStory };
}
