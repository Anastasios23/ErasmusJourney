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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import {
  Users,
  Star,
  MapPin,
  Euro,
  Calendar,
  Search,
  Filter,
  Heart,
  TrendingUp,
  Camera,
  BookOpen,
  Home,
  DollarSign,
  ArrowRight,
  Clock,
  ThumbsUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAllTestimonials,
  getAllDestinations,
  getTestimonialsByDestination,
} from "@/data/destinations";

const StudentStories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [activeTab, setActiveTab] = useState("all-stories");

  const testimonials = getAllTestimonials();
  const destinations = getAllDestinations();

  // Get unique values for filters
  const countries = [...new Set(testimonials.map((t) => t.country))]
    .filter(Boolean)
    .sort();
  const universities = [...new Set(testimonials.map((t) => t.homeUniversity))]
    .filter(Boolean)
    .sort();

  // Filter testimonials based on search criteria
  const filteredTestimonials = testimonials.filter((testimonial) => {
    const matchesSearch =
      searchTerm === "" ||
      testimonial.studentName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      testimonial.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCountry =
      selectedCountry === "" ||
      selectedCountry === "all-countries" ||
      testimonial.country === selectedCountry;

    const matchesUniversity =
      selectedUniversity === "" ||
      selectedUniversity === "all-universities" ||
      testimonial.homeUniversity === selectedUniversity;

    const matchesRating =
      selectedRating === "" ||
      selectedRating === "all-ratings" ||
      testimonial.rating >= parseInt(selectedRating);

    return (
      matchesSearch && matchesCountry && matchesUniversity && matchesRating
    );
  });

  // Statistics for dashboard
  const avgRating =
    testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length;
  const avgRent =
    testimonials.reduce((acc, t) => acc + t.monthlyRent, 0) /
    testimonials.length;
  const recommendationRate =
    (testimonials.filter((t) => t.wouldRecommend).length /
      testimonials.length) *
    100;

  // Top destinations by reviews
  const destinationStats = destinations.map((dest) => {
    const destTestimonials = getTestimonialsByDestination(dest.city);
    const avgDestRating =
      destTestimonials.length > 0
        ? destTestimonials.reduce((acc, t) => acc + t.rating, 0) /
          destTestimonials.length
        : 0;
    return {
      ...dest,
      reviewCount: destTestimonials.length,
      avgRating: avgDestRating,
    };
  });

  const topDestinations = destinationStats
    .filter((d) => d.reviewCount > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 6);

  const featuredStories = testimonials
    .filter((t) => t.rating === 5)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-white/20 text-white border-white/30"
            >
              Student Stories
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Real Stories, Real Experiences
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Discover authentic experiences from students who've lived,
              studied, and thrived across Europe. Get insights into
              accommodation, budgets, cities, and everything in between.
            </p>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-1">
                  {testimonials.length}
                </div>
                <div className="text-indigo-200 text-sm">Student Stories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300 mb-1">
                  {avgRating.toFixed(1)} ⭐
                </div>
                <div className="text-indigo-200 text-sm">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300 mb-1">
                  €{Math.round(avgRent)}
                </div>
                <div className="text-indigo-200 text-sm">Avg Monthly Rent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-300 mb-1">
                  {Math.round(recommendationRate)}%
                </div>
                <div className="text-indigo-200 text-sm">Would Recommend</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all-stories" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                All Stories
              </TabsTrigger>
              <TabsTrigger value="destinations" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                By Destination
              </TabsTrigger>
              <TabsTrigger value="budget-guides" className="flex items-center">
                <Euro className="h-4 w-4 mr-2" />
                Budget Guides
              </TabsTrigger>
              <TabsTrigger value="photo-gallery" className="flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                Photo Gallery
              </TabsTrigger>
            </TabsList>

            {/* All Stories Tab */}
            <TabsContent value="all-stories" className="mt-8">
              {/* Search and Filters */}
              <div className="mb-8">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students or cities..."
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
                  <Select onValueChange={setSelectedUniversity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Home University" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-universities">
                        All Universities
                      </SelectItem>
                      {universities.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
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

              {/* Featured Stories */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Star className="h-6 w-6 text-yellow-500 mr-2" />
                  Featured Stories
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {featuredStories.map((story) => (
                    <Card
                      key={story.id}
                      className="group hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={story.avatar}
                              alt={story.studentName}
                            />
                            <AvatarFallback>
                              {story.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {story.studentName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {story.city}, {story.country}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          "{story.cityReview.slice(0, 150)}..."
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {story.semester} {story.year}
                          </span>
                          <span className="flex items-center">
                            <Euro className="h-3 w-3 mr-1" />€
                            {story.monthlyRent}/month
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* All Stories Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTestimonials.map((testimonial) => (
                  <Card
                    key={testimonial.id}
                    className="group hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage
                            src={testimonial.avatar}
                            alt={testimonial.studentName}
                          />
                          <AvatarFallback>
                            {testimonial.studentName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {testimonial.studentName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {testimonial.city}, {testimonial.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                          {testimonial.rating}/5
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        "{testimonial.accommodationReview.slice(0, 120)}..."
                      </p>
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <Home className="h-3 w-3 mr-1" />
                            {testimonial.accommodationType}
                          </span>
                          <span className="flex items-center">
                            <Euro className="h-3 w-3 mr-1" />€
                            {testimonial.monthlyRent}/month
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{testimonial.homeUniversity}</span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {testimonial.semester} {testimonial.year}
                          </span>
                        </div>
                      </div>
                      {testimonial.wouldRecommend && (
                        <div className="mt-3 flex items-center text-green-600 text-xs">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Recommends this destination
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Destinations Tab */}
            <TabsContent value="destinations" className="mt-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Top Destinations by Student Reviews
                </h2>
                <p className="text-gray-600">
                  Discover the most popular destinations based on real student
                  experiences and ratings.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topDestinations.map((destination) => (
                  <Card
                    key={destination.id}
                    className="group hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-0">
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <img
                          src={destination.imageUrl}
                          alt={destination.city}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/90 text-gray-900">
                            {destination.reviewCount} reviews
                          </Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-yellow-500 text-white">
                            {destination.avgRating.toFixed(1)} ⭐
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {destination.city}, {destination.country}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {destination.universityShort}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-gray-600">
                            <Euro className="h-4 w-4 mr-1" />€
                            {destination.averageRent}/month avg.
                          </span>
                          <Link
                            to={`/destinations?city=${destination.city}`}
                            className="text-blue-600 hover:text-blue-700 flex items-center"
                          >
                            View Details
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Budget Guides Tab */}
            <TabsContent value="budget-guides" className="mt-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Budget Breakdowns by City
                </h2>
                <p className="text-gray-600">
                  Real budget data from students who've lived in these cities.
                </p>
              </div>

              <div className="space-y-6">
                {topDestinations.map((destination) => {
                  const cityTestimonials = getTestimonialsByDestination(
                    destination.city,
                  );
                  const avgCityRent =
                    cityTestimonials.reduce(
                      (acc, t) => acc + t.monthlyRent,
                      0,
                    ) / cityTestimonials.length;

                  return (
                    <Card key={destination.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl">
                              {destination.city}, {destination.country}
                            </CardTitle>
                            <p className="text-gray-600">
                              Based on {cityTestimonials.length} student reports
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              €{Math.round(avgCityRent)}
                            </div>
                            <div className="text-sm text-gray-600">
                              avg. monthly rent
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">
                              💡 Money-Saving Tips
                            </h4>
                            {cityTestimonials[0]?.budgetTips && (
                              <p className="text-sm text-gray-600">
                                {cityTestimonials[0].budgetTips.slice(0, 100)}
                                ...
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">
                              🏠 Accommodation Types
                            </h4>
                            <div className="text-sm text-gray-600">
                              {[
                                ...new Set(
                                  cityTestimonials.map(
                                    (t) => t.accommodationType,
                                  ),
                                ),
                              ]
                                .slice(0, 3)
                                .join(", ")}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">
                              📊 Cost Level
                            </h4>
                            <Badge
                              className={
                                destination.costOfLiving === "low"
                                  ? "bg-green-500 text-white"
                                  : destination.costOfLiving === "medium"
                                    ? "bg-yellow-500 text-white"
                                    : "bg-red-500 text-white"
                              }
                            >
                              {destination.costOfLiving} cost
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Photo Gallery Tab */}
            <TabsContent value="photo-gallery" className="mt-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Photo Gallery
                </h2>
                <p className="text-gray-600">
                  Visual memories from students across Europe.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.slice(0, 6).map((destination, index) => (
                  <div key={destination.id} className="group cursor-pointer">
                    <div className="aspect-square relative overflow-hidden rounded-lg">
                      <img
                        src={destination.imageUrl}
                        alt={destination.city}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-bold text-lg">
                            {destination.city}
                          </h3>
                          <p className="text-sm">{destination.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <div className="bg-blue-50 p-8 rounded-lg">
                  <Camera className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Coming Soon: Student Photo Stories
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We're building a photo sharing platform where students can
                    upload and share visual stories of their Erasmus journey.
                  </p>
                  <Link to="/share-story">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Share Your Photos
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Share Your Story Too
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Help future students by sharing your own Erasmus experience. Your
            story could be exactly what someone needs to hear.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/basic-information">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100"
              >
                Share Your Experience
              </Button>
            </Link>
            <Link to="/community">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-indigo-600"
              >
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentStories;
