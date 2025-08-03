import { useState, useEffect } from "react";

interface RecentlyViewedItem {
  id: string;
  title: string;
  type: "story" | "accommodation" | "destination";
  url: string;
  timestamp: number;
  metadata?: {
    city?: string;
    country?: string;
    university?: string;
    author?: string;
  };
}

const MAX_RECENT_ITEMS = 10;
const STORAGE_KEY = "erasmus_recently_viewed";

export function useRecentlyViewed() {
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Filter out items older than 30 days
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          const filtered = parsed.filter(
            (item: RecentlyViewedItem) => item.timestamp > thirtyDaysAgo,
          );
          setRecentItems(filtered);
        }
      } catch (error) {
        console.error("Error loading recently viewed items:", error);
      }
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== "undefined" && recentItems.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentItems));
      } catch (error) {
        console.error("Error saving recently viewed items:", error);
      }
    }
  }, [recentItems]);

  const addRecentItem = (item: Omit<RecentlyViewedItem, "timestamp">) => {
    setRecentItems((prev) => {
      // Remove if already exists
      const filtered = prev.filter((existing) => existing.id !== item.id);

      // Add to beginning with timestamp
      const newItem: RecentlyViewedItem = {
        ...item,
        timestamp: Date.now(),
      };

      // Keep only MAX_RECENT_ITEMS
      return [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);
    });
  };

  const removeRecentItem = (id: string) => {
    setRecentItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearRecentItems = () => {
    setRecentItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const getRecentItemsByType = (type: RecentlyViewedItem["type"]) => {
    return recentItems.filter((item) => item.type === type);
  };

  return {
    recentItems,
    addRecentItem,
    removeRecentItem,
    clearRecentItems,
    getRecentItemsByType,
    hasRecentItems: recentItems.length > 0,
  };
}
