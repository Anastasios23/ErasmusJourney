import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
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
  const [previews, setPreviews] = useState<PreviewEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Generate sample preview data
    const samplePreviews: PreviewEntry[] = [
      {
        id: "1",
        type: "story",
        title: "My Amazing Semester in Barcelona",
        excerpt:
          "A life-changing experience studying at UPC Barcelona and discovering Spanish culture...",
        imageUrl:
          "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=250&fit=crop",
        city: "Barcelona",
        rating: 5,
        studentName: "Maria K.",
      },
      {
        id: "2",
        type: "story",
        title: "Finding the Perfect Student Accommodation in Prague",
        excerpt:
          "Tips and tricks for finding affordable, comfortable housing in Prague. From dorms to shared apartments...",
        imageUrl:
          "https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=250&fit=crop",
        city: "Prague",
        rating: 5,
        studentName: "Andreas M.",
      },
      {
        id: "3",
        type: "story",
        title: "Navigating Academic Life at Sorbonne University",
        excerpt:
          "Everything you need to know about the academic system in France and making the most of your time in Paris...",
        imageUrl:
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=250&fit=crop",
        city: "Paris",
        rating: 5,
        studentName: "Elena P.",
      },
    ];

    setPreviews(samplePreviews);
  }, []);

  const router = useRouter();

  const handleReadMore = (entry: PreviewEntry) => {
    // Navigate to individual story page
    router.push(`/stories/${entry.id}`);
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
              Real Student Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get inspired by authentic experiences from students who have lived
              their Erasmus dreams. Discover what makes each destination special
              through their eyes.
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
                  aria-label="Previous stories"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg"
                  onClick={nextSlide}
                  aria-label="Next stories"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
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
                      <Image
                        src={entry.imageUrl || "/placeholder-image.jpg"}
                        alt={entry.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                            <BookOpen
                              className="h-3 w-3 mr-1"
                              aria-hidden="true"
                            />
                          ) : (
                            <Home className="h-3 w-3 mr-1" aria-hidden="true" />
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
                                <MapPin
                                  className="h-3 w-3 mr-1"
                                  aria-hidden="true"
                                />
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
                          <ArrowRight
                            className="h-3 w-3 ml-1"
                            aria-hidden="true"
                          />
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
            <Link href="/course-matching-experiences">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View All Experiences
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-2">
              Discover authentic student course experiences
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default TeaserGallery;
