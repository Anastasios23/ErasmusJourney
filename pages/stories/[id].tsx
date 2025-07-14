import { useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import { Card, CardContent } from "../../src/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../src/components/ui/avatar";
import { Separator } from "../../src/components/ui/separator";
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

interface StoryDetail {
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
    avatar: string;
    bio: string;
    program: string;
  };
  period?: string;
  tags: string[];
  likes: number;
  views: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  readingTime: number;
  featured: boolean;
}

interface StoryDetailPageProps {
  story: StoryDetail | null;
}

export default function StoryDetailPage({ story }: StoryDetailPageProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!story) {
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: story.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
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

  return (
    <>
      <Head>
        <title>{story.title} - Erasmus Journey Platform</title>
        <meta name="description" content={story.excerpt} />
        <meta property="og:title" content={story.title} />
        <meta property="og:description" content={story.excerpt} />
        <meta property="og:image" content={story.image} />
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
                  src={story.image}
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
                    <Badge variant="secondary">{story.category}</Badge>
                    {story.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    )}
                    {story.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {story.city}, {story.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>{story.university}</span>
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
                        {story.author.firstName[0]}
                        {story.author.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-lg">
                        {story.author.firstName} {story.author.lastName}
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

            {/* Related Stories */}
            {story.relatedStories.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Related Stories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {story.relatedStories.map((relatedStory) => (
                    <Card
                      key={relatedStory.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/stories/${relatedStory.id}`)}
                    >
                      <div className="aspect-video overflow-hidden rounded-t-lg relative">
                        <Image
                          src={relatedStory.image}
                          alt={relatedStory.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <CardContent className="pt-4">
                        <Badge variant="secondary" className="mb-2">
                          {relatedStory.category}
                        </Badge>
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {relatedStory.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {relatedStory.excerpt}
                        </p>
                        <div className="text-xs text-gray-500">
                          by {relatedStory.author}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

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
                <Link href="/share-story">
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

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { id } = params!;

  try {
    // Fetch story from our API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/stories/${id}`);

    if (!response.ok) {
      return {
        props: {
          story: null,
        },
      };
    }

    const story = await response.json();

    return {
      props: {
        story,
      },
    };
  } catch (error) {
    console.error("Error fetching story:", error);
    return {
      props: {
        story: null,
      },
    };
  }
};
