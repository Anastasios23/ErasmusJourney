import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  MapPin,
  Euro,
  User,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Building,
  Star,
} from "lucide-react";
import { GeneratedAccommodation } from "../hooks/useGeneratedDestinations";

interface GeneratedAccommodationCardProps {
  accommodation: GeneratedAccommodation;
  isCompact?: boolean;
}

export default function GeneratedAccommodationCard({
  accommodation,
  isCompact = false,
}: GeneratedAccommodationCardProps) {
  const formatPrice = (price?: number, currency: string = "EUR") => {
    if (!price) return "Price not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card
      className={`${isCompact ? "h-fit" : ""} hover:shadow-md transition-shadow`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {accommodation.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              {accommodation.studentName && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>by {accommodation.studentName}</span>
                </div>
              )}
              {accommodation.neighborhood && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{accommodation.neighborhood}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="secondary" className="text-xs">
              <Building className="h-3 w-3 mr-1" />
              {accommodation.accommodationType}
            </Badge>
            {accommodation.featured && (
              <Badge variant="default" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        {accommodation.monthlyRent && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Euro className="h-4 w-4" />
              <span className="font-medium">Monthly Rent</span>
            </div>
            <span className="font-bold text-blue-900">
              {formatPrice(accommodation.monthlyRent, accommodation.currency)}
            </span>
          </div>
        )}

        {/* Description */}
        <div className="text-gray-700">
          <p className={`${isCompact ? "line-clamp-3" : ""}`}>
            {accommodation.description}
          </p>
        </div>

        {/* Pros and Cons */}
        {!isCompact && (
          <div className="grid md:grid-cols-2 gap-4">
            {accommodation.pros && accommodation.pros.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-700">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="font-medium text-sm">Pros</span>
                </div>
                <ul className="space-y-1">
                  {accommodation.pros.map((pro, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-start gap-1"
                    >
                      <span className="text-green-500 text-xs mt-1">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {accommodation.cons && accommodation.cons.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-700">
                  <ThumbsDown className="h-4 w-4" />
                  <span className="font-medium text-sm">Cons</span>
                </div>
                <ul className="space-y-1">
                  {accommodation.cons.map((con, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-start gap-1"
                    >
                      <span className="text-red-500 text-xs mt-1">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        {!isCompact && accommodation.tips && accommodation.tips.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-700">
              <Lightbulb className="h-4 w-4" />
              <span className="font-medium text-sm">Student Tips</span>
            </div>
            <ul className="space-y-1">
              {accommodation.tips.map((tip, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 flex items-start gap-1"
                >
                  <span className="text-amber-500 text-xs mt-1">💡</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Booking Advice */}
        {!isCompact && accommodation.bookingAdvice && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-amber-800 font-medium text-sm mb-1">
              How to book:
            </div>
            <p className="text-amber-700 text-sm">
              {accommodation.bookingAdvice}
            </p>
          </div>
        )}

        {/* Compact view action */}
        {isCompact && (
          <Button variant="outline" size="sm" className="w-full">
            View Full Experience
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
