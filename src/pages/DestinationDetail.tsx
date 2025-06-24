import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import {
  MapPin,
  Star,
  Euro,
  Users,
  ArrowLeft,
  Globe,
  Calendar,
  Thermometer,
  GraduationCap,
  Bus,
  ShoppingCart,
  Lightbulb,
  Camera,
  Heart,
  ExternalLink,
} from "lucide-react";
import { getCityDestinationById } from "@/data/citiesDestinations";

const DestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const destination = id ? getCityDestinationById(id) : null;

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Destination Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the destination you're looking for.
          </p>
          <Link to="/destinations">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Destinations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const avgRating =
    destination.testimonials.length > 0
      ? destination.testimonials.reduce((acc, t) => acc + t.rating, 0) /
        destination.testimonials.length
      : 0;

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
      <section className="relative h-96 overflow-hidden">
        <img
          src={destination.imageUrl || `/api/placeholder/1200/400`}
          alt={destination.city}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">
              {destination.city}, {destination.country}
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl">
              {destination.description}
            </p>
            <div className="flex items-center justify-center space-x-4 mt-6">
              <Badge className={getCostBadgeColor(destination.costLevel)}>
                {destination.costLevel} cost
              </Badge>
              <Badge variant="secondary" className="bg-white/90 text-gray-900">
                <Globe className="h-3 w-3 mr-1" />
                {destination.language.split(" ")[0]}
              </Badge>
              {avgRating > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-white/90 text-gray-900"
                >
                  <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                  {avgRating.toFixed(1)} rating
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Link to="/destinations">
            <Button variant="secondary" className="bg-white/90 text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Destinations
            </Button>
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Facts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Quick Facts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      <Thermometer className="h-4 w-4 inline mr-1" />
                      Climate
                    </h4>
                    <p className="text-gray-600">{destination.climate}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      <Globe className="h-4 w-4 inline mr-1" />
                      Language
                    </h4>
                    <p className="text-gray-600">{destination.language}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      <Euro className="h-4 w-4 inline mr-1" />
                      Average Rent
                    </h4>
                    <p className="text-gray-600">{destination.averageRent}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      <Bus className="h-4 w-4 inline mr-1" />
                      Transport Cost
                    </h4>
                    <p className="text-gray-600">{destination.transportCost}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      <ShoppingCart className="h-4 w-4 inline mr-1" />
                      Food Budget
                    </h4>
                    <p className="text-gray-600">{destination.foodBudget}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Universities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Popular Universities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {destination.popularUniversities.map((university, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">{university}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Student Life */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Student Life
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {destination.studentLife}
                </p>
              </CardContent>
            </Card>

            {/* Attractions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Must-Visit Attractions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {destination.attractions.map((attraction, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <MapPin className="h-4 w-4 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{attraction}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Insider Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {destination.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                    >
                      <Lightbulb className="h-4 w-4 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Testimonials */}
            {destination.testimonials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Student Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {destination.testimonials.map((testimonial, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {testimonial.studentName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {testimonial.studentName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {testimonial.university}
                          </p>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < testimonial.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <blockquote className="text-gray-700 italic">
                        "{testimonial.quote}"
                      </blockquote>
                      {index < destination.testimonials.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to Start Your Journey?
                </h3>
                <p className="text-gray-600 mb-4">
                  Share your experience and help future students!
                </p>
                <Link to="/basic-information">
                  <Button className="w-full mb-3">Share Your Experience</Button>
                </Link>
                <Link to="/destinations">
                  <Button variant="outline" className="w-full">
                    Explore More Destinations
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>At a Glance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cost Level</span>
                  <Badge className={getCostBadgeColor(destination.costLevel)}>
                    {destination.costLevel}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Universities</span>
                  <span className="font-medium">
                    {destination.popularUniversities.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Attractions</span>
                  <span className="font-medium">
                    {destination.attractions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Student Reviews</span>
                  <span className="font-medium">
                    {destination.testimonials.length}
                  </span>
                </div>
                {avgRating > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Average Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">
                        {avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
