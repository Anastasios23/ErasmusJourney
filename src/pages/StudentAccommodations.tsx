import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Star,
  Calendar,
  MapPin,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Mail,
  Home,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import {
  Home,
  Star,
  MapPin,
  Euro,
  Wifi,
  Users,
  Search,
  ExternalLink,
  CheckCircle,
  MessageSquare,
  Calendar,
  Utensils,
  Car,
  Zap,
  Droplets,
  ArrowRight,
  Globe,
  Phone,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAllTestimonials } from "@/data/destinations";

interface AccommodationListing {
  id: string;
  studentName: string;
  studentAvatar: string;
  homeUniversity: string;
  city: string;
  country: string;
  accommodationType: string;
  monthlyRent: number;
  address: string;
  neighborhood: string;
  roomSize?: number;
  rating: number;
  review: string;
  landlordEmail?: string;
  bookingWebsite?: string;
  platformUsed: string;
  billsIncluded: boolean;
  additionalCosts?: number;
  amenities: string[];
  nearbyAmenities: string[];
  transportLinks: string;
  wouldRecommend: boolean;
  semester: string;
  year: number;
  contactAllowed: boolean;
  tips: string;
}

const StudentAccommodations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedRating, setSelectedRating] = useState("");

  const testimonials = getAllTestimonials();

  // Transform testimonials into accommodation listings with realistic booking websites
  const accommodationListings: AccommodationListing[] = testimonials.map(
    (testimonial, index) => {
      const bookingWebsites = [
        "WG-Gesucht.de",
        "Studenten-WG.de",
        "Airbnb",
        "Spotahome",
        "HousingAnywhere",
        "Erasmusu",
        "Uniplaces",
        "Student.com",
        "University Housing Portal",
        "Facebook Housing Groups",
        "Local Real Estate Agency",
        "Direct Contact",
      ];

      const platforms = [
        "WG-Gesucht",
        "Studenten-WG",
        "University Portal",
        "Facebook Groups",
        "Spotahome",
        "HousingAnywhere",
        "Local Agency",
        "Erasmusu",
        "Airbnb",
        "Direct Contact",
      ];

      return {
        id: testimonial.id,
        studentName: testimonial.studentName,
        studentAvatar: index === 0
          ? "https://cdn.builder.io/api/v1/image/assets%2F3ab1e1015f654e219ee7dc3d44bc47c8%2F76989c425d164c7683fb6621d949af84?format=webp&width=800"
          : `https://images.unsplash.com/photo-${1500000000000 + index * 100000}?w=150&h=150&fit=crop&crop=face`,
        homeUniversity: testimonial.homeUniversity,
        city: testimonial.city,
        country: testimonial.country,
        accommodationType: testimonial.accommodationType,
        monthlyRent: testimonial.monthlyRent,
        address: `${testimonial.city} City Center`, // Simplified for privacy
        neighborhood: getNeighborhood(testimonial.city),
        roomSize: 15 + Math.floor(Math.random() * 20),
        rating: testimonial.rating,
        review: testimonial.accommodationReview,
        landlordEmail:
          index % 3 === 0 ? `landlord${index}@example.com` : undefined,
        bookingWebsite:
          index % 2 === 0
            ? bookingWebsites[index % bookingWebsites.length]
            : undefined,
        platformUsed: platforms[index % platforms.length],
        billsIncluded: index % 3 !== 0,
        additionalCosts:
          index % 3 === 0 ? 50 + Math.floor(Math.random() * 100) : undefined,
        amenities: getRandomAmenities(),
        nearbyAmenities: getNearbyAmenities(testimonial.city),
        transportLinks: `Metro station 5-10 min walk, Bus stop 2 min walk`,
        wouldRecommend: testimonial.wouldRecommend,
        semester: testimonial.semester,
        year: testimonial.year,
        contactAllowed: index % 4 !== 0,
        tips: getTipsForCity(testimonial.city),
      };
    },
  );

  function getNeighborhood(city: string): string {
    const neighborhoods: { [key: string]: string } = {
      Berlin: "Friedrichshain",
      Barcelona: "Gràcia",
      Amsterdam: "Zuid",
      Vienna: "3rd District",
      Prague: "Vinohrady",
      Stockholm: "Södermalm",
      Toulouse: "Centre",
      Dublin: "Rathmines",
    };
    return neighborhoods[city] || "City Center";
  }

  function getRandomAmenities(): string[] {
    const allAmenities = [
      "Wifi",
      "Kitchen Access",
      "Laundry",
      "Furnished",
      "Parking",
      "Gym",
      "Study Room",
      "Common Area",
    ];
    const count = 3 + Math.floor(Math.random() * 4);
    return allAmenities.slice(0, count);
  }

  function getNearbyAmenities(city: string): string[] {
    return ["Supermarket", "Public Transport", "Restaurants", "University"];
  }

  function getTipsForCity(city: string): string {
    const tips: { [key: string]: string } = {
      Berlin:
        "Start looking early! Housing market is competitive. Check Facebook groups for shared apartments.",
      Barcelona:
        "Avoid touristy areas for better prices. Gothic Quarter is expensive but charming.",
      Amsterdam:
        "Register with housing associations early. Bikes are essential for transport.",
      Vienna:
        "Student housing is affordable. Check ÖH (student union) for recommendations.",
      Prague:
        "Very affordable compared to Western Europe. Dormitories are a great budget option.",
      Stockholm:
        "Housing queue system - register as early as possible. Consider suburbs for better prices.",
      Toulouse:
        "CROUS offers cheap student housing. Pink city is beautiful and affordable.",
      Dublin:
        "Expensive city! Consider sharing to reduce costs. Temple Bar area is fun but pricey.",
    };
    return tips[city] || "Research the area well and start your search early!";
  }

  // Filter accommodations
  const cities = [...new Set(accommodationListings.map((a) => a.city))].sort();
  const types = [
    ...new Set(accommodationListings.map((a) => a.accommodationType)),
  ].sort();

  const filteredListings = accommodationListings.filter((listing) => {
    const matchesSearch =
      searchTerm === "" ||
      listing.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity =
      selectedCity === "" ||
      selectedCity === "all-cities" ||
      listing.city === selectedCity;

    const matchesType =
      selectedType === "" ||
      selectedType === "all-types" ||
      listing.accommodationType === selectedType;

    const matchesBudget =
      maxBudget === "" ||
      maxBudget === "no-limit" ||
      listing.monthlyRent <= parseInt(maxBudget);

    const matchesRating =
      selectedRating === "" ||
      selectedRating === "all-ratings" ||
      listing.rating >= parseInt(selectedRating);

    return (
      matchesSearch &&
      matchesCity &&
      matchesType &&
      matchesBudget &&
      matchesRating
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-white/20 text-white border-white/30"
            >
              Student Accommodations
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Secure Your Stay
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              Find accommodation based on real experiences from students who've
              already lived there. Get insider tips, contact details, and
              booking platforms used by fellow Erasmus students.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto text-center">
              <div>
                <div className="text-3xl font-bold text-green-200 mb-1">
                  {accommodationListings.length}
                </div>
                <div className="text-green-100 text-sm">
                  Verified Accommodations
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-200 mb-1">8</div>
                <div className="text-green-100 text-sm">European Cities</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-200 mb-1">95%</div>
                <div className="text-green-100 text-sm">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-cities">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Accommodation Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setMaxBudget}>
              <SelectTrigger>
                <SelectValue placeholder="Max Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-limit">No Limit</SelectItem>
                <SelectItem value="400">€400</SelectItem>
                <SelectItem value="500">€500</SelectItem>
                <SelectItem value="600">€600</SelectItem>
                <SelectItem value="700">€700</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedRating}>
              <SelectTrigger>
                <SelectValue placeholder="Min Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-ratings">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars Only</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section className="py-4 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-600">
            Showing {filteredListings.length} of {accommodationListings.length}{" "}
            accommodations
          </p>
        </div>
      </section>

      {/* Accommodation Listings */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {filteredListings.map((listing) => (
              <Card
                key={listing.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
                onClick={() => navigate(`/accommodation-detail/${listing.id}`)}
              >
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-3 gap-0">
                    {/* Student Info & Basic Details */}
                    <div className="lg:col-span-2 p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
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
                            <h3 className="font-bold text-lg text-gray-900">
                              {listing.accommodationType} in{" "}
                              {listing.neighborhood}, {listing.city}
                            </h3>
                            <p className="text-gray-600">
                              Reviewed by{" "}
                              <span className="font-medium">
                                {listing.studentName}
                              </span>{" "}
                              from {listing.homeUniversity}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < listing.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="text-sm text-gray-600 ml-1">
                                  {listing.rating}/5
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {listing.semester} {listing.year}
                              </span>
                            </div>
                          </div>
                        </div>
                        {listing.wouldRecommend && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Student Review:
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          "{listing.review}"
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            🏠 Accommodation Details
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {listing.neighborhood}, {listing.city}
                            </li>
                            {listing.roomSize && (
                              <li>📏 Room: {listing.roomSize} sqm</li>
                            )}
                            <li>
                              💰 Bills{" "}
                              {listing.billsIncluded
                                ? "included"
                                : "not included"}
                              {listing.additionalCosts &&
                                ` (+€${listing.additionalCosts}/month)`}
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            🌟 Amenities
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {listing.amenities.map((amenity, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          💡 Insider Tips:
                        </h4>
                        <p className="text-blue-800 text-sm">{listing.tips}</p>
                      </div>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="relative bg-gray-50 p-6 space-y-4">
                      {/* Background Image */}
                      <div className="absolute inset-0 overflow-hidden rounded-r-lg">
                        <img
                          src={listing.studentAvatar}
                          alt={`${listing.accommodationType} in ${listing.neighborhood}`}
                          className="w-full h-full object-cover opacity-10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                      <div className="bg-white border-2 border-green-200 rounded-lg p-4">
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-green-600">
                            €{listing.monthlyRent}
                          </div>
                          <div className="text-sm text-gray-600">per month</div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Found via:
                            </Label>
                            <div className="flex items-center mt-1">
                              <Globe className="h-4 w-4 text-blue-500 mr-2" />
                              <span className="text-sm font-medium">
                                {listing.platformUsed}
                              </span>
                            </div>
                          </div>

                          {listing.bookingWebsite && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Booking Website:
                              </Label>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-1 text-xs"
                                onClick={() =>
                                  window.open(
                                    `https://${listing.bookingWebsite.toLowerCase().replace(/\s+/g, "")}.com`,
                                    "_blank",
                                  )
                                }
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {listing.bookingWebsite}
                              </Button>
                            </div>
                          )}

                          {listing.contactAllowed && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Contact Student:
                              </Label>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Message {listing.studentName.split(" ")[0]}
                              </Button>
                            </div>
                          )}

                          {listing.landlordEmail && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Landlord Contact:
                              </Label>
                              <div className="text-xs text-blue-600 mt-1">
                                <Mail className="h-3 w-3 inline mr-1" />
                                {listing.landlordEmail}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2 text-sm">
                          🚌 Transport & Location
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {listing.transportLinks}
                        </p>
                        <div className="text-xs">
                          <span className="font-medium">Nearby: </span>
                          {listing.nearbyAmenities.join(", ")}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-500">Click to view details</p>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No accommodations found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria to find more options.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Home className="h-12 w-12 text-green-200 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Found Your Perfect Place?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Share your accommodation experience to help future students find
            great places to stay during their Erasmus journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/accommodation">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                Share Your Accommodation
              </Button>
            </Link>
            <Link to="/basic-information">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
                Start Your Application
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentAccommodations;