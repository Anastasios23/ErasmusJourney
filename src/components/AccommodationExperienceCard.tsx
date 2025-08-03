import React from "react";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Star,
  MapPin,
  Euro,
  Users,
  CheckCircle,
  AlertTriangle,
  Heart,
  ExternalLink,
  Home,
  Calendar,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface AccommodationExperienceCardProps {
  accommodation: {
    id: string;
    studentName: string;
    city: string;
    country: string;
    university?: string;
    universityInCyprus?: string;
    accommodationType: string;
    monthlyRent: number;
    billsIncluded?: boolean | string;
    utilityCosts?: number;
    rating: number;
    wouldRecommend?: boolean | string;
    address?: string;
    neighborhood?: string;
    tips?: string;
    pros?: string[];
    cons?: string[];
    facilities?: any;
    nearbyAmenities?: string[];
    transportLinks?: string;
    additionalNotes?: string;
    createdAt: string;
    verified?: boolean;
    isReal?: boolean;
    source?: string;
  };
  onSaveToWishlist?: (id: string) => void;
  isInWishlist?: boolean;
  showFullDetails?: boolean;
}

export default function AccommodationExperienceCard({
  accommodation,
  onSaveToWishlist,
  isInWishlist = false,
  showFullDetails = false,
}: AccommodationExperienceCardProps) {
  const {
    id,
    studentName,
    city,
    country,
    university,
    universityInCyprus,
    accommodationType,
    monthlyRent,
    billsIncluded,
    utilityCosts,
    rating,
    wouldRecommend,
    address,
    neighborhood,
    tips,
    pros,
    cons,
    facilities,
    nearbyAmenities,
    transportLinks,
    additionalNotes,
    createdAt,
    verified,
    isReal,
    source,
  } = accommodation;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getRecommendationText = (recommend: boolean | string | undefined) => {
    if (recommend === true || recommend === "yes" || recommend === "Definitely") {
      return { text: "✅ Recommends", color: "text-green-600" };
    } else if (recommend === "Probably" || recommend === "maybe") {
      return { text: "👍 Probably recommends", color: "text-blue-600" };
    } else if (recommend === false || recommend === "no" || recommend === "Definitely Not") {
      return { text: "❌ Doesn't recommend", color: "text-red-600" };
    }
    return { text: "No recommendation", color: "text-gray-500" };
  };

  const recommendationData = getRecommendationText(wouldRecommend);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header with badges */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg text-gray-900">
                  {accommodationType}
                </h3>
                {isReal && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Real Experience
                  </Badge>
                )}
                {verified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="h-4 w-4" />
                <span>
                  {neighborhood ? `${neighborhood}, ` : ""}{city}, {country}
                </span>
              </div>
              
              {address && showFullDetails && (
                <p className="text-sm text-gray-500 mt-1">{address}</p>
              )}
            </div>

            <div className="text-right">
              {rating > 0 && renderStars(rating)}
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {studentName}
              </span>
            </div>
            {universityInCyprus && university && (
              <p className="text-xs text-blue-700">
                {universityInCyprus} → {university}
              </p>
            )}
          </div>

          {/* Financial Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Monthly Rent:</span>
              <span className="font-semibold text-green-600 text-lg">
                {formatPrice(monthlyRent)}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              {billsIncluded !== undefined && (
                <div className="flex items-center justify-between">
                  <span>Bills included:</span>
                  <span className={billsIncluded === true || billsIncluded === "Yes" ? "text-green-600" : "text-orange-600"}>
                    {billsIncluded === true || billsIncluded === "Yes" ? "✅ Yes" : 
                     billsIncluded === "Partially" ? "🟡 Partially" : "❌ No"}
                  </span>
                </div>
              )}
              
              {utilityCosts && utilityCosts > 0 && (
                <div className="flex items-center justify-between">
                  <span>Utilities:</span>
                  <span className="text-orange-600">+{formatPrice(utilityCosts)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Experience Highlights */}
          {(pros && pros.length > 0) || (cons && cons.length > 0) ? (
            <div className="space-y-3">
              {pros && pros.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Pros:
                  </h4>
                  <div className="space-y-1">
                    {pros.slice(0, showFullDetails ? pros.length : 2).map((pro, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cons && cons.length > 0 && showFullDetails && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Cons:
                  </h4>
                  <div className="space-y-1">
                    {cons.map((con, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{con}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Tips */}
          {tips && (
            <div className="bg-yellow-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-yellow-900 mb-1 flex items-center gap-1">
                💡 Student Tip:
              </h4>
              <p className="text-xs text-yellow-800 line-clamp-2">
                {tips}
              </p>
            </div>
          )}

          {/* Additional Info for Full Details */}
          {showFullDetails && (
            <div className="space-y-3">
              {facilities && Object.keys(facilities).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Facilities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {facilities.kitchenAccess && (
                      <Badge variant="secondary" className="text-xs">
                        🍳 Kitchen: {facilities.kitchenAccess}
                      </Badge>
                    )}
                    {facilities.internetIncluded && (
                      <Badge variant="secondary" className="text-xs">
                        📶 WiFi Included
                      </Badge>
                    )}
                    {facilities.laundryAccess && (
                      <Badge variant="secondary" className="text-xs">
                        🧺 Laundry: {facilities.laundryAccess}
                      </Badge>
                    )}
                    {facilities.parkingAvailable && (
                      <Badge variant="secondary" className="text-xs">
                        🚗 Parking Available
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {nearbyAmenities && nearbyAmenities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Nearby:</h4>
                  <div className="flex flex-wrap gap-1">
                    {nearbyAmenities.slice(0, 5).map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {transportLinks && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Transport:</h4>
                  <p className="text-sm text-gray-600">{transportLinks}</p>
                </div>
              )}

              {additionalNotes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Additional Notes:</h4>
                  <p className="text-sm text-gray-600">{additionalNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Recommendation */}
          {wouldRecommend !== undefined && (
            <div className="flex items-center gap-2 text-sm py-2 border-t border-gray-100">
              <span className="text-gray-600">Student recommendation:</span>
              <span className={recommendationData.color}>
                {recommendationData.text}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Shared {new Date(createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {onSaveToWishlist && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSaveToWishlist(id)}
                  className={isInWishlist ? "text-red-600" : "text-gray-600"}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
                </Button>
              )}
              
              {isReal && (
                <Link href={`/accommodation/${id}`}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Full Details
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
