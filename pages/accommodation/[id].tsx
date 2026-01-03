import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { prisma } from "../../lib/prisma";
import Header from "../../components/Header";
import { useGeneratedContent } from "../../src/hooks/useFormSubmissions";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import { Card, CardContent } from "../../src/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../src/components/ui/avatar";
import { Separator } from "../../src/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../src/components/ui/dialog";
import {
  Star,
  MapPin,
  Euro,
  Calendar,
  CheckCircle,
  Mail,
  Phone,
  ExternalLink,
  ArrowLeft,
  Wifi,
  Car,
  Utensils,
  WashingMachine,
  AirVent,
  ShowerHead,
  Home,
  Users,
  Heart,
  Share2,
  Flag,
  MessageSquare,
} from "lucide-react";

interface AccommodationDetail {
  id: string;
  studentName: string;
  accommodationType: string;
  city: string;
  country: string;
  neighborhood: string;
  address: string;
  monthlyRent: number;
  billsIncluded: boolean;
  utilityCosts: number;
  rating: number;
  datePosted: string;
  description: string;
  highlights: string[];
  contact: {
    email?: string;
    phone?: string;
    bookingLink?: string;
    allowContact: boolean;
  };
  landlord: {
    name: string;
    email: string;
    phone: string;
  };
  facilities: string[];
  nearbyAmenities: string[];
  transportLinks: string;
  photos: string[];
  verified: boolean;
  featured: boolean;
  roomDetails: {
    bedrooms: number;
    bathrooms: number;
    totalArea: number;
    furnished: boolean;
  };
  evaluation: {
    findingDifficulty: number;
    wouldRecommend: boolean;
    tips: string;
  };
}

export default function AccommodationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [accommodation, setAccommodation] =
    useState<AccommodationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's form submissions for personalization (like destinations page)
  const { content: userGeneratedContent } = useGeneratedContent();

  // Ensure userGeneratedContent is an array before filtering
  const userContentArray = Array.isArray(userGeneratedContent)
    ? userGeneratedContent
    : userGeneratedContent?.submissions || userGeneratedContent?.content || [];

  // Filter user content relevant to this accommodation location (similar to destinations page)
  const relevantUserContent =
    userContentArray.filter(
      (content: any) =>
        // Match exact city/country
        content.data?.city?.toLowerCase() ===
          accommodation?.city?.toLowerCase() ||
        content.data?.country?.toLowerCase() ===
          accommodation?.country?.toLowerCase() ||
        // Match host destination from basic-information form
        content.data?.hostCity?.toLowerCase() ===
          accommodation?.city?.toLowerCase() ||
        content.data?.hostCountry?.toLowerCase() ===
          accommodation?.country?.toLowerCase() ||
        // Match preferred destination from form submissions
        content.data?.preferredHostCity?.toLowerCase() ===
          accommodation?.city?.toLowerCase() ||
        content.data?.preferredHostCountry?.toLowerCase() ===
          accommodation?.country?.toLowerCase(),
    ) || [];

  // Check if user has form data matching this accommodation location
  const userHasMatchingDestination = relevantUserContent.some(
    (content: any) =>
      content.data?.hostCity?.toLowerCase() ===
        accommodation?.city?.toLowerCase() ||
      content.data?.preferredHostCity?.toLowerCase() ===
        accommodation?.city?.toLowerCase(),
  );

  // Extract user's academic info for better recommendations
  const userAcademicInfo = userContentArray.find(
    (content: any) =>
      content.data?.universityInCyprus || content.data?.departmentInCyprus,
  )?.data;

  // Load accommodation data when component mounts
  useState(() => {
    if (id) {
      // Simulate API call with sample data (in real app, this would be an API call)
      setTimeout(() => {
        const sampleAccommodations: Record<string, AccommodationDetail> = {
          "1": {
            id: "1",
            studentName: "Maria S.",
            accommodationType: "Private Apartment",
            city: "Barcelona",
            country: "Spain",
            neighborhood: "Eixample",
            address: "Carrer de Mallorca, 123, 08037 Barcelona, Spain",
            monthlyRent: 850,
            billsIncluded: false,
            utilityCosts: 80,
            rating: 5,
            datePosted: "2024-01-15",
            description:
              "Beautiful 1-bedroom apartment in the heart of Barcelona, 10 minutes walk to UPC. Fully furnished with modern amenities. Great neighborhood with lots of cafes and restaurants. The apartment is on the 3rd floor with elevator access and gets plenty of natural light throughout the day.",
            highlights: [
              "Close to university",
              "Modern furnishing",
              "Great location",
              "Quiet neighborhood",
              "Natural light",
              "Elevator access",
            ],
            contact: {
              email: "maria.s@university.edu",
              allowContact: true,
              bookingLink: "https://booking-platform.com/apartment-123",
            },
            landlord: {
              name: "Carlos Martinez",
              email: "carlos.martinez@apartments.es",
              phone: "+34 612 345 678",
            },
            facilities: [
              "Wifi",
              "Kitchen",
              "Washing Machine",
              "Air Conditioning",
              "Private Bathroom",
              "Balcony",
            ],
            nearbyAmenities: [
              "Supermarket",
              "Metro Station",
              "Restaurants",
              "Pharmacy",
              "ATM",
              "Gym",
            ],
            transportLinks:
              "Metro L2 - 5 min walk (Sagrada Familia), Bus 24 - 2 min walk. Direct connection to UPC in 15 minutes.",
            photos: [
              "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop",
              "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
              "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
              "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&h=600&fit=crop",
            ],
            verified: true,
            featured: true,
            roomDetails: {
              bedrooms: 1,
              bathrooms: 1,
              totalArea: 45,
              furnished: true,
            },
            evaluation: {
              findingDifficulty: 3,
              wouldRecommend: true,
              tips: "Contact landlord early as good apartments go fast. Visit in person if possible. The area is safe and very well connected to the university.",
            },
          },
        };

        const foundAccommodation = sampleAccommodations[id as string];
        if (foundAccommodation) {
          setAccommodation(foundAccommodation);
        } else {
          setError("Accommodation not found");
        }
        setIsLoading(false);
      }, 500);
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading Accommodation - Erasmus Journey Platform</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error or not found state
  if (error || !accommodation) {
    return (
      <>
        <Head>
          <title>Accommodation Not Found - Erasmus Journey Platform</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Accommodation Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The accommodation you're looking for doesn't exist or has been
                removed.
              </p>
              <Link href="/destinations">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Destinations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const facilityIcons: Record<string, React.ReactNode> = {
    Wifi: <Wifi className="h-4 w-4" />,
    Kitchen: <Utensils className="h-4 w-4" />,
    "Washing Machine": <WashingMachine className="h-4 w-4" />,
    "Air Conditioning": <AirVent className="h-4 w-4" />,
    Parking: <Car className="h-4 w-4" />,
    "Private Bathroom": <ShowerHead className="h-4 w-4" />,
  };

  const handleContactStudent = () => {
    if (accommodation.contact.email) {
      const subject = `Inquiry about accommodation in ${accommodation.city}`;
      const body = `Hi ${accommodation.studentName},\n\nI'm interested in your accommodation listing in ${accommodation.neighborhood}, ${accommodation.city}. Could you please provide more information?\n\nThanks!`;
      window.location.href = `mailto:${accommodation.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  return (
    <>
      <Head>
        <title>
          {accommodation.accommodationType} in {accommodation.city} - Erasmus
          Journey Platform
        </title>
        <meta
          name="description"
          content={accommodation.description.substring(0, 160)}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Back Navigation */}
            <div className="mb-6">
              <Link href="/destinations">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Destinations
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personalized Alert */}
                {userHasMatchingDestination && (
                  <Card className="mb-6 bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Perfect Match!</span>
                      </div>
                      <p className="text-green-700 mt-1 text-sm">
                        This accommodation is in {accommodation.city}, which
                        matches your selected exchange destination.
                        {userAcademicInfo?.universityInCyprus && (
                          <span>
                            {" "}
                            As a {userAcademicInfo.universityInCyprus} student,
                            this could be ideal for your exchange.
                          </span>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">
                        {accommodation.accommodationType} in{" "}
                        {accommodation.neighborhood}
                      </h1>
                      <div className="flex items-center gap-4 text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {accommodation.city}, {accommodation.country}
                          </span>
                        </div>
                        {accommodation.verified && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Verified</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="font-medium">
                            {accommodation.rating}
                          </span>
                        </div>
                        {accommodation.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsLiked(!isLiked)}
                      >
                        <Heart
                          className={`h-4 w-4 ${isLiked ? "fill-current text-red-500" : ""}`}
                        />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Photo Gallery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="md:col-span-1">
                      <Image
                        src={accommodation.photos[selectedPhotoIndex]}
                        alt="Accommodation"
                        width={600}
                        height={400}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {accommodation.photos.slice(1, 5).map((photo, index) => (
                        <Image
                          key={index}
                          src={photo}
                          alt={`View ${index + 2}`}
                          width={200}
                          height={150}
                          className="w-full h-28 object-cover rounded-lg cursor-pointer hover:opacity-80"
                          onClick={() => setSelectedPhotoIndex(index + 1)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tabs Content */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="facilities">Facilities</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-3">
                          Description
                        </h3>
                        <p className="text-gray-700 mb-4">
                          {accommodation.description}
                        </p>

                        <h4 className="font-semibold mb-2">Highlights</h4>
                        <div className="flex flex-wrap gap-2">
                          {accommodation.highlights.map((highlight, index) => (
                            <Badge key={index} variant="secondary">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* User-generated content relevant to this location */}
                    {relevantUserContent.length > 0 && (
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="text-lg font-semibold mb-3">
                            From Other Students in {accommodation.city}
                          </h3>
                          <div className="space-y-4">
                            {relevantUserContent
                              .slice(0, 2)
                              .map((content: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-blue-50 p-4 rounded-lg"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        {content.user?.name?.charAt(0) || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">
                                      {content.user?.name || "Student"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {content.data?.universityInCyprus} →{" "}
                                      {content.data?.city}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">
                                    {content.data?.accommodationTips ||
                                      content.data?.additionalAdvice}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="facilities">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Available Facilities
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {accommodation.facilities.map((facility) => (
                            <div
                              key={facility}
                              className="flex items-center gap-2"
                            >
                              {facilityIcons[facility] || (
                                <CheckCircle className="h-4 w-4" />
                              )}
                              <span className="text-sm">{facility}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="location">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Location & Transport
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Address</h4>
                            <p className="text-gray-700">
                              {accommodation.address}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">
                              Transport Links
                            </h4>
                            <p className="text-gray-700">
                              {accommodation.transportLinks}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">
                              Nearby Amenities
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {accommodation.nearbyAmenities.map(
                                (amenity, index) => (
                                  <Badge key={index} variant="outline">
                                    {amenity}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="reviews">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Student Evaluation
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">
                              Finding Difficulty
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <=
                                      accommodation.evaluation.findingDifficulty
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                ({accommodation.evaluation.findingDifficulty}/5
                                difficulty)
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">
                              Recommendation
                            </h4>
                            <p className="text-gray-700">
                              {accommodation.evaluation.wouldRecommend
                                ? "✅ Would recommend"
                                : "❌ Would not recommend"}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">
                              Tips for Future Students
                            </h4>
                            <p className="text-gray-700">
                              {accommodation.evaluation.tips}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Price */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Euro className="h-5 w-5 text-green-600" />
                          <span className="text-2xl font-bold">
                            €{accommodation.monthlyRent}
                          </span>
                          <span className="text-gray-600">/ month</span>
                        </div>
                        {!accommodation.billsIncluded && (
                          <p className="text-sm text-gray-600">
                            + €{accommodation.utilityCosts} utilities
                          </p>
                        )}
                        {accommodation.billsIncluded && (
                          <p className="text-sm text-green-600">
                            All bills included
                          </p>
                        )}
                      </div>

                      <Separator />

                      {/* Room Details */}
                      <div>
                        <h4 className="font-semibold mb-2">Room Details</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Bedrooms:</span>
                            <span>{accommodation.roomDetails.bedrooms}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bathrooms:</span>
                            <span>{accommodation.roomDetails.bathrooms}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Area:</span>
                            <span>{accommodation.roomDetails.totalArea}m²</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Furnished:</span>
                            <span>
                              {accommodation.roomDetails.furnished
                                ? "Yes"
                                : "No"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Contact */}
                      <div className="space-y-3">
                        <h4 className="font-semibold">Contact Student</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {accommodation.studentName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {accommodation.studentName}
                              </p>
                              <p className="text-xs text-gray-600">
                                Posted{" "}
                                {new Date(
                                  accommodation.datePosted,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {accommodation.contact.allowContact && (
                            <div className="space-y-2">
                              <Button
                                className="w-full"
                                onClick={handleContactStudent}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Contact Student
                              </Button>
                              {accommodation.contact.bookingLink && (
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  asChild
                                >
                                  <a
                                    href={accommodation.contact.bookingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Book Online
                                  </a>
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Actions */}
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full">
                          <Flag className="h-4 w-4 mr-2" />
                          Report Listing
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
