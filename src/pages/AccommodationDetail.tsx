import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { getAllTestimonials } from "@/data/destinations";
import {
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Mail,
  Home,
  Wifi,
  Car,
  Users,
  Shield,
  Heart,
} from "lucide-react";

// Use the same data generation logic as StudentAccommodations
const generateAccommodationListings = () => {
  const testimonials = getAllTestimonials();

  const bookingWebsites = [
    "WG-Gesucht.de",
    "Studenten-WG.de",
    "Airbnb",
    "Spotahome",
    "HousingAnywhere",
    "Erasmusu",
    "Uniplaces",
    "Student.com",
  ];

  return testimonials.map((testimonial, index) => ({
    id: index + 1,
    studentName: testimonial.studentName,
    studentAvatar:
      index === 0
        ? "https://cdn.builder.io/api/v1/image/assets%2F3ab1e1015f654e219ee7dc3d44bc47c8%2F76989c425d164c7683fb6621d949af84?format=webp&width=800"
        : `https://images.unsplash.com/photo-${1500000000000 + index * 100000}?w=150&h=150&fit=crop&crop=face`,
    homeUniversity: testimonial.homeUniversity,
    rating: testimonial.rating,
    semester: testimonial.semester,
    year: testimonial.year,
    accommodationType: testimonial.accommodationType,
    city: testimonial.city,
    neighborhood: testimonial.city === "Barcelona" ? "Gracia" : "City Center",
    monthlyRent: `€${testimonial.monthlyRent}`,
    roomSize: `${15 + Math.floor(Math.random() * 20)}`,
    review: testimonial.accommodationReview,
    wouldRecommend: testimonial.wouldRecommend,
    contactAllowed: index % 4 !== 0,
    bookingWebsite:
      index % 2 === 0 ? bookingWebsites[index % bookingWebsites.length] : null,
    landlordEmail: index % 3 === 0 ? `landlord${index}@example.com` : null,
    transportLinks: "Metro station 5-10 min walk, bus stop 2 min walk",
    nearbyAmenities: [
      "Supermarket",
      "Public Transport",
      "Restaurants",
      "University",
    ],
    amenities: ["WiFi", "Kitchen Access", "Laundry", "Furnished"],
    billsIncluded: index % 3 !== 0,
    country: testimonial.country,
    images: [
      index === 0
        ? "https://cdn.builder.io/api/v1/image/assets%2F3ab1e1015f654e219ee7dc3d44bc47c8%2F76989c425d164c7683fb6621d949af84?format=webp&width=800"
        : `https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800`,
      "https://images.unsplash.com/photo-1515263487990-61b07816b704?w=800",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    ],
  }));
};

const AccommodationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const accommodationListings = generateAccommodationListings();
  const listing = accommodationListings.find(
    (item) => item.id === parseInt(id || "0"),
  );

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Accommodation Not Found
          </h1>
          <Button onClick={() => navigate("/student-accommodations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Accommodations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section with Images */}
      <section className="relative">
        <div className="h-96 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
          <img
            src={listing.images?.[currentImageIndex] || listing.studentAvatar}
            alt={`${listing.accommodationType} in ${listing.neighborhood}`}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute top-6 left-6">
            <Button
              variant="outline"
              onClick={() => navigate("/student-accommodations")}
              className="bg-white/90 hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Button>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {listing.accommodationType} in {listing.neighborhood}
                  </h1>
                  <p className="text-white/90 text-lg">
                    {listing.city} • {listing.monthlyRent} per month
                  </p>
                  {listing.wouldRecommend && (
                    <Badge className="bg-green-500 text-white mt-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </div>

                <div className="text-right text-white">
                  <div className="flex items-center space-x-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < listing.rating
                            ? "text-yellow-400 fill-current"
                            : "text-white/50"
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-semibold">
                      {listing.rating}/5
                    </span>
                  </div>
                  <p className="text-white/80">
                    {listing.semester} {listing.year}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Navigation */}
          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-2">
                {listing.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Student Review */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={listing.studentAvatar}
                        alt={listing.studentName}
                      />
                      <AvatarFallback>
                        {listing.studentName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Review by {listing.studentName}
                      </h3>
                      <p className="text-gray-600">{listing.homeUniversity}</p>
                    </div>
                  </div>

                  <blockquote className="text-gray-700 text-lg leading-relaxed italic border-l-4 border-blue-500 pl-4">
                    "{listing.review}"
                  </blockquote>
                </CardContent>
              </Card>

              {/* Accommodation Details */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    🏠 Accommodation Details
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <span>
                          {listing.neighborhood}, {listing.city}
                        </span>
                      </div>

                      {listing.roomSize && (
                        <div className="flex items-center">
                          <Home className="h-5 w-5 text-gray-400 mr-3" />
                          <span>Room: {listing.roomSize} sqm</span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <span className="text-2xl mr-3">💰</span>
                        <span>
                          Bills{" "}
                          {listing.billsIncluded ? "included" : "not included"}
                          {listing.additionalCosts &&
                            ` (${listing.additionalCosts})`}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.map((amenity) => (
                          <Badge
                            key={amenity}
                            variant="outline"
                            className="text-sm"
                          >
                            {amenity === "WiFi" && (
                              <Wifi className="h-3 w-3 mr-1" />
                            )}
                            {amenity === "Furnished" && (
                              <Home className="h-3 w-3 mr-1" />
                            )}
                            {amenity === "Kitchen Access" && (
                              <span className="mr-1">🍳</span>
                            )}
                            {amenity === "Laundry" && (
                              <span className="mr-1">👕</span>
                            )}
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transport & Location */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    🚌 Transport & Location
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Transportation
                      </h4>
                      <p className="text-gray-600">{listing.transportLinks}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Nearby Amenities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {listing.nearbyAmenities.map((amenity) => (
                          <Badge
                            key={amenity}
                            variant="secondary"
                            className="text-sm"
                          >
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {listing.monthlyRent}
                    </div>
                    <p className="text-gray-600">per month</p>
                  </div>

                  {listing.bookingWebsite && (
                    <div className="space-y-3 mb-6">
                      <Label className="text-sm font-medium text-gray-700">
                        Found via:
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          window.open(
                            `https://${listing.bookingWebsite.toLowerCase().replace(/\s+/g, "")}.com`,
                            "_blank",
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {listing.bookingWebsite}
                      </Button>
                    </div>
                  )}

                  {listing.contactAllowed && (
                    <div className="space-y-3 mb-6">
                      <Label className="text-sm font-medium text-gray-700">
                        Contact Student:
                      </Label>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message {listing.studentName.split(" ")[0]}
                      </Button>
                    </div>
                  )}

                  {listing.landlordEmail && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Landlord Contact:
                      </Label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-blue-600">
                          <Mail className="h-4 w-4 inline mr-2" />
                          {listing.landlordEmail}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                      <Heart className="h-4 w-4 mr-2" />
                      Save to Favorites
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Share with Friends
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      Report Listing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccommodationDetail;
