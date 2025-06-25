import { useState } from "react";
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
import { Link } from "react-router-dom";
import {
  getAllDestinations,
  getTestimonialsByDestination,
  ERASMUS_DESTINATIONS,
} from "@/data/destinations";
import { getAllUniversities } from "@/data/universities";
import {
  getAllCityDestinations,
  getCityDestinationsByCountry,
  getUniqueCountries,
  searchDestinations,
  CityDestination,
} from "@/data/citiesDestinations";

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCostLevel, setSelectedCostLevel] = useState("");

  const cityDestinations = getAllCityDestinations();
  const universities = getAllUniversities();

  // Get unique values for filters
  const countries = getUniqueCountries();
  const cities = [...new Set(cityDestinations.map((dest) => dest.city))].sort();
  const costLevels = ["low", "medium", "high"];
  // Removed academic fields filter as requested

  // Filter destinations based on search criteria
  const filteredDestinations = cityDestinations.filter((dest) => {
    const matchesSearch =
      searchTerm === "" ||
      dest.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.popularUniversities.some((uni) =>
        uni.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCountry =
      selectedCountry === "" ||
      selectedCountry === "all-countries" ||
      dest.country === selectedCountry;

    const matchesCity =
      selectedCity === "" ||
      selectedCity === "all-cities" ||
      dest.city === selectedCity;

    const matchesCost =
      selectedCostLevel === "" ||
      selectedCostLevel === "all-costs" ||
      dest.costLevel === selectedCostLevel;

    return matchesSearch && matchesCountry && matchesCity && matchesCost;
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-white/20 text-white border-white/30"
            >
              Erasmus Destinations
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Choose Your Destination
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover amazing universities and cities across Europe where
              Cyprus students are studying. Find your perfect match based on
              academics, cost, and lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/basic-information" />
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search cities or universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-countries">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select onValueChange={setSelectedCostLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Cost Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-costs">All Costs</SelectItem>
                {costLevels.map((cost) => (
                  <SelectItem key={cost} value={cost}>
                    {cost.charAt(0).toUpperCase() + cost.slice(1)} Cost
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCountry("");
                setSelectedCity("");
                setSelectedCostLevel("");
                setSelectedField("");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-600">
            Showing {filteredDestinations.length} of {cityDestinations.length}{" "}
            destinations
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination) => {
              const avgRating =
                destination.testimonials.length > 0
                  ? destination.testimonials.reduce(
                      (acc, t) => acc + t.rating,
                      0,
                    ) / destination.testimonials.length
                  : 0;

              return (
                <Card
                  key={destination.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() =>
                    window.open(`/destination/${destination.id}`, "_blank")
                  }
                >
                  <CardContent className="p-0">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={destination.imageUrl || `/api/placeholder/400/250`}
                        alt={destination.city}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge
                          className={getCostBadgeColor(destination.costLevel)}
                        >
                          {destination.costLevel} cost
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge
                          variant="secondary"
                          className="bg-white/90 text-gray-900"
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          {destination.language.split(" ")[0]}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {destination.city}
                          </h3>
                          <p className="text-gray-600">{destination.country}</p>
                        </div>
                        {avgRating > 0 && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">
                              {avgRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {destination.popularUniversities[0]} +{" "}
                        {destination.popularUniversities.length - 1} more
                      </p>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {destination.description}
                      </p>

                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Euro className="h-4 w-4 mr-1" />
                        {destination.averageRent} rent
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="text-xs">
                          {destination.climate.split(" ")[0]} Climate
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {destination.attractions.length} Attractions
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <Users className="h-3 w-3 mr-1" />
                          {destination.testimonials.length} review
                          {destination.testimonials.length !== 1 ? "s" : ""}
                        </div>

                        <Link to={`/destination/${destination.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Learn More
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredDestinations.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No destinations found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or clearing the filters.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Found your perfect destination? Start your Erasmus application
            process and join thousands of students already studying abroad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/basic-information">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Start Application
              </Button>
            </Link>
            <Link to="/experiences">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Read Student Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Destinations;
