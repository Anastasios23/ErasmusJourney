import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import {
  Euro,
  Home,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BookOpen,
  Users,
  Award,
} from "lucide-react";
import {
  formatCents,
  formatPriceRange,
  formatSampleSize,
  getPriceBadge,
  getQualityRating,
  formatPercentileRange,
  getAccommodationTypeLabel,
  formatECTS,
  formatQualityScore,
} from "../lib/utils/statsFormatters";

interface CityStatsProps {
  city: string;
  country?: string;
}

interface CityStatsData {
  city: string;
  country: string;
  sampleSize: number;
  accommodation: {
    avgMonthlyRentCents: number;
    medianMonthlyRentCents: number;
    minMonthlyRentCents: number;
    maxMonthlyRentCents: number;
    p5MonthlyRentCents: number;
    p95MonthlyRentCents: number;
    byType: Record<
      string,
      {
        count: number;
        avgRentCents: number;
        medianRentCents: number;
      }
    >;
  };
  courses: {
    totalCourses: number;
    avgECTS: number;
    avgQuality: number;
    byLevel: Record<
      string,
      {
        count: number;
        avgECTS: number;
        avgQuality: number;
      }
    >;
  };
  experiences: {
    totalFullExperiences: number;
    avgQualityScore: number;
    featuredCount: number;
  };
  lastUpdated: string;
}

export default function CityStatsCard({ city, country }: CityStatsProps) {
  const [stats, setStats] = useState<CityStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [city, country]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ city });
      if (country) params.append("country", country);

      const res = await fetch(`/api/stats/city?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching city stats:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>City Statistics</CardTitle>
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

  if (error || !stats) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to load statistics for {city}. {error}
        </AlertDescription>
      </Alert>
    );
  }

  const sampleInfo = formatSampleSize(stats.sampleSize);
  const priceBadge = getPriceBadge(
    stats.accommodation.avgMonthlyRentCents,
    stats.accommodation.avgMonthlyRentCents,
  );
  const qualityRating = getQualityRating(stats.experiences.avgQualityScore);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                {city}, {stats.country}
              </CardTitle>
              <CardDescription className="mt-1">
                <span className={sampleInfo.className}>{sampleInfo.text}</span>
                {" · "}
                <span className="text-gray-500">{sampleInfo.confidence}</span>
              </CardDescription>
            </div>
            {stats.experiences.featuredCount > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800">
                <Award className="h-3 w-3 mr-1" />
                {stats.experiences.featuredCount} Featured
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Accommodation Stats */}
      {stats.accommodation.avgMonthlyRentCents > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Accommodation Costs
            </CardTitle>
            <CardDescription>
              Monthly rent statistics (filtered for outliers)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Average</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCents(stats.accommodation.avgMonthlyRentCents)}
                </div>
                <Badge className={priceBadge.className}>
                  {priceBadge.label}
                </Badge>
              </div>

              <div>
                <div className="text-sm text-gray-600">Median</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCents(stats.accommodation.medianMonthlyRentCents)}
                </div>
                <div className="text-xs text-gray-500">Typical price</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Price Range</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatPriceRange(
                    stats.accommodation.minMonthlyRentCents,
                    stats.accommodation.maxMonthlyRentCents,
                  )}
                </div>
                <div className="text-xs text-gray-500">Full range</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Typical Range</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatPercentileRange(
                    stats.accommodation.p5MonthlyRentCents,
                    stats.accommodation.p95MonthlyRentCents,
                  )}
                </div>
                <div className="text-xs text-gray-500">5th-95th percentile</div>
              </div>
            </div>

            {/* Alert for outlier filtering */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Average excludes outliers (bottom 5% and top 5%) for more
                accurate representation. Typical range shows where 90% of prices
                fall.
              </AlertDescription>
            </Alert>

            {/* By Type Breakdown */}
            {Object.keys(stats.accommodation.byType).length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  By Accommodation Type
                </h4>
                <div className="space-y-3">
                  {Object.entries(stats.accommodation.byType).map(
                    ([type, data]) => (
                      <div
                        key={type}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {getAccommodationTypeLabel(type)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {data.count} listings
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCents(data.avgRentCents)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Median: {formatCents(data.medianRentCents)}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Course Stats */}
      {stats.courses.totalCourses > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Exchange Data
            </CardTitle>
            <CardDescription>
              {stats.courses.totalCourses} course
              {stats.courses.totalCourses === 1 ? "" : "s"} reported
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Course Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Courses</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.courses.totalCourses}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Average ECTS</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatECTS(stats.courses.avgECTS)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Average Quality</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatQualityScore(stats.courses.avgQuality)}
                </div>
                <Badge
                  className={
                    getQualityRating(stats.courses.avgQuality).className
                  }
                >
                  {getQualityRating(stats.courses.avgQuality).label}
                </Badge>
              </div>
            </div>

            {/* By Level Breakdown */}
            {Object.keys(stats.courses.byLevel).length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  By Study Level
                </h4>
                <div className="space-y-3">
                  {Object.entries(stats.courses.byLevel).map(
                    ([level, data]) => (
                      <div
                        key={level}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {level}
                          </div>
                          <div className="text-sm text-gray-600">
                            {data.count} courses
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatECTS(data.avgECTS)} ·{" "}
                            {formatQualityScore(data.avgQuality)}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Experience Stats */}
      {stats.experiences.totalFullExperiences > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Experiences
            </CardTitle>
            <CardDescription>
              {stats.experiences.totalFullExperiences} complete experience
              {stats.experiences.totalFullExperiences === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Average Quality</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.experiences.avgQualityScore.toFixed(1)}/5.0
                </div>
                <Badge className={qualityRating.className}>
                  {qualityRating.label}
                </Badge>
              </div>

              {stats.experiences.featuredCount > 0 && (
                <div>
                  <div className="text-sm text-gray-600">Featured</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.experiences.featuredCount}
                  </div>
                  <div className="text-xs text-gray-500">
                    High-quality content
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {stats.sampleSize === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No approved submissions found for {city}. Be the first to share your
            experience!
          </AlertDescription>
        </Alert>
      )}

      {/* Last Updated */}
      <div className="text-xs text-gray-500 text-center">
        Statistics last updated: {new Date(stats.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}
