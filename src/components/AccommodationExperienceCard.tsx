import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Heart,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  getAccommodationTypeLabel,
  getBillsIncludedLabel,
  getDifficultyFindingAccommodationLabel,
  getHowFoundAccommodationLabel,
} from "../lib/accommodation";

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
    currency?: string;
    billsIncluded?: boolean | string;
    utilityCosts?: number;
    rating: number;
    wouldRecommend?: boolean | string;
    neighborhood?: string;
    minutesToUniversity?: number;
    howFoundAccommodation?: string;
    difficultyFindingAccommodation?: string;
    tips?: string;
    pros?: string[];
    cons?: string[];
    facilities?: Record<string, any>;
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
    currency,
    billsIncluded,
    utilityCosts,
    rating,
    wouldRecommend,
    neighborhood,
    minutesToUniversity,
    howFoundAccommodation,
    difficultyFindingAccommodation,
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
  } = accommodation;

  const formatPrice = (price: number, priceCurrency = "EUR") =>
    new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: priceCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const renderStars = (value: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= value ? "fill-current text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{value.toFixed(1)}</span>
    </div>
  );

  const getRecommendationText = (recommend: boolean | string | undefined) => {
    if (
      recommend === true ||
      recommend === "yes" ||
      recommend === "Definitely"
    ) {
      return { text: "Recommends", color: "text-green-600" };
    }
    if (recommend === "Probably" || recommend === "maybe") {
      return { text: "Probably recommends", color: "text-blue-600" };
    }
    if (
      recommend === false ||
      recommend === "no" ||
      recommend === "Definitely Not"
    ) {
      return { text: "Does not recommend", color: "text-red-600" };
    }
    return { text: "No recommendation", color: "text-gray-500" };
  };

  const accommodationTypeLabel = getAccommodationTypeLabel(accommodationType);
  const recommendationData = getRecommendationText(wouldRecommend);
  const billsIncludedLabel =
    billsIncluded === undefined
      ? null
      : getBillsIncludedLabel(
          typeof billsIncluded === "boolean"
            ? billsIncluded
              ? "yes"
              : "no"
            : billsIncluded,
        );
  const howFoundLabel = howFoundAccommodation
    ? getHowFoundAccommodationLabel(howFoundAccommodation)
    : null;
  const findingDifficultyLabel = difficultyFindingAccommodation
    ? getDifficultyFindingAccommodationLabel(difficultyFindingAccommodation)
    : null;

  return (
    <Card className="border-l-4 border-l-blue-500 transition-all duration-200 hover:shadow-lg">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {accommodationTypeLabel}
                </h3>
                {isReal && (
                  <Badge
                    variant="outline"
                    className="border-blue-600 text-blue-600"
                  >
                    Real Experience
                  </Badge>
                )}
                {verified && (
                  <Badge
                    variant="outline"
                    className="border-green-600 text-green-600"
                  >
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>
                  {neighborhood ? `${neighborhood}, ` : ""}
                  {city}, {country}
                </span>
              </div>
            </div>

            <div className="text-right">
              {rating > 0 && renderStars(rating)}
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-3">
            <div className="mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {studentName}
              </span>
            </div>
            {universityInCyprus && university && (
              <p className="text-xs text-blue-700">
                {universityInCyprus}
                {" -> "}
                {university}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly Rent:</span>
              <span className="text-lg font-semibold text-green-600">
                {formatPrice(monthlyRent, currency)}
              </span>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              {billsIncludedLabel && (
                <div className="flex items-center justify-between">
                  <span>Bills included:</span>
                  <span
                    className={
                      billsIncludedLabel === "Yes"
                        ? "text-green-600"
                        : billsIncludedLabel === "Partially"
                          ? "text-amber-600"
                          : "text-orange-600"
                    }
                  >
                    {billsIncludedLabel}
                  </span>
                </div>
              )}

              {utilityCosts && utilityCosts > 0 && (
                <div className="flex items-center justify-between">
                  <span>Utilities:</span>
                  <span className="text-orange-600">
                    +{formatPrice(utilityCosts, currency)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {(minutesToUniversity !== undefined ||
            howFoundLabel ||
            findingDifficultyLabel) && (
            <div className="grid gap-2 rounded-lg border border-gray-100 bg-white p-3 text-sm text-gray-600">
              {minutesToUniversity !== undefined && (
                <div className="flex items-center justify-between">
                  <span>Minutes to university:</span>
                  <span className="font-medium text-gray-900">
                    {minutesToUniversity}
                  </span>
                </div>
              )}

              {howFoundLabel && (
                <div className="flex items-center justify-between gap-4">
                  <span>How it was found:</span>
                  <span className="text-right font-medium text-gray-900">
                    {howFoundLabel}
                  </span>
                </div>
              )}

              {findingDifficultyLabel && (
                <div className="flex items-center justify-between gap-4">
                  <span>Finding difficulty:</span>
                  <span className="text-right font-medium text-gray-900">
                    {findingDifficultyLabel}
                  </span>
                </div>
              )}
            </div>
          )}

          {(pros && pros.length > 0) || (cons && cons.length > 0) ? (
            <div className="space-y-3">
              {pros && pros.length > 0 && (
                <div>
                  <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-900">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Pros:
                  </h4>
                  <div className="space-y-1">
                    {pros
                      .slice(0, showFullDetails ? pros.length : 2)
                      .map((pro, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" />
                          <span className="text-xs text-gray-700">{pro}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {cons && cons.length > 0 && showFullDetails && (
                <div>
                  <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-900">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Cons:
                  </h4>
                  <div className="space-y-1">
                    {cons.map((con, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-orange-500" />
                        <span className="text-xs text-gray-700">{con}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {tips && (
            <div className="rounded-lg bg-yellow-50 p-3">
              <h4 className="mb-1 text-sm font-medium text-yellow-900">
                Student Tip:
              </h4>
              <p className="line-clamp-2 text-xs text-yellow-800">{tips}</p>
            </div>
          )}

          {showFullDetails && (
            <div className="space-y-3">
              {facilities && Object.keys(facilities).length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900">
                    Facilities:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {facilities.kitchenAccess && (
                      <Badge variant="secondary" className="text-xs">
                        Kitchen: {facilities.kitchenAccess}
                      </Badge>
                    )}
                    {facilities.internetIncluded && (
                      <Badge variant="secondary" className="text-xs">
                        WiFi Included
                      </Badge>
                    )}
                    {facilities.laundryAccess && (
                      <Badge variant="secondary" className="text-xs">
                        Laundry: {facilities.laundryAccess}
                      </Badge>
                    )}
                    {facilities.parkingAvailable && (
                      <Badge variant="secondary" className="text-xs">
                        Parking Available
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {nearbyAmenities && nearbyAmenities.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900">
                    Nearby:
                  </h4>
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
                  <h4 className="mb-1 text-sm font-medium text-gray-900">
                    Transport:
                  </h4>
                  <p className="text-sm text-gray-600">{transportLinks}</p>
                </div>
              )}

              {additionalNotes && (
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-900">
                    Additional Notes:
                  </h4>
                  <p className="text-sm text-gray-600">{additionalNotes}</p>
                </div>
              )}
            </div>
          )}

          {wouldRecommend !== undefined && (
            <div className="flex items-center gap-2 border-t border-gray-100 py-2 text-sm">
              <span className="text-gray-600">Student recommendation:</span>
              <span className={recommendationData.color}>
                {recommendationData.text}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
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
                  <Heart
                    className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`}
                  />
                </Button>
              )}

              {isReal && (
                <Link href={`/accommodation/${id}`}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-1 h-4 w-4" />
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
