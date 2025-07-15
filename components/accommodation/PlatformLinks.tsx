import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import { Skeleton } from "../../src/components/ui/skeleton";
import { ExternalLink, Star, Bookmark, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";

interface AccommodationPlatform {
  id: string;
  name: string;
  description: string;
  url: string;
  logo: string;
  category: "booking" | "housing" | "classifieds" | "specialized";
  features: string[];
  countries: string[];
  averagePrice: "low" | "medium" | "high";
  trustScore: number;
}

interface PlatformLinksProps {
  userCountry?: string;
  userCity?: string;
}

export default function PlatformLinks({
  userCountry,
  userCity,
}: PlatformLinksProps) {
  const [platforms, setPlatforms] = useState<AccommodationPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bookmarkedPlatforms, setBookmarkedPlatforms] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    fetchPlatforms();
    loadBookmarks();
  }, [userCountry, selectedCategory]);

  const fetchPlatforms = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (userCountry && userCountry !== "all") {
        params.append("country", userCountry);
      }
      if (selectedCategory && selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      const response = await fetch(`/api/accommodation/platforms?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPlatforms(data.platforms || []);
      } else {
        setError("Failed to fetch platforms");
      }
    } catch (err) {
      setError("Error loading platforms");
      console.error("Error fetching platforms:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bookmarked_platforms");
      if (saved) {
        setBookmarkedPlatforms(new Set(JSON.parse(saved)));
      }
    }
  };

  const toggleBookmark = (platformId: string) => {
    const newBookmarks = new Set(bookmarkedPlatforms);
    if (newBookmarks.has(platformId)) {
      newBookmarks.delete(platformId);
    } else {
      newBookmarks.add(platformId);
    }
    setBookmarkedPlatforms(newBookmarks);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "bookmarked_platforms",
        JSON.stringify([...newBookmarks]),
      );
    }
  };

  const getPriceColor = (price: string) => {
    switch (price) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "booking":
        return "bg-blue-100 text-blue-800";
      case "specialized":
        return "bg-purple-100 text-purple-800";
      case "housing":
        return "bg-green-100 text-green-800";
      case "classifieds":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePlatformClick = (platform: AccommodationPlatform) => {
    // Add tracking parameters if needed
    let url = platform.url;
    if (userCity) {
      // Some platforms might support deep linking to specific cities
      if (platform.id === "booking") {
        url += `?ss=${encodeURIComponent(userCity)}`;
      } else if (platform.id === "airbnb") {
        url += `/s/${encodeURIComponent(userCity)}`;
      }
    }

    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-12 w-12 rounded mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Popular Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">{error}</p>
            <Button variant="outline" onClick={fetchPlatforms} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Popular Accommodation Platforms
        </CardTitle>
        <p className="text-sm text-gray-600">
          Trusted platforms to find accommodation in your destination
        </p>
      </CardHeader>
      <CardContent>
        {/* Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4" />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="booking">Booking Platforms</SelectItem>
                <SelectItem value="specialized">Student Specialized</SelectItem>
                <SelectItem value="housing">University Housing</SelectItem>
                <SelectItem value="classifieds">Classifieds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative"
              onClick={() => handlePlatformClick(platform)}
            >
              {/* Bookmark button */}
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(platform.id);
                }}
              >
                <Bookmark
                  className={`h-4 w-4 ${
                    bookmarkedPlatforms.has(platform.id)
                      ? "fill-current text-blue-600"
                      : "text-gray-400"
                  }`}
                />
              </Button>

              {/* Platform logo/icon */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ExternalLink className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {platform.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {platform.description}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getCategoryColor(platform.category)}>
                  {platform.category}
                </Badge>
                <Badge className={getPriceColor(platform.averagePrice)}>
                  {platform.averagePrice} price
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">
                    {platform.trustScore}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1 mb-3">
                {platform.features.slice(0, 3).map((feature, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-600 flex items-center gap-1"
                  >
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
                {platform.features.length > 3 && (
                  <div className="text-xs text-blue-600">
                    +{platform.features.length - 3} more features
                  </div>
                )}
              </div>

              {/* Countries availability */}
              <div className="text-xs text-gray-500 mb-3">
                Available:{" "}
                {platform.countries.includes("All")
                  ? "Worldwide"
                  : platform.countries.slice(0, 3).join(", ")}
                {platform.countries.length > 3 &&
                  !platform.countries.includes("All") &&
                  ` +${platform.countries.length - 3} more`}
              </div>

              {/* Action button */}
              <Button
                className="w-full"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlatformClick(platform);
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit {platform.name}
              </Button>
            </div>
          ))}
        </div>

        {platforms.length === 0 && (
          <div className="text-center py-8">
            <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No platforms found for the selected criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => setSelectedCategory("all")}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Bookmarked platforms summary */}
        {bookmarkedPlatforms.size > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bookmark className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">
                Bookmarked Platforms ({bookmarkedPlatforms.size})
              </h4>
            </div>
            <p className="text-sm text-blue-800">
              Your bookmarked platforms are saved locally and will be available
              next time you visit.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
