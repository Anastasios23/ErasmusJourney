import React from "react";
import { Badge } from "../src/components/ui/badge";
import { Star, Euro, Users, ThumbsUp, TrendingUp, Home } from "lucide-react";

interface CityDataCardProps {
  cityData?: {
    city: string;
    country: string;
    totalSubmissions: number;
    livingCosts: {
      avgMonthlyRent: number;
      avgMonthlyFood: number;
      avgMonthlyTransport: number;
      avgTotalMonthly: number;
      costSubmissions: number;
    };
    ratings: {
      avgOverallRating: number;
      avgAcademicRating: number;
      avgSocialLifeRating: number;
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
  };
  loading?: boolean;
}

const CityDataCard: React.FC<CityDataCardProps> = ({ cityData, loading }) => {
  if (loading) {
    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!cityData || cityData.totalSubmissions === 0) {
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-500 text-center">
          📊 No student data available yet
        </div>
        <div className="text-xs text-gray-400 text-center mt-1">
          Be the first to share your experience!
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return Math.round(amount);
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < fullStars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />,
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="text-sm font-medium text-blue-900 mb-3 flex items-center gap-1">
        <Users className="h-4 w-4" />
        Student Insights ({cityData.totalSubmissions} experiences)
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Top row - main stats */}
        <div className="grid grid-cols-3 gap-2">
          {cityData.livingCosts.costSubmissions > 0 && (
            <div className="text-center bg-white rounded-md p-2 border">
              <div className="text-xs font-medium text-gray-700 mb-1">
                Monthly Cost
              </div>
              <div className="text-sm font-bold text-green-600 flex items-center justify-center gap-1">
                <Euro className="h-3 w-3" />€
                {formatCurrency(cityData.livingCosts.avgTotalMonthly)}
              </div>
            </div>
          )}

          {cityData.ratings.ratingSubmissions > 0 && (
            <div className="text-center bg-white rounded-md p-2 border">
              <div className="text-xs font-medium text-gray-700 mb-1">
                Experience
              </div>
              <div className="flex flex-col items-center gap-1">
                {renderStarRating(cityData.ratings.avgOverallRating)}
                <div className="text-xs text-gray-600">
                  {cityData.ratings.avgOverallRating.toFixed(1)}/5
                </div>
              </div>
            </div>
          )}

          {cityData.recommendations.totalRecommendationResponses > 0 && (
            <div className="text-center bg-white rounded-md p-2 border">
              <div className="text-xs font-medium text-gray-700 mb-1">
                Recommend
              </div>
              <div className="text-sm font-bold text-blue-600 flex items-center justify-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {Math.round(cityData.recommendations.recommendationPercentage)}%
              </div>
            </div>
          )}
        </div>

        {/* Second row - detailed breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Accommodation info */}
          {cityData.accommodation.types.length > 0 && (
            <div className="bg-white rounded-md p-2 border">
              <div className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Home className="h-3 w-3" />
                Popular Housing
              </div>
              {cityData.accommodation.types.slice(0, 2).map((acc, index) => (
                <div key={index} className="text-xs text-gray-600">
                  {acc.type} ({acc.percentage}%)
                </div>
              ))}
            </div>
          )}

          {/* Top tip */}
          {cityData.topTips.length > 0 && (
            <div className="bg-white rounded-md p-2 border">
              <div className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Top Tip
              </div>
              <div className="text-xs text-gray-600 line-clamp-2">
                "{cityData.topTips[0].tip}"
              </div>
            </div>
          )}
        </div>

        {/* Additional cost breakdown if available */}
        {cityData.livingCosts.costSubmissions > 0 && (
          <div className="bg-white rounded-md p-2 border">
            <div className="text-xs font-medium text-gray-700 mb-1">
              Cost Breakdown (avg/month)
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs text-gray-600">
              <div>
                🏠 €{formatCurrency(cityData.livingCosts.avgMonthlyRent)}
              </div>
              <div>
                🍽️ €{formatCurrency(cityData.livingCosts.avgMonthlyFood)}
              </div>
              <div>
                🚊 €{formatCurrency(cityData.livingCosts.avgMonthlyTransport)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityDataCard;
