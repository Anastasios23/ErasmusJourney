import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Progress } from "../src/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../src/components/ui/tabs";
import {
  Users,
  Euro,
  Star,
  Home,
  ThumbsUp,
  TrendingUp,
  MapPin,
  GraduationCap,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import EnhancedStudentData from "./EnhancedStudentData";

interface CityAggregatedData {
  city: string;
  country: string;
  totalSubmissions: number;
  livingCosts: {
    avgMonthlyRent: number;
    avgMonthlyFood: number;
    avgMonthlyTransport: number;
    avgMonthlyEntertainment: number;
    avgMonthlyUtilities: number;
    avgMonthlyOther: number;
    avgTotalMonthly: number;
    costSubmissions: number;
  };
  ratings: {
    avgOverallRating: number;
    avgAcademicRating: number;
    avgSocialLifeRating: number;
    avgCulturalImmersionRating: number;
    avgCostOfLivingRating: number;
    avgAccommodationRating: number;
    ratingSubmissions: number;
  };
  accommodation: {
    types: Array<{
      type: string;
      count: number;
      avgRent: number;
      percentage: number;
    }>;
    totalAccommodationSubmissions: number;
  };
  recommendations: {
    wouldRecommendCount: number;
    totalRecommendationResponses: number;
    recommendationPercentage: number;
  };
  topTips: Array<{
    category: string;
    tip: string;
    frequency: number;
  }>;
  universities: Array<{
    name: string;
    studentCount: number;
  }>;
}

interface StudentDataOverviewProps {
  city: string;
  country: string;
  className?: string;
}

export function StudentDataOverview({
  city,
  country,
  className,
}: StudentDataOverviewProps) {
  const [data, setData] = useState<CityAggregatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`Fetching city data for ${city}, ${country}`);
        const response = await fetch(
          `/api/destinations/city-aggregated?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`,
        );

        console.log(`API response status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("API error response:", errorData);

          if (response.status === 404) {
            setError(`No student data available for ${city}, ${country} yet.`);
          } else if (response.status === 500) {
            setError(
              `Server error while loading data for ${city}. Please try again later.`,
            );
          } else {
            setError(
              errorData?.message ||
                `Failed to fetch city data: ${response.statusText}`,
            );
          }
          return;
        }

        const result = await response.json();
        console.log("API response data:", result);

        if (result.success && result.data) {
          setData(result.data);
          setError(null);
        } else {
          setError("Invalid response format from server");
        }
      } catch (err) {
        console.error("Error fetching city data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load city data",
        );
      } finally {
        setLoading(false);
      }
    };

    if (city && country) {
      fetchCityData();
    } else {
      setLoading(false);
      setError("Missing city or country information");
    }
  }, [city, country]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Data Overview
          </CardTitle>
          <CardDescription>
            Loading student insights for {city}...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Data Overview
          </CardTitle>
          <CardDescription>{error || "No data available"}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Be the first to share your experience in {city}!
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderStarRating = (rating: number, size: "sm" | "md" = "sm") => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} ${
            i < fullStars
              ? "fill-yellow-400 text-yellow-400"
              : i === fullStars && hasHalfStar
                ? "fill-yellow-200 text-yellow-400"
                : "text-gray-300"
          }`}
        />,
      );
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Data Overview
          </CardTitle>
          <CardDescription>
            Based on {data.totalSubmissions} student experience
            {data.totalSubmissions !== 1 ? "s" : ""} in {city}, {country}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.recommendations.recommendationPercentage}%
              </div>
              <div className="text-sm text-gray-600">Would Recommend</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                {renderStarRating(data.ratings.avgOverallRating, "md")}
              </div>
              <div className="text-sm text-gray-600 mt-1">Overall Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.universities.length}
              </div>
              <div className="text-sm text-gray-600">Universities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.livingCosts.costSubmissions}
              </div>
              <div className="text-sm text-gray-600">Cost Reports</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Living Costs */}
      {data.livingCosts.costSubmissions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Average Monthly Costs
            </CardTitle>
            <CardDescription>
              Based on {data.livingCosts.costSubmissions} cost report
              {data.livingCosts.costSubmissions !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-lg font-semibold">
                  {formatCurrency(data.livingCosts.avgMonthlyRent)}
                </div>
                <div className="text-sm text-gray-600">Accommodation</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {formatCurrency(data.livingCosts.avgMonthlyFood)}
                </div>
                <div className="text-sm text-gray-600">Food</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {formatCurrency(data.livingCosts.avgMonthlyTransport)}
                </div>
                <div className="text-sm text-gray-600">Transport</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {formatCurrency(data.livingCosts.avgMonthlyEntertainment)}
                </div>
                <div className="text-sm text-gray-600">Entertainment</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {formatCurrency(data.livingCosts.avgMonthlyUtilities)}
                </div>
                <div className="text-sm text-gray-600">Utilities</div>
              </div>
              <div className="md:col-span-1">
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(data.livingCosts.avgTotalMonthly)}
                </div>
                <div className="text-sm text-gray-600">Total Monthly</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ratings */}
      {data.ratings.ratingSubmissions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Student Ratings
            </CardTitle>
            <CardDescription>
              Average ratings from {data.ratings.ratingSubmissions} review
              {data.ratings.ratingSubmissions !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Academic Experience</span>
                <div className="flex items-center gap-2">
                  {renderStarRating(data.ratings.avgAcademicRating)}
                  <span className="text-sm text-gray-600">
                    {data.ratings.avgAcademicRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Social Life</span>
                <div className="flex items-center gap-2">
                  {renderStarRating(data.ratings.avgSocialLifeRating)}
                  <span className="text-sm text-gray-600">
                    {data.ratings.avgSocialLifeRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cultural Immersion</span>
                <div className="flex items-center gap-2">
                  {renderStarRating(data.ratings.avgCulturalImmersionRating)}
                  <span className="text-sm text-gray-600">
                    {data.ratings.avgCulturalImmersionRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cost of Living</span>
                <div className="flex items-center gap-2">
                  {renderStarRating(data.ratings.avgCostOfLivingRating)}
                  <span className="text-sm text-gray-600">
                    {data.ratings.avgCostOfLivingRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Accommodation</span>
                <div className="flex items-center gap-2">
                  {renderStarRating(data.ratings.avgAccommodationRating)}
                  <span className="text-sm text-gray-600">
                    {data.ratings.avgAccommodationRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accommodation Types */}
        {data.accommodation.totalAccommodationSubmissions > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Popular Accommodation
              </CardTitle>
              <CardDescription>Types used by students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.accommodation.types.slice(0, 5).map((type, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{type.type}</div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(type.avgRent)}/month
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {type.percentage}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {type.count} student{type.count !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Universities */}
        {data.universities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Universities
              </CardTitle>
              <CardDescription>Popular destinations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.universities.slice(0, 5).map((uni, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="font-medium text-sm">{uni.name}</div>
                    <Badge variant="secondary">
                      {uni.studentCount} student
                      {uni.studentCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Tips */}
      {data.topTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Top Student Tips
            </CardTitle>
            <CardDescription>Most common advice from students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topTips.slice(0, 5).map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    {tip.frequency}
                  </Badge>
                  <p className="text-sm flex-1">{tip.tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Data Tab */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Quick Overview</TabsTrigger>
          <TabsTrigger value="enhanced">Detailed Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* Keep existing overview cards */}
          <div className="space-y-6">
            {/* Ratings Overview */}
            {data.ratings.ratingSubmissions > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Student Ratings ({data.ratings.ratingSubmissions} responses)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        {data.ratings.avgOverallRating.toFixed(1)}/5
                      </div>
                      <div className="text-sm text-gray-600">Overall</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        {data.ratings.avgAcademicRating.toFixed(1)}/5
                      </div>
                      <div className="text-sm text-gray-600">Academic</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {data.ratings.avgSocialLifeRating.toFixed(1)}/5
                      </div>
                      <div className="text-sm text-gray-600">Social Life</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Tips (simplified) */}
            {data.topTips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Quick Tips from Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.topTips.slice(0, 3).map((tip, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs">
                          {tip.frequency}
                        </Badge>
                        <p className="text-sm flex-1">{tip.tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="enhanced" className="mt-6">
          <EnhancedStudentData city={city} country={country} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default StudentDataOverview;
