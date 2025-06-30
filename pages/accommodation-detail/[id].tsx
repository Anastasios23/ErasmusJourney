import { useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../../components/Header";
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

interface AccommodationDetailPageProps {
  accommodation: AccommodationDetail | null;
}

export default function AccommodationDetailPage({
  accommodation,
}: AccommodationDetailPageProps) {
  const router = useRouter();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  if (!accommodation) {
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
              <Link href="/student-accommodations">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Accommodations
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
    "Washing Machine": <Washing_machine className="h-4 w-4" />,
    "Air Conditioning": <AirVent className="h-4 w-4" />,
    Parking: <Car className="h-4 w-4" />,
    "Private Bathroom": <ShowerHead className="h-4 w-4" />,
  };

  const handleContactStudent = () => {
    if (accommodation.contact.allowContact && accommodation.contact.email) {
      window.location.href = `mailto:${accommodation.contact.email}?subject=Question about your accommodation in ${accommodation.city}`;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${accommodation.accommodationType} in ${accommodation.neighborhood}`,
          text: `Check out this accommodation in ${accommodation.city}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <Head>
        <title>
          {accommodation.accommodationType} in {accommodation.neighborhood} -{" "}
          {accommodation.city} | Erasmus Journey
        </title>
        <meta
          name="description"
          content={`${accommodation.accommodationType} in ${accommodation.city} for €${accommodation.monthlyRent}/month. Shared by ${accommodation.studentName}.`}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Back Navigation */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Accommodations
              </Button>
            </div>

            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {accommodation.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    )}
                    {accommodation.verified && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {accommodation.accommodationType} in{" "}
                    {accommodation.neighborhood}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {accommodation.city}, {accommodation.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">
                        {accommodation.rating}/5
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(
                          accommodation.datePosted,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className={isLiked ? "text-red-500 border-red-500" : ""}
                  >
                    <Heart
                      className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
                    />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Flag className="h-4 w-4 mr-1" />
                    Report
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Photo Gallery */}
                <Card>
                  <CardContent className="p-0">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={accommodation.photos[selectedPhotoIndex]}
                        alt={`${accommodation.accommodationType} photo ${selectedPhotoIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {accommodation.photos.length > 1 && (
                      <div className="p-4 flex gap-2 overflow-x-auto">
                        {accommodation.photos.map((photo, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedPhotoIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                              selectedPhotoIndex === index
                                ? "border-blue-500"
                                : "border-gray-200"
                            }`}
                          >
                            <img
                              src={photo}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

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
                        <h3 className="text-lg font-semibold mb-4">
                          Description
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {accommodation.description}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Highlights
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {accommodation.highlights.map((highlight, index) => (
                            <Badge key={index} variant="secondary">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Room Details
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {accommodation.roomDetails.bedrooms}
                            </div>
                            <div className="text-sm text-gray-600">
                              Bedrooms
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {accommodation.roomDetails.bathrooms}
                            </div>
                            <div className="text-sm text-gray-600">
                              Bathrooms
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {accommodation.roomDetails.totalArea}m²
                            </div>
                            <div className="text-sm text-gray-600">Area</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {accommodation.roomDetails.furnished
                                ? "Yes"
                                : "No"}
                            </div>
                            <div className="text-sm text-gray-600">
                              Furnished
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="facilities">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Available Facilities
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {accommodation.facilities.map((facility, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              {facilityIcons[facility] || (
                                <Home className="h-4 w-4" />
                              )}
                              <span>{facility}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="location">
                    <Card>
                      <CardContent className="pt-6 space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            Address
                          </h3>
                          <p className="text-gray-700">
                            {accommodation.address}
                          </p>
                          <p className="text-gray-600">
                            {accommodation.neighborhood}, {accommodation.city}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            Transportation
                          </h3>
                          <p className="text-gray-700">
                            {accommodation.transportLinks}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            Nearby Amenities
                          </h3>
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
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">
                                Finding Difficulty
                              </span>
                              <span className="text-sm text-gray-600">
                                {accommodation.evaluation.findingDifficulty}/5
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(accommodation.evaluation.findingDifficulty / 5) * 100}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <span className="text-sm font-medium">
                              Would Recommend:{" "}
                            </span>
                            <Badge
                              variant={
                                accommodation.evaluation.wouldRecommend
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {accommodation.evaluation.wouldRecommend
                                ? "Yes"
                                : "No"}
                            </Badge>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Tips from Student
                            </h4>
                            <p className="text-gray-700 text-sm">
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
              <div className="space-y-6">
                {/* Price Card */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        €{accommodation.monthlyRent}
                        <span className="text-lg text-gray-500">/month</span>
                      </div>
                      {accommodation.billsIncluded ? (
                        <Badge className="bg-green-100 text-green-800">
                          Bills Included
                        </Badge>
                      ) : (
                        <div className="text-sm text-gray-600">
                          + €{accommodation.utilityCosts} utilities/month
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {accommodation.contact.allowContact && (
                        <Button
                          className="w-full"
                          onClick={handleContactStudent}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Contact Student
                        </Button>
                      )}

                      {accommodation.contact.bookingLink && (
                        <Button variant="outline" className="w-full" asChild>
                          <a
                            href={accommodation.contact.bookingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Booking Link
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Student Info */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">Shared by</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${accommodation.studentName}`}
                        />
                        <AvatarFallback>
                          {accommodation.studentName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {accommodation.studentName}
                        </div>
                        <div className="text-sm text-gray-600">
                          Erasmus Student
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </CardContent>
                </Card>

                {/* Landlord Info */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Landlord Contact
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span>{" "}
                        {accommodation.landlord.name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        <a
                          href={`mailto:${accommodation.landlord.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {accommodation.landlord.email}
                        </a>
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span>{" "}
                        <a
                          href={`tel:${accommodation.landlord.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {accommodation.landlord.phone}
                        </a>
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

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { id } = params!;

  // Sample accommodation data (in production this would come from your database)
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
    "2": {
      id: "2",
      studentName: "Andreas M.",
      accommodationType: "Student Residence",
      city: "Prague",
      country: "Czech Republic",
      neighborhood: "New Town",
      address: "Wenceslas Square 15, 110 00 Prague, Czech Republic",
      monthlyRent: 450,
      billsIncluded: true,
      utilityCosts: 0,
      rating: 4,
      datePosted: "2024-01-12",
      description:
        "Modern student residence with great facilities and international community. 15 minutes to Charles University by tram. Includes gym and study rooms. Perfect for students who want to be part of an international community.",
      highlights: [
        "Student community",
        "Affordable price",
        "Good facilities",
        "International environment",
        "All bills included",
        "24/7 security",
      ],
      contact: {
        email: "andreas.m@uni.cz",
        allowContact: true,
      },
      landlord: {
        name: "Student Housing Prague",
        email: "info@studenthousing.cz",
        phone: "+420 224 123 456",
      },
      facilities: [
        "Wifi",
        "Shared Kitchen",
        "Gym",
        "Study Room",
        "Laundry",
        "Common Room",
      ],
      nearbyAmenities: [
        "Tram Stop",
        "Shopping Center",
        "Park",
        "Library",
        "Restaurants",
        "Bank",
      ],
      transportLinks:
        "Tram 22 - direct to university (15 min), Metro A line - 10 min walk",
      photos: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800&h=600&fit=crop",
      ],
      verified: true,
      featured: false,
      roomDetails: {
        bedrooms: 1,
        bathrooms: 1,
        totalArea: 20,
        furnished: true,
      },
      evaluation: {
        findingDifficulty: 2,
        wouldRecommend: true,
        tips: "Great choice for first-time exchange students. Apply early for better room selection. The community events are amazing for meeting people.",
      },
    },
  };

  const accommodation = sampleAccommodations[id as string] || null;

  return {
    props: {
      accommodation,
    },
  };
};
