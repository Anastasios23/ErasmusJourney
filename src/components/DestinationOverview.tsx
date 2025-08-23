import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Users,
  Star,
  Euro,
  Home,
  TrendingUp,
  MapPin,
  Globe,
  ThumbsUp,
  ThumbsDown,
  PieChart,
  GraduationCap,
} from "lucide-react";
import { GeneratedDestinationData } from "../hooks/useGeneratedDestinations";

interface DestinationOverviewProps {
  destination: GeneratedDestinationData;
}

export default function DestinationOverview({
  destination,
}: DestinationOverviewProps) {
  const formatPrice = (price?: number, currency: string = "EUR") => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderRating = (rating?: number) => {
    if (!rating) return <span className="text-gray-400">No ratings yet</span>;

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="font-medium">{rating.toFixed(1)}/5</span>
      </div>
    );
  };

  const expenseLabels: Record<string, string> = {
    accommodation: "Rent",
    groceries: "Groceries",
    transport: "Transportation",
    social: "Eating Out",
    bills: "Bills",
    other: "Other",
  };

  const universities = Array.from(
    new Set(
      (destination.courseExchanges || [])
        .map((course) => course.hostUniversity)
        .filter(Boolean),
    ),
  );

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {destination.adminTitle ||
                  `${destination.city}, ${destination.country}`}
              </h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {destination.city}, {destination.country}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {destination.totalSubmissions} student experiences
                  </span>
                </div>
                {destination.featured && (
                  <Badge variant="default">
                    <Star className="h-3 w-3 mr-1" />
                    Featured Destination
                  </Badge>
                )}
              </div>
              {destination.adminDescription && (
                <p className="text-gray-700 mb-4">
                  {destination.adminDescription}
                </p>
              )}
            </div>
            {destination.adminImageUrl && (
              <div className="ml-6">
                <img
                  src={destination.adminImageUrl}
                  alt={`${destination.city}, ${destination.country}`}
                  className="w-48 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Student Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderRating(destination.averageRating)}
            <p className="text-sm text-gray-500 mt-1">
              Based on {destination.totalSubmissions} experiences
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Euro className="h-5 w-5 text-green-500" />
              Monthly Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(destination.averageMonthlyCost)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Average total monthly expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-500" />
              Accommodation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(destination.averageAccommodationCost)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Average monthly rent</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Breakdown */}
      {destination.budgetBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Monthly Budget Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(destination.budgetBreakdown).map(
                  ([category, amount]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <span className="capitalize text-sm font-medium">
                        {expenseLabels[category] || category}
                      </span>
                      <span className="font-bold">
                        {formatPrice(amount as number)}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {universities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Available Universities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {universities.map((uni) => (
                  <Badge key={uni} variant="secondary" className="text-sm">
                    {uni}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Neighborhoods */}
        {destination.topNeighborhoods &&
          destination.topNeighborhoods.length > 0 && (
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Popular Neighborhoods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {destination.topNeighborhoods.map((neighborhood, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {neighborhood}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Pros and Cons */}
      <div className="grid md:grid-cols-2 gap-6">
        {destination.commonPros && destination.commonPros.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <ThumbsUp className="h-5 w-5" />
                What Students Love
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {destination.commonPros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 text-sm mt-1">✓</span>
                    <span className="text-sm text-gray-700">{pro}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {destination.commonCons && destination.commonCons.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <ThumbsDown className="h-5 w-5" />
                Common Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {destination.commonCons.map((con, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 text-sm mt-1">!</span>
                    <span className="text-sm text-gray-700">{con}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Admin Highlights */}
      {destination.adminHighlights &&
        destination.adminHighlights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Destination Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {destination.adminHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 text-sm mt-1">•</span>
                    <span className="text-sm text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

      {/* General Information */}
      {destination.adminGeneralInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(destination.adminGeneralInfo).map(
                ([key, value]) =>
                  value && (
                    <div key={key}>
                      <div className="text-sm font-medium text-gray-800 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                      <div className="text-sm text-gray-600">{value}</div>
                    </div>
                  ),
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
