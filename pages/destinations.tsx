import { useState, useMemo, useEffect } from "react";
import { ERASMUS_DESTINATIONS } from "../src/data/destinations";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Fuse from "fuse.js";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
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
import Header from "../components/Header";
import {
  MapPin,
  Star,
  Euro,
  Users,
  Search,
  ArrowRight,
  FilterX,
} from "lucide-react";
import { DestinationSkeleton } from "../src/components/ui/destination-skeleton";

export default function Destinations() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCostLevel, setSelectedCostLevel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [destinations, setDestinations] = useState([]); // Make this dynamic
  const [error, setError] = useState<string | null>(null);

  // Load dynamic destination data
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/destinations");

        if (!response.ok) {
          throw new Error("Failed to fetch destinations");
        }

        const data = await response.json();

        // Transform API data to match component expectations
        const transformedDestinations = data.destinations.map((dest: any) => ({
          id: dest.id,
          city: dest.city,
          country: dest.country,
          image: dest.image,
          description: dest.description,
          costLevel: dest.costLevel,
          rating: dest.rating,
          studentCount: dest.studentCount,
          popularUniversities: dest.popularUniversities,
          highlights: dest.universities ? dest.universities.slice(0, 3) : [], // Use universities as highlights for now
          avgCostPerMonth: dest.avgCostPerMonth,
          region: getRegionFromCountry(dest.country),
        }));

        setDestinations(transformedDestinations);
      } catch (error) {
        console.error("Error fetching destinations:", error);
        setError("Failed to load destinations");
        // Fallback to static data if API fails and ERASMUS_DESTINATIONS exists
        if (ERASMUS_DESTINATIONS) {
          setDestinations(
            ERASMUS_DESTINATIONS.map((dest) => ({
              ...dest,
              studentCount: 0,
              popularUniversities: [dest.university],
              highlights: dest.popularWith ? dest.popularWith.slice(0, 3) : [],
              avgCostPerMonth: dest.averageRent * 1.5,
            })),
          );
        } else {
          // Create empty state if no static data available
          setDestinations([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const getRegionFromCountry = (country: string) => {
    const regions: Record<string, string> = {
      Germany: "Central Europe",
      "Czech Republic": "Central Europe",
      Spain: "Southern Europe",
      Italy: "Southern Europe",
      France: "Western Europe",
      Netherlands: "Western Europe",
    };
    return regions[country] || "Europe";
  };

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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCostLevel("");
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
                    <Button variant="outline" onClick={clearFilters}>
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
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <DestinationSkeleton key={index} />
                ))}
              </div>
            ) : (
              <>
                {filteredDestinations.length > 0 ? (
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
                            priority={
                              filteredDestinations.indexOf(destination) < 3
                            }
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
                              className={getCostBadgeColor(
                                destination.costLevel,
                              )}
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
                                  <p
                                    key={index}
                                    className="text-xs text-gray-600"
                                  >
                                    • {uni}
                                  </p>
                                ))}
                              {destination.popularUniversities.length > 2 && (
                                <p className="text-xs text-blue-600">
                                  +{destination.popularUniversities.length - 2}{" "}
                                  more
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
                ) : (
                  <div className="text-center py-12 col-span-full">
                    <div className="bg-white p-8 rounded-lg shadow-md">
                      <FilterX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        No Destinations Found
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        We couldn't find any destinations matching your search
                        for "{searchTerm}". Try adjusting your filters or search
                        terms.
                      </p>
                      <Button onClick={clearFilters} size="lg">
                        Clear All Filters
                      </Button>
                      <div className="mt-6 text-sm text-gray-500">
                        <p>Popular searches:</p>
                        <div className="flex gap-2 justify-center mt-2">
                          <Button
                            variant="link"
                            className="text-blue-600"
                            onClick={() => setSearchTerm("Spain")}
                          >
                            Spain
                          </Button>
                          <Button
                            variant="link"
                            className="text-blue-600"
                            onClick={() => setSearchTerm("Germany")}
                          >
                            Germany
                          </Button>
                          <Button
                            variant="link"
                            className="text-blue-600"
                            onClick={() => setSearchTerm("low cost")}
                          >
                            Low Cost
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Show error message if API fails */}
            {error && !isLoading && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  {error}. Showing available destinations from our database.
                </p>
              </div>
            )}

            {/* Show data source info */}
            {!isLoading && destinations.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  📊 This data is generated from{" "}
                  <strong>
                    {destinations.reduce(
                      (sum, dest) => sum + dest.studentCount,
                      0,
                    )}{" "}
                    real student experiences
                  </strong>
                  {destinations.some((dest) => dest.studentCount > 0) &&
                    ". Click on any destination to see detailed experiences from students who studied there."}
                </p>
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
