import React from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  MapPin,
  Clock,
  TrendingUp,
  Filter,
  Grid,
  List,
  BookOpen,
  Star,
} from "lucide-react";
import { useStoriesStats } from "../hooks/useStoryEngagement";

interface StoriesHeroSectionProps {
  totalStories: number;
  featuredTopics: Array<{
    name: string;
    count: number;
    icon: React.ReactNode;
    color: string;
  }>;
  onTopicClick: (topic: string) => void;
}

export function StoriesHeroSection({
  totalStories,
  featuredTopics,
  onTopicClick,
}: StoriesHeroSectionProps) {
  // Use dynamic stats
  const { stats, loading } = useStoriesStats();

  // Use dynamic data if available, fallback to props
  const displayStats = {
    totalStories: stats.totalStories || totalStories,
    totalViews: stats.totalViews,
    helpfulnessRate: stats.helpfulnessRate,
    topCategories: stats.topCategories,
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 mb-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Student Stories
              </h1>
              <p className="text-lg text-gray-600">
                {displayStats.totalStories}+ authentic experiences from Erasmus
                students
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex gap-4">
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                {loading ? "..." : displayStats.totalStories}
              </div>
              <div className="text-sm text-gray-600">Stories</div>
            </div>
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {loading ? "..." : `${displayStats.helpfulnessRate}%`}
              </div>
              <div className="text-sm text-gray-600">Helpful Rate</div>
            </div>
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {loading ? "..." : displayStats.totalViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>
        </div>

        <p className="text-gray-700 mb-8 max-w-3xl text-lg leading-relaxed">
          Discover inspiring experiences from students who've embarked on their
          Erasmus journey. Get practical insights, cultural tips, and motivation
          for your own adventure across Europe.
        </p>

        {/* Featured Topics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Popular Topics
          </h3>
          <div className="flex flex-wrap gap-3">
            {featuredTopics.map((topic) => (
              <button
                key={topic.name}
                onClick={() => onTopicClick(topic.name)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 hover:shadow-md ${topic.color}`}
              >
                {topic.icon}
                <span className="font-medium">{topic.name}</span>
                <Badge
                  variant="secondary"
                  className="ml-1 bg-white/80 text-gray-700"
                >
                  {topic.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
