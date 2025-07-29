import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Sparkles,
  Clock,
  MapPin,
  GraduationCap,
  TrendingUp,
  RefreshCw,
  Heart,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface StoryRecommendation {
  id: string;
  title: string;
  excerpt: string;
  studentName: string;
  university: string;
  city: string;
  country: string;
  topics: string[];
  matchScore: number;
  matchReasons: string[];
  readingTime: number;
}

interface AIRecommendationsProps {
  userId?: string;
  currentStoryId?: string;
  preferences?: {
    countries?: string[];
    universities?: string[];
    topics?: string[];
    studyLevel?: string;
  };
  maxRecommendations?: number;
}

export default function AIRecommendations({
  userId,
  currentStoryId,
  preferences,
  maxRecommendations = 6,
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<StoryRecommendation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          currentStoryId,
          preferences,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations.slice(0, maxRecommendations));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userId, currentStoryId, JSON.stringify(preferences)]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-blue-600 bg-blue-100";
    if (score >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchRecommendations}
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No recommendations available at the moment.
            </p>
            <Button
              variant="outline"
              onClick={fetchRecommendations}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI-Powered Recommendations
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchRecommendations}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Stories matched based on your interests and preferences
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-video overflow-hidden rounded-t-lg relative">
                  <Image
                    src={`https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop&q=80&auto=format&cs=tinysrgb&crop=smart&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
                    alt={rec.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute top-2 right-2">
                  <Badge
                    className={`${getScoreColor(rec.matchScore)} font-semibold`}
                  >
                    {rec.matchScore}% match
                  </Badge>
                </div>
              </div>

              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {rec.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {rec.city}, {rec.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{rec.readingTime} min</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <GraduationCap className="h-3 w-3" />
                    <span className="truncate">{rec.university}</span>
                  </div>

                  {rec.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rec.topics.slice(0, 3).map((topic) => (
                        <Badge
                          key={topic}
                          variant="secondary"
                          className="text-xs"
                        >
                          {topic}
                        </Badge>
                      ))}
                      {rec.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{rec.topics.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {rec.matchReasons.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>Why this matches:</span>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {rec.matchReasons.slice(0, 2).map((reason, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-blue-400 mt-0.5">•</span>
                            <span className="line-clamp-1">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2">
                    <Link href={`/stories/${rec.id}`}>
                      <Button size="sm" className="w-full">
                        Read Story
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {recommendations.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-3">
              Powered by AI • Updated in real-time based on your preferences
            </p>
            <Link href="/student-stories">
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                View All Stories
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
