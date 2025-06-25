import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Home,
  BookOpen,
  Star,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { generateAccommodationListings } from "@/utils/accommodationData";
import { getAllTestimonials } from "@/data/destinations";

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
  const { user } = useAuth();
  const [previews, setPreviews] = useState<PreviewEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  useEffect(() => {
    // Generate preview data from existing testimonials and accommodations
    const testimonials = getAllTestimonials();
    const accommodations = generateAccommodationListings();

    const storyPreviews: PreviewEntry[] = testimonials.slice(0, 3).map((t) => ({
      id: `story_${t.id}`,
      type: "story" as const,
      title: `How I survived ${t.semester} ${t.year} in ${t.city}`,
      excerpt: t.cityReview.substring(0, 80) + "...",
      imageUrl: `https://images.unsplash.com/photo-${1600000000000 + Math.random() * 100000000}?w=400&h=250&fit=crop`,
      city: t.city,
      rating: t.rating,
      studentName: t.studentName,
    }));

    const accommodationPreviews: PreviewEntry[] = accommodations
      .slice(0, 3)
      .map((a) => ({
        id: `accommodation_${a.id}`,
        type: "accommodation" as const,
        title: `${a.accommodationType} in ${a.neighborhood}`,
        excerpt: a.review.substring(0, 80) + "...",
        imageUrl: a.images?.[0] || a.studentAvatar,
        city: a.city,
        rating: a.rating,
        studentName: a.studentName,
        price: `€${a.monthlyRent}/mo`,
      }));

    // Interleave stories and accommodations
    const combined: PreviewEntry[] = [];
    const maxLength = Math.max(
      storyPreviews.length,
      accommodationPreviews.length,
    );

    for (let i = 0; i < maxLength; i++) {
      if (storyPreviews[i]) combined.push(storyPreviews[i]);
      if (accommodationPreviews[i]) combined.push(accommodationPreviews[i]);
    }

    setPreviews(combined.slice(0, 6));
  }, []);

  const handleReadMore = (entry: PreviewEntry) => {
    if (!user) {
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
            <Button
              size="lg"
              onClick={() =>
                !user
                  ? setShowEmailCapture(true)
                  : (window.location.href = "/experiences")
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Explore All Stories & Stays
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              {user
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
                      window.location.href = "/login";
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
