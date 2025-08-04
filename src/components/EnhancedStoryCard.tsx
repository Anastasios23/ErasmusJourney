import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Heart,
  Eye,
  Calendar,
  MapPin,
  GraduationCap,
  BookOpen,
  Clock,
  Share2,
  Bookmark,
  ExternalLink,
  Star,
  MessageCircle,
} from "lucide-react";
import {
  useStoryEngagement,
  calculateReadingTime,
} from "../hooks/useStoryEngagement";

interface EnhancedStoryCardProps {
  story: {
    id: string;
    studentName: string;
    university: string;
    city: string;
    country: string;
    story: string;
    tags?: string[];
    helpTopics?: string[];
    createdAt: string;
    likes?: number;
    views?: number;
    title?: string;
    excerpt?: string;
    imageUrl?: string;
    author?: {
      name: string;
      university?: string;
    };
    location?: {
      city?: string;
      country?: string;
    };
    exchangePeriod?: string;
    readingTime?: number;
  };
  onLike: (storyId: string) => void;
  showFullContent?: boolean;
  compact?: boolean;
}

export default function EnhancedStoryCard({
  story,
  onLike,
  showFullContent = false,
  compact = false,
}: EnhancedStoryCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // Use dynamic engagement data
  const {
    engagement,
    loading: engagementLoading,
    toggleLike,
    toggleBookmark,
    incrementView,
  } = useStoryEngagement(story.id);

  // Calculate reading time dynamically
  const readingTime = calculateReadingTime(story.story);

  useEffect(() => {
    // Increment view count when card is viewed
    // Only increment if we have a valid story ID
    if (story.id && incrementView) {
      incrementView().catch((error) => {
        console.warn("Failed to increment view for story:", story.id, error);
      });
    }
  }, [incrementView, story.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLike();
    onLike(story.id);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleBookmark();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement share functionality
    navigator.share?.({
      title:
        story.title || `${story.studentName}'s Experience in ${story.city}`,
      text: story.excerpt || story.story?.substring(0, 150),
      url: `/stories/${story.id}`,
    });
  };

  const primaryTag = story.tags?.[0] || story.helpTopics?.[0] || "experience";
  const storyReadingTime =
    readingTime || Math.ceil((story.story?.length || 0) / 200);

  const displayTitle =
    story.title || `${story.studentName}'s Experience in ${story.city}`;
  const displayExcerpt =
    story.excerpt ||
    story.story?.substring(0, 150) + "..." ||
    "No description available";
  const displayCity = story.location?.city || story.city || "City";
  const displayCountry = story.location?.country || story.country || "Country";
  const displayUniversity =
    story.author?.university || story.university || "University";

  const cardContent = (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200 ${compact ? "h-auto" : "h-full"} flex flex-col`}
    >
      {/* Image Section */}
      <div
        className={`relative overflow-hidden rounded-t-lg ${compact ? "aspect-video" : "aspect-[4/3]"}`}
      >
        {!imageError ? (
          <Image
            src={
              story.imageUrl ||
              `https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop&auto=format&q=80`
            }
            alt={displayTitle}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes={
              compact
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            }
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-blue-500" />
          </div>
        )}

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleBookmark}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <Bookmark
                className={`h-4 w-4 ${engagement?.isBookmarked ? "fill-yellow-500 text-yellow-500" : "text-gray-700"}`}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <Share2 className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          <div className="absolute bottom-4 left-4">
            <Button
              size="sm"
              className="bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/stories/${story.id}`);
              }}
            >
              Read Story
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge
            variant="secondary"
            className="bg-white/90 backdrop-blur-sm text-gray-800 font-medium"
          >
            {primaryTag}
          </Badge>
          {storyReadingTime > 0 && (
            <Badge
              variant="outline"
              className="bg-white/90 backdrop-blur-sm border-gray-200 text-gray-700"
            >
              <Clock className="h-3 w-3 mr-1" />
              {storyReadingTime} min
            </Badge>
          )}
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="pb-3 flex-none">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <time dateTime={story.createdAt}>
              {new Date(story.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-600">4.8</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
          {displayTitle}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Story Excerpt */}
        <p className="text-gray-600 text-sm line-clamp-3 flex-1 leading-relaxed">
          {displayExcerpt}
        </p>

        {/* Author & Location Info */}
        <div className="space-y-3">
          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(story.studentName || "anonymous")}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                alt={story.studentName || "Student"}
                fill
                className="rounded-full object-cover"
                sizes="32px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {story.studentName || "Anonymous Student"}
              </div>
              <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {displayUniversity}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
            <MapPin className="h-4 w-4" />
            <span>
              {displayCity}, {displayCountry}
            </span>
          </div>

          {/* Exchange Period */}
          {story.exchangePeriod && (
            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              {story.exchangePeriod}
            </div>
          )}
        </div>

        {/* Interaction Bar */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm transition-colors ${
                engagement?.isLiked
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-500 hover:text-red-500"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${engagement?.isLiked ? "fill-current" : ""}`}
              />
              <span>{engagement?.likes || story.likes || 0}</span>
            </button>

            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Eye className="h-4 w-4" />
              <span>{engagement?.views || story.views || 0}</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MessageCircle className="h-4 w-4" />
              <span>5</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/stories/${story.id}`);
            }}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Read More
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <article
      className="group"
      onClick={() => router.push(`/stories/${story.id}`)}
    >
      {cardContent}
    </article>
  );
}
