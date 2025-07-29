import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Brain,
  TrendingUp,
  Clock,
  Target,
  MessageSquare,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

interface StoryAnalysis {
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
  readingTime: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  keywords: string[];
  recommendedFor: string[];
}

interface ContentSuggestion {
  type: "improvement" | "missing_info" | "enhancement";
  message: string;
  priority: "low" | "medium" | "high";
}

interface AnalysisResult {
  id: string;
  analysis: StoryAnalysis;
  suggestions: ContentSuggestion[];
  score: number;
  generatedAt: string;
}

interface StoryAnalysisComponentProps {
  storyId: string;
  storyContent?: string;
}

export default function StoryAnalysisComponent({
  storyId,
  storyContent,
}: StoryAnalysisComponentProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeStory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/ai/analyze-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storyId }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze story");
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Info className="h-4 w-4 text-yellow-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Story Analysis
          </CardTitle>
          <Button
            onClick={analyzeStory}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? "Analyzing..." : "Analyze Story"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}
              >
                {analysis.score}/100
              </div>
              <p className="text-sm text-gray-600">Content Quality Score</p>
              <Progress value={analysis.score} className="mt-2" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge
                  className={getSentimentColor(analysis.analysis.sentiment)}
                >
                  {analysis.analysis.sentiment}
                </Badge>
                <p className="text-xs text-gray-600 mt-1">Sentiment</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">
                    {analysis.analysis.readingTime}m
                  </span>
                </div>
                <p className="text-xs text-gray-600">Reading Time</p>
              </div>

              <div className="text-center">
                <Badge
                  className={getDifficultyColor(analysis.analysis.difficulty)}
                >
                  {analysis.analysis.difficulty}
                </Badge>
                <p className="text-xs text-gray-600 mt-1">Difficulty</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">
                    {analysis.analysis.topics.length}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Topics</p>
              </div>
            </div>

            {/* Topics */}
            {analysis.analysis.topics.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Topics Covered
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.analysis.topics.map((topic) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {analysis.analysis.keywords.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Key Terms
                </h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.analysis.keywords.slice(0, 8).map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {analysis.analysis.keywords.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{analysis.analysis.keywords.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Recommended For */}
            {analysis.analysis.recommendedFor.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Recommended For
                </h4>
                <ul className="space-y-1">
                  {analysis.analysis.recommendedFor.map((audience, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-center gap-2"
                    >
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {audience}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Content Suggestions
                </h4>
                <div className="space-y-3">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        suggestion.priority === "high"
                          ? "border-red-200 bg-red-50"
                          : suggestion.priority === "medium"
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {getPriorityIcon(suggestion.priority)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                suggestion.type === "improvement"
                                  ? "destructive"
                                  : suggestion.type === "missing_info"
                                    ? "secondary"
                                    : "default"
                              }
                              className="text-xs"
                            >
                              {suggestion.type.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">
                            {suggestion.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Info */}
            <div className="text-xs text-gray-500 border-t pt-4">
              Analysis generated at{" "}
              {new Date(analysis.generatedAt).toLocaleString()}
            </div>
          </div>
        )}

        {!analysis && !loading && !error && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Get AI-powered insights about this story's content, sentiment, and
              quality.
            </p>
            <Button onClick={analyzeStory}>
              <Brain className="h-4 w-4 mr-2" />
              Analyze Story
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
