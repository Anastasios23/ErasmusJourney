import { useState, useEffect } from "react";
import {
  StudentStoryResponse,
  StudentStoryError,
  validateStudentStoriesResponse,
  LoadingState,
} from "../types/studentStories";
import { safeFetch } from "../utils/safeFetch";

export interface Story {
  id: string;
  studentName: string;
  university: string;
  city: string;
  country: string;
  department: string;
  levelOfStudy: string;
  exchangePeriod: string;
  story: string;
  tips: string[] | string;
  helpTopics: string[];
  contactMethod: string | null;
  contactInfo: string | null;
  accommodationTips: string | null;
  budgetTips: {
    cheapGroceries?: string;
    cheapEating?: string;
    transportation?: string;
    socialLife?: string;
    travel?: string;
    overall?: string;
  } | null;
  createdAt: string;
  isPublic: boolean;
  // Legacy fields for backward compatibility
  title?: string;
  content?: string;
  excerpt?: string;
  imageUrl?: string | null;
  photos?: Array<{
    id: string;
    image: string;
    caption: string;
    location: string;
    description: string;
  }>;
  location?: {
    city?: string;
    country?: string;
    university?: string;
  };
  author?: {
    name: string;
    university?: string;
    avatar?: string;
    bio?: string;
    program?: string;
  };
  period?: string;
  tags?: string[];
  likes?: number;
  views?: number;
  comments?: number;
  readingTime?: number;
  featured?: boolean;
  updatedAt?: string;
}

export interface StoriesResponse {
  stories: Story[];
  total: number;
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchStories = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await safeFetch("/api/student-stories");

      if (!response.ok) {
        throw new StudentStoryError(
          `Failed to fetch stories: ${response.statusText}`,
          "API_ERROR",
          { status: response.status },
        );
      }

      const rawData = await response.json();
      const validatedData = validateStudentStoriesResponse(rawData);
      setStories(validatedData.stories);
      setLoadingState({
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.error("Error fetching stories:", err);
      const error =
        err instanceof StudentStoryError
          ? err
          : new StudentStoryError(
              err instanceof Error ? err.message : "Failed to load stories",
              "NETWORK_ERROR",
            );
      setLoadingState({
        isLoading: false,
        error,
        lastUpdated: null,
      });
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return {
    stories,
    loading: loadingState.isLoading,
    error: loadingState.error?.message || null,
    loadingState,
    refetch: fetchStories,
  };
}

export function useStory(id: string | undefined) {
  const [story, setStory] = useState<Story | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  useEffect(() => {
    if (!id) {
      setLoadingState({
        isLoading: false,
        error: null,
        lastUpdated: null,
      });
      return;
    }

    const fetchStory = async () => {
      try {
        setLoadingState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await safeFetch(`/api/student-stories/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new StudentStoryError("Story not found", "NOT_FOUND");
          }
          throw new StudentStoryError(
            `Failed to fetch story: ${response.statusText}`,
            "API_ERROR",
            { status: response.status },
          );
        }

        const storyData = await response.json();
        // Validate individual story data
        if (!storyData || typeof storyData !== "object") {
          throw new StudentStoryError(
            "Invalid story data received",
            "VALIDATION_ERROR",
          );
        }

        setStory(storyData);
        setLoadingState({
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } catch (err) {
        console.error("Error fetching story:", err);
        const error =
          err instanceof StudentStoryError
            ? err
            : new StudentStoryError(
                err instanceof Error ? err.message : "Failed to load story",
                "NETWORK_ERROR",
              );
        setLoadingState({
          isLoading: false,
          error,
          lastUpdated: null,
        });
      }
    };

    fetchStory();
  }, [id]);

  return {
    story,
    loading: loadingState.isLoading,
    error: loadingState.error?.message || null,
    loadingState,
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
