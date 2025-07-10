import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent } from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import { Avatar, AvatarFallback } from "../src/components/ui/avatar";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Home,
  BookOpen,
  Star,
  MapPin,
} from "lucide-react";

interface PreviewEntry {
  id: string;
  type: "story" | "accommodation";
  title: string;
  excerpt: string;
  imageUrl?: string;
  city?: string;
  rating?: number;
  studentName?: string;
  price?: string;
}

const TeaserGallery = () => {
  const { data: session } = useSession();
  const [previews, setPreviews] = useState<PreviewEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  useEffect(() => {
    // Generate sample preview data
    const samplePreviews: PreviewEntry[] = [
      {
        id: "story_1",
        type: "story",
        title: "How I survived Spring 2024 in Barcelona",
        excerpt:
          "Barcelona exceeded all my expectations. The city has incredible energy and the university...",
        imageUrl:
          "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=250&fit=crop",
        city: "Barcelona",
        rating: 5,
        studentName: "Maria K.",
      },
      {
        id: "accommodation_1",
        type: "accommodation",
        title: "Student Apartment in City Center",
        excerpt:
          "Amazing location right in the heart of the city. Walking distance to university and all amenities...",
        imageUrl:
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=250&fit=crop",
        city: "Barcelona",
        rating: 4,
        studentName: "Alex M.",
        price: "€650/mo",
      },
      {
        id: "story_2",
        type: "story",
        title: "My semester in Vienna was life-changing",
        excerpt:
          "Vienna is a perfect blend of history and modernity. The coffee culture, the architecture...",
        imageUrl:
          "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&h=250&fit=crop",
        city: "Vienna",
        rating: 5,
        studentName: "John D.",
      },
      {
        id: "accommodation_2",
        type: "accommodation",
        title: "Cozy Studio near University",
        excerpt:
          "Perfect for students! This studio has everything you need and is very close to campus...",
        imageUrl:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop",
        city: "Vienna",
        rating: 4,
        studentName: "Emma S.",
        price: "€520/mo",
      },
      {
        id: "story_3",
        type: "story",
        title: "Erasmus in Prague: Best decision ever",
        excerpt:
          "Prague is absolutely magical. The old town, the nightlife, the friendly people...",
        imageUrl:
          "https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=250&fit=crop",
        city: "Prague",
        rating: 5,
        studentName: "Lisa T.",
      },
      {
        id: "accommodation_3",
        type: "accommodation",
        title: "Shared Flat in Historic District",
        excerpt:
          "Living with other international students in the most beautiful part of the city...",
        imageUrl:
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop",
        city: "Prague",
        rating: 4,
        studentName: "Carlos R.",
        price: "€400/mo",
      },
    ];

    setPreviews(samplePreviews);
  }, []);

  const handleReadMore = (entry: PreviewEntry) => {
    if (!session) {
      setShowEmailCapture(true);
      return;
    }

    // Navigate to the appropriate page
    if (entry.type === "story") {
      window.location.href = `/student-stories`;
    } else {
      window.location.href = `/student-accommodations`;
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, previews.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + Math.max(1, previews.length - 2)) %
        Math.max(1, previews.length - 2),
    );
  };

  const visiblePreviews = previews.slice(currentIndex, currentIndex + 3);

  if (previews.length === 0) return null;

  return (
    <>
      <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-blue-100 text-blue-800 px-4 py-2">
              ✨ Sneak Peek
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stories & Stays from Real Students
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get inspired by authentic experiences and find your perfect
              accommodation. Join our community to access the full library of
              student insights.
            </p>
          </div>

          <div className="relative">
            {/* Navigation Buttons */}
            {previews.length > 3 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6 px-8">
              {visiblePreviews.map((entry) => (
                <Card
                  key={entry.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                  onClick={() => handleReadMore(entry)}
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
                        {entry.rating && (
                          <div className="flex items-center ml-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium ml-1">
                              {entry.rating}
                            </span>
                          </div>
                        )}
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
                            {entry.city && (
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {entry.city}
                              </div>
                            )}
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
          </div>

          {/* Call to Action */}
          <div className="text-center mt-8">
            <Link href={session ? "/experiences" : "/login"}>
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Explore All Stories & Stays
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-2">
              {session
                ? "Access our full library"
                : "Sign up to access our full library of experiences"}
            </p>
          </div>
        </div>
      </section>

      {/* Email Capture Modal */}
      {showEmailCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Join Our Community
              </h3>
              <p className="text-gray-600 mb-6">
                Get access to hundreds of authentic student experiences and
                accommodation reviews.
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
                    Sign Up & Continue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailCapture(false)}
                    className="flex-1"
                  >
                    Maybe Later
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

export default TeaserGallery;
