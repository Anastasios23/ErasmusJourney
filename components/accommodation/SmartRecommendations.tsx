import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";
import { Skeleton } from "../../src/components/ui/skeleton";
import {
  Star,
  Users,
  ExternalLink,
  Lightbulb,
  MapPin,
  Euro,
  TrendingUp,
} from "lucide-react";
import { useFormSubmissions } from "../../src/hooks/useFormSubmissions";

interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  type: "accommodation" | "platform" | "tip" | "location";
  relevanceScore: number;
  data: any;
  reason: string;
}

interface SmartRecommendationsProps {
  userProfile?: {
    university?: string;
    hostCountry?: string;
    hostCity?: string;
    hostUniversity?: string;
    budget?: number;
  };
}

export default function SmartRecommendations({
  userProfile,
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getDraftData } = useFormSubmissions();

  useEffect(() => {
    fetchRecommendations();
  }, [userProfile]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user data from form submissions if not provided in props
      let profile = userProfile;
      if (!profile) {
        const basicInfoData = getDraftData("basic-info");
        if (basicInfoData) {
          profile = {
            university: basicInfoData.universityInCyprus,
            hostCountry: basicInfoData.hostCountry,
            hostCity: basicInfoData.hostCity,
            hostUniversity: basicInfoData.hostUniversity,
            budget: basicInfoData.monthlyBudget,
          };
        }
      }

      if (!profile || !profile.hostCity) {
        setRecommendations([]);
        return;
      }

      const params = new URLSearchParams();
      if (profile.university)
        params.append("userUniversity", profile.university);
      if (profile.hostCountry)
        params.append("hostCountry", profile.hostCountry);
      if (profile.hostCity) params.append("hostCity", profile.hostCity);
      if (profile.hostUniversity)
        params.append("hostUniversity", profile.hostUniversity);
      if (profile.budget) params.append("budget", profile.budget.toString());

      const response = await fetch(
        `/api/accommodation/recommendations?${params}`,
      );
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        setError("Failed to fetch recommendations");
      }
    } catch (err) {
      setError("Error loading recommendations");
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "accommodation":
        return <MapPin className="h-4 w-4" />;
      case "platform":
        return <ExternalLink className="h-4 w-4" />;
      case "tip":
        return <Lightbulb className="h-4 w-4" />;
      case "location":
        return <MapPin className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "accommodation":
        return "bg-blue-100 text-blue-800";
      case "platform":
        return "bg-green-100 text-green-800";
      case "tip":
        return "bg-yellow-100 text-yellow-800";
      case "location":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRecommendationClick = (recommendation: SmartRecommendation) => {
    if (recommendation.type === "platform" && recommendation.data.url) {
      window.open(recommendation.data.url, "_blank");
    } else if (
      recommendation.type === "accommodation" &&
      recommendation.data.id
    ) {
      // Navigate to accommodation detail page
      window.location.href = `/accommodation/${recommendation.data.id}`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
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
            <Users className="h-5 w-5" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">{error}</p>
            <Button
              variant="outline"
              onClick={fetchRecommendations}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Complete your basic information to get personalized accommodation
              recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Students Like You Also Viewed
        </CardTitle>
        <p className="text-sm text-gray-600">
          Personalized recommendations based on your profile and similar
          students
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleRecommendationClick(recommendation)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(recommendation.type)}>
                    {getTypeIcon(recommendation.type)}
                    <span className="ml-1 capitalize">
                      {recommendation.type}
                    </span>
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">
                      {recommendation.relevanceScore}% match
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">
                {recommendation.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {recommendation.description}
              </p>
              <p className="text-xs text-blue-600 mb-3">
                {recommendation.reason}
              </p>

              {/* Type-specific content */}
              {recommendation.type === "accommodation" &&
                recommendation.data && (
                  <div className="bg-gray-50 rounded p-3 space-y-2">
                    {recommendation.data.monthlyRent && (
                      <div className="flex items-center gap-2 text-sm">
                        <Euro className="h-3 w-3 text-green-600" />
                        <span>€{recommendation.data.monthlyRent}/month</span>
                      </div>
                    )}
                    {recommendation.data.rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>{recommendation.data.rating}/5 rating</span>
                      </div>
                    )}
                  </div>
                )}

              {recommendation.type === "platform" && recommendation.data && (
                <div className="bg-gray-50 rounded p-3">
                  {recommendation.data.features && (
                    <div className="flex flex-wrap gap-1">
                      {recommendation.data.features
                        .slice(0, 3)
                        .map((feature: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {recommendation.type === "tip" && recommendation.data && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-800">
                    {recommendation.data.tip}
                  </p>
                </div>
              )}

              {(recommendation.type === "platform" ||
                recommendation.type === "accommodation") && (
                <div className="flex items-center gap-2 mt-3 text-blue-600 text-sm">
                  <ExternalLink className="h-3 w-3" />
                  <span>
                    {recommendation.type === "platform"
                      ? "Visit Platform"
                      : "View Details"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {recommendations.length > 0 && (
          <div className="text-center mt-6">
            <Button variant="outline" onClick={fetchRecommendations}>
              Refresh Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
