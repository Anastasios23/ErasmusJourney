import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import { useStory } from "../../src/hooks/useStories";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import { Card, CardContent } from "../../src/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../src/components/ui/avatar";
import { Skeleton } from "../../src/components/ui/skeleton";
import {
  ArrowLeft,
  Heart,
  Eye,
  Calendar,
  Share2,
  MessageSquare,
  Flag,
  Bookmark,
  MapPin,
  GraduationCap,
  Clock,
} from "lucide-react";

export default function StoryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { story, loading, error } = useStory(id as string);

  const handleShare = async () => {
    if (navigator.share && story) {
      try {
        await navigator.share({
          title: story.title,
          text: story.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else if (story) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatContent = (content: string) => {
    return content.split("\n\n").map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Story - Erasmus Journey Platform</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Back Navigation Skeleton */}
              <div className="mb-6">
                <Skeleton className="h-10 w-32" />
              </div>

              {/* Article Skeleton */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Hero Image Skeleton */}
                <Skeleton className="aspect-video w-full" />

                {/* Content Skeleton */}
                <div className="p-8">
                  {/* Meta Info Skeleton */}
                  <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="flex items-center gap-4 text-sm mb-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>

                  {/* Title Skeleton */}
                  <Skeleton className="h-10 w-full mb-6" />

                  {/* Author Info Skeleton */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div>
                        <Skeleton className="h-6 w-32 mb-1" />
                        <Skeleton className="h-4 w-48 mb-1" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                  </div>

                  {/* Content Skeleton */}
                  <div className="space-y-4 mb-8">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !story) {
    return (
      <>
        <Head>
          <title>Story Not Found - Erasmus Journey Platform</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Story Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The story you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/student-stories">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Stories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{story.title} - Erasmus Journey Platform</title>
        <meta name="description" content={story.excerpt} />
        <meta property="og:title" content={story.title} />
        <meta property="og:description" content={story.excerpt} />
        <meta property="og:image" content={story.imageUrl || ""} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Navigation */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Stories
              </Button>
            </div>

            {/* Article Header */}
            <article className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Hero Image */}
              <div className="aspect-video overflow-hidden relative">
                <Image
                  src={
                    story.imageUrl ||
                    story.photos?.[0]?.image ||
                    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
                  }
                  alt={story.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Meta Info */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="secondary">
                      {story.tags[0] || "Story"}
                    </Badge>
                    {story.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    )}
                    {story.tags.slice(1).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {story.location.city || "City"},{" "}
                        {story.location.country || "Country"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>
                        {story.location.university ||
                          story.author.university ||
                          "University"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{story.readingTime} min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(story.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {story.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={story.author.avatar} />
                      <AvatarFallback>
                        {story.author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-lg">
                        {story.author.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {story.author.program} at {story.author.university}
                      </div>
                      <div className="text-sm text-gray-500">
                        {story.author.bio}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                      className={isLiked ? "text-red-500 border-red-500" : ""}
                    >
                      <Heart
                        className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
                      />
                      {story.likes + (isLiked ? 1 : 0)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className={
                        isBookmarked ? "text-blue-500 border-blue-500" : ""
                      }
                    >
                      <Bookmark
                        className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                      />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Story Content */}
                <div className="prose prose-lg max-w-none mb-8">
                  {formatContent(story.content)}
                </div>

                {/* Photos Section */}
                {story.photos && story.photos.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Photo Gallery
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {story.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video overflow-hidden rounded-lg relative">
                            <Image
                              src={photo.image}
                              alt={photo.caption || `Photo ${index + 1}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                          {photo.caption && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-900">
                                {photo.caption}
                              </p>
                              {photo.location && (
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {photo.location}
                                </p>
                              )}
                              {photo.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {photo.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-8">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{story.likes} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{story.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{story.comments} comments</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsLiked(!isLiked)}
                      className={isLiked ? "text-red-500 border-red-500" : ""}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`}
                      />
                      {isLiked ? "Liked" : "Like"}
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </article>

            {/* CTA Section */}
            <Card className="mt-12 bg-blue-50 border-blue-200">
              <CardContent className="pt-8 pb-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Share Your Erasmus Story
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Have an amazing experience to share? Help future students by
                  sharing your insights, tips, and memorable moments.
                </p>
                <Link href="/photo-story">
                  <Button size="lg">Share Your Story</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
