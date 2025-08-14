import React, { useState } from "react";
import { usePartnershipAnalytics } from "../src/hooks/usePartnershipAnalytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import { Input } from "../src/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../src/components/ui/tabs";
import { AnalyticsSkeleton } from "../src/components/ui/skeleton";
import { ErrorBoundary } from "../src/components/ui/error-boundary";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  MapPin,
  GraduationCap,
  Globe,
  Euro,
  Star,
  Calendar,
  Building,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";

const trendIcons = {
  growing: { icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
  declining: { icon: TrendingDown, color: "text-red-600", bg: "bg-red-100" },
  stable: { icon: Minus, color: "text-blue-600", bg: "bg-blue-100" },
  insufficient_data: { icon: Minus, color: "text-gray-600", bg: "bg-gray-100" },
};

export default function PartnershipAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"6m" | "12m" | "24m">("12m");
  const [universityFilter, setUniversityFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = usePartnershipAnalytics({
    timeRange,
    university: universityFilter || undefined,
    country: countryFilter || undefined,
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // Export functionality could be implemented here
    console.log("Exporting analytics data...");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnalyticsSkeleton />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Error loading analytics
          </h2>
          <p className="text-gray-600 mb-4">Please try again later</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Partnership Analytics
              </h1>
              <p className="mt-2 text-gray-600">
                Analyze university partnerships and exchange program performance
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Rest of component remains the same */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Range
                  </label>
                  <Select
                    value={timeRange}
                    onValueChange={(value: any) => setTimeRange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6m">Last 6 months</SelectItem>
                      <SelectItem value="12m">Last 12 months</SelectItem>
                      <SelectItem value="24m">Last 24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University Filter
                  </label>
                  <Input
                    placeholder="Filter by university..."
                    value={universityFilter}
                    onChange={(e) => setUniversityFilter(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country Filter
                  </label>
                  <Input
                    placeholder="Filter by country..."
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUniversityFilter("");
                      setCountryFilter("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Submissions
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overview.totalSubmissions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Building className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Active Partnerships
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overview.uniquePartnerships}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <GraduationCap className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Universities
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overview.uniqueUniversities}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Globe className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Countries
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overview.uniqueCountries}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Global Rating
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overview.globalAverageRating?.toFixed(1) ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="partnerships" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
              <TabsTrigger value="universities">Universities</TabsTrigger>
              <TabsTrigger value="countries">Countries</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="partnerships" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Top University Partnerships
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.partnerships.top.map((partnership, index) => {
                      const trend = trendIcons[partnership.growthTrend];
                      const TrendIcon = trend.icon;

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {partnership.hostUniversity}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {partnership.hostCity},{" "}
                                {partnership.hostCountry}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">
                                  {partnership.homeCountry} →{" "}
                                  {partnership.hostCountry}
                                </Badge>
                                <div
                                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${trend.bg} ${trend.color}`}
                                >
                                  <TrendIcon className="w-3 h-3" />
                                  {partnership.growthTrend}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="font-bold text-gray-900">
                                  {partnership.submissions}
                                </p>
                                <p className="text-gray-600">submissions</p>
                              </div>
                              {partnership.averageRating && (
                                <div>
                                  <p className="font-bold text-gray-900">
                                    ★ {partnership.averageRating.toFixed(1)}
                                  </p>
                                  <p className="text-gray-600">rating</p>
                                </div>
                              )}
                              {partnership.averageCost && (
                                <div>
                                  <p className="font-bold text-gray-900">
                                    €{Math.round(partnership.averageCost)}
                                  </p>
                                  <p className="text-gray-600">avg/month</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="universities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Top Host Universities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.universities.top.map((university, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {university.university}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {university.city}, {university.country}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="font-bold text-gray-900">
                                {university.submissions}
                              </p>
                              <p className="text-gray-600">students</p>
                            </div>
                            {university.averageRating && (
                              <div>
                                <p className="font-bold text-gray-900">
                                  ★ {university.averageRating.toFixed(1)}
                                </p>
                                <p className="text-gray-600">rating</p>
                              </div>
                            )}
                            {university.averageCost && (
                              <div>
                                <p className="font-bold text-gray-900">
                                  €{Math.round(university.averageCost)}
                                </p>
                                <p className="text-gray-600">avg cost</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="countries" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Host Countries Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.countries.top.map((country, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {country.country}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {country.universities} universities •{" "}
                              {country.cities} cities
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-bold text-gray-900">
                                {country.submissions}
                              </p>
                              <p className="text-gray-600">total students</p>
                            </div>
                            {country.avgRating && (
                              <div>
                                <p className="font-bold text-gray-900">
                                  ★ {country.avgRating.toFixed(1)}
                                </p>
                                <p className="text-gray-600">avg rating</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Monthly Submission Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.trends.monthly.map((trend, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(trend.month + "-01").toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                            },
                          )}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(trend.submissions / Math.max(...analytics.trends.monthly.map((t) => t.submissions))) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-900 w-8">
                            {trend.submissions}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
}
