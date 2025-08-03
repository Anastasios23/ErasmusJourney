import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "../components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../src/components/ui/tabs";
import {
  MapPin,
  Users,
  Euro,
  Star,
  Search,
  ThermometerSun,
  Building,
  Clock,
  Globe,
} from "lucide-react";

interface CompleteDestination {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  imageUrl?: string;
  climate?: string;
  highlights?: string[];
  officialUniversities?: Array<{
    name: string;
    website: string;
    programs: string[];
  }>;
  generalInfo?: {
    language: string;
    currency: string;
    timeZone: string;
    publicTransport: string;
  };
  featured: boolean;
  hasStudentData: boolean;
  studentData?: {
    totalSubmissions: number;
    livingCosts: {
      avgTotalMonthly: number;
    };
    ratings: {
      avgOverallRating: number;
    };
    recommendations: {
      recommendationPercentage: number;
    };
  };
}

export default function EnhancedDestinationsPage() {
  const [destinations, setDestinations] = useState<CompleteDestination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<
    CompleteDestination[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    filterDestinations();
  }, [destinations, searchTerm, activeTab]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/enhanced-destinations?withStudentData=true",
      );
      const result = await response.json();

      if (result.destinations) {
        setDestinations(result.destinations);
      } else {
        console.error("Failed to fetch destinations:", result.message);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDestinations = () => {
    let filtered = destinations;

    // Filter by tab
    if (activeTab === "featured") {
      filtered = filtered.filter((dest) => dest.featured);
    } else if (activeTab === "with-data") {
      filtered = filtered.filter((dest) => dest.hasStudentData);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (dest) =>
          dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.country.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredDestinations(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Study Destinations - Erasmus Journey</title>
        <meta
          name="description"
          content="Explore study abroad destinations with real student experiences and official information"
        />
      </Head>

      <Header />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Study Abroad Destinations</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover amazing destinations for your study abroad experience. Get
            official information combined with real insights from students who
            have been there.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="all">
                All Destinations ({destinations.length})
              </TabsTrigger>
              <TabsTrigger value="featured">
                Featured ({destinations.filter((d) => d.featured).length})
              </TabsTrigger>
              <TabsTrigger value="with-data">
                With Student Data (
                {destinations.filter((d) => d.hasStudentData).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Destinations</p>
                  <p className="text-2xl font-bold">{destinations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Featured</p>
                  <p className="text-2xl font-bold">
                    {destinations.filter((d) => d.featured).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">With Student Data</p>
                  <p className="text-2xl font-bold">
                    {destinations.filter((d) => d.hasStudentData).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">
                    {destinations.reduce(
                      (sum, d) => sum + (d.studentData?.totalSubmissions || 0),
                      0,
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Destinations Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No destinations found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No destinations available in this category"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DestinationCard({
  destination,
}: {
  destination: CompleteDestination;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {destination.imageUrl && (
        <div className="relative h-48">
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            {destination.featured && (
              <Badge className="bg-yellow-500 text-white">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {destination.hasStudentData && (
              <Badge className="bg-green-500 text-white">
                <Users className="h-3 w-3 mr-1" />
                Student Data
              </Badge>
            )}
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{destination.name}</span>
          {destination.studentData && (
            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              {destination.studentData.ratings.avgOverallRating.toFixed(1)}
            </div>
          )}
        </CardTitle>
        <CardDescription>
          <MapPin className="h-4 w-4 inline mr-1" />
          {destination.city}, {destination.country}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {destination.description}
        </p>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {destination.climate && (
            <div className="flex items-center text-gray-600">
              <ThermometerSun className="h-3 w-3 mr-1" />
              {destination.climate}
            </div>
          )}
          {destination.generalInfo?.language && (
            <div className="flex items-center text-gray-600">
              <Globe className="h-3 w-3 mr-1" />
              {destination.generalInfo.language}
            </div>
          )}
          {destination.generalInfo?.currency && (
            <div className="flex items-center text-gray-600">
              <Euro className="h-3 w-3 mr-1" />
              {destination.generalInfo.currency}
            </div>
          )}
          {destination.generalInfo?.timeZone && (
            <div className="flex items-center text-gray-600">
              <Clock className="h-3 w-3 mr-1" />
              {destination.generalInfo.timeZone}
            </div>
          )}
        </div>

        {/* Highlights */}
        {destination.highlights && destination.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {destination.highlights.slice(0, 3).map((highlight, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {highlight}
              </Badge>
            ))}
            {destination.highlights.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{destination.highlights.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Student Data Preview */}
        {destination.hasStudentData && destination.studentData ? (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              Student Insights
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-blue-700">
                  {destination.studentData.totalSubmissions}
                </div>
                <div className="text-blue-600">Students</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-700">
                  {formatCurrency(
                    destination.studentData.livingCosts.avgTotalMonthly,
                  )}
                </div>
                <div className="text-blue-600">Avg Cost</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-700">
                  {
                    destination.studentData.recommendations
                      .recommendationPercentage
                  }
                  %
                </div>
                <div className="text-blue-600">Recommend</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              Official information available • Student data coming soon
            </p>
          </div>
        )}

        {/* Universities Preview */}
        {destination.officialUniversities &&
          destination.officialUniversities.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">
                Partner Universities:
              </h4>
              <div className="space-y-1">
                {destination.officialUniversities
                  .slice(0, 2)
                  .map((uni, idx) => (
                    <div key={idx} className="text-xs text-gray-600">
                      • {uni.name}
                    </div>
                  ))}
                {destination.officialUniversities.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{destination.officialUniversities.length - 2} more
                    universities
                  </div>
                )}
              </div>
            </div>
          )}

        <Button className="w-full" variant="outline">
          Learn More
        </Button>
      </CardContent>
    </Card>
  );
}
