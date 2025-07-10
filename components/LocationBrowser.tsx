import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Card, CardContent } from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import { Avatar, AvatarFallback } from "../src/components/ui/avatar";
import { ArrowRight, MapPin, Star, Home, BookOpen, Users } from "lucide-react";

interface BrowseEntry {
  id: string;
  type: "story" | "accommodation";
  title: string;
  excerpt: string;
  imageUrl?: string;
  rating: number;
  studentName: string;
  price?: string;
  city: string;
}

const LocationBrowser = () => {
  const { data: session } = useSession();
  const [selectedCity, setSelectedCity] = useState("");
  const [results, setResults] = useState<BrowseEntry[]>([]);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [availableCities] = useState<string[]>([
    "Barcelona",
    "Vienna",
    "Prague",
    "Amsterdam",
    "Berlin",
    "Paris",
    "Rome",
    "Lisbon",
    "Stockholm",
    "Budapest",
  ]);

  useEffect(() => {
    if (!selectedCity) {
      setResults([]);
      return;
    }

    // Generate sample results for selected city
    const sampleResults: BrowseEntry[] = [
      {
        id: `story_${selectedCity}_1`,
        type: "story",
        title: `My ${selectedCity} Adventure`,
        excerpt: `Living in ${selectedCity} was absolutely incredible. The culture, the people, the experiences...`,
        imageUrl: `https://images.unsplash.com/photo-${1600000000000 + Math.random() * 100000000}?w=300&h=200&fit=crop`,
        rating: 5,
        studentName: "Sarah M.",
        city: selectedCity,
      },
      {
        id: `accommodation_${selectedCity}_1`,
        type: "accommodation",
        title: `Student Apartment in ${selectedCity}`,
        excerpt: `Perfect location for students, close to university and city center. Great amenities and friendly neighbors...`,
        imageUrl: `https://images.unsplash.com/photo-${1600000000000 + Math.random() * 100000000}?w=300&h=200&fit=crop`,
        rating: 4,
        studentName: "Marco L.",
        price: "€550/mo",
        city: selectedCity,
      },
      {
        id: `story_${selectedCity}_2`,
        type: "story",
        title: `Best semester in ${selectedCity}`,
        excerpt: `I never expected ${selectedCity} to become my second home. Every day was a new adventure...`,
        imageUrl: `https://images.unsplash.com/photo-${1600000000000 + Math.random() * 100000000}?w=300&h=200&fit=crop`,
        rating: 5,
        studentName: "Anna K.",
        city: selectedCity,
      },
    ];

    setResults(sampleResults);
  }, [selectedCity]);

  const handleViewAll = (city: string) => {
    if (!session) {
      setShowEmailCapture(true);
      return;
    }

    // Navigate to browse page with city filter
    window.location.href = `/destinations?city=${encodeURIComponent(city)}`;
  };

  const handleEntryClick = (entry: BrowseEntry) => {
    if (!session) {
      setShowEmailCapture(true);
      return;
    }

    if (entry.type === "story") {
      window.location.href = `/student-stories`;
    } else {
      window.location.href = `/student-accommodations`;
    }
  };

  return (
    <>
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-green-100 text-green-800 px-4 py-2">
              🌍 Browse by Destination
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore by City
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Find stories and accommodations from students who've lived in your
              destination city.
            </p>

            <div className="max-w-md mx-auto">
              <Select onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select city..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {city}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCity && results.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Stories & Stays in {selectedCity}
                </h3>
                <p className="text-gray-600">
                  {results.filter((r) => r.type === "story").length} stories and{" "}
                  {results.filter((r) => r.type === "accommodation").length}{" "}
                  accommodations
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((entry, index) => (
                  <Card
                    key={entry.id}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => handleEntryClick(entry)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleEntryClick(entry);
                      } else if (
                        e.key === "ArrowRight" &&
                        index < results.length - 1
                      ) {
                        e.preventDefault();
                        const nextCard = e.currentTarget.parentElement
                          ?.children[index + 1] as HTMLElement;
                        nextCard?.focus();
                      } else if (e.key === "ArrowLeft" && index > 0) {
                        e.preventDefault();
                        const prevCard = e.currentTarget.parentElement
                          ?.children[index - 1] as HTMLElement;
                        prevCard?.focus();
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${entry.type === "story" ? "Read story" : "View accommodation"}: ${entry.title} by ${entry.studentName} in ${entry.city}`}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <img
                          src={entry.imageUrl}
                          alt={entry.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge
                            className={
                              entry.type === "story"
                                ? "bg-purple-500 text-white"
                                : "bg-green-500 text-white"
                            }
                          >
                            {entry.type === "story" ? (
                              <BookOpen className="h-3 w-3 mr-1" />
                            ) : (
                              <Home className="h-3 w-3 mr-1" />
                            )}
                            {entry.type === "story" ? "Story" : "Stay"}
                          </Badge>
                        </div>
                        {entry.price && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-white text-gray-900 font-semibold">
                              {entry.price}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {entry.title}
                          </h3>
                          <div className="flex items-center ml-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium ml-1">
                              {entry.rating}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {entry.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {entry.studentName
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xs text-gray-500">
                              <div className="font-medium">
                                {entry.studentName}
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Read More
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => handleViewAll(selectedCity)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Users className="mr-2 h-5 w-5" />
                  View All in {selectedCity}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  {session
                    ? "Explore the complete collection"
                    : "Sign up to see all experiences in this city"}
                </p>
              </div>
            </div>
          )}

          {selectedCity && results.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No experiences found in {selectedCity}
              </h3>
              <p className="text-gray-600">
                Be the first to share your story from this destination!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Email Capture Modal */}
      {showEmailCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Unlock Full Access
              </h3>
              <p className="text-gray-600 mb-6">
                Join our community to explore all stories and accommodations in{" "}
                {selectedCity}.
              </p>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select your university</option>
                  <option value="ucy">University of Cyprus</option>
                  <option value="cut">Cyprus University of Technology</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      setShowEmailCapture(false);
                      router.push("/login");
                    }}
                    className="flex-1"
                  >
                    Sign Up & Explore
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailCapture(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default LocationBrowser;
