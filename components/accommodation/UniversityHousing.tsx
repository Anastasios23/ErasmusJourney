import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import { Skeleton } from "../../src/components/ui/skeleton";
import {
  GraduationCap,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  Euro,
  MapPin,
  Clock,
} from "lucide-react";

interface UniversityHousing {
  id: string;
  universityName: string;
  country: string;
  city: string;
  housingOfficeName: string;
  email: string;
  phone?: string;
  website: string;
  applicationDeadline?: string;
  averageRent: {
    min: number;
    max: number;
    currency: string;
  };
  features: string[];
  applicationProcess: string[];
  requirements: string[];
}

interface UniversityHousingProps {
  userCountry?: string;
  userCity?: string;
  userUniversity?: string;
}

export default function UniversityHousing({
  userCountry,
  userCity,
  userUniversity,
}: UniversityHousingProps) {
  const [housings, setHousings] = useState<UniversityHousing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHousings();
  }, [userCountry, userCity, userUniversity]);

  const fetchHousings = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (userCountry && userCountry !== "all") {
        params.append("country", userCountry);
      }
      if (userCity && userCity !== "all") {
        params.append("city", userCity);
      }
      if (userUniversity && userUniversity !== "all") {
        params.append("university", userUniversity);
      }

      const response = await fetch(
        `/api/accommodation/university-housing?${params}`,
      );
      if (response.ok) {
        const data = await response.json();
        setHousings(data.housings || []);
      } else {
        setError("Failed to fetch university housing");
      }
    } catch (err) {
      setError("Error loading university housing");
      console.error("Error fetching university housing:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (
    housing: UniversityHousing,
    method: "email" | "phone" | "website",
  ) => {
    switch (method) {
      case "email":
        window.open(
          `mailto:${housing.email}?subject=Student Accommodation Inquiry&body=Dear ${housing.housingOfficeName},%0A%0AI am an international exchange student and would like to inquire about accommodation options at ${housing.universityName}.%0A%0AThank you for your assistance.%0A%0ABest regards`,
        );
        break;
      case "phone":
        if (housing.phone) {
          window.open(`tel:${housing.phone}`);
        }
        break;
      case "website":
        window.open(housing.website, "_blank");
        break;
    }
  };

  const isDeadlineApproaching = (deadline?: string) => {
    if (!deadline) return false;

    const currentYear = new Date().getFullYear();
    const deadlineDate = new Date(`${deadline} ${currentYear}`);
    const today = new Date();
    const daysDiff = Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24),
    );

    return daysDiff > 0 && daysDiff <= 60; // Within 60 days
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
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <div className="flex gap-2 mb-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-10 w-full" />
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
            <GraduationCap className="h-5 w-5" />
            University Housing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">{error}</p>
            <Button variant="outline" onClick={fetchHousings} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Official University Housing
        </CardTitle>
        <p className="text-sm text-gray-600">
          Connect directly with university housing offices for official
          dormitories and student residences
        </p>
      </CardHeader>
      <CardContent>
        {housings.length === 0 ? (
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {userCity || userCountry
                ? `No university housing information available for ${userCity || userCountry} yet.`
                : "Select your destination to see university housing options."}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              We're constantly adding new university housing information.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {housings.map((housing) => (
              <div
                key={housing.id}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {housing.universityName}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {housing.city}, {housing.country}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {housing.housingOfficeName}
                    </p>
                  </div>
                  {housing.applicationDeadline &&
                    isDeadlineApproaching(housing.applicationDeadline) && (
                      <Badge variant="destructive">
                        <Calendar className="h-3 w-3 mr-1" />
                        Deadline Soon
                      </Badge>
                    )}
                </div>

                {/* Key Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Average Rent
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">
                        {housing.averageRent.min}-{housing.averageRent.max}{" "}
                        {housing.averageRent.currency}/month
                      </span>
                    </div>
                  </div>

                  {housing.applicationDeadline && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600 mb-1">
                        Application Deadline
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">
                          {housing.applicationDeadline}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Contact Methods
                    </div>
                    <div className="flex gap-2">
                      <Mail className="h-4 w-4 text-green-600" />
                      {housing.phone && (
                        <Phone className="h-4 w-4 text-blue-600" />
                      )}
                      <ExternalLink className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Features */}
                {housing.features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Features & Amenities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {housing.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Process */}
                {housing.applicationProcess.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Application Process
                    </h4>
                    <ol className="text-sm text-gray-600 space-y-1">
                      {housing.applicationProcess.map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium min-w-[24px] text-center">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Requirements */}
                {housing.requirements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Requirements
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {housing.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contact Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleContact(housing, "email")}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email Housing Office
                  </Button>

                  {housing.phone && (
                    <Button
                      variant="outline"
                      onClick={() => handleContact(housing, "phone")}
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => handleContact(housing, "website")}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Note */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Pro Tip</h4>
              <p className="text-sm text-yellow-800">
                University housing often fills up quickly. Apply as early as
                possible, even before your exchange is confirmed. Most
                universities prioritize early applications and may have rolling
                admissions.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
