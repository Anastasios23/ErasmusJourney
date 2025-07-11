import { useState, useMemo } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Fuse from "fuse.js";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import Header from "../components/Header";
import {
  MapPin,
  Star,
  Euro,
  Users,
  Filter,
  Search,
  ArrowRight,
  Globe,
  Calendar,
} from "lucide-react";

// Sample data - in production this would come from your database
const destinations = [
  {
    id: "barcelona",
    city: "Barcelona",
    country: "Spain",
    region: "Southern Europe",
    image:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=300&fit=crop",
    description:
      "A vibrant Mediterranean city perfect for students seeking culture, beaches, and excellent universities.",
    costLevel: "medium",
    rating: 4.8,
    studentCount: 1200,
    popularUniversities: [
      "Universitat Politècnica de Catalunya",
      "Universitat de Barcelona",
      "Universitat Pompeu Fabra",
    ],
    highlights: [
      "Beautiful architecture",
      "Beach proximity",
      "Rich cultural scene",
    ],
    avgCostPerMonth: 800,
  },
  {
    id: "prague",
    city: "Prague",
    country: "Czech Republic",
    region: "Central Europe",
    image:
      "https://images.unsplash.com/photo-1542324151-ee2b73cb0d95?w=400&h=300&fit=crop",
    description:
      "A historic gem in Central Europe offering affordable living and world-class education.",
    costLevel: "low",
    rating: 4.6,
    studentCount: 800,
    popularUniversities: [
      "Charles University",
      "Czech Technical University",
      "University of Economics",
    ],
    highlights: [
      "Historic architecture",
      "Affordable living",
      "Central European culture",
    ],
    avgCostPerMonth: 600,
  },
  {
    id: "paris",
    city: "Paris",
    country: "France",
    region: "Western Europe",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop",
    description:
      "The City of Light offers unparalleled cultural experiences and prestigious universities.",
    costLevel: "high",
    rating: 4.7,
    studentCount: 2000,
    popularUniversities: [
      "Sorbonne University",
      "École Normale Supérieure",
      "Sciences Po",
    ],
    highlights: [
      "World-class museums",
      "Fashion capital",
      "Culinary excellence",
    ],
    avgCostPerMonth: 1200,
  },
  {
    id: "berlin",
    city: "Berlin",
    country: "Germany",
    region: "Central Europe",
    image:
      "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&h=300&fit=crop",
    description:
      "A dynamic city with rich history, vibrant nightlife, and excellent educational opportunities.",
    costLevel: "medium",
    rating: 4.5,
    studentCount: 1500,
    popularUniversities: [
      "Humboldt University",
      "Technical University of Berlin",
      "Free University of Berlin",
    ],
    highlights: ["Rich history", "Vibrant nightlife", "Tech hub"],
    avgCostPerMonth: 900,
  },
  {
    id: "amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    region: "Western Europe",
    image:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop",
    description:
      "Liberal, multicultural city known for its canals, bikes, and innovative universities.",
    costLevel: "high",
    rating: 4.6,
    studentCount: 900,
    popularUniversities: [
      "University of Amsterdam",
      "VU Amsterdam",
      "Amsterdam University of Applied Sciences",
    ],
    highlights: ["Canal system", "Bike-friendly", "Liberal culture"],
    avgCostPerMonth: 1100,
  },
  {
    id: "rome",
    city: "Rome",
    country: "Italy",
    region: "Southern Europe",
    image:
      "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&h=300&fit=crop",
    description:
      "The Eternal City combines ancient history with modern student life and amazing cuisine.",
    costLevel: "medium",
    rating: 4.4,
    studentCount: 700,
    popularUniversities: [
      "Sapienza University of Rome",
      "Roma Tre University",
      "LUISS University",
    ],
    highlights: ["Ancient history", "Amazing cuisine", "Art everywhere"],
    avgCostPerMonth: 750,
  },
];

export default function Destinations() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCostLevel, setSelectedCostLevel] = useState("");

  // Configure Fuse.js for fuzzy search
  const fuseOptions = {
    keys: [
      { name: "city", weight: 0.3 },
      { name: "country", weight: 0.3 },
      { name: "description", weight: 0.2 },
      { name: "popularUniversities", weight: 0.1 },
      { name: "highlights", weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
  };

  const fuse = useMemo(() => new Fuse(destinations, fuseOptions), []);

  // Get unique values for filters
  const regions = [...new Set(destinations.map((dest) => dest.region))].sort();
  const costLevels = ["low", "medium", "high"];

  // Filter destinations using Fuse.js and other filters
  const filteredDestinations = useMemo(() => {
    let results = destinations;

    // Apply fuzzy search if search term exists
    if (searchTerm.trim()) {
      const fuseResults = fuse.search(searchTerm.trim());
      results = fuseResults.map((result) => result.item);
    }

    // Apply cost filter
    if (selectedCostLevel && selectedCostLevel !== "all-costs") {
      results = results.filter((dest) => dest.costLevel === selectedCostLevel);
    }

    return results;
  }, [searchTerm, selectedCostLevel, fuse]);

  const getCostBadgeColor = (cost: string) => {
    switch (cost) {
      case "low":
        return "bg-green-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "high":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleDestinationClick = (destinationId: string) => {
    router.push(`/destinations/${destinationId}`);
  };

  return (
    <>
      <Head>
        <title>Destinations - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Explore amazing destinations for your Erasmus exchange program"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Explore Destinations
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover amazing cities and universities across Europe for your
                Erasmus exchange experience.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search cities, countries, universities, or highlights..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-4">
                  <Select
                    value={selectedCostLevel}
                    onValueChange={setSelectedCostLevel}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Cost Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-costs">All Cost Levels</SelectItem>
                      {costLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)} Cost
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Clear Filters Button */}
                  {(searchTerm || selectedCostLevel) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCostLevel("");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Results count */}
              <div className="text-left mt-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredDestinations.length} of {destinations.length}{" "}
                  European destinations
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
              </div>
            </div>

            {/* Destinations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((destination) => (
                <Card
                  key={destination.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleDestinationClick(destination.id)}
                >
                  <div className="aspect-video overflow-hidden rounded-t-lg relative">
                    <Image
                      src={destination.image}
                      alt={`${destination.city}, ${destination.country} - Beautiful cityscape showing iconic landmarks and architecture perfect for Erasmus students`}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                      priority={filteredDestinations.indexOf(destination) < 3}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {destination.city}
                        </CardTitle>
                        <p className="text-gray-600 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {destination.country}
                        </p>
                      </div>
                      <Badge
                        className={getCostBadgeColor(destination.costLevel)}
                      >
                        {destination.costLevel} cost
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {destination.description}
                    </p>

                    {/* Stats */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {destination.rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          {destination.studentCount} students
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Euro className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          €{destination.avgCostPerMonth}/mo
                        </span>
                      </div>
                    </div>

                    {/* Universities */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Popular Universities:
                      </h4>
                      <div className="space-y-1">
                        {destination.popularUniversities
                          .slice(0, 2)
                          .map((uni, index) => (
                            <p key={index} className="text-xs text-gray-600">
                              • {uni}
                            </p>
                          ))}
                        {destination.popularUniversities.length > 2 && (
                          <p className="text-xs text-blue-600">
                            +{destination.popularUniversities.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {destination.highlights
                        .slice(0, 3)
                        .map((highlight, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {highlight}
                          </Badge>
                        ))}
                    </div>

                    <Button className="w-full" variant="outline">
                      Learn More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredDestinations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">
                  No destinations found matching your criteria.
                </div>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search terms or filters to find more
                  destinations.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCostLevel("");
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* CTA Section */}
            <section className="mt-16">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-8 pb-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Start Your Adventure?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Explore detailed information about each destination, connect
                    with other students, and start planning your Erasmus
                    journey.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/basic-information">
                      <Button size="lg">Start Your Application</Button>
                    </Link>
                    <Link href="/student-stories">
                      <Button variant="outline" size="lg">
                        Read Student Stories
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
