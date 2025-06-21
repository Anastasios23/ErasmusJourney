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

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCostLevel, setSelectedCostLevel] = useState("");
  const [selectedField, setSelectedField] = useState("");

  const destinations = getAllDestinations();
  const universities = getAllUniversities();

  // Get unique values for filters
  const countries = [...new Set(destinations.map((d) => d.country))]
    .filter(Boolean)
    .sort();
  const costLevels = ["low", "medium", "high"];
  const academicFields = [
    ...new Set(destinations.flatMap((d) => d.popularWith)),
  ]
    .filter(Boolean)
    .sort();

  // Filter destinations based on search criteria
  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      searchTerm === "" ||
      dest.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.university.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCountry =
      selectedCountry === "" ||
      selectedCountry === "all-countries" ||
      dest.country === selectedCountry;

    const matchesCost =
      selectedCostLevel === "" ||
      selectedCostLevel === "all-costs" ||
      dest.costOfLiving === selectedCostLevel;

    const matchesField =
      selectedField === "" ||
      selectedField === "all-fields" ||
      dest.popularWith.includes(selectedField);

    return matchesSearch && matchesCountry && matchesCost && matchesField;
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
              <Link to="/basic-information">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Start Your Application
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
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
            <Select onValueChange={setSelectedField}>
              <SelectTrigger>
                <SelectValue placeholder="Academic Field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-fields">All Fields</SelectItem>
                {academicFields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCountry("all-countries");
                setSelectedCostLevel("all-costs");
                setSelectedField("all-fields");
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
            Showing {filteredDestinations.length} of {destinations.length}{" "}
            destinations
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination) => {
              const testimonials = getTestimonialsByDestination(
                destination.city,
              );
              const avgRating =
                testimonials.length > 0
                  ? testimonials.reduce((acc, t) => acc + t.rating, 0) /
                    testimonials.length
                  : 0;

              return (
                <Card
                  key={destination.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <CardContent className="p-0">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={destination.imageUrl}
                        alt={destination.city}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge
                          className={getCostBadgeColor(
                            destination.costOfLiving,
                          )}
                        >
                          {destination.costOfLiving} cost
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge
                          variant="secondary"
                          className="bg-white/90 text-gray-900"
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          {destination.language}
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
                        {destination.universityShort}
                      </p>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {destination.description}
                      </p>

                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Euro className="h-4 w-4 mr-1" />€
                        {destination.averageRent}/month avg. rent
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {destination.popularWith.map((field, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {field}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <Users className="h-3 w-3 mr-1" />
                          {destination.partnerUniversities.length} partner uni
                          {destination.partnerUniversities.length !== 1
                            ? "s"
                            : ""}
                        </div>
                        <Button
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            // Navigate to destination details or application
                          }}
                        >
                          Learn More
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>

                      {testimonials.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={testimonials[0].avatar}
                                alt={testimonials[0].studentName}
                              />
                              <AvatarFallback className="text-xs">
                                {testimonials[0].studentName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">
                                {testimonials[0].studentName}
                              </span>{" "}
                              from {testimonials[0].homeUniversity}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            "{testimonials[0].cityReview.slice(0, 100)}..."
                          </p>
                        </div>
                      )}
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
