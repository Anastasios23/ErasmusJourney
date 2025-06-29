import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Badge } from "../src/components/ui/badge";
import { Card, CardContent } from "../src/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import { Label } from "../src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
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
  Globe,
  Euro,
  Users,
  Wifi,
  Car,
  Utensils,
} from "lucide-react";

interface AccommodationListing {
  id: string;
  studentName: string;
  accommodationType: string;
  city: string;
  country: string;
  neighborhood: string;
  monthlyRent: number;
  rating: number;
  datePosted: string;
  description: string;
  highlights: string[];
  contact: {
    email?: string;
    phone?: string;
    allowContact: boolean;
  };
  facilities: string[];
  nearbyAmenities: string[];
  transportLinks: string;
  photos: string[];
  verified: boolean;
  featured: boolean;
}

export default function StudentAccommodations() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  // Sample accommodation data
  const accommodationListings: AccommodationListing[] = [
    {
      id: "1",
      studentName: "Maria S.",
      accommodationType: "Private Apartment",
      city: "Barcelona",
      country: "Spain",
      neighborhood: "Eixample",
      monthlyRent: 850,
      rating: 5,
      datePosted: "2024-01-15",
      description:
        "Beautiful 1-bedroom apartment in the heart of Barcelona, 10 minutes walk to UPC. Fully furnished with modern amenities. Great neighborhood with lots of cafes and restaurants.",
      highlights: [
        "Close to university",
        "Modern furnishing",
        "Great location",
        "Quiet neighborhood",
      ],
      contact: {
        email: "maria.s@university.edu",
        allowContact: true,
      },
      facilities: ["Wifi", "Kitchen", "Washing Machine", "Air Conditioning"],
      nearbyAmenities: ["Supermarket", "Metro", "Restaurants", "Pharmacy"],
      transportLinks: "Metro L2 - 5 min walk, Bus 24 - 2 min walk",
      photos: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
      ],
      verified: true,
      featured: true,
    },
    {
      id: "2",
      studentName: "Andreas M.",
      accommodationType: "Student Residence",
      city: "Prague",
      country: "Czech Republic",
      neighborhood: "New Town",
      monthlyRent: 450,
      rating: 4,
      datePosted: "2024-01-12",
      description:
        "Modern student residence with great facilities and international community. 15 minutes to Charles University by tram. Includes gym and study rooms.",
      highlights: [
        "Student community",
        "Affordable price",
        "Good facilities",
        "International environment",
      ],
      contact: {
        email: "andreas.m@uni.cz",
        allowContact: true,
      },
      facilities: ["Wifi", "Shared Kitchen", "Gym", "Study Room", "Laundry"],
      nearbyAmenities: ["Tram Stop", "Shopping Center", "Park", "Library"],
      transportLinks: "Tram 22 - direct to university (15 min)",
      photos: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
      ],
      verified: true,
      featured: false,
    },
    {
      id: "3",
      studentName: "Elena K.",
      accommodationType: "Shared Apartment",
      city: "Paris",
      country: "France",
      neighborhood: "Latin Quarter",
      monthlyRent: 700,
      rating: 4,
      datePosted: "2024-01-10",
      description:
        "Charming shared apartment in the Latin Quarter, walking distance to Sorbonne. Shared with 2 other international students. Historic building with character.",
      highlights: [
        "Historic location",
        "Walking to university",
        "International flatmates",
        "Cultural area",
      ],
      contact: {
        allowContact: false,
      },
      facilities: ["Wifi", "Shared Kitchen", "Shared Bathroom"],
      nearbyAmenities: ["University", "Metro", "Cafes", "Bookshops"],
      transportLinks: "Walking distance to Sorbonne, Metro Saint-Michel",
      photos: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
      ],
      verified: true,
      featured: false,
    },
  ];

  // Filter options
  const cities = [...new Set(accommodationListings.map((a) => a.city))].sort();
  const countries = [
    ...new Set(accommodationListings.map((a) => a.country)),
  ].sort();
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

    const matchesCountry =
      selectedCountry === "" ||
      selectedCountry === "all-countries" ||
      listing.country === selectedCountry;

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
      matchesCountry &&
      matchesType &&
      matchesBudget &&
      matchesRating
    );
  });

  const handleContactStudent = (listing: AccommodationListing) => {
    if (listing.contact.allowContact && listing.contact.email) {
      window.location.href = `mailto:${listing.contact.email}?subject=Question about your accommodation in ${listing.city}`;
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/accommodation-detail/${id}`);
  };

  return (
    <>
      <Head>
        <title>Student Accommodations - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Find accommodation recommendations from fellow Erasmus students"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Student Accommodations
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Find accommodation recommendations from fellow Erasmus students
                who've already lived in your destination city.
              </p>
            </div>

            {/* Search and Filters */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                  <div className="lg:col-span-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="search"
                        placeholder="Search by city, student, or area..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={selectedCountry}
                      onValueChange={setSelectedCountry}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Countries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-countries">
                          All Countries
                        </SelectItem>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="city">City</Label>
                    <Select
                      value={selectedCity}
                      onValueChange={setSelectedCity}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Cities" />
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
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={selectedType}
                      onValueChange={setSelectedType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
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
                  </div>

                  <div>
                    <Label htmlFor="budget">Max Budget</Label>
                    <Select value={maxBudget} onValueChange={setMaxBudget}>
                      <SelectTrigger>
                        <SelectValue placeholder="No Limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-limit">No Limit</SelectItem>
                        <SelectItem value="500">€500</SelectItem>
                        <SelectItem value="700">€700</SelectItem>
                        <SelectItem value="1000">€1000</SelectItem>
                        <SelectItem value="1500">€1500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Found {filteredListings.length} accommodation{" "}
                {filteredListings.length === 1 ? "listing" : "listings"}
              </p>
              <Link href="/accommodation">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Share Your Accommodation
                </Button>
              </Link>
            </div>

            {/* Accommodation Listings */}
            <div className="space-y-6">
              {filteredListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Image */}
                      <div className="lg:col-span-1">
                        <div className="aspect-video overflow-hidden rounded-lg">
                          <img
                            src={listing.photos[0]}
                            alt={`${listing.accommodationType} in ${listing.city}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {listing.featured && (
                          <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                            Featured
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="lg:col-span-2 space-y-4">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">
                                {listing.accommodationType} in{" "}
                                {listing.neighborhood}
                              </h3>
                              <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {listing.city}, {listing.country}
                                </span>
                                {listing.verified && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="font-medium">
                                {listing.rating}
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">
                            {listing.description}
                          </p>

                          {/* Highlights */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {listing.highlights.map((highlight, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {highlight}
                              </Badge>
                            ))}
                          </div>

                          {/* Facilities */}
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            {listing.facilities.slice(0, 4).map((facility) => (
                              <div
                                key={facility}
                                className="flex items-center gap-1"
                              >
                                {facility === "Wifi" && (
                                  <Wifi className="h-3 w-3" />
                                )}
                                {facility === "Kitchen" && (
                                  <Utensils className="h-3 w-3" />
                                )}
                                {facility === "Parking" && (
                                  <Car className="h-3 w-3" />
                                )}
                                <span>{facility}</span>
                              </div>
                            ))}
                            {listing.facilities.length > 4 && (
                              <span className="text-blue-600">
                                +{listing.facilities.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="lg:col-span-1 flex flex-col justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            €{listing.monthlyRent}
                            <span className="text-sm text-gray-500">
                              /month
                            </span>
                          </div>

                          {/* Student Info */}
                          <div className="flex items-center gap-2 mb-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.studentName}`}
                              />
                              <AvatarFallback>
                                {listing.studentName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">
                                {listing.studentName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(
                                  listing.datePosted,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button
                            className="w-full"
                            onClick={() => handleViewDetails(listing.id)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </Button>

                          {listing.contact.allowContact && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleContactStudent(listing)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Contact Student
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredListings.length === 0 && (
              <div className="text-center py-12">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No accommodations found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or be the first to share
                  accommodation info for this location.
                </p>
                <Link href="/accommodation">
                  <Button>Share Your Accommodation</Button>
                </Link>
              </div>
            )}

            {/* CTA Section */}
            <Card className="mt-12 bg-blue-50 border-blue-200">
              <CardContent className="pt-8 pb-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Help Future Students Find Great Housing
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Share details about your accommodation to help other students
                  find great places to live during their Erasmus experience.
                </p>
                <Link href="/accommodation">
                  <Button size="lg">
                    <Home className="h-5 w-5 mr-2" />
                    Share Your Accommodation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
